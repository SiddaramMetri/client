import { io, Socket } from 'socket.io-client';

export interface AttendanceRecord {
  studentId: string;
  status: 'present' | 'absent' | 'late';
  timestamp: Date;
  markedBy: string;
  classId: string;
  workspaceId: string;
  date: string;
  notes?: string;
}

export interface AttendanceSession {
  sessionId: string;
  classId: string;
  workspaceId: string;
  date: string;
  createdBy: string;
  createdAt: Date;
  isActive: boolean;
  totalStudents: number;
  markedStudents: number;
  attendanceRecords: Record<string, AttendanceRecord>;
}

export interface SocketUser {
  userId: string;
  workspaceId: string;
  role: string;
  email: string;
}

export interface AttendanceSocketEvents {
  // Events sent to server
  'create-attendance-session': (data: {
    classId: string;
    workspaceId: string;
    date: string;
    totalStudents: number;
  }) => void;

  'join-attendance-session': (data: {
    sessionId: string;
    classId: string;
  }) => void;

  'leave-attendance-session': (data: {
    sessionId: string;
  }) => void;

  'mark-student-attendance': (data: {
    sessionId: string;
    studentId: string;
    status: 'present' | 'absent' | 'late';
    notes?: string;
  }) => void;

  'bulk-mark-attendance': (data: {
    sessionId: string;
    records: Array<{
      studentId: string;
      status: 'present' | 'absent' | 'late';
      notes?: string;
    }>;
  }) => void;

  'get-session-status': (data: {
    sessionId: string;
  }) => void;

  'close-attendance-session': (data: {
    sessionId: string;
  }) => void;

  'get-attendance-stats': (data: {
    classId: string;
    workspaceId: string;
    date: string;
  }) => void;

  // Events received from server
  'attendance-session-created': (data: AttendanceSession & { success: boolean }) => void;
  'attendance-session-joined': (data: { session: AttendanceSession; success: boolean }) => void;
  'user-joined-session': (data: { user: { email: string; role: string }; sessionId: string; timestamp: Date }) => void;
  'user-left-session': (data: { user: { email: string; role: string }; sessionId: string; timestamp: Date }) => void;
  'student-attendance-marked': (data: {
    sessionId: string;
    studentId: string;
    status: string;
    markedBy: string;
    timestamp: Date;
    notes?: string;
    sessionProgress: {
      markedStudents: number;
      totalStudents: number;
      percentage: number;
    };
  }) => void;
  'bulk-attendance-marked': (data: {
    sessionId: string;
    recordsCount: number;
    records: Array<any>;
    markedBy: string;
    timestamp: Date;
    sessionProgress: {
      markedStudents: number;
      totalStudents: number;
      percentage: number;
    };
  }) => void;
  'session-status': (data: {
    sessionId: string;
    session: AttendanceSession;
    progress: {
      markedStudents: number;
      totalStudents: number;
      percentage: number;
    };
  }) => void;
  'session-closed': (data: {
    sessionId: string;
    closedBy: string;
    timestamp: Date;
  }) => void;
  'attendance-stats': (data: {
    classId: string;
    date: string;
    stats: Record<string, number>;
    summary: {
      totalStudents: number;
      presentCount: number;
      absentCount: number;
      lateCount: number;
      percentage: number;
    };
  }) => void;
  'attendance-error': (data: {
    message: string;
    error?: string;
  }) => void;
  'attendance-marked-success': (data: {
    studentId: string;
    status: string;
    timestamp: Date;
    sessionProgress: {
      markedStudents: number;
      totalStudents: number;
    };
  }) => void;
  'bulk-attendance-success': (data: {
    recordsCount: number;
    sessionProgress: {
      markedStudents: number;
      totalStudents: number;
    };
  }) => void;
  'session-close-success': (data: {
    sessionId: string;
  }) => void;

  // Workspace-wide events
  'new-attendance-session': (data: {
    sessionId: string;
    classId: string;
    createdBy: string;
    timestamp: Date;
  }) => void;
  'attendance-update': (data: {
    sessionId: string;
    classId: string;
    studentId: string;
    status: string;
    markedBy: string;
    timestamp: Date;
  }) => void;
  'bulk-attendance-update': (data: {
    sessionId: string;
    classId: string;
    recordsCount: number;
    markedBy: string;
    timestamp: Date;
  }) => void;
  'attendance-session-closed': (data: {
    sessionId: string;
    classId: string;
    closedBy: string;
    timestamp: Date;
  }) => void;
}

class SocketService {
  private static instance: SocketService;
  private socket: Socket | null = null;
  private isConnected = false;
  private eventListeners: Map<string, Array<(...args: any[]) => void>> = new Map();

  private constructor() {}

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  public connect(user: SocketUser): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve();
        return;
      }

      const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
      
      this.socket = io(baseURL, {
        auth: {
          userId: user.userId,
          workspaceId: user.workspaceId,
          role: user.role,
          email: user.email
        },
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000
      });

      this.socket.on('connect', () => {
        this.isConnected = true;
        console.log('🔌 Connected to Socket.IO server');
        resolve();
      });

      this.socket.on('disconnect', (reason) => {
        this.isConnected = false;
        console.log('❌ Disconnected from Socket.IO server:', reason);
      });

      this.socket.on('connect_error', (error) => {
        console.error('❌ Socket.IO connection error:', error);
        reject(error);
      });

      this.socket.on('error', (error) => {
        console.error('❌ Socket.IO error:', error);
      });

      // Restore event listeners
      this.eventListeners.forEach((listeners, event) => {
        listeners.forEach(listener => {
          this.socket?.on(event, listener);
        });
      });
    });
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      console.log('🔌 Disconnected from Socket.IO server');
    }
  }

  public isSocketConnected(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  // Event emission methods
  public createAttendanceSession(data: {
    classId: string;
    workspaceId: string;
    date: string;
    totalStudents: number;
  }): void {
    this.emit('create-attendance-session', data);
  }

  public joinAttendanceSession(sessionId: string, classId: string): void {
    this.emit('join-attendance-session', { sessionId, classId });
  }

  public leaveAttendanceSession(sessionId: string): void {
    this.emit('leave-attendance-session', { sessionId });
  }

  public markStudentAttendance(data: {
    sessionId: string;
    studentId: string;
    status: 'present' | 'absent' | 'late';
    notes?: string;
  }): void {
    this.emit('mark-student-attendance', data);
  }

  public bulkMarkAttendance(data: {
    sessionId: string;
    records: Array<{
      studentId: string;
      status: 'present' | 'absent' | 'late';
      notes?: string;
    }>;
  }): void {
    this.emit('bulk-mark-attendance', data);
  }

  public getSessionStatus(sessionId: string): void {
    this.emit('get-session-status', { sessionId });
  }

  public closeAttendanceSession(sessionId: string): void {
    this.emit('close-attendance-session', { sessionId });
  }

  public getAttendanceStats(classId: string, workspaceId: string, date: string): void {
    this.emit('get-attendance-stats', { classId, workspaceId, date });
  }

  // Event listener methods
  public on<K extends keyof AttendanceSocketEvents>(
    event: K,
    listener: AttendanceSocketEvents[K]
  ): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(listener);

    if (this.socket) {
      this.socket.on(event, listener);
    }
  }

  public off<K extends keyof AttendanceSocketEvents>(
    event: K,
    listener: AttendanceSocketEvents[K]
  ): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }

    if (this.socket) {
      this.socket.off(event, listener);
    }
  }

  public once<K extends keyof AttendanceSocketEvents>(
    event: K,
    listener: AttendanceSocketEvents[K]
  ): void {
    if (this.socket) {
      this.socket.once(event, listener);
    }
  }

  public emit(event: string, data: any): void {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data);
    } else {
      console.warn('⚠️ Socket not connected. Cannot emit event:', event);
    }
  }
}

export default SocketService;