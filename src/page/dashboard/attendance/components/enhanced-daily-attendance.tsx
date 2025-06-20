import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useGetClassAttendance, useMarkBulkAttendance, useGetStudentsWithAttendance } from "@/hooks/api/use-attendance";
import { toastError, toastSuccess } from "@/utils/toast";
import { format } from "date-fns";
import {
  AlertTriangle,
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  Filter,
  RotateCcw,
  Save,
  Search,
  UserX,
  XCircle,
  Zap,
  Grid,
  List,
  ChevronLeft,
  ChevronRight,
  Users
} from "lucide-react";
import { useEffect, useMemo, useState, useCallback } from "react";

interface EnhancedDailyAttendanceProps {
  classId: string;
  date: Date;
}

const ATTENDANCE_STATUS_OPTIONS = [
  { value: "present", label: "Present", icon: CheckCircle, color: "bg-green-500", textColor: "text-green-600" },
  { value: "absent", label: "Absent", icon: XCircle, color: "bg-red-500", textColor: "text-red-600" },
  { value: "late", label: "Late", icon: Clock, color: "bg-yellow-500", textColor: "text-yellow-600" },
  { value: "half-day", label: "Half Day", icon: UserX, color: "bg-orange-500", textColor: "text-orange-600" },
  { value: "holiday", label: "Holiday", icon: Calendar, color: "bg-blue-500", textColor: "text-blue-600" },
  { value: "leave", label: "Leave", icon: BookOpen, color: "bg-purple-500", textColor: "text-purple-600" },
];

const EnhancedDailyAttendance: React.FC<EnhancedDailyAttendanceProps> = ({ classId, date }) => {
  const [attendanceData, setAttendanceData] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState<string>("");
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'compact'>('compact');
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage] = useState(50);
  const [quickMarkMode, setQuickMarkMode] = useState(false);
  const [quickMarkStatus, setQuickMarkStatus] = useState('present');

  const formattedDate = format(date, "yyyy-MM-dd");
  const displayDate = format(date, "MMMM d, yyyy");
  const currentYear = date.getFullYear().toString();
  const currentMonth = (date.getMonth() + 1).toString().padStart(2, '0');

  // Fetch existing attendance data
  const { data: existingAttendance, isLoading: attendanceLoading } = useGetClassAttendance(classId, formattedDate);
  
  // Fetch students who have attendance records for this month/year
  const { data: studentsWithAttendanceData, isLoading: studentsLoading } = useGetStudentsWithAttendance(
    classId,
    currentYear,
    currentMonth
  );

  const markBulkAttendanceMutation = useMarkBulkAttendance();

  // Initialize attendance data when existing attendance is loaded
  useEffect(() => {
    if (existingAttendance && existingAttendance.length > 0) {
      const attendanceMap: Record<string, string> = {};
      existingAttendance.forEach(item => {
        if (item.attendance) {
          attendanceMap[item.student._id] = item.attendance.status;
        }
      });
      setAttendanceData(attendanceMap);
    }
  }, [existingAttendance]);

  // Initialize all students as present if no existing data
  useEffect(() => {
    if (studentsWithAttendanceData && Object.keys(attendanceData).length === 0 && !attendanceLoading) {
      const initialData: Record<string, string> = {};
      studentsWithAttendanceData.forEach(item => {
        const studentId = item.student._id;
        if (studentId) {
          initialData[studentId] = "present";
        }
      });
      setAttendanceData(initialData);
    }
  }, [studentsWithAttendanceData, attendanceData, attendanceLoading]);

  // Filtered and searched students with pagination
  const { filteredStudents, paginatedStudents, totalPages } = useMemo(() => {
    if (!studentsWithAttendanceData) return { filteredStudents: [], paginatedStudents: [], totalPages: 0 };
    
    const filtered = studentsWithAttendanceData.filter(item => {
      const student = item.student;
      const studentId = student._id;
      if (!studentId) return false;
      
      const matchesSearch = searchQuery === "" || 
        student.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.rollNumber.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || 
        attendanceData[studentId] === statusFilter;
      
      return matchesSearch && matchesStatus;
    }).map(item => item.student);

    const startIndex = currentPage * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginated = filtered.slice(startIndex, endIndex);
    const pages = Math.ceil(filtered.length / itemsPerPage);

    return { 
      filteredStudents: filtered, 
      paginatedStudents: paginated, 
      totalPages: pages 
    };
  }, [studentsWithAttendanceData, searchQuery, statusFilter, attendanceData, currentPage, itemsPerPage]);

  // Attendance statistics
  const stats = useMemo(() => {
    const students = studentsWithAttendanceData || [];
    const total = students.length;
    const marked = Object.keys(attendanceData).length;
    const present = Object.values(attendanceData).filter(status => status === "present").length;
    const absent = Object.values(attendanceData).filter(status => status === "absent").length;
    const late = Object.values(attendanceData).filter(status => status === "late").length;
    const other = marked - present - absent - late;
    
    return { total, marked, present, absent, late, other };
  }, [studentsWithAttendanceData, attendanceData]);

  const handleStatusChange = (studentId: string, status: string) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: status
    }));
    
    // Remove from selected if changing individual status
    setSelectedStudents(prev => {
      const newSet = new Set(prev);
      newSet.delete(studentId);
      return newSet;
    });
  };

  const handleStudentSelect = (studentId: string, checked: boolean) => {
    setSelectedStudents(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(studentId);
      } else {
        newSet.delete(studentId);
      }
      return newSet;
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedStudents(new Set(filteredStudents.map(s => s._id).filter(Boolean)));
    } else {
      setSelectedStudents(new Set());
    }
  };

  const handleBulkStatusChange = () => {
    if (!bulkStatus || selectedStudents.size === 0) {
      toastError("Please select students and choose a status for bulk update");
      return;
    }

    const updates: Record<string, string> = {};
    selectedStudents.forEach(studentId => {
      updates[studentId] = bulkStatus;
    });

    setAttendanceData(prev => ({ ...prev, ...updates }));
    setSelectedStudents(new Set());
    setBulkStatus("");

    toastSuccess(`Updated ${selectedStudents.size} students to ${bulkStatus}`);
  };

  const handleQuickMarkAll = useCallback((status: string) => {
    const updates: Record<string, string> = {};
    (studentsWithAttendanceData || []).forEach(item => {
      const studentId = item.student._id;
      if (studentId) {
        updates[studentId] = status;
      }
    });
    setAttendanceData(updates);
    
    toastSuccess(`Marked all students as ${status}`);
  }, [studentsWithAttendanceData]);

  const handleQuickMark = useCallback((studentId: string) => {
    if (quickMarkMode) {
      setAttendanceData(prev => ({
        ...prev,
        [studentId]: quickMarkStatus
      }));
    }
  }, [quickMarkMode, quickMarkStatus]);

  const handlePageChange = useCallback((direction: 'prev' | 'next') => {
    setCurrentPage(prev => {
      if (direction === 'prev') {
        return Math.max(0, prev - 1);
      } else {
        return Math.min(totalPages - 1, prev + 1);
      }
    });
  }, [totalPages]);

  const handleSaveAttendance = useCallback(async () => {
    if (!classId) {
      toastError("Please select a class first");
      return;
    }

    const students = studentsWithAttendanceData || [];
    
    // Filter out students without valid IDs and add debugging
    const validStudents = students.filter(item => {
      const hasId = item.student && item.student._id;
      if (!hasId) {
        console.warn('Student without valid ID:', item.student);
      }
      return hasId;
    });

    const attendanceList = validStudents.map(item => ({
      studentId: item.student._id,
      status: attendanceData[item.student._id] || "present"
    }));

    if (attendanceList.length === 0) {
      toastError("No students found to mark attendance");
      return;
    }

    // Validate that all studentIds are present
    const invalidEntries = attendanceList.filter(entry => !entry.studentId);
    if (invalidEntries.length > 0) {
      console.error('Invalid attendance entries:', invalidEntries);
      toastError("Some students are missing IDs. Please refresh and try again.");
      return;
    }

    try {
      const result = await markBulkAttendanceMutation.mutateAsync({
        classId,
        date: formattedDate,
        attendanceList
      });
      
      // Log success details for debugging
      console.log('Attendance save result:', result);
      
    } catch (error) {
      // Error is handled in the mutation
      console.error('Attendance save error:', error);
    }
  }, [classId, studentsWithAttendanceData, attendanceData, formattedDate, markBulkAttendanceMutation]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(0);
  }, [searchQuery, statusFilter]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement) {
        return; // Don't trigger shortcuts when typing in inputs
      }

      switch (event.key.toLowerCase()) {
        case 'p':
          event.preventDefault();
          handleQuickMarkAll('present');
          break;
        case 'a':
          event.preventDefault();
          handleQuickMarkAll('absent');
          break;
        case 'l':
          event.preventDefault();
          handleQuickMarkAll('late');
          break;
        case 'r':
          event.preventDefault();
          setAttendanceData({});
          break;
        case 's':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            handleSaveAttendance();
          }
          break;
        case 'q':
          event.preventDefault();
          setQuickMarkMode(!quickMarkMode);
          break;
        case 'arrowleft':
          if (currentPage > 0) {
            event.preventDefault();
            handlePageChange('prev');
          }
          break;
        case 'arrowright':
          if (currentPage < totalPages - 1) {
            event.preventDefault();
            handlePageChange('next');
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleQuickMarkAll, setAttendanceData, handleSaveAttendance, quickMarkMode, setQuickMarkMode, currentPage, totalPages, handlePageChange]);

  const getStatusOption = (status: string) => {
    return ATTENDANCE_STATUS_OPTIONS.find(option => option.value === status);
  };

  const isAttendanceMarked = existingAttendance && existingAttendance.length > 0 && 
    existingAttendance.some(item => item.attendance);

  if (!classId) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <AlertTriangle className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Class Selected</h3>
          <p className="text-muted-foreground text-center max-w-md">
            Please select a class from the dropdown above to view and mark attendance for students.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (studentsLoading || attendanceLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading students and attendance data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const students = studentsWithAttendanceData || [];

  if (students.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <UserX className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Students Found</h3>
          <p className="text-muted-foreground text-center max-w-md">
            There are no students with attendance records in the selected class for {currentYear}-{currentMonth}. 
            Please make sure students have been marked for attendance in this month, or select a different month.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Attendance for {displayDate}
          </CardTitle>
          <CardDescription>
            Class: {students[0]?.student?.classId?.name} {students[0]?.student?.classId?.section ? `- ${students[0]?.student?.classId?.section}` : ""} 
            • {stats.total} students
            {isAttendanceMarked && (
              <Badge variant="outline" className="ml-2">
                Previously Marked
              </Badge>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.present}</div>
              <div className="text-sm text-muted-foreground">Present</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.absent}</div>
              <div className="text-sm text-muted-foreground">Absent</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.late}</div>
              <div className="text-sm text-muted-foreground">Late</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.other}</div>
              <div className="text-sm text-muted-foreground">Other</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Previous Attendance Warning */}
      {isAttendanceMarked && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Attendance Already Marked</AlertTitle>
          <AlertDescription>
            Attendance has already been marked for this date. Making changes will update the existing records.
          </AlertDescription>
        </Alert>
      )}

      {/* Quick Actions & View Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Quick Actions & View Options</span>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'compact' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('compact')}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
            </div>
          </CardTitle>
          <CardDescription>
            Fast ways to mark attendance and view options for large classes
            <div className="mt-2 text-xs text-muted-foreground flex flex-wrap gap-4">
              <span><kbd className="px-1 py-0.5 bg-muted rounded text-xs">P</kbd> All Present</span>
              <span><kbd className="px-1 py-0.5 bg-muted rounded text-xs">A</kbd> All Absent</span>
              <span><kbd className="px-1 py-0.5 bg-muted rounded text-xs">L</kbd> All Late</span>
              <span><kbd className="px-1 py-0.5 bg-muted rounded text-xs">Q</kbd> Quick Mode</span>
              <span><kbd className="px-1 py-0.5 bg-muted rounded text-xs">Ctrl+S</kbd> Save</span>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Quick Mark Mode */}
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border">
            <div className="flex items-center gap-3">
              <Switch
                checked={quickMarkMode}
                onCheckedChange={setQuickMarkMode}
              />
              <div>
                <p className="font-medium text-sm">Quick Mark Mode</p>
                <p className="text-xs text-muted-foreground">Tap students to quickly mark with selected status</p>
              </div>
            </div>
            {quickMarkMode && (
              <Select value={quickMarkStatus} onValueChange={setQuickMarkStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ATTENDANCE_STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${option.color}`}></div>
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Bulk Actions */}
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleQuickMarkAll("present")}
              className="text-green-600 border-green-200 hover:bg-green-50"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              All Present
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleQuickMarkAll("absent")}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              <XCircle className="h-4 w-4 mr-2" />
              All Absent
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setAttendanceData({})}
              className="text-gray-600 border-gray-200 hover:bg-gray-50"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset All
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter Students</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or roll number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {ATTENDANCE_STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${option.color}`}></div>
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Bulk Actions for Selected Students */}
          {selectedStudents.size > 0 && (
            <div className="flex flex-col sm:flex-row gap-4 p-4 bg-blue-50 rounded-lg border">
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900 mb-2">
                  {selectedStudents.size} students selected
                </p>
                <div className="flex gap-2">
                  <Select value={bulkStatus} onValueChange={setBulkStatus}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Choose status" />
                    </SelectTrigger>
                    <SelectContent>
                      {ATTENDANCE_STATUS_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${option.color}`}></div>
                            {option.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={handleBulkStatusChange} size="sm">
                    <Zap className="h-4 w-4 mr-2" />
                    Apply to Selected
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Student List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <span>Student Attendance ({filteredStudents.length})</span>
            </div>
            <div className="flex items-center gap-4">
              {totalPages > 1 && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Page {currentPage + 1} of {totalPages}</span>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange('prev')}
                      disabled={currentPage === 0}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange('next')}
                      disabled={currentPage >= totalPages - 1}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedStudents.size === paginatedStudents.length && paginatedStudents.length > 0}
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-sm text-muted-foreground">Select All</span>
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {paginatedStudents.map((student) => {
                const studentId = student._id;
                const studentStatus = attendanceData[studentId] || "present";
                const statusOption = getStatusOption(studentStatus);
                const isSelected = selectedStudents.has(studentId);

                return (
                  <div 
                    key={studentId} 
                    className={`p-3 rounded-lg border transition-all hover:shadow-md ${
                      quickMarkMode ? 'cursor-pointer hover:scale-105' : ''
                    } ${isSelected ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => quickMarkMode && handleQuickMark(studentId)}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => handleStudentSelect(studentId, checked as boolean)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-semibold text-primary">
                          {student.rollNumber}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm font-medium truncate mb-1">
                      {student.firstName} {student.lastName}
                    </p>
                    <div className="flex items-center justify-between">
                      {statusOption && (
                        <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${statusOption.textColor} bg-background border`}>
                          <statusOption.icon className="w-3 h-3" />
                          <span className="hidden sm:inline">{statusOption.label}</span>
                        </div>
                      )}
                      {!quickMarkMode && (
                        <Select
                          value={studentStatus}
                          onValueChange={(value) => handleStatusChange(studentId, value)}
                        >
                          <SelectTrigger className="w-20 h-7 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ATTENDANCE_STATUS_OPTIONS.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                <div className="flex items-center gap-2">
                                  <div className={`w-2 h-2 rounded-full ${option.color}`}></div>
                                  <span className="text-xs">{option.label}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-1">
              {paginatedStudents.map((student, index) => {
                const studentId = student._id;
                const studentStatus = attendanceData[studentId] || "present";
                const statusOption = getStatusOption(studentStatus);
                const isSelected = selectedStudents.has(studentId);

                return (
                  <div key={studentId}>
                    <div 
                      className={`flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-all ${
                        quickMarkMode ? 'cursor-pointer' : ''
                      } ${isSelected ? 'ring-1 ring-primary' : ''}`}
                      onClick={() => quickMarkMode && handleQuickMark(studentId)}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => handleStudentSelect(studentId, checked as boolean)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-semibold text-primary">
                            {student.rollNumber}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">
                            {student.firstName} {student.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            Roll: {student.rollNumber}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {statusOption && (
                          <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${statusOption.textColor} bg-background border`}>
                            <statusOption.icon className="w-3 h-3" />
                            <span className="hidden sm:inline">{statusOption.label}</span>
                          </div>
                        )}
                        
                        {!quickMarkMode && (
                          <Select
                            value={studentStatus}
                            onValueChange={(value) => handleStatusChange(studentId, value)}
                          >
                            <SelectTrigger className="w-24 sm:w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {ATTENDANCE_STATUS_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  <div className="flex items-center gap-2">
                                    <div className={`w-3 h-3 rounded-full ${option.color}`}></div>
                                    {option.label}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    </div>
                    {index < paginatedStudents.length - 1 && <Separator className="my-1" />}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSaveAttendance}
          disabled={markBulkAttendanceMutation.isPending}
          size="lg"
          className="min-w-32"
        >
          {markBulkAttendanceMutation.isPending ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {isAttendanceMarked ? "Update Attendance" : "Save Attendance"}
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default EnhancedDailyAttendance;