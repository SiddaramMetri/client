import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarIcon, Download, Filter, RefreshCcw, Search, BarChart3, Activity, Lightbulb, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { AuditLogsTable } from './components/audit-logs-table';
import { AuditLogsStats } from './components/audit-logs-stats';
import { AuditCharts } from './components/audit-charts';
import { RealTimeActivity } from './components/real-time-activity';
import { AuditInsights } from './components/audit-insights';
import { auditLogService } from '@/services/audit-log.service';

const AuditLogsPage = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLive, setIsLive] = useState(false);
  const [filters, setFilters] = useState({
    action: 'all',
    category: 'all',
    severity: 'all',
    resource: 'all',
    success: 'all',
    startDate: '',
    endDate: '',
    search: ''
  });

  // Fetch audit logs
  const { data: auditData, isLoading, refetch } = useQuery({
    queryKey: ['audit-logs', page, limit, filters],
    queryFn: () => {
      // Convert 'all' values to empty strings for API
      const apiFilters = Object.entries(filters).reduce((acc, [key, value]) => {
        acc[key] = value === 'all' ? '' : value;
        return acc;
      }, {} as Record<string, string>);
      
      return auditLogService.getAuditLogs({ page, limit, ...apiFilters });
    },
  });

  // Fetch filter options
  const { data: filterOptions } = useQuery({
    queryKey: ['audit-log-filter-options'],
    queryFn: () => auditLogService.getFilterOptions(),
  });

  // Fetch statistics
  const { data: statsData } = useQuery({
    queryKey: ['audit-log-stats'],
    queryFn: () => auditLogService.getStats({ days: 7 }),
  });

  // Fetch extended stats for charts
  const { data: extendedStatsData } = useQuery({
    queryKey: ['audit-log-stats-extended'],
    queryFn: () => auditLogService.getStats({ days: 30 }),
  });

  // Auto-refresh for live mode
  React.useEffect(() => {
    if (!isLive) return;
    
    const interval = setInterval(() => {
      refetch();
    }, 10000); // Refresh every 10 seconds

    return () => clearInterval(interval);
  }, [isLive, refetch]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1); // Reset to first page when filtering
  };

  const handleExport = async () => {
    try {
      // Convert 'all' values to empty strings for API
      const apiFilters = Object.entries(filters).reduce((acc, [key, value]) => {
        acc[key] = value === 'all' ? '' : value;
        return acc;
      }, {} as Record<string, string>);
      
      await auditLogService.exportLogs(apiFilters);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const clearFilters = () => {
    setFilters({
      action: 'all',
      category: 'all',
      severity: 'all',
      resource: 'all',
      success: 'all',
      startDate: '',
      endDate: '',
      search: ''
    });
    setPage(1);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Audit Logs</h1>
          <p className="text-muted-foreground">
            Track and monitor all system activities and user actions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant={isLive ? "default" : "outline"} 
            size="sm" 
            onClick={() => setIsLive(!isLive)}
          >
            <Activity className={`h-4 w-4 mr-2 ${isLive ? 'animate-pulse' : ''}`} />
            {isLive ? 'Live' : 'Enable Live'}
          </Button>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCcw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Live Activity
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Insights
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Logs
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Top Stats Row */}
          {statsData && <AuditLogsStats stats={statsData.stats} />}
          {/* Bottom Section - Key Metrics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">System Health</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {statsData && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Uptime</span>
                      <span className="text-sm font-semibold text-green-600">99.9%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Avg Response</span>
                      <span className="text-sm font-semibold">120ms</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Error Rate</span>
                      <span className="text-sm font-semibold text-red-600">
                        {((statsData.stats.failedActions / statsData.stats.totalActions) * 100).toFixed(2)}%
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">User Activity</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {statsData && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Active Users</span>
                      <span className="text-sm font-semibold text-blue-600">
                        {statsData.stats.uniqueUsers}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Actions/User</span>
                      <span className="text-sm font-semibold">
                        {(statsData.stats.totalActions / statsData.stats.uniqueUsers).toFixed(1)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Peak Hour</span>
                      <span className="text-sm font-semibold text-orange-600">14:00</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Security Status</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {statsData && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Risk Level</span>
                      <Badge variant={
                        (statsData.stats.severityBreakdown.CRITICAL || 0) > 0 ? 'destructive' :
                        (statsData.stats.severityBreakdown.HIGH || 0) > 5 ? 'secondary' : 'outline'
                      }>
                        {(statsData.stats.severityBreakdown.CRITICAL || 0) > 0 ? 'High' :
                         (statsData.stats.severityBreakdown.HIGH || 0) > 5 ? 'Medium' : 'Low'}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Critical Events</span>
                      <span className="text-sm font-semibold text-red-600">
                        {statsData.stats.severityBreakdown.CRITICAL || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Failed Logins</span>
                      <span className="text-sm font-semibold text-orange-600">
                        {Object.entries(statsData.stats.actionBreakdown)
                          .filter(([action]) => action.includes('LOGIN_FAILED'))
                          .reduce((sum, [, count]) => sum + count, 0)}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Recent Activity - Takes 2/3 width on large screens */}
           {/* <div className="xl:col-span-2 space-y-6">
                <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Recent Activity Feed
                    {isLive && (
                      <div className="flex items-center gap-2 ml-auto">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm text-green-600">Live</span>
                      </div>
                    )}
                  </CardTitle>
                </CardHeader>
               <CardContent className="pt-0">
                  <div className="max-h-[500px] overflow-y-auto">
                    <RealTimeActivity 
                      logs={auditData?.logs?.slice(0, 15) || []} 
                      isLive={isLive}
                    /> 
                  </div>
                </CardContent>
              </Card>
            </div>*/}

            
            
            {/* Quick Analytics Sidebar - Takes 1/3 width */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Quick Insights</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-4">
                  {extendedStatsData && (
                    <>
                      {/* Daily Trend Mini Chart */}
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-semibold text-blue-700">Daily Activity</h4>
                          <div className="text-lg font-bold text-blue-600">
                            {Math.round(extendedStatsData.stats.totalActions / 7)}
                          </div>
                        </div>
                        <p className="text-xs text-blue-600">avg. actions/day</p>
                      </div>

                      {/* Success Rate */}
                      <div className="p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-semibold text-green-700">Success Rate</h4>
                          <div className="text-lg font-bold text-green-600">
                            {((extendedStatsData.stats.successfulActions / extendedStatsData.stats.totalActions) * 100).toFixed(1)}%
                          </div>
                        </div>
                        <div className="w-full bg-green-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ 
                              width: `${(extendedStatsData.stats.successfulActions / extendedStatsData.stats.totalActions) * 100}%` 
                            }}
                          ></div>
                        </div>
                      </div>

                      {/* Security Events */}
                      <div className="p-3 bg-red-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-semibold text-red-700">Security Events</h4>
                          <div className="text-lg font-bold text-red-600">
                            {(extendedStatsData.stats.severityBreakdown.CRITICAL || 0) + 
                             (extendedStatsData.stats.severityBreakdown.HIGH || 0)}
                          </div>
                        </div>
                        <p className="text-xs text-red-600">critical + high severity</p>
                      </div>

                      {/* Top Actions */}
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Top Actions</h4>
                        <div className="space-y-2">
                          {Object.entries(extendedStatsData.stats.actionBreakdown)
                            .sort(([,a], [,b]) => b - a)
                            .slice(0, 3)
                            .map(([action, count]) => (
                              <div key={action} className="flex items-center justify-between">
                                <span className="text-xs text-gray-600 truncate">
                                  {action.replace(/_/g, ' ').toLowerCase()}
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  {count}
                                </Badge>
                              </div>
                            ))}
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Mini Charts */}
              
            </div>
            <div>
            <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Activity Patterns</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  {extendedStatsData && (
                    <div className="space-y-4">
                      {/* Hourly Activity Mini Bar */}
                      <div>
                        <h4 className="text-sm font-medium mb-2">Hourly Distribution</h4>
                        <div className="flex items-end gap-1 h-12">
                          {Array.from({ length: 24 }, (_, i) => {
                            const hourActivity = auditData?.logs?.filter(log => 
                              new Date(log.timestamp).getHours() === i
                            ).length || 0;
                            const maxHourly = Math.max(...Array.from({ length: 24 }, (_, j) => 
                              auditData?.logs?.filter(log => 
                                new Date(log.timestamp).getHours() === j
                              ).length || 0
                            ));
                            const height = maxHourly > 0 ? (hourActivity / maxHourly) * 100 : 0;
                            
                            return (
                              <div
                                key={i}
                                className="bg-blue-200 rounded-sm flex-1 transition-all hover:bg-blue-300"
                                style={{ height: `${Math.max(height, 2)}%` }}
                                title={`${i}:00 - ${hourActivity} actions`}
                              />
                            );
                          })}
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>0h</span>
                          <span>12h</span>
                          <span>24h</span>
                        </div>
                      </div>

                      {/* Resource Usage */}
                      <div>
                        <h4 className="text-sm font-medium mb-2">Resource Usage</h4>
                        <div className="space-y-2">
                          {extendedStatsData.stats.topResources.slice(0, 4).map((resource, index) => {
                            const maxCount = extendedStatsData.stats.topResources[0]?.count || 1;
                            const percentage = (resource.count / maxCount) * 100;
                            
                            return (
                              <div key={resource.resource} className="flex items-center gap-2">
                                <span className="text-xs text-gray-600 w-16 truncate capitalize">
                                  {resource.resource}
                                </span>
                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-blue-500 h-2 rounded-full" 
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                                <span className="text-xs text-gray-500 w-8 text-right">
                                  {resource.count}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          {extendedStatsData && (
            <AuditCharts 
              stats={extendedStatsData.stats} 
              logs={auditData?.logs || []}
              period={30}
            />
          )}
        </TabsContent>

        {/* Live Activity Tab */}
        <TabsContent value="activity" className="space-y-6">
          <RealTimeActivity 
            logs={auditData?.logs || []} 
            isLive={isLive}
          />
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          {statsData && (
            <AuditInsights 
              stats={statsData.stats} 
              logs={auditData?.logs || []}
            />
          )}
        </TabsContent>

        {/* Logs Tab */}
        <TabsContent value="logs" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Search */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search descriptions..."
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                {/* Action Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Action</label>
                  <Select value={filters.action} onValueChange={(value) => handleFilterChange('action', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All actions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All actions</SelectItem>
                      {filterOptions?.filterOptions?.actions?.map((action: string) => (
                        <SelectItem key={action} value={action}>
                          {action.replace(/_/g, ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Category Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Select value={filters.category} onValueChange={(value) => handleFilterChange('category', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All categories</SelectItem>
                      {filterOptions?.filterOptions?.categories?.map((category: string) => (
                        <SelectItem key={category} value={category}>
                          {category.replace(/_/g, ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Severity Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Severity</label>
                  <Select value={filters.severity} onValueChange={(value) => handleFilterChange('severity', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All severities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All severities</SelectItem>
                      {filterOptions?.filterOptions?.severities?.map((severity: string) => (
                        <SelectItem key={severity} value={severity}>
                          <Badge variant={severity === 'CRITICAL' ? 'destructive' : severity === 'HIGH' ? 'secondary' : 'outline'}>
                            {severity}
                          </Badge>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Resource Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Resource</label>
                  <Select value={filters.resource} onValueChange={(value) => handleFilterChange('resource', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All resources" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All resources</SelectItem>
                      {filterOptions?.filterOptions?.resources?.map((resource: string) => (
                        <SelectItem key={resource} value={resource}>
                          {resource.charAt(0).toUpperCase() + resource.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Success Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select value={filters.success} onValueChange={(value) => handleFilterChange('success', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All statuses</SelectItem>
                      <SelectItem value="true">Success</SelectItem>
                      <SelectItem value="false">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Start Date */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Start Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !filters.startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.startDate ? format(new Date(filters.startDate), "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={filters.startDate ? new Date(filters.startDate) : undefined}
                        onSelect={(date) => handleFilterChange('startDate', date ? date.toISOString() : '')}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* End Date */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">End Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !filters.endDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.endDate ? format(new Date(filters.endDate), "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={filters.endDate ? new Date(filters.endDate) : undefined}
                        onSelect={(date) => handleFilterChange('endDate', date ? date.toISOString() : '')}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Audit Logs Table */}
          <AuditLogsTable
            data={auditData?.logs || []}
            pagination={auditData?.pagination}
            loading={isLoading}
            onPageChange={setPage}
            currentPage={page}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AuditLogsPage;