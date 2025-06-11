import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  ComposedChart
} from 'recharts';
import { 
  TrendingUp, 
  Clock, 
  Users, 
  Activity, 
  AlertTriangle,
  Shield,
  Eye,
  Calendar
} from 'lucide-react';
import { format, subDays, startOfHour, eachHourOfInterval, eachDayOfInterval, startOfDay } from 'date-fns';

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

interface AuditChartsProps {
  stats: AuditStats;
  logs: any[];
  period?: number;
}

const COLORS = {
  primary: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  secondary: '#6b7280',
  accent: '#8b5cf6'
};

const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'];

export const AuditCharts: React.FC<AuditChartsProps> = ({ stats, logs, period = 7 }) => {
  
  // Process daily activity data for charts
  const dailyActivityData = React.useMemo(() => {
    const days = eachDayOfInterval({
      start: subDays(new Date(), period - 1),
      end: new Date()
    });

    return days.map(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const total = stats.dailyActivity[dateStr] || 0;
      const dayLogs = logs.filter(log => 
        format(new Date(log.timestamp), 'yyyy-MM-dd') === dateStr
      );
      
      const successful = dayLogs.filter(log => log.success).length;
      const failed = dayLogs.filter(log => !log.success).length;
      
      return {
        date: format(day, 'MMM dd'),
        fullDate: dateStr,
        total,
        successful,
        failed,
        successRate: total > 0 ? (successful / total) * 100 : 0
      };
    });
  }, [stats.dailyActivity, logs, period]);

  // Process hourly activity data
  const hourlyActivityData = React.useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const hourlyStats = hours.map(hour => ({
      hour: `${hour.toString().padStart(2, '0')}:00`,
      count: 0,
      successful: 0,
      failed: 0
    }));

    logs.forEach(log => {
      const hour = new Date(log.timestamp).getHours();
      hourlyStats[hour].count++;
      if (log.success) {
        hourlyStats[hour].successful++;
      } else {
        hourlyStats[hour].failed++;
      }
    });

    return hourlyStats;
  }, [logs]);

  // Process action distribution data
  const actionDistributionData = React.useMemo(() => {
    return Object.entries(stats.actionBreakdown)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([action, count], index) => ({
        name: action.replace(/_/g, ' '),
        value: count,
        color: PIE_COLORS[index % PIE_COLORS.length],
        percentage: ((count / stats.totalActions) * 100).toFixed(1)
      }));
  }, [stats.actionBreakdown, stats.totalActions]);

  // Process severity trends
  const severityTrendsData = React.useMemo(() => {
    return Object.entries(stats.severityBreakdown).map(([severity, count]) => ({
      severity,
      count,
      percentage: ((count / stats.totalActions) * 100).toFixed(1),
      color: severity === 'CRITICAL' ? COLORS.danger :
             severity === 'HIGH' ? COLORS.warning :
             severity === 'MEDIUM' ? COLORS.primary : COLORS.success
    }));
  }, [stats.severityBreakdown, stats.totalActions]);

  // Process user activity data
  const userActivityData = React.useMemo(() => {
    return stats.topUsers.slice(0, 10).map((user, index) => ({
      user: `User ${index + 1}`,
      actions: user.count,
      percentage: ((user.count / stats.totalActions) * 100).toFixed(1)
    }));
  }, [stats.topUsers, stats.totalActions]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.dataKey}: {entry.value}
              {entry.dataKey === 'successRate' && '%'}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Overview Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Average</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(stats.totalActions / period)}
            </div>
            <p className="text-xs text-muted-foreground">
              Actions per day
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Peak Hour</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {hourlyActivityData.reduce((max, hour) => 
                hour.count > max.count ? hour : max
              ).hour}
            </div>
            <p className="text-xs text-muted-foreground">
              Most active time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Action</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold">
              {Object.entries(stats.actionBreakdown)[0]?.[0]?.replace(/_/g, ' ') || 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {Object.entries(stats.actionBreakdown)[0]?.[1] || 0} times
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Events</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.severityBreakdown.CRITICAL || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Critical alerts
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Daily Activity Trend */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Daily Activity Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <ComposedChart data={dailyActivityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="total"
                  stroke={COLORS.primary}
                  fill={COLORS.primary}
                  fillOpacity={0.1}
                />
                <Bar
                  yAxisId="left"
                  dataKey="successful"
                  fill={COLORS.success}
                  opacity={0.7}
                />
                <Bar
                  yAxisId="left"
                  dataKey="failed"
                  fill={COLORS.danger}
                  opacity={0.7}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="successRate"
                  stroke={COLORS.accent}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Action Distribution */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Action Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={actionDistributionData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percentage }) => `${name} (${percentage}%)`}
                  labelLine={false}
                >
                  {actionDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any, name: any) => [value, name]} 
                  labelFormatter={(label) => `Action: ${label}`}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Hourly Activity Pattern */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Hourly Usage Pattern
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={hourlyActivityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="hour" 
                  interval={5}
                  fontSize={10}
                />
                <YAxis fontSize={10} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke={COLORS.primary}
                  fill={COLORS.primary}
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Severity Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Severity Levels
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={severityTrendsData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" fontSize={10} />
                <YAxis dataKey="severity" type="category" fontSize={10} />
                <Tooltip 
                  formatter={(value: any) => [value, 'Count']}
                  labelFormatter={(label) => `Severity: ${label}`}
                />
                <Bar dataKey="count" fill={COLORS.warning} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Users Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Most Active Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {userActivityData.slice(0, 6).map((user, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-medium text-blue-600">
                      {index + 1}
                    </div>
                    <span className="text-sm font-medium">{user.user}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{user.actions}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {user.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resource Activity Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Resource Activity Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {stats.topResources.map((resource, index) => {
              const intensity = (resource.count / Math.max(...stats.topResources.map(r => r.count))) * 100;
              return (
                <div
                  key={resource.resource}
                  className="p-4 rounded-lg border text-center"
                  style={{
                    backgroundColor: `rgba(59, 130, 246, ${intensity / 100 * 0.7 + 0.1})`,
                  }}
                >
                  <div className="text-sm font-medium capitalize">
                    {resource.resource}
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    {resource.count}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    actions
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Success Rate Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Success Rate Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={dailyActivityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 100]} />
              <Tooltip 
                formatter={(value: any) => [`${value}%`, 'Success Rate']}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Line
                type="monotone"
                dataKey="successRate"
                stroke={COLORS.success}
                strokeWidth={3}
                dot={{ r: 5, fill: COLORS.success }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};