import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toastSuccess, toastError } from "@/utils/toast";

// Add temporary toastWarning function
const toastWarning = (message: string) => {
  console.warn(message);
  // You can implement proper warning toast here if needed
};
import API from "@/lib/axios-client";

// Types
export interface AttendanceConfig {
  _id: string;
  isActive: boolean;
  voiceCallConfig: {
    enabled: boolean;
    maxAttempts: number;
    retryDelayMinutes: number;
    callWindowStart: string;
    callWindowEnd: string;
    messageTemplate: string;
  };
  smsConfig: {
    enabled: boolean;
    maxAttempts: number;
    retryDelayMinutes: number;
    messageTemplate: string;
  };
  whatsappConfig: {
    enabled: boolean;
    maxAttempts: number;
    retryDelayMinutes: number;
    messageTemplate: string;
    useBusinessAPI: boolean;
  };
  generalConfig: {
    autoTriggerEnabled: boolean;
    triggerDelayMinutes: number;
    workingDaysOnly: boolean;
    communicationOrder: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceRecord {
  _id: string;
  studentId: {
    _id: string;
    firstName: string;
    lastName: string;
    rollNumber: string;
    parentInfo: {
      primaryMobileNo: string;
    };
  };
  classId: {
    _id: string;
    name: string;
    section?: string;
  };
  academicYear: string;
  year: string;
  month: string;
  attendanceData: AttendanceData[];
  monthlyStats: MonthlyStats;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceData {
  date: string;
  status: 'present' | 'absent' | 'late' | 'half-day' | 'holiday' | 'leave';
  markedBy: string;
  remarks?: string;
  markedAt: string;
  voiceCallAttempts: number;
  smsAttempts: number;
  whatsappAttempts: number;
  voiceCallStatus: 'success' | 'failed' | 'pending' | 'max_reached';
  smsStatus: 'delivered' | 'failed' | 'pending' | 'max_reached';
  whatsappStatus: 'delivered' | 'read' | 'failed' | 'max_reached' | 'pending';
  lastVoiceCallAt?: string;
  lastSmsAt?: string;
  lastWhatsappAt?: string;
  nextRetryAt?: string;
}

export interface MonthlyStats {
  totalDaysMarked: number;
  totalPresent: number;
  totalAbsent: number;
  totalLate: number;
  totalHalfDay: number;
  totalLeave: number;
  totalHolidays: number;
  attendancePercentage: number;
  absentDates: string[];
  communicationCount: {
    totalVoiceCalls: number;
    totalSMS: number;
    totalWhatsApp: number;
    successfulCalls: number;
    deliveredSMS: number;
    deliveredWhatsApp: number;
  };
}

export interface DashboardStats {
  todayStats: {
    marked: number;
    present: number;
    absent: number;
  };
  monthlyStats: {
    totalStudents: number;
    totalPresent: number;
    totalAbsent: number;
    totalLate: number;
    averageAttendance: number;
    highAbsenceStudents: number;
  };
  communicationStats: {
    totalVoiceCalls: number;
    totalSMS: number;
    totalWhatsApp: number;
    successfulCalls: number;
    deliveredSMS: number;
    deliveredWhatsApp: number;
  };
}

export interface ClassAttendance {
  student: {
    _id: string;
    firstName: string;
    lastName: string;
    rollNumber: string;
    parentInfo: {
      primaryMobileNo: string;
    };
  };
  class: {
    _id: string;
    name: string;
    section?: string;
  };
  attendance: AttendanceData | null;
}

export interface StudentWithAttendance {
  student: {
    _id: string;
    firstName: string;
    lastName: string;
    rollNumber: string;
    parentInfo: {
      primaryMobileNo: string;
    };
    classId: {
      _id: string;
      name: string;
      section?: string;
    };
  };
  class: {
    _id: string;
    name: string;
    section?: string;
  };
  monthlyRecord: AttendanceRecord;
}

// API Hooks

// Get attendance configuration
export const useGetAttendanceConfig = () => {
  return useQuery({
    queryKey: ["attendanceConfig"],
    queryFn: async (): Promise<AttendanceConfig | null> => {
      const response = await API.get("/attendance/config");
      return response.data.config;
    },
  });
};

// Create/Update attendance configuration
export const useCreateAttendanceConfig = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (configData: Partial<AttendanceConfig>) => {
      const response = await API.post("/attendance/config", configData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendanceConfig"] });
      toastSuccess("Attendance configuration updated successfully");
    },
    onError: (error: any) => {
      toastError(error.response?.data?.message || "Failed to update configuration");
    },
  });
};

// Mark single attendance
export const useMarkAttendance = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (attendanceData: {
      studentId: string;
      classId: string;
      date: string;
      status: string;
      remarks?: string;
    }) => {
      const response = await API.post("/attendance/mark", attendanceData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classAttendance"] });
      queryClient.invalidateQueries({ queryKey: ["monthlyStats"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
      toastSuccess("Attendance marked successfully");
    },
    onError: (error: any) => {
      toastError(error.response?.data?.message || "Failed to mark attendance");
    },
  });
};

// Mark bulk attendance
export const useMarkBulkAttendance = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (bulkData: {
      classId: string;
      date: string;
      attendanceList: Array<{
        studentId: string;
        status: string;
        remarks?: string;
      }>;
    }) => {
      const response = await API.post("/attendance/mark-bulk", bulkData);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["classAttendance"] });
      queryClient.invalidateQueries({ queryKey: ["monthlyStats"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
      
      // Use the detailed message from the backend
      const result = data.result;
      if (result.failed > 0 && (result.success > 0 || result.updated > 0)) {
        // Partial success - show warning
        toastWarning(data.message);
      } else if (result.failed > 0) {
        // All failed - show error
        toastError(data.message);
      } else {
        // All successful - show success
        toastSuccess(data.message);
      }
    },
    onError: (error: any) => {
      toastError(error.response?.data?.message || "Failed to mark bulk attendance");
    },
  });
};

// Get class attendance by date
export const useGetClassAttendance = (classId?: string, date?: string) => {
  return useQuery({
    queryKey: ["classAttendance", classId, date],
    queryFn: async (): Promise<ClassAttendance[]> => {
      if (!classId || !date) return [];
      const response = await API.get(`/attendance/class/${classId}`, {
        params: { date }
      });
      return response.data.attendance;
    },
    enabled: !!classId && !!date,
  });
};

// Get class attendance by date with filtered students (only students with attendance records for that month)
export const useGetClassAttendanceWithStudents = (classId?: string, date?: string) => {
  return useQuery({
    queryKey: ["classAttendanceWithStudents", classId, date],
    queryFn: async (): Promise<ClassAttendance[]> => {
      if (!classId || !date) return [];
      const response = await API.get(`/attendance/class-with-students/${classId}`, {
        params: { date }
      });
      return response.data.attendance;
    },
    enabled: !!classId && !!date,
  });
};

// Get students who have attendance records for specific month/year
export const useGetStudentsWithAttendance = (classId?: string, year?: string, month?: string) => {
  return useQuery({
    queryKey: ["studentsWithAttendance", classId, year, month],
    queryFn: async (): Promise<StudentWithAttendance[]> => {
      if (!classId || !year || !month) return [];
      const response = await API.get(`/attendance/students/${classId}`, {
        params: { year, month }
      });
      return response.data.students;
    },
    enabled: !!classId && !!year && !!month,
  });
};

// Get monthly statistics
export const useGetMonthlyStats = (params: {
  year: string;
  month: string;
  classId?: string;
  studentId?: string;
}) => {
  return useQuery({
    queryKey: ["monthlyStats", params],
    queryFn: async () => {
      const { year, month, ...queryParams } = params;
      const response = await API.get(`/attendance/stats/${year}/${month}`, {
        params: queryParams
      });
      return response.data.stats;
    },
    enabled: !!params.year && !!params.month,
  });
};

// Get dashboard statistics
export const useGetDashboardStats = (classIds?: string[]) => {
  return useQuery({
    queryKey: ["dashboardStats", classIds],
    queryFn: async (): Promise<DashboardStats> => {
      const response = await API.get("/attendance/dashboard-stats", {
        params: classIds ? { classIds: classIds.join(',') } : {}
      });
      return response.data.stats;
    },
    refetchInterval: 60000, // Refetch every minute for real-time stats
  });
};

// Get attendance report
export const useGetAttendanceReport = (params: {
  classId: string;
  year: string;
  month: string;
  threshold?: number;
}) => {
  return useQuery({
    queryKey: ["attendanceReport", params],
    queryFn: async () => {
      const { classId, year, month, threshold } = params;
      const response = await API.get(`/attendance/report/${classId}/${year}/${month}`, {
        params: threshold ? { threshold } : {}
      });
      return response.data;
    },
    enabled: !!params.classId && !!params.year && !!params.month,
  });
};

// Get students for communication retry
export const useGetRetryStudents = (communicationType: 'voiceCall' | 'sms' | 'whatsapp') => {
  return useQuery({
    queryKey: ["retryStudents", communicationType],
    queryFn: async () => {
      const response = await API.get(`/attendance/retry/${communicationType}`);
      return response.data.students;
    },
    refetchInterval: 300000, // Refetch every 5 minutes
  });
};

// Update communication status
export const useUpdateCommunicationStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (params: {
      attendanceId: string;
      date: string;
      communicationType: 'voiceCall' | 'sms' | 'whatsapp';
      status: 'success' | 'failed' | 'delivered' | 'read' | 'max_reached';
    }) => {
      const { attendanceId, ...data } = params;
      const response = await API.patch(`/attendance/communication/${attendanceId}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["retryStudents"] });
      queryClient.invalidateQueries({ queryKey: ["monthlyStats"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
      toastSuccess("Communication status updated successfully");
    },
    onError: (error: any) => {
      toastError(error.response?.data?.message || "Failed to update communication status");
    },
  });
};

// Monthly Attendance Summary Interface
export interface MonthlyAttendanceSummary {
  classInfo: {
    _id: string;
    name: string;
    section?: string;
  };
  year: string;
  month: string;
  monthName: string;
  daysInMonth: number;
  monthDays: number[];
  students: StudentAttendanceSummary[];
  overallStats: {
    totalStudents: number;
    averageAttendance: number;
    totalWorkingDays: number;
    totalHolidays: number;
  };
}

export interface StudentAttendanceSummary {
  srNo: number;
  studentId: string;
  studentName: string;
  rollNumber: string;
  parentInfo: {
    primaryMobileNo: string;
  };
  dailyAttendance: DailyAttendanceCell[];
  summary: {
    totalAttended: number;
    totalMissed: number;
    totalLate: number;
    totalHolidays: number;
    totalLeave: number;
    attendancePercentage: number;
    workingDays: number;
  };
}

export interface DailyAttendanceCell {
  day: number;
  status: string; // 'P', 'A', 'L', 'H', 'WO', etc.
  fullStatus: string | null; // 'present', 'absent', etc.
  color: string;
  hasData: boolean;
}

// Get monthly attendance summary hook
export const useMonthlyAttendanceSummary = (
  classId: string,
  year: string,
  month: string,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ["attendance", "monthly-summary", classId, year, month],
    queryFn: async (): Promise<MonthlyAttendanceSummary> => {
      const response = await API.get(`/attendance/summary/${classId}/${year}/${month}`);
      return response.data.summary;
    },
    enabled: enabled && !!classId && !!year && !!month,
    refetchOnWindowFocus: false,
  });
};