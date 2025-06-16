import { useQuery } from '@tanstack/react-query';
import { academicYearService, AcademicYearFilters } from '@/services/academicYear.service';

export const useAcademicYears = (filters: AcademicYearFilters = {}) => {
  return useQuery({
    queryKey: ['academic-years-paginated', filters],
    queryFn: () => academicYearService.getAcademicYears(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useAllAcademicYears = (showActiveOnly = false) => {
  return useQuery({
    queryKey: ['academic-years-all', { showActiveOnly }],
    queryFn: async () => {
      const academicYears = await academicYearService.getAllAcademicYears();
      return showActiveOnly ? academicYears.filter(year => year.isActive) : academicYears;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useAcademicYear = (id: string) => {
  return useQuery({
    queryKey: ['academic-year', id],
    queryFn: () => academicYearService.getAcademicYearById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useActiveAcademicYear = () => {
  return useQuery({
    queryKey: ['academic-year-active'],
    queryFn: () => academicYearService.getActiveAcademicYear(),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};