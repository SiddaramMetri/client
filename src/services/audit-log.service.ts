import API from '@/lib/axios-client';

export interface AuditLogFilters {
  page?: number;
  limit?: number;
  userId?: string;
  action?: string;
  category?: string;
  severity?: string;
  resource?: string;
  resourceId?: string;
  workspaceId?: string;
  success?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export interface AuditLog {
  _id: string;
  timestamp: string;
  action: string;
  category: string;
  severity: string;
  resource?: string;
  resourceId?: string;
  success: boolean;
  userId?: {
    _id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
  userEmail?: string;
  ipAddress?: string;
  userAgent?: string;
  description?: string;
  duration?: number;
  metadata?: Record<string, unknown>;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  changedFields?: string[];
}

export interface AuditLogResponse {
  message: string;
  logs: AuditLog[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  filters: AuditLogFilters;
}

export interface FilterOptions {
  message: string;
  filterOptions: {
    actions: string[];
    categories: string[];
    severities: string[];
    resources: string[];
  };
}

export interface AuditStats {
  totalActions: number;
  successfulActions: number;
  failedActions: number;
  uniqueUsers: number;
  actionBreakdown: Record<string, number>;
  categoryBreakdown: Record<string, number>;
  severityBreakdown: Record<string, number>;
  dailyActivity: Record<string, number>;
  topUsers: Array<{ userId: string; count: number }>;
  topResources: Array<{ resource: string; count: number }>;
}

export interface StatsResponse {
  message: string;
  stats: AuditStats;
  period: string;
}

export interface UserActivitySummary {
  message: string;
  summary: Array<{
    _id: string;
    actions: Array<{
      action: string;
      count: number;
    }>;
    totalActions: number;
  }>;
  period: string;
}

class AuditLogService {
  private baseUrl = '/audit-logs';

  async getAuditLogs(filters: AuditLogFilters = {}): Promise<AuditLogResponse> {
    // Build query parameters
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await API.get(`${this.baseUrl}?${params.toString()}`);
    return response.data;
  }

  async getFilterOptions(): Promise<FilterOptions> {
    const response = await API.get(`${this.baseUrl}/filter-options`);
    return response.data;
  }

  async getStats(options: { days?: number; workspaceId?: string } = {}): Promise<StatsResponse> {
    const params = new URLSearchParams();
    
    if (options.days) params.append('days', options.days.toString());
    if (options.workspaceId) params.append('workspaceId', options.workspaceId);

    const response = await API.get(`${this.baseUrl}/stats?${params.toString()}`);
    return response.data;
  }

  async getCurrentUserActivity(days = 30): Promise<UserActivitySummary> {
    const response = await API.get(`${this.baseUrl}/my-activity?days=${days}`);
    return response.data;
  }

  async getUserActivity(userId: string, days = 30): Promise<UserActivitySummary> {
    const response = await API.get(`${this.baseUrl}/user/${userId}/activity?days=${days}`);
    return response.data;
  }

  async exportLogs(filters: AuditLogFilters = {}): Promise<void> {
    // Build query parameters for export
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    try {
      const response = await API.get(`${this.baseUrl}/export?${params.toString()}`, {
        responseType: 'blob',
      });

      // Create blob and download
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename with current date
      const date = new Date().toISOString().split('T')[0];
      link.download = `audit-logs-${date}.csv`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export audit logs:', error);
      throw new Error('Failed to export audit logs');
    }
  }

  // Utility methods for formatting and filtering
  formatAction(action: string): string {
    return action.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  }

  formatCategory(category: string): string {
    return category.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  }

  getSeverityColor(severity: string): string {
    switch (severity) {
      case 'CRITICAL':
        return 'destructive';
      case 'HIGH':
        return 'secondary';
      case 'MEDIUM':
        return 'default';
      case 'LOW':
        return 'outline';
      default:
        return 'outline';
    }
  }

  getSeverityVariant(severity: string): 'default' | 'destructive' | 'outline' | 'secondary' {
    switch (severity) {
      case 'CRITICAL':
        return 'destructive';
      case 'HIGH':
        return 'secondary';
      case 'MEDIUM':
        return 'default';
      case 'LOW':
        return 'outline';
      default:
        return 'outline';
    }
  }

  // Helper to determine if an action is security-related
  isSecurityAction(action: string): boolean {
    const securityActions = [
      'LOGIN_FAILED',
      'UNAUTHORIZED_ACCESS_ATTEMPT', 
      'PERMISSION_DENIED',
      'SUSPICIOUS_ACTIVITY',
      'PASSWORD_CHANGED',
      'SECURITY_POLICY_VIOLATION'
    ];
    return securityActions.includes(action);
  }

  // Helper to determine if an action is high-risk
  isHighRiskAction(action: string): boolean {
    const highRiskActions = [
      'USER_DELETED',
      'STUDENT_DELETED', 
      'CLASS_DELETED',
      'WORKSPACE_DELETED',
      'PROJECT_DELETED'
    ];
    return highRiskActions.includes(action);
  }

  // Helper to get user display name
  getUserDisplayName(log: AuditLog): string {
    if (log.userId?.firstName && log.userId?.lastName) {
      return `${log.userId.firstName} ${log.userId.lastName}`;
    }
    if (log.userId?.email) {
      return log.userId.email;
    }
    if (log.userEmail) {
      return log.userEmail;
    }
    return 'System';
  }

  // Helper to format duration
  formatDuration(milliseconds?: number): string {
    if (!milliseconds) return 'N/A';
    
    if (milliseconds < 1000) {
      return `${milliseconds}ms`;
    }
    
    const seconds = milliseconds / 1000;
    if (seconds < 60) {
      return `${seconds.toFixed(1)}s`;
    }
    
    const minutes = seconds / 60;
    return `${minutes.toFixed(1)}m`;
  }
}

export const auditLogService = new AuditLogService();
export default auditLogService;