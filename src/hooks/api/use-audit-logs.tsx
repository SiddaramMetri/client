import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { auditLogService, AuditLogFilters } from '@/services/audit-log.service';

// Query keys
export const auditLogKeys = {
  all: ['audit-logs'] as const,
  lists: () => [...auditLogKeys.all, 'list'] as const,
  list: (filters: AuditLogFilters) => [...auditLogKeys.lists(), { filters }] as const,
  filterOptions: () => [...auditLogKeys.all, 'filter-options'] as const,
  stats: (options?: { days?: number; workspaceId?: string }) => 
    [...auditLogKeys.all, 'stats', options] as const,
  userActivity: (userId?: string, days?: number) => 
    [...auditLogKeys.all, 'user-activity', userId, days] as const,
  myActivity: (days?: number) => [...auditLogKeys.all, 'my-activity', days] as const,
};

// Hook to fetch audit logs with filters and pagination
export const useAuditLogs = (filters: AuditLogFilters = {}) => {
  return useQuery({
    queryKey: auditLogKeys.list(filters),
    queryFn: () => auditLogService.getAuditLogs(filters),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to fetch filter options
export const useAuditLogFilterOptions = () => {
  return useQuery({
    queryKey: auditLogKeys.filterOptions(),
    queryFn: () => auditLogService.getFilterOptions(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

// Hook to fetch audit log statistics
export const useAuditLogStats = (options: { days?: number; workspaceId?: string } = {}) => {
  return useQuery({
    queryKey: auditLogKeys.stats(options),
    queryFn: () => auditLogService.getStats(options),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook to fetch current user's activity
export const useMyAuditActivity = (days = 30) => {
  return useQuery({
    queryKey: auditLogKeys.myActivity(days),
    queryFn: () => auditLogService.getCurrentUserActivity(days),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
};

// Hook to fetch specific user's activity
export const useUserAuditActivity = (userId: string, days = 30) => {
  return useQuery({
    queryKey: auditLogKeys.userActivity(userId, days),
    queryFn: () => auditLogService.getUserActivity(userId, days),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
};

// Hook to invalidate audit log queries
export const useInvalidateAuditLogs = () => {
  const queryClient = useQueryClient();

  return {
    invalidateAll: () => queryClient.invalidateQueries({ queryKey: auditLogKeys.all }),
    invalidateLists: () => queryClient.invalidateQueries({ queryKey: auditLogKeys.lists() }),
    invalidateStats: () => queryClient.invalidateQueries({ 
      queryKey: auditLogKeys.all,
      predicate: (query) => query.queryKey.includes('stats')
    }),
    invalidateUserActivity: (userId?: string) => {
      if (userId) {
        queryClient.invalidateQueries({ queryKey: auditLogKeys.userActivity(userId) });
      } else {
        queryClient.invalidateQueries({ queryKey: auditLogKeys.myActivity() });
      }
    },
  };
};

// Real-time hooks for live updates (if needed)
export const useRealtimeAuditLogs = (filters: AuditLogFilters = {}) => {
  const queryClient = useQueryClient();
  
  // Refresh every 30 seconds for live updates
  const query = useAuditLogs(filters);
  
  // Set up auto-refresh
  React.useEffect(() => {
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: auditLogKeys.list(filters) });
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [queryClient, filters]);

  return query;
};

// Export individual hooks for convenience
export {
  auditLogService,
};

// Type exports
export type {
  AuditLogFilters,
  AuditLog,
  AuditLogResponse,
  FilterOptions,
  AuditStats,
  StatsResponse,
  UserActivitySummary,
} from '@/services/audit-log.service';