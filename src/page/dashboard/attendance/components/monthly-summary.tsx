import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Download, Users, TrendingUp, Clock, UserX } from 'lucide-react';
import { useMonthlyAttendanceSummary } from '@/hooks/api/use-attendance';
import { useClasses } from '@/hooks/api/use-classes';
import AttendanceCalendarGrid from '@/components/attendance/attendance-calendar-grid';

const MonthlyAttendanceSummary: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedClassId, setSelectedClassId] = useState(searchParams.get('classId') || '');
  const [selectedYear, setSelectedYear] = useState(searchParams.get('year') || new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState(searchParams.get('month') || (new Date().getMonth() + 1).toString().padStart(2, '0'));

  // Fetch data
  const { data: classes, isLoading: classesLoading } = useClasses();
  const { data: summaryData, isLoading: summaryLoading, error } = useMonthlyAttendanceSummary(
    selectedClassId,
    selectedYear,
    selectedMonth,
    !!selectedClassId
  );

  // Safely access summary data with fallbacks
  const safeClassInfo = summaryData?.classInfo;
  const safeStudents = summaryData?.students || [];
  const safeOverallStats = summaryData?.overallStats || { totalStudents: 0, averageAttendance: 0, totalWorkingDays: 0, totalHolidays: 0 };

  // Generate month options
  const monthOptions = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const month = (i + 1).toString().padStart(2, '0');
      const monthName = new Date(2024, i, 1).toLocaleString('default', { month: 'long' });
      return { value: month, label: monthName };
    });
  }, []);

  // Generate year options (current year ± 2)
  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => {
      const year = (currentYear - 2 + i).toString();
      return { value: year, label: year };
    });
  }, []);

  // Handle filter changes with safe state updates
  const handleClassChange = (value: string) => {
    setSelectedClassId(value);
    setSearchParams(prev => {
      const params = new URLSearchParams(prev);
      params.set('classId', value);
      return params;
    });
  };

  const handleYearChange = (value: string) => {
    setSelectedYear(value);
    setSearchParams(prev => {
      const params = new URLSearchParams(prev);
      params.set('year', value);
      return params;
    });
  };

  const handleMonthChange = (value: string) => {
    setSelectedMonth(value);
    setSearchParams(prev => {
      const params = new URLSearchParams(prev);
      params.set('month', value);
      return params;
    });
  };

  // Handle export
  const handleExport = () => {
    if (!summaryData || !summaryData.monthDays || safeStudents.length === 0) return;
    
    // Create CSV content
    const headers = ['Sr No', 'ID', 'Name', ...summaryData.monthDays.map(day => day.toString()), 'Total Attended', 'Missed', 'COT WO', 'Holiday'];
    const csvContent = [
      headers.join(','),
      ...safeStudents.map(student => [
        student.srNo,
        student.rollNumber,
        student.studentName,
        ...student.dailyAttendance.map(day => day.status || ''),
        student.summary.totalAttended,
        student.summary.totalMissed,
        student.summary.totalLate,
        student.summary.totalHolidays
      ].join(','))
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `attendance-summary-${summaryData?.monthName || 'unknown'}-${summaryData?.year || 'unknown'}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Monthly Attendance Summary</h1>
          <p className="text-muted-foreground">View comprehensive attendance data in calendar format</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={!summaryData || safeStudents.length === 0}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Class</label>
              <Select value={selectedClassId} onValueChange={handleClassChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Class" />
                </SelectTrigger>
                <SelectContent>
                  {classesLoading ? (
                    <SelectItem value="loading" disabled>Loading classes...</SelectItem>
                  ) : (
                    classes?.data?.map((cls) => (
                      <SelectItem key={cls._id} value={cls._id}>
                        {cls.name} {cls.section ? `- ${cls.section}` : ''}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Year</label>
              <Select value={selectedYear} onValueChange={handleYearChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Year" />
                </SelectTrigger>
                <SelectContent>
                  {yearOptions.map((year) => (
                    <SelectItem key={year.value} value={year.value}>
                      {year.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Month</label>
              <Select value={selectedMonth} onValueChange={handleMonthChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Month" />
                </SelectTrigger>
                <SelectContent>
                  {monthOptions.map((month) => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      {summaryData && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Students</p>
                  <p className="text-2xl font-bold">{safeOverallStats.totalStudents}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Average Attendance</p>
                  <p className="text-2xl font-bold">{safeOverallStats.averageAttendance}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Working Days</p>
                  <p className="text-2xl font-bold">{safeOverallStats.totalWorkingDays}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <UserX className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Holidays</p>
                  <p className="text-2xl font-bold">{safeOverallStats.totalHolidays}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Attendance Grid */}
      <Card>
        <CardHeader>
          <CardTitle>
            {safeClassInfo ? 
              `${safeClassInfo.name} ${safeClassInfo.section ? `- ${safeClassInfo.section}` : ''} - ${summaryData?.monthName || ''} ${summaryData?.year || ''}` :
              summaryData?.monthName && summaryData?.year ?
                `Attendance Summary - ${summaryData.monthName} ${summaryData.year}` :
                'Attendance Summary'
            }
          </CardTitle>
          {summaryData && (
            <div className="text-sm text-muted-foreground">
              Showing {safeStudents.length} students • {safeOverallStats.totalWorkingDays} working days • {safeOverallStats.averageAttendance}% average attendance
            </div>
          )}
        </CardHeader>
        <CardContent className="p-0">
          {summaryLoading ? (
            <div className="p-6 space-y-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : error ? (
            <div className="p-6 text-center text-red-600">
              <p>Failed to load attendance data</p>
              <p className="text-sm text-muted-foreground mt-2">
                {error instanceof Error ? error.message : 'Unknown error occurred'}
              </p>
            </div>
          ) : !selectedClassId ? (
            <div className="p-6 text-center text-muted-foreground">
              <p>Please select a class to view attendance summary</p>
            </div>
          ) : summaryData && safeStudents.length > 0 ? (
            <AttendanceCalendarGrid data={summaryData} />
          ) : (
            <div className="p-6 text-center text-muted-foreground">
              <p>No attendance data found for the selected period</p>
              {summaryData?.monthName && summaryData?.year && (
                <p className="text-xs mt-1">
                  No students have attendance records for {summaryData.monthName} {summaryData.year}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MonthlyAttendanceSummary;