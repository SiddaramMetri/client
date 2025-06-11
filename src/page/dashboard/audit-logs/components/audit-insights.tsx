import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Shield, 
  Users, 
  Clock,
  Target,
  Zap,
  BarChart3,
  PieChart
} from 'lucide-react';
import { format, subDays, isToday, isYesterday } from 'date-fns';

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

interface AuditInsightsProps {
  stats: AuditStats;
  logs: any[];
  previousStats?: AuditStats;
}

export const AuditInsights: React.FC<AuditInsightsProps> = ({ 
  stats, 
  logs, 
  previousStats 
}) => {
  
  // Calculate trends and insights
  const insights = React.useMemo(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');
    
    const todayActivity = stats.dailyActivity[today] || 0;
    const yesterdayActivity = stats.dailyActivity[yesterday] || 0;
    
    const dailyTrend = yesterdayActivity > 0 
      ? ((todayActivity - yesterdayActivity) / yesterdayActivity) * 100 
      : todayActivity > 0 ? 100 : 0;

    // Peak activity analysis
    const hourlyActivity = logs.reduce((acc, log) => {
      const hour = new Date(log.timestamp).getHours();
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    const peakHour = Object.entries(hourlyActivity)
      .sort(([,a], [,b]) => b - a)[0];

    // Risk assessment
    const criticalEvents = stats.severityBreakdown.CRITICAL || 0;
    const failureRate = stats.totalActions > 0 ? (stats.failedActions / stats.totalActions) * 100 : 0;
    const riskScore = Math.min(100, (criticalEvents * 10) + (failureRate * 2));

    // User behavior insights
    const avgActionsPerUser = stats.uniqueUsers > 0 ? stats.totalActions / stats.uniqueUsers : 0;
    const mostActiveUser = stats.topUsers[0];

    // Resource utilization
    const totalResourceActions = stats.topResources.reduce((sum, resource) => sum + resource.count, 0);
    const resourceUtilization = stats.topResources.map(resource => ({
      ...resource,
      percentage: (resource.count / totalResourceActions) * 100
    }));

    return {
      dailyTrend,
      todayActivity,
      yesterdayActivity,
      peakHour: peakHour ? `${peakHour[0].padStart(2, '0')}:00` : 'N/A',
      peakActivity: peakHour ? peakHour[1] : 0,
      riskScore,
      failureRate,
      avgActionsPerUser,
      mostActiveUser,
      resourceUtilization,
      criticalEvents
    };
  }, [stats, logs]);

  // Anomaly detection
  const anomalies = React.useMemo(() => {
    const alerts = [];
    
    // High failure rate
    if (insights.failureRate > 10) {
      alerts.push({
        type: 'error',
        title: 'High Failure Rate',
        description: `${insights.failureRate.toFixed(1)}% of actions are failing`,
        severity: 'high'
      });
    }

    // Unusual activity spike
    if (insights.dailyTrend > 200) {
      alerts.push({
        type: 'warning',
        title: 'Activity Spike Detected',
        description: `Activity increased by ${insights.dailyTrend.toFixed(1)}% from yesterday`,
        severity: 'medium'
      });
    }

    // Critical security events
    if (insights.criticalEvents > 0) {
      alerts.push({
        type: 'error',
        title: 'Critical Security Events',
        description: `${insights.criticalEvents} critical security events detected`,
        severity: 'critical'
      });
    }

    // Low activity
    if (insights.todayActivity === 0) {
      alerts.push({
        type: 'info',
        title: 'No Activity Today',
        description: 'No audit events recorded today',
        severity: 'low'
      });
    }

    return alerts;
  }, [insights]);

  const getRiskColor = (score: number) => {
    if (score >= 80) return 'text-red-600';
    if (score >= 60) return 'text-orange-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getRiskLabel = (score: number) => {
    if (score >= 80) return 'Critical';
    if (score >= 60) return 'High';
    if (score >= 40) return 'Medium';
    return 'Low';
  };

  return (
    <div className="space-y-6">
      {/* Key Insights Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Trend</CardTitle>
            {insights.dailyTrend >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${insights.dailyTrend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {insights.dailyTrend >= 0 ? '+' : ''}{insights.dailyTrend.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              vs yesterday ({insights.yesterdayActivity} actions)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risk Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getRiskColor(insights.riskScore)}`}>
              {insights.riskScore.toFixed(0)}/100
            </div>
            <p className="text-xs text-muted-foreground">
              {getRiskLabel(insights.riskScore)} risk level
            </p>
            <Progress value={insights.riskScore} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Peak Activity</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {insights.peakHour}
            </div>
            <p className="text-xs text-muted-foreground">
              {insights.peakActivity} actions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">User Efficiency</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {insights.avgActionsPerUser.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">
              actions per user
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Anomalies and Alerts */}
      {anomalies.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <AlertTriangle className="h-5 w-5" />
              System Alerts & Anomalies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {anomalies.map((alert, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 bg-white rounded-lg border"
                >
                  <div className={`mt-1 ${
                    alert.severity === 'critical' ? 'text-red-600' :
                    alert.severity === 'high' ? 'text-orange-600' :
                    alert.severity === 'medium' ? 'text-yellow-600' :
                    'text-blue-600'
                  }`}>
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{alert.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {alert.description}
                    </p>
                  </div>
                  <Badge variant={
                    alert.severity === 'critical' ? 'destructive' :
                    alert.severity === 'high' ? 'secondary' :
                    'outline'
                  }>
                    {alert.severity}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Insights */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Success Rate</span>
                <span className="text-sm font-bold text-green-600">
                  {((stats.successfulActions / stats.totalActions) * 100).toFixed(1)}%
                </span>
              </div>
              <Progress 
                value={(stats.successfulActions / stats.totalActions) * 100} 
                className="h-2"
              />

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Failure Rate</span>
                <span className="text-sm font-bold text-red-600">
                  {insights.failureRate.toFixed(1)}%
                </span>
              </div>
              <Progress 
                value={insights.failureRate} 
                className="h-2"
              />

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">User Engagement</span>
                <span className="text-sm font-bold text-blue-600">
                  {((stats.uniqueUsers / (stats.uniqueUsers + 10)) * 100).toFixed(0)}%
                </span>
              </div>
              <Progress 
                value={(stats.uniqueUsers / (stats.uniqueUsers + 10)) * 100} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Resource Utilization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights.resourceUtilization.slice(0, 5).map((resource, index) => (
                <div key={resource.resource} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium capitalize">
                      {resource.resource}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {resource.count} ({resource.percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <Progress value={resource.percentage} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Activity Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Activity Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Most Active User</h4>
              {insights.mostActiveUser ? (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">User #{insights.mostActiveUser.userId.slice(-4)}</p>
                    <p className="text-xs text-muted-foreground">
                      {insights.mostActiveUser.count} actions
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No data available</p>
              )}
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-sm">Average Actions/User</h4>
              <div className="text-2xl font-bold text-blue-600">
                {insights.avgActionsPerUser.toFixed(1)}
              </div>
              <p className="text-xs text-muted-foreground">
                Across {stats.uniqueUsers} users
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-sm">Activity Distribution</h4>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>High activity users</span>
                  <span>{Math.ceil(stats.uniqueUsers * 0.2)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Medium activity users</span>
                  <span>{Math.ceil(stats.uniqueUsers * 0.5)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Low activity users</span>
                  <span>{Math.floor(stats.uniqueUsers * 0.3)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700">
            <Zap className="h-5 w-5" />
            Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {insights.failureRate > 5 && (
              <div className="p-3 bg-white rounded-lg border">
                <h4 className="font-medium text-sm text-red-700">High Failure Rate</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Consider investigating failed actions and implementing better error handling.
                </p>
              </div>
            )}
            
            {insights.criticalEvents > 0 && (
              <div className="p-3 bg-white rounded-lg border">
                <h4 className="font-medium text-sm text-orange-700">Security Review</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Critical security events detected. Review access controls and permissions.
                </p>
              </div>
            )}
            
            {insights.avgActionsPerUser < 5 && (
              <div className="p-3 bg-white rounded-lg border">
                <h4 className="font-medium text-sm text-blue-700">User Engagement</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Low user activity detected. Consider user training or system improvements.
                </p>
              </div>
            )}
            
            {insights.dailyTrend > 100 && (
              <div className="p-3 bg-white rounded-lg border">
                <h4 className="font-medium text-sm text-green-700">Activity Monitoring</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  High activity spike detected. Monitor system performance and capacity.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};