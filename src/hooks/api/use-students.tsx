import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toastSuccess, toastError, toastWarning } from "@/utils/toast";
import {
  getStudentsService,
  getStudentByIdService,
  createStudentService,
  updateStudentService,
  deleteStudentService,
  uploadStudentExcelService,
  toggleStudentStatusService,
  GetStudentsParams,
} from "@/services/student.service";
import { Task } from "@/page/dashboard/students/data/schema";

// Query keys
export const studentKeys = {
  all: ['students'] as const,
  lists: () => [...studentKeys.all, 'list'] as const,
  list: (params: GetStudentsParams) => [...studentKeys.lists(), params] as const,
  details: () => [...studentKeys.all, 'detail'] as const,
  detail: (id: string) => [...studentKeys.details(), id] as const,
};

// Hook to fetch students with pagination and filters
export const useStudents = (params: GetStudentsParams = {}) => {
  return useQuery({
    queryKey: studentKeys.list(params),
    queryFn: () => getStudentsService(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook to fetch a single student by ID
export const useStudent = (studentId: string) => {
  return useQuery({
    queryKey: studentKeys.detail(studentId),
    queryFn: () => getStudentByIdService(studentId),
    enabled: !!studentId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Hook to create a new student
export const useCreateStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Task>) => createStudentService(data),
    onSuccess: () => {
      // Invalidate and refetch students list
      queryClient.invalidateQueries({ queryKey: studentKeys.lists() });
      
      toastSuccess("Student has been successfully added to the system");
    },
    onError: (error: any) => {
      toastError(error.response?.data?.message || "Failed to create student");
    },
  });
};

// Hook to update a student
export const useUpdateStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ studentId, data }: { studentId: string; data: Partial<Task> }) =>
      updateStudentService(studentId, data),
    onSuccess: (_, variables) => {
      // Invalidate and refetch students list
      queryClient.invalidateQueries({ queryKey: studentKeys.lists() });
      // Invalidate specific student detail
      queryClient.invalidateQueries({ 
        queryKey: studentKeys.detail(variables.studentId) 
      });
      
      toastSuccess("Student information has been successfully updated");
    },
    onError: (error: any) => {
      toastError(error.response?.data?.message || "Failed to update student");
    },
  });
};

// Hook to delete a student
export const useDeleteStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (studentId: string) => deleteStudentService(studentId),
    onSuccess: (_, variables) => {
      // Invalidate and refetch students list
      queryClient.invalidateQueries({ queryKey: studentKeys.lists() });
      // Remove specific student detail from cache
      queryClient.removeQueries({ 
        queryKey: studentKeys.detail(variables) 
      });
      
      toastSuccess("Student has been successfully removed from the system");
    },
    onError: (error: any) => {
      toastError(error.response?.data?.message || "Failed to delete student");
    },
  });
};

// Hook to upload Excel file with students
export const useUploadStudentExcel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => uploadStudentExcelService(file),
    onSuccess: (data) => {
      // Invalidate and refetch students list
      queryClient.invalidateQueries({ queryKey: studentKeys.lists() });
      
      const { results } = data;
      
      if (results.success > 0 && results.failed === 0) {
        toastSuccess(`Successfully uploaded ${results.success} students`);
      } else if (results.success > 0 && results.failed > 0) {
        toastWarning(`${results.success} students uploaded successfully, ${results.failed} failed`);
      } else {
        toastError(`Failed to upload students. ${results.failed} errors occurred.`);
      }
    },
    onError: (error: any) => {
      toastError(error.response?.data?.message || "Failed to upload Excel file");
    },
  });
};

// Hook for prefetching student data
export const usePrefetchStudent = () => {
  const queryClient = useQueryClient();

  return (studentId: string) => {
    queryClient.prefetchQuery({
      queryKey: studentKeys.detail(studentId),
      queryFn: () => getStudentByIdService(studentId),
      staleTime: 5 * 60 * 1000,
    });
  };
};

// Hook to toggle student status (activate/deactivate)
export const useToggleStudentStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (studentId: string) => toggleStudentStatusService(studentId),
    onSuccess: (data, variables) => {
      // Invalidate and refetch students list
      queryClient.invalidateQueries({ queryKey: studentKeys.lists() });
      // Update specific student detail in cache
      queryClient.setQueryData(
        studentKeys.detail(variables), 
        { student: data.student, message: data.message }
      );
      
      toastSuccess(data.message);
    },
    onError: (error: any) => {
      toastError(error.response?.data?.message || "Failed to update student status");
    },
  });
};

// Helper hook to get students count by status
export const useStudentsStats = () => {
  const { data: allStudents } = useStudents({ limit: 1 }); // Just get count, not actual data
  const { data: activeStudents } = useStudents({ limit: 1, isActive: true });
  const { data: inactiveStudents } = useStudents({ limit: 1, isActive: false });

  return {
    total: allStudents?.pagination?.total || 0,
    active: activeStudents?.pagination?.total || 0,
    inactive: inactiveStudents?.pagination?.total || 0,
    isLoading: !allStudents || !activeStudents || !inactiveStudents,
  };
};