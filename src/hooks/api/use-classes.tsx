import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { classService, ClassFilters, CreateClassData, UpdateClassData } from '@/services/class.service';

// Hook for fetching classes with pagination and filters
export const useClasses = (filters: ClassFilters = {}) => {
  return useQuery({
    queryKey: ['classes', filters],
    queryFn: () => classService.getClasses(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook for fetching all classes (useful for dropdowns)
export const useAllClasses = (academicYearId?: string, activeOnly: boolean = true) => {
  return useQuery({
    queryKey: ['all-classes', { academicYearId, activeOnly }],
    queryFn: () => classService.getClasses({
      limit: 100,
      sortBy: 'name',
      sortOrder: 'asc',
      ...(academicYearId && { academicYearId }),
      ...(activeOnly && { isActive: 'true' }),
    }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook for fetching a single class by ID
export const useClass = (id: string) => {
  return useQuery({
    queryKey: ['class', id],
    queryFn: () => classService.getClassById(id),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!id,
  });
};

// Hook for class statistics
export const useClassStats = () => {
  return useQuery({
    queryKey: ['class-stats'],
    queryFn: () => classService.getClassStats(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook for creating a class
export const useCreateClass = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateClassData) => classService.createClass(data),
    onSuccess: () => {
      // Invalidate and refetch class-related queries
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      queryClient.invalidateQueries({ queryKey: ['all-classes'] });
      queryClient.invalidateQueries({ queryKey: ['class-stats'] });
    },
  });
};

// Hook for updating a class
export const useUpdateClass = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateClassData }) => 
      classService.updateClass(id, data),
    onSuccess: (_, variables) => {
      // Invalidate and refetch class-related queries
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      queryClient.invalidateQueries({ queryKey: ['all-classes'] });
      queryClient.invalidateQueries({ queryKey: ['class', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['class-stats'] });
    },
  });
};

// Hook for deleting a class
export const useDeleteClass = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => classService.deleteClass(id),
    onSuccess: () => {
      // Invalidate and refetch class-related queries
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      queryClient.invalidateQueries({ queryKey: ['all-classes'] });
      queryClient.invalidateQueries({ queryKey: ['class-stats'] });
    },
  });
};