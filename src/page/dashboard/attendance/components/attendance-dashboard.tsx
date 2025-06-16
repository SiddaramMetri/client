import { useState } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { Users, TrendingUp, TrendingDown, Phone, MessageSquare, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { type DashboardStats } from "@/hooks/api/use-attendance";

interface AttendanceDashboardProps {
  classId?: string;
  dashboardStats?: DashboardStats;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

// Mock data for charts - in real app, this would come from API
const monthlyTrendData = [
  { month: 'Jan', attendance: 85, absent: 15 },
  { month: 'Feb', attendance: 87, absent: 13 },
  { month: 'Mar', attendance: 82, absent: 18 },
  { month: 'Apr', attendance: 90, absent: 10 },
  { month: 'May', attendance: 88, absent: 12 },
  { month: 'Jun', attendance: 91, absent: 9 },
];

const classComparisonData = [
  { class: 'Class A', attendance: 92, totalStudents: 30 },
  { class: 'Class B', attendance: 88, totalStudents: 28 },
  { class: 'Class C', attendance: 85, totalStudents: 32 },
  { class: 'Class D', attendance: 90, totalStudents: 29 },
];

const AttendanceDashboard: React.FC<AttendanceDashboardProps> = ({ classId, dashboardStats }) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState("month");

  // Prepare pie chart data
  const attendanceDistribution = dashboardStats ? [
    { name: 'Present', value: dashboardStats.monthlyStats.totalPresent, color: '#00C49F' },
    { name: 'Absent', value: dashboardStats.monthlyStats.totalAbsent, color: '#FF8042' },
    { name: 'Late', value: dashboardStats.monthlyStats.totalLate, color: '#FFBB28' },
  ] : [];

  const communicationData = dashboardStats ? [
    { name: 'Voice Calls', total: dashboardStats.communicationStats.totalVoiceCalls, successful: dashboardStats.communicationStats.successfulCalls },
    { name: 'SMS', total: dashboardStats.communicationStats.totalSMS, successful: dashboardStats.communicationStats.deliveredSMS },
    { name: 'WhatsApp', total: dashboardStats.communicationStats.totalWhatsApp, successful: dashboardStats.communicationStats.deliveredWhatsApp },
  ] : [];

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Attendance Dashboard</h2>
        <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="quarter">This Quarter</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Present</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {dashboardStats?.todayStats.present || 0}
            </div>
            <Progress 
              value={dashboardStats?.todayStats.marked > 0 ? 
                (dashboardStats.todayStats.present / dashboardStats.todayStats.marked) * 100 : 0} 
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Absent</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {dashboardStats?.todayStats.absent || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {dashboardStats?.monthlyStats.highAbsenceStudents || 0} need attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Average</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {dashboardStats?.monthlyStats.averageAttendance || 0}%
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
              <span className="text-xs text-green-600">+2.5% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Communications</CardTitle>
            <Phone className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {(dashboardStats?.communicationStats.totalVoiceCalls || 0) + 
               (dashboardStats?.communicationStats.totalSMS || 0) + 
               (dashboardStats?.communicationStats.totalWhatsApp || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Total communications sent
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="communications">Communications</TabsTrigger>
          <TabsTrigger value="comparison">Class Comparison</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Attendance Distribution Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Attendance Distribution</CardTitle>
                <CardDescription>Monthly breakdown by status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={attendanceDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {attendanceDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Daily Attendance Bar Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Weekly Attendance</CardTitle>
                <CardDescription>Last 7 days attendance summary</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyTrendData.slice(-7)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="attendance" fill="#00C49F" name="Present" />
                      <Bar dataKey="absent" fill="#FF8042" name="Absent" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Trends</CardTitle>
              <CardDescription>Monthly attendance percentage over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="attendance" 
                      stroke="#0088FE" 
                      strokeWidth={2}
                      name="Attendance %"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="communications" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Communication Success Rate</CardTitle>
                <CardDescription>Delivery and success rates by channel</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {communicationData.map((item, index) => {
                  const successRate = item.total > 0 ? (item.successful / item.total) * 100 : 0;
                  return (
                    <div key={item.name} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{item.name}</span>
                        <Badge variant="outline">
                          {item.successful}/{item.total} ({successRate.toFixed(1)}%)
                        </Badge>
                      </div>
                      <Progress value={successRate} className="h-2" />
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Communication Volume</CardTitle>
                <CardDescription>Total communications by type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={communicationData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="total" fill="#8884d8" name="Total Sent" />
                      <Bar dataKey="successful" fill="#82ca9d" name="Successful" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Class Comparison</CardTitle>
              <CardDescription>Attendance performance across different classes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={classComparisonData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="class" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="attendance" fill="#0088FE" name="Attendance %" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AttendanceDashboard;