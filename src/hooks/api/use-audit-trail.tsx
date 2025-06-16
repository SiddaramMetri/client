import { useQuery } from '@tanstack/react-query';
import API from '@/lib/axios-client';

export interface AuditTrailEntry {
  _id?: string;
  previousStatus?: string;
  newStatus: string;
  previousRemarks?: string;
  newRemarks?: string;
  changedBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  changedAt: string;
  changeReason?: string;
  ipAddress?: string;
  userAgent?: string;
  isInitialEntry: boolean;
}

export interface StudentAuditEntry {
  day: number;
  date: string;
  student: {
    id: string;
    name: string;
    rollNumber: string;
  };
  currentStatus: string;
  hasChanges: boolean;
  changeCount: number;
  lastModified: string;
  version: number;
  auditTrail: AuditTrailEntry[];
}

export interface DailySummary {
  day: number;
  totalStudents: number;
  studentsWithChanges: number;
  totalChanges: number;
  hasActivity: boolean;
  entries: StudentAuditEntry[];
}

export interface AuditTrailCalendar {
  classInfo: {
    _id: string;
    name: string;
    section: string;
  } | null;
  year: string;
  month: string;
  monthName: string;
  daysInMonth: number;
  dailySummary: DailySummary[];
  auditTrailByDate: { [day: number]: StudentAuditEntry[] };
}

export interface AuditTrailCalendarResponse {
  message: string;
  classId: string;
  year: string;
  month: string;
  auditCalendar: AuditTrailCalendar;
}

// Hook to get audit trail calendar data
export const useAuditTrailCalendar = (classId: string, year: string, month: string) => {
  return useQuery({
    queryKey: ['audit-trail-calendar', classId, year, month],
    queryFn: async (): Promise<AuditTrailCalendarResponse> => {
      const response = await API.get(`/attendance/audit-calendar/${classId}/${year}/${month}`);
      return response.data;
    },
    enabled: !!classId && !!year && !!month,
    staleTime: 30000, // 30 seconds
    gcTime: 300000, // 5 minutes
  });
};

// Hook to get audit report with filters
export const useAuditReport = (filters: {
  classId?: string;
  studentId?: string;
  startDate?: string;
  endDate?: string;
  changedBy?: string;
}) => {
  const queryParams = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      queryParams.append(key, value);
    }
  });

  return useQuery({
    queryKey: ['audit-report', filters],
    queryFn: async () => {
      const response = await API.get(`/attendance/audit-report?${queryParams.toString()}`);
      return response.data;
    },
    enabled: Object.values(filters).some(value => !!value),
    staleTime: 60000, // 1 minute
  });
};

// Hook to get suspicious changes
export const useSuspiciousChanges = (timeWindowMinutes: number = 5) => {
  return useQuery({
    queryKey: ['suspicious-changes', timeWindowMinutes],
    queryFn: async () => {
      const response = await API.get(`/attendance/suspicious-changes?timeWindowMinutes=${timeWindowMinutes}`);
      return response.data;
    },
    staleTime: 30000, // 30 seconds
  });
};

// Hook to get attendance history for a specific student and date
export const useAttendanceHistory = (studentId: string, date: string) => {
  return useQuery({
    queryKey: ['attendance-history', studentId, date],
    queryFn: async () => {
      const response = await API.get(`/attendance/history/${studentId}/${date}`);
      return response.data;
    },
    enabled: !!studentId && !!date,
    staleTime: 60000, // 1 minute
  });
};