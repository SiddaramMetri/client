import { useEffect, useCallback, useRef } from 'react';
import { useAuthContext } from '@/context/auth-provider';
import SocketService, { AttendanceSocketEvents, SocketUser } from '@/services/socket.service';

export const useSocket = () => {
  const { user } = useAuthContext();
  const socketService = useRef(SocketService.getInstance());
  const isConnectedRef = useRef(false);

  useEffect(() => {
    if (user && !isConnectedRef.current) {
      const socketUser: SocketUser = {
        userId: user._id,
        workspaceId: user.workspaceId,
        role: user.role,
        email: user.email
      };

      socketService.current.connect(socketUser)
        .then(() => {
          isConnectedRef.current = true;
        })
        .catch((error) => {
          console.error('Failed to connect to Socket.IO:', error);
        });
    }

    return () => {
      if (isConnectedRef.current) {
        socketService.current.disconnect();
        isConnectedRef.current = false;
      }
    };
  }, [user]);

  const isConnected = useCallback(() => {
    return socketService.current.isSocketConnected();
  }, []);

  const emit = useCallback((event: string, data: any) => {
    socketService.current.emit(event, data);
  }, []);

  const on = useCallback(<K extends keyof AttendanceSocketEvents>(
    event: K,
    listener: AttendanceSocketEvents[K]
  ) => {
    socketService.current.on(event, listener);
  }, []);

  const off = useCallback(<K extends keyof AttendanceSocketEvents>(
    event: K,
    listener: AttendanceSocketEvents[K]
  ) => {
    socketService.current.off(event, listener);
  }, []);

  const once = useCallback(<K extends keyof AttendanceSocketEvents>(
    event: K,
    listener: AttendanceSocketEvents[K]
  ) => {
    socketService.current.once(event, listener);
  }, []);

  // Attendance-specific methods
  const attendance = {
    createSession: useCallback((data: {
      classId: string;
      workspaceId: string;
      date: string;
      totalStudents: number;
    }) => {
      socketService.current.createAttendanceSession(data);
    }, []),

    joinSession: useCallback((sessionId: string, classId: string) => {
      socketService.current.joinAttendanceSession(sessionId, classId);
    }, []),

    leaveSession: useCallback((sessionId: string) => {
      socketService.current.leaveAttendanceSession(sessionId);
    }, []),

    markStudent: useCallback((data: {
      sessionId: string;
      studentId: string;
      status: 'present' | 'absent' | 'late';
      notes?: string;
    }) => {
      socketService.current.markStudentAttendance(data);
    }, []),

    bulkMark: useCallback((data: {
      sessionId: string;
      records: Array<{
        studentId: string;
        status: 'present' | 'absent' | 'late';
        notes?: string;
      }>;
    }) => {
      socketService.current.bulkMarkAttendance(data);
    }, []),

    getStatus: useCallback((sessionId: string) => {
      socketService.current.getSessionStatus(sessionId);
    }, []),

    closeSession: useCallback((sessionId: string) => {
      socketService.current.closeAttendanceSession(sessionId);
    }, []),

    getStats: useCallback((classId: string, workspaceId: string, date: string) => {
      socketService.current.getAttendanceStats(classId, workspaceId, date);
    }, [])
  };

  return {
    isConnected,
    on,
    off,
    once,
    emit,
    attendance
  };
};

export default useSocket;