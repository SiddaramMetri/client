import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useSocket } from '@/hooks/use-socket';
import { AttendanceSession, AttendanceRecord } from '@/services/socket.service';
import { toast } from '@/hooks/use-toast';

interface AttendanceProgress {
  markedStudents: number;
  totalStudents: number;
  percentage: number;
}

interface AttendanceStats {
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  percentage: number;
}

interface AttendanceSocketContextType {
  // Current session state
  currentSession: AttendanceSession | null;
  isInSession: boolean;
  sessionProgress: AttendanceProgress | null;
  attendanceRecords: Record<string, AttendanceRecord>;
  
  // Real-time updates
  connectedUsers: Array<{ email: string; role: string }>;
  lastUpdate: Date | null;
  
  // Statistics
  currentStats: AttendanceStats | null;
  
  // Actions
  createSession: (data: {
    classId: string;
    workspaceId: string;
    date: string;
    totalStudents: number;
  }) => void;
  joinSession: (sessionId: string, classId: string) => void;
  leaveSession: () => void;
  markAttendance: (studentId: string, status: 'present' | 'absent' | 'late', notes?: string) => void;
  bulkMarkAttendance: (records: Array<{
    studentId: string;
    status: 'present' | 'absent' | 'late';
    notes?: string;
  }>) => void;
  closeSession: () => void;
  getStats: (classId: string, workspaceId: string, date: string) => void;
  refreshSessionStatus: () => void;
  
  // Connection status
  isSocketConnected: boolean;
}

const AttendanceSocketContext = createContext<AttendanceSocketContextType | undefined>(undefined);

export const useAttendanceSocket = () => {
  const context = useContext(AttendanceSocketContext);
  if (!context) {
    throw new Error('useAttendanceSocket must be used within an AttendanceSocketProvider');
  }
  return context;
};

interface AttendanceSocketProviderProps {
  children: React.ReactNode;
}

export const AttendanceSocketProvider: React.FC<AttendanceSocketProviderProps> = ({ children }) => {
  const socket = useSocket();
  
  // State
  const [currentSession, setCurrentSession] = useState<AttendanceSession | null>(null);
  const [sessionProgress, setSessionProgress] = useState<AttendanceProgress | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, AttendanceRecord>>({});
  const [connectedUsers, setConnectedUsers] = useState<Array<{ email: string; role: string }>>([]);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [currentStats, setCurrentStats] = useState<AttendanceStats | null>(null);

  // Computed values
  const isInSession = currentSession !== null;
  const isSocketConnected = socket.isConnected();

  // Actions
  const createSession = useCallback((data: {
    classId: string;
    workspaceId: string;
    date: string;
    totalStudents: number;
  }) => {
    socket.attendance.createSession(data);
  }, [socket]);

  const joinSession = useCallback((sessionId: string, classId: string) => {
    socket.attendance.joinSession(sessionId, classId);
  }, [socket]);

  const leaveSession = useCallback(() => {
    if (currentSession) {
      socket.attendance.leaveSession(currentSession.sessionId);
      setCurrentSession(null);
      setSessionProgress(null);
      setAttendanceRecords({});
      setConnectedUsers([]);
    }
  }, [socket, currentSession]);

  const markAttendance = useCallback((studentId: string, status: 'present' | 'absent' | 'late', notes?: string) => {
    if (currentSession) {
      socket.attendance.markStudent({
        sessionId: currentSession.sessionId,
        studentId,
        status,
        notes
      });
    }
  }, [socket, currentSession]);

  const bulkMarkAttendance = useCallback((records: Array<{
    studentId: string;
    status: 'present' | 'absent' | 'late';
    notes?: string;
  }>) => {
    if (currentSession) {
      socket.attendance.bulkMark({
        sessionId: currentSession.sessionId,
        records
      });
    }
  }, [socket, currentSession]);

  const closeSession = useCallback(() => {
    if (currentSession) {
      socket.attendance.closeSession(currentSession.sessionId);
    }
  }, [socket, currentSession]);

  const getStats = useCallback((classId: string, workspaceId: string, date: string) => {
    socket.attendance.getStats(classId, workspaceId, date);
  }, [socket]);

  const refreshSessionStatus = useCallback(() => {
    if (currentSession) {
      socket.attendance.getStatus(currentSession.sessionId);
    }
  }, [socket, currentSession]);

  // Event handlers
  useEffect(() => {
    // Session creation success
    socket.on('attendance-session-created', (data) => {
      setCurrentSession(data);
      setSessionProgress({
        markedStudents: data.markedStudents,
        totalStudents: data.totalStudents,
        percentage: Math.round((data.markedStudents / data.totalStudents) * 100)
      });
      setAttendanceRecords(data.attendanceRecords);
      toast({
        title: "Session Created",
        description: `Attendance session created successfully for ${data.date}`,
        variant: "default",
      });
    });

    // Session join success
    socket.on('attendance-session-joined', (data) => {
      setCurrentSession(data.session);
      setSessionProgress({
        markedStudents: data.session.markedStudents,
        totalStudents: data.session.totalStudents,
        percentage: Math.round((data.session.markedStudents / data.session.totalStudents) * 100)
      });
      setAttendanceRecords(data.session.attendanceRecords);
      toast({
        title: "Session Joined",
        description: `Successfully joined attendance session`,
        variant: "default",
      });
    });

    // User joined session
    socket.on('user-joined-session', (data) => {
      setConnectedUsers(prev => {
        const exists = prev.find(u => u.email === data.user.email);
        if (!exists) {
          return [...prev, data.user];
        }
        return prev;
      });
      toast({
        title: "User Joined",
        description: `${data.user.email} joined the session`,
        variant: "default",
      });
    });

    // User left session
    socket.on('user-left-session', (data) => {
      setConnectedUsers(prev => prev.filter(u => u.email !== data.user.email));
      toast({
        title: "User Left",
        description: `${data.user.email} left the session`,
        variant: "default",
      });
    });

    // Student attendance marked
    socket.on('student-attendance-marked', (data) => {
      setAttendanceRecords(prev => ({
        ...prev,
        [data.studentId]: {
          studentId: data.studentId,
          status: data.status as 'present' | 'absent' | 'late',
          timestamp: new Date(data.timestamp),
          markedBy: data.markedBy,
          classId: currentSession?.classId || '',
          workspaceId: currentSession?.workspaceId || '',
          date: currentSession?.date || '',
          notes: data.notes
        }
      }));
      
      setSessionProgress(data.sessionProgress);
      setLastUpdate(new Date());
      
      toast({
        title: "Attendance Marked",
        description: `Student marked as ${data.status} by ${data.markedBy}`,
        variant: "default",
      });
    });

    // Bulk attendance marked
    socket.on('bulk-attendance-marked', (data) => {
      const newRecords: Record<string, AttendanceRecord> = {};
      data.records.forEach(record => {
        newRecords[record.studentId] = {
          studentId: record.studentId,
          status: record.status as 'present' | 'absent' | 'late',
          timestamp: new Date(record.timestamp),
          markedBy: record.markedBy,
          classId: currentSession?.classId || '',
          workspaceId: currentSession?.workspaceId || '',
          date: currentSession?.date || '',
          notes: record.notes
        };
      });
      
      setAttendanceRecords(prev => ({ ...prev, ...newRecords }));
      setSessionProgress(data.sessionProgress);
      setLastUpdate(new Date());
      
      toast({
        title: "Bulk Attendance Marked",
        description: `${data.recordsCount} students marked by ${data.markedBy}`,
        variant: "default",
      });
    });

    // Session status update
    socket.on('session-status', (data) => {
      setCurrentSession(data.session);
      setSessionProgress(data.progress);
      setAttendanceRecords(data.session.attendanceRecords);
    });

    // Session closed
    socket.on('session-closed', (data) => {
      setCurrentSession(prev => prev ? { ...prev, isActive: false } : null);
      toast({
        title: "Session Closed",
        description: `Session closed by ${data.closedBy}`,
        variant: "default",
      });
    });

    // Attendance stats
    socket.on('attendance-stats', (data) => {
      setCurrentStats(data.summary);
    });

    // Success responses
    socket.on('attendance-marked-success', (data) => {
      setSessionProgress(data.sessionProgress);
      setLastUpdate(new Date());
    });

    socket.on('bulk-attendance-success', (data) => {
      setSessionProgress(data.sessionProgress);
      setLastUpdate(new Date());
    });

    socket.on('session-close-success', () => {
      setCurrentSession(null);
      setSessionProgress(null);
      setAttendanceRecords({});
      setConnectedUsers([]);
      toast({
        title: "Session Closed",
        description: "Attendance session closed successfully",
        variant: "default",
      });
    });

    // Session persisted to permanent storage
    socket.on('session-persisted', (data) => {
      toast({
        title: "Data Saved",
        description: data.message,
        variant: "default",
      });
    });

    // Error handling
    socket.on('attendance-error', (data) => {
      toast({
        title: "Attendance Error",
        description: data.message,
        variant: "destructive",
      });
    });

    // Cleanup function to remove all listeners
    return () => {
      socket.off('attendance-session-created', () => {});
      socket.off('attendance-session-joined', () => {});
      socket.off('user-joined-session', () => {});
      socket.off('user-left-session', () => {});
      socket.off('student-attendance-marked', () => {});
      socket.off('bulk-attendance-marked', () => {});
      socket.off('session-status', () => {});
      socket.off('session-closed', () => {});
      socket.off('attendance-stats', () => {});
      socket.off('attendance-marked-success', () => {});
      socket.off('bulk-attendance-success', () => {});
      socket.off('session-close-success', () => {});
      socket.off('session-persisted', () => {});
      socket.off('attendance-error', () => {});
    };
  }, [socket, currentSession]);

  const value: AttendanceSocketContextType = {
    // State
    currentSession,
    isInSession,
    sessionProgress,
    attendanceRecords,
    connectedUsers,
    lastUpdate,
    currentStats,
    
    // Actions
    createSession,
    joinSession,
    leaveSession,
    markAttendance,
    bulkMarkAttendance,
    closeSession,
    getStats,
    refreshSessionStatus,
    
    // Connection status
    isSocketConnected
  };

  return (
    <AttendanceSocketContext.Provider value={value}>
      {children}
    </AttendanceSocketContext.Provider>
  );
};

export default AttendanceSocketProvider;