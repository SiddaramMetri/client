import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  Users, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Shield,
  TrendingUp,
  Database
} from 'lucide-react';
import AuditStatsCards from './audit-stats-cards';

interface AuditStats {
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

interface AuditLogsStatsProps {
  stats: AuditStats;
}

export const AuditLogsStats: React.FC<AuditLogsStatsProps> = ({ stats }) => {
  const successRate = stats.totalActions > 0 
    ? (stats.successfulActions / stats.totalActions) * 100 
    : 0;

  const topActions = Object.entries(stats.actionBreakdown)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const topCategories = Object.entries(stats.categoryBreakdown)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'text-red-600';
      case 'HIGH':
        return 'text-orange-600';
      case 'MEDIUM':
        return 'text-yellow-600';
      case 'LOW':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'HIGH':
        return <Shield className="h-4 w-4 text-orange-600" />;
      default:
        return <Activity className="h-4 w-4 text-blue-600" />;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

      <div className='col-span-3 md:col-span-2 lg:col-span-4'>
      <AuditStatsCards statsData={stats}  successRate={successRate}/>
      </div>

      {/* Overview Cards */}
     

      {/* Top Actions */}
      <Card className="col-span-1 md:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg">Top Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topActions.map(([action, count], index) => (
              <div key={action} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium text-blue-600">
                    {index + 1}
                  </div>
                  <span className="text-sm font-medium">
                    {action.replace(/_/g, ' ')}
                  </span>
                </div>
                <Badge variant="secondary">{count}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Severity Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Severity Levels</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(stats.severityBreakdown)
              .sort(([, a], [, b]) => b - a)
              .map(([severity, count]) => (
                <div key={severity} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getSeverityIcon(severity)}
                    <span className={`text-sm font-medium ${getSeverityColor(severity)}`}>
                      {severity}
                    </span>
                  </div>
                  <Badge variant="outline">{count}</Badge>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Top Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topCategories.map(([category, count], index) => (
              <div key={category} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {category.replace(/_/g, ' ')}
                  </span>
                </div>
                <Badge variant="outline">{count}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Resources */}
      {stats.topResources.length > 0 && (
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Most Active Resources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {stats.topResources.slice(0, 6).map((item, index) => (
                <div key={item.resource} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-xs font-medium text-green-600">
                      {index + 1}
                    </div>
                    <span className="text-sm font-medium capitalize">
                      {item.resource}
                    </span>
                  </div>
                  <Badge variant="secondary">{item.count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Daily Activity Trend */}
      {Object.keys(stats.dailyActivity).length > 0 && (
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Daily Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(stats.dailyActivity)
                .sort(([dateA], [dateB]) => dateB.localeCompare(dateA))
                .slice(0, 7)
                .map(([date, count]) => {
                  const maxCount = Math.max(...Object.values(stats.dailyActivity));
                  const percentage = (count / maxCount) * 100;
                  
                  return (
                    <div key={date} className="flex items-center gap-3">
                      <div className="w-20 text-xs text-muted-foreground">
                        {new Date(date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </div>
                      <div className="flex-1">
                        <Progress value={percentage} className="h-2" />
                      </div>
                      <div className="w-12 text-xs text-right font-medium">
                        {count}
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};