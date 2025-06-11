import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Activity, 
  User, 
  Clock, 
  MapPin, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Shield,
  Eye,
  Zap
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface AuditLog {
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
  description?: string;
}

interface RealTimeActivityProps {
  logs: AuditLog[];
  isLive?: boolean;
}

const getActionIcon = (action: string, success: boolean) => {
  if (!success) return <XCircle className="h-4 w-4 text-red-500" />;
  
  if (action.includes('LOGIN')) return <User className="h-4 w-4 text-blue-500" />;
  if (action.includes('CREATE')) return <CheckCircle className="h-4 w-4 text-green-500" />;
  if (action.includes('UPDATE')) return <Activity className="h-4 w-4 text-orange-500" />;
  if (action.includes('DELETE')) return <AlertTriangle className="h-4 w-4 text-red-500" />;
  if (action.includes('VIEW')) return <Eye className="h-4 w-4 text-blue-400" />;
  
  return <Activity className="h-4 w-4 text-gray-500" />;
};

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'CRITICAL': return 'destructive';
    case 'HIGH': return 'secondary';
    case 'MEDIUM': return 'default';
    case 'LOW': return 'outline';
    default: return 'outline';
  }
};

const getActivityDescription = (log: AuditLog) => {
  const user = log.userId?.firstName && log.userId?.lastName 
    ? `${log.userId.firstName} ${log.userId.lastName}` 
    : log.userId?.email || log.userEmail || 'System';
  
  const action = log.action.toLowerCase().replace(/_/g, ' ');
  const resource = log.resource ? ` ${log.resource}` : '';
  const resourceId = log.resourceId ? ` (${log.resourceId.slice(-8)})` : '';
  
  return `${user} ${action}${resource}${resourceId}`;
};

export const RealTimeActivity: React.FC<RealTimeActivityProps> = ({ 
  logs, 
  isLive = false 
}) => {
  // Get recent logs (last 20)
  const recentLogs = React.useMemo(() => {
    return logs
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 20);
  }, [logs]);

  // Live activity stats
  const liveStats = React.useMemo(() => {
    const last5Minutes = new Date(Date.now() - 5 * 60 * 1000);
    const recentActivity = logs.filter(log => new Date(log.timestamp) > last5Minutes);
    
    return {
      totalRecent: recentActivity.length,
      successfulRecent: recentActivity.filter(log => log.success).length,
      failedRecent: recentActivity.filter(log => !log.success).length,
      uniqueUsersRecent: new Set(recentActivity.map(log => log.userId?._id || log.userEmail)).size
    };
  }, [logs]);

  return (
    <div className="space-y-4">
      {/* Live Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm text-muted-foreground">Last 5min</p>
              <p className="text-2xl font-bold">{liveStats.totalRecent}</p>
            </div>
            <Zap className={`h-8 w-8 ${isLive ? 'text-green-500' : 'text-gray-400'}`} />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm text-muted-foreground">Success</p>
              <p className="text-2xl font-bold text-green-600">{liveStats.successfulRecent}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm text-muted-foreground">Failed</p>
              <p className="text-2xl font-bold text-red-600">{liveStats.failedRecent}</p>
            </div>
            <XCircle className="h-8 w-8 text-red-500" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm text-muted-foreground">Users</p>
              <p className="text-2xl font-bold text-blue-600">{liveStats.uniqueUsersRecent}</p>
            </div>
            <User className="h-8 w-8 text-blue-500" />
          </CardContent>
        </Card>
      </div>

      {/* Real-time Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Real-time Activity Feed
            {isLive && (
              <div className="flex items-center gap-2 ml-auto">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-600">Live</span>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px] sm:h-[400px] w-full">
            <div className="space-y-3">
              {recentLogs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No recent activity</p>
                </div>
              ) : (
                recentLogs.map((log, index) => (
                  <div
                    key={log._id}
                    className={`flex items-start gap-3 p-3 rounded-lg border transition-all duration-300 ${
                      index === 0 && isLive ? 'bg-green-50 border-green-200' : 'hover:bg-muted/50'
                    }`}
                  >
                    {/* User Avatar */}
                    <Avatar className="h-10 w-10 sm:h-8 sm:w-8 mt-1">
                      <AvatarFallback className="text-xs">
                        {log.userId?.firstName?.[0] || log.userEmail?.[0]?.toUpperCase() || 'S'}
                      </AvatarFallback>
                    </Avatar>

                    {/* Activity Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                        <div className="flex items-center gap-2">
                          {getActionIcon(log.action, log.success)}
                          <span className="text-sm font-medium break-words">
                            {getActivityDescription(log)}
                          </span>
                        </div>
                        <Badge 
                          variant={getSeverityColor(log.severity) as any}
                          className="text-xs self-start sm:self-auto"
                        >
                          {log.severity}
                        </Badge>
                      </div>
                      
                      {/* Description */}
                      {log.description && (
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                          {log.description}
                        </p>
                      )}

                      {/* Metadata */}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>
                            {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                          </span>
                        </div>
                        
                        {log.ipAddress && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span>{log.ipAddress}</span>
                          </div>
                        )}

                        {log.resource && (
                          <div className="flex items-center gap-1">
                            <Shield className="h-3 w-3" />
                            <span className="capitalize">{log.resource}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Status Indicator */}
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      log.success ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Security Alerts */}
      {logs.some(log => log.severity === 'CRITICAL' || !log.success) && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-5 w-5" />
              Security Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {logs
                .filter(log => log.severity === 'CRITICAL' || !log.success)
                .slice(0, 5)
                .map((log) => (
                  <div
                    key={log._id}
                    className="flex items-center justify-between p-2 bg-white rounded border"
                  >
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <span className="text-sm font-medium">
                        {log.action.replace(/_/g, ' ')}
                      </span>
                      {log.userEmail && (
                        <span className="text-xs text-muted-foreground">
                          by {log.userEmail}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive" className="text-xs">
                        {log.severity}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};