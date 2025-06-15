import { useState } from "react";
import { Users, TrendingUp, AlertCircle, Calendar, BarChart3, Clock, CalendarDays } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ClassDropdown from "@/components/form/class-dropdown";
import AttendanceDashboard from "./components/attendance-dashboard";
import { useGetDashboardStats } from "@/hooks/api/use-attendance";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const AttendancePage = () => {
  const [selectedClassId, setSelectedClassId] = useState<string>("");

  const { data: dashboardStats, isLoading: statsLoading } = useGetDashboardStats();

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-4 md:space-y-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <BarChart3 className="h-8 w-8" />
          Attendance Dashboard
        </h1>
        <p className="text-muted-foreground">
          Overview of attendance statistics, trends, and key metrics.
        </p>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Attendance</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? "..." : dashboardStats?.todayStats.marked || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {statsLoading ? "Loading..." : `${dashboardStats?.todayStats.present || 0} present, ${dashboardStats?.todayStats.absent || 0} absent`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Average</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? "..." : `${dashboardStats?.monthlyStats.averageAttendance || 0}%`}
            </div>
            <p className="text-xs text-muted-foreground">
              Attendance percentage this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? "..." : dashboardStats?.monthlyStats.totalStudents || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Enrolled students
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Absence</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? "..." : dashboardStats?.monthlyStats.highAbsenceStudents || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Students needing attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5 text-blue-600" />
              Daily Attendance
            </CardTitle>
            <CardDescription>Mark attendance for today</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/dashboard/attendance/daily">
              <Button className="w-full">
                <Clock className="h-4 w-4 mr-2" />
                Mark Today's Attendance
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <CalendarDays className="h-5 w-5 text-purple-600" />
              Monthly Summary
            </CardTitle>
            <CardDescription>View monthly attendance calendar</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/dashboard/attendance/monthly">
              <Button variant="outline" className="w-full">
                <CalendarDays className="h-4 w-4 mr-2" />
                Monthly View
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="h-5 w-5 text-green-600" />
              Reports
            </CardTitle>
            <CardDescription>Generate attendance reports</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/dashboard/attendance/reports">
              <Button variant="outline" className="w-full">
                <TrendingUp className="h-4 w-4 mr-2" />
                View Reports
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              Configuration
            </CardTitle>
            <CardDescription>Settings and automation</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/dashboard/attendance/config">
              <Button variant="secondary" className="w-full">
                <AlertCircle className="h-4 w-4 mr-2" />
                Manage Settings
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Class Selection for Dashboard */}
      <Card>
        <CardHeader>
          <CardTitle>Dashboard Filters</CardTitle>
          <CardDescription>
            Filter dashboard data by class (optional)
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Class (Optional)</label>
            <ClassDropdown
              value={selectedClassId}
              onChange={setSelectedClassId}
              placeholder="All classes..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Dashboard Component */}
      <AttendanceDashboard 
        classId={selectedClassId}
        dashboardStats={dashboardStats}
      />
    </div>
  );
};

export default AttendancePage;