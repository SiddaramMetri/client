import { useState } from "react";
import { format } from "date-fns";
import { FileDown, Filter, Search, Calendar, Users, AlertTriangle, TrendingDown } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetMonthlyStats, useGetAttendanceReport } from "@/hooks/api/use-attendance";
import { toast } from "@/hooks/use-toast";

interface AttendanceReportsProps {
  classId?: string;
  selectedDate: Date;
}

const AttendanceReports: React.FC<AttendanceReportsProps> = ({ classId, selectedDate }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState(format(selectedDate, "MM"));
  const [selectedYear, setSelectedYear] = useState(format(selectedDate, "yyyy"));
  const [absenceThreshold, setAbsenceThreshold] = useState("5");

  // Fetch monthly stats
  const { data: monthlyStats, isLoading: statsLoading } = useGetMonthlyStats({
    year: selectedYear,
    month: selectedMonth,
    classId: classId || undefined,
  });

  // Fetch detailed attendance report
  const { data: attendanceReport, isLoading: reportLoading } = useGetAttendanceReport({
    classId: classId || "",
    year: selectedYear,
    month: selectedMonth,
    threshold: parseInt(absenceThreshold),
  });

  const handleExportReport = () => {
    if (!monthlyStats) {
      toast({
        title: "Error",
        description: "No data available to export",
        variant: "destructive",
      });
      return;
    }

    // Prepare CSV data
    const csvData = [];
    
    if (Array.isArray(monthlyStats)) {
      // Individual student records
      csvData.push(["Student Name", "Roll Number", "Total Present", "Total Absent", "Total Late", "Attendance %", "Mobile"]);
      
      monthlyStats.forEach((record: any) => {
        if (record.studentId) {
          csvData.push([
            `${record.studentId.firstName} ${record.studentId.lastName}`,
            record.studentId.rollNumber,
            record.monthlyStats.totalPresent,
            record.monthlyStats.totalAbsent,
            record.monthlyStats.totalLate,
            `${record.monthlyStats.attendancePercentage}%`,
            record.studentId.parentInfo?.primaryMobileNo || "N/A"
          ]);
        }
      });
    } else if (monthlyStats.studentRecords) {
      // Class-wide data
      csvData.push(["Student Name", "Roll Number", "Total Present", "Total Absent", "Total Late", "Attendance %", "Mobile"]);
      
      monthlyStats.studentRecords.forEach((record: any) => {
        csvData.push([
          `${record.studentId.firstName} ${record.studentId.lastName}`,
          record.studentId.rollNumber,
          record.monthlyStats.totalPresent,
          record.monthlyStats.totalAbsent,
          record.monthlyStats.totalLate,
          `${record.monthlyStats.attendancePercentage}%`,
          record.studentId.parentInfo?.primaryMobileNo || "N/A"
        ]);
      });
    }

    // Create and download CSV
    const csvContent = csvData.map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance-report-${selectedYear}-${selectedMonth}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Success",
      description: "Report exported successfully",
    });
  };

  const getStudentRecords = () => {
    if (!monthlyStats) return [];
    
    if (Array.isArray(monthlyStats)) {
      return monthlyStats;
    } else if (monthlyStats.studentRecords) {
      return monthlyStats.studentRecords;
    }
    
    return [];
  };

  const filteredStudents = getStudentRecords().filter((record: any) => {
    const searchMatch = searchTerm === "" || 
      `${record.studentId?.firstName} ${record.studentId?.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.studentId?.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase());

    const statusMatch = filterStatus === "all" || 
      (filterStatus === "low" && record.monthlyStats.attendancePercentage < 75) ||
      (filterStatus === "high" && record.monthlyStats.totalAbsent >= parseInt(absenceThreshold));

    return searchMatch && statusMatch;
  });

  const getStatusBadge = (percentage: number, absences: number) => {
    if (percentage >= 90) return <Badge className="bg-green-500">Excellent</Badge>;
    if (percentage >= 75) return <Badge className="bg-yellow-500">Good</Badge>;
    if (percentage >= 60) return <Badge className="bg-orange-500">Average</Badge>;
    return <Badge className="bg-red-500">Poor</Badge>;
  };

  if (!classId) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Class Selected</h3>
          <p className="text-muted-foreground text-center">
            Please select a class to view attendance reports.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Report Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Report Filters
          </CardTitle>
          <CardDescription>
            Configure report parameters and filters
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Year</label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 5 }, (_, i) => {
                    const year = new Date().getFullYear() - i;
                    return (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Month</label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => {
                    const month = (i + 1).toString().padStart(2, '0');
                    const monthName = new Date(2024, i, 1).toLocaleString('default', { month: 'long' });
                    return (
                      <SelectItem key={month} value={month}>
                        {monthName}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Filter by Status</label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Students</SelectItem>
                  <SelectItem value="low">Low Attendance (&lt;75%)</SelectItem>
                  <SelectItem value="high">High Absences (≥{absenceThreshold})</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Absence Threshold</label>
              <Select value={absenceThreshold} onValueChange={setAbsenceThreshold}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 days</SelectItem>
                  <SelectItem value="5">5 days</SelectItem>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="10">10 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by student name or roll number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button onClick={handleExportReport} variant="outline">
              <FileDown className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report Tabs */}
      <Tabs defaultValue="monthly" className="space-y-4">
        <TabsList>
          <TabsTrigger value="monthly">Monthly Report</TabsTrigger>
          <TabsTrigger value="summary">Summary Statistics</TabsTrigger>
          <TabsTrigger value="alerts">Alerts & Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="monthly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Attendance Report</CardTitle>
              <CardDescription>
                Detailed attendance data for {new Date(parseInt(selectedYear), parseInt(selectedMonth) - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading attendance data...</p>
                  </div>
                </div>
              ) : filteredStudents.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Roll No.</TableHead>
                        <TableHead>Present</TableHead>
                        <TableHead>Absent</TableHead>
                        <TableHead>Late</TableHead>
                        <TableHead>Attendance %</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Mobile</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStudents.map((record: any) => (
                        <TableRow key={record._id}>
                          <TableCell className="font-medium">
                            {record.studentId?.firstName} {record.studentId?.lastName}
                          </TableCell>
                          <TableCell>{record.studentId?.rollNumber}</TableCell>
                          <TableCell className="text-green-600">
                            {record.monthlyStats.totalPresent}
                          </TableCell>
                          <TableCell className="text-red-600">
                            {record.monthlyStats.totalAbsent}
                          </TableCell>
                          <TableCell className="text-yellow-600">
                            {record.monthlyStats.totalLate}
                          </TableCell>
                          <TableCell>
                            <span className={`font-medium ${
                              record.monthlyStats.attendancePercentage >= 75 
                                ? 'text-green-600' 
                                : 'text-red-600'
                            }`}>
                              {record.monthlyStats.attendancePercentage}%
                            </span>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(record.monthlyStats.attendancePercentage, record.monthlyStats.totalAbsent)}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {record.studentId?.parentInfo?.primaryMobileNo || "N/A"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Data Available</h3>
                  <p className="text-muted-foreground">
                    No attendance data found for the selected filters.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="summary" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {monthlyStats?.classStats?.totalStudents || filteredStudents.length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Enrolled in class
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Class Average</CardTitle>
                <TrendingDown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {monthlyStats?.classStats?.averageAttendance || 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Monthly attendance
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">At Risk Students</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {monthlyStats?.classStats?.lowAttendanceStudents || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Below 75% attendance
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Alerts</CardTitle>
              <CardDescription>
                Students requiring immediate attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredStudents
                  .filter((record: any) => 
                    record.monthlyStats.attendancePercentage < 75 || 
                    record.monthlyStats.totalAbsent >= parseInt(absenceThreshold)
                  )
                  .map((record: any) => (
                    <div key={record._id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                        <div>
                          <p className="font-medium">
                            {record.studentId?.firstName} {record.studentId?.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Roll: {record.studentId?.rollNumber} • 
                            {record.monthlyStats.attendancePercentage}% attendance • 
                            {record.monthlyStats.totalAbsent} absences
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-red-600 border-red-600">
                        Needs Attention
                      </Badge>
                    </div>
                  ))}
                
                {filteredStudents.filter((record: any) => 
                  record.monthlyStats.attendancePercentage < 75 || 
                  record.monthlyStats.totalAbsent >= parseInt(absenceThreshold)
                ).length === 0 && (
                  <div className="text-center py-8">
                    <AlertTriangle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">All Clear!</h3>
                    <p className="text-muted-foreground">
                      No students require immediate attention based on current criteria.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AttendanceReports;