import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Calendar, CheckCircle2, ClipboardCheck, Loader2, UserX } from "lucide-react";
import ClassSelector from "./components/class-selector";
import DatePicker from "./components/date-picker";
import { ScrollArea } from "@/components/ui/scroll-area";
import AttendanceStats from "./components/attendance-stats";
import AttendanceView from "./components/attendance-view-with-keyboard";
import AttendanceActionsModal from "./components/attendance-actions-modal";
import AttendanceHelpGuide from "./components/attendance-help-guide";
import AccessibilityHelp from "./components/accessibility-help";
import { syncAttendanceData } from "./utils/attendance-utils";

// Define Student type
interface Student {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  rollNumber: string;
  className: string;
  attendanceStatus: 'present' | 'absent' | 'leave';
  profileImage: string | null;
  gender: 'male' | 'female' | 'other';
  lastSeen?: string; 
  isOnline?: boolean;
}

export default function AttendancePage() {
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [viewType, setViewType] = useState<'table' | 'grid'>('table');
  const [students, setStudents] = useState<Student[]>([]);
  const [saveInProgress, setSaveInProgress] = useState(false);
  const [attendanceStats, setAttendanceStats] = useState({
    present: 0,
    absent: 0,
    leave: 0,
    total: 0
  });
  
  const { toast } = useToast();
  
  // Update attendance stats whenever student attendance changes
  const updateAttendanceStats = (students: Student[]) => {
    const present = students.filter(s => s.attendanceStatus === 'present').length;
    const absent = students.filter(s => s.attendanceStatus === 'absent').length;
    const leave = students.filter(s => s.attendanceStatus === 'leave').length;
    
    setAttendanceStats({
      present,
      absent,
      leave,
      total: students.length
    });
  };

  // Fetch students for selected class
  useEffect(() => {
    const fetchStudentsForClass = async () => {
      if (!selectedClass) {
        setStudents([]);
        return;
      }

      setLoading(true);
      try {
        // For this demo, use mock data
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API latency
        
        // Create 30 students for demo
        const mockStudents = Array.from({ length: 30 }, (_, i) => {
          // Generate random attendance status with probability distribution
          const rand = Math.random();
          let attendanceStatus: 'present' | 'absent' | 'leave';
          
          if (rand < 0.75) {
            attendanceStatus = 'present'; // 75% present
          } else if (rand < 0.90) {
            attendanceStatus = 'leave';  // 15% leave
          } else {
            attendanceStatus = 'absent'; // 10% absent
          }
          
          // Determine if student is online (20% chance)
          const isOnline = Math.random() < 0.2;
          
          // Generate a random "last seen" time for offline students
          const getRandomLastSeen = () => {
            const now = new Date();
            const hoursAgo = Math.floor(Math.random() * 24); // 0-24 hours ago
            const minutesAgo = Math.floor(Math.random() * 60); // 0-60 minutes ago
            now.setHours(now.getHours() - hoursAgo);
            now.setMinutes(now.getMinutes() - minutesAgo);
            return now.toLocaleString();
          };
          
          return {
            id: `student-${i + 1}`,
            studentId: `STD${10001 + i}`,
            firstName: `Student`,
            lastName: `${i + 1}`,
            rollNumber: `${1001 + i}`,
            className: selectedClass,
            attendanceStatus,
            profileImage: null,
            gender: (i % 2 === 0 ? 'male' : 'female') as 'male' | 'female',
            isOnline: isOnline,
            lastSeen: isOnline ? undefined : getRandomLastSeen()
          };
        });
        
        setStudents(mockStudents);
        updateAttendanceStats(mockStudents);
      } catch (error) {
        console.error("Failed to fetch students:", error);
        toast({
          variant: "error",
          title: "Error",
          description: "Failed to load student data",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStudentsForClass();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClass]);

  const handleToggleAttendance = (studentId: string, newStatus: 'present' | 'absent' | 'leave') => {
    const updatedStudents = students.map(student => {
      if (student.id === studentId) {
        return { ...student, attendanceStatus: newStatus };
      }
      return student;
    });
    
    setStudents(updatedStudents);
    updateAttendanceStats(updatedStudents);
  };
  
  const handleClassChange = (classId: string) => {
    setSelectedClass(classId);
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleMarkAllPresent = () => {
    const updatedStudents = students.map(student => ({
      ...student,
      attendanceStatus: 'present'
    }));
    
    setStudents(updatedStudents);
    updateAttendanceStats(updatedStudents);
  };

  const handleMarkAllAbsent = () => {
    const updatedStudents = students.map(student => ({
      ...student,
      attendanceStatus: 'absent'
    }));
    
    setStudents(updatedStudents);
    updateAttendanceStats(updatedStudents);
  };
  
  const handleMarkAllLeave = () => {
    const updatedStudents = students.map(student => ({
      ...student,
      attendanceStatus: 'leave'
    }));
    
    setStudents(updatedStudents);
    updateAttendanceStats(updatedStudents);
  };

  const handleSaveAttendance = async () => {
    setSaveInProgress(true);
    try {
      // Use the sync utility function
      const result = await syncAttendanceData(
        selectedClass as string,
        selectedDate,
        students
      );
      
      // Get attendance summary for toast message
      const present = students.filter(s => s.attendanceStatus === 'present').length;
      const absent = students.filter(s => s.attendanceStatus === 'absent').length;
      const leave = students.filter(s => s.attendanceStatus === 'leave').length;
      
      if (result.success) {
        toast({
          title: "Attendance Saved",
          description: `Attendance for ${selectedDate.toLocaleDateString()} has been recorded successfully. Summary: ${present} present, ${leave} on leave, ${absent} absent.`,
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to save attendance data";
      console.error("Failed to save attendance:", errorMessage);
      toast({
        variant: "error",
        title: "Error Saving Attendance",
        description: errorMessage,
      });
    } finally {
      setSaveInProgress(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col space-y-6">
        {/* Header Section */}
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Attendance
            </h2>
            <p className="text-sm text-muted-foreground sm:text-base">
              Track and manage daily student attendance
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <AccessibilityHelp />
            <AttendanceHelpGuide />
            {selectedClass && students.length > 0 && (
              <AttendanceActionsModal 
                classId={selectedClass}
                className={selectedClass}
                date={selectedDate}
                students={students}
                isLoading={loading || saveInProgress}
              />
            )}
          </div>
        </div>

        {/* Filters & Actions Row */}
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 items-center">
              <div className="col-span-1">
                <ClassSelector onClassChange={handleClassChange} />
              </div>
              <div className="col-span-1">
                <DatePicker date={selectedDate} onDateChange={handleDateChange} />
              </div>
              
              <div className="col-span-1 flex justify-end">
                <Button
                  onClick={handleSaveAttendance}
                  disabled={!selectedClass || loading || saveInProgress}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700"
                >
                  {saveInProgress ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <ClipboardCheck className="mr-2 h-4 w-4" />
                  )}
                  Save Attendance
                </Button>
              </div>
            </div>
            
            {selectedClass && !loading && students.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4 border-t pt-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleMarkAllPresent}
                  disabled={loading || saveInProgress}
                  className="bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30 dark:text-green-300"
                >
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Mark All</span> Present
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleMarkAllLeave}
                  disabled={loading || saveInProgress}
                  className="bg-yellow-50 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:hover:bg-yellow-900/30 dark:text-yellow-300"
                >
                  <Calendar className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Mark All</span> Leave
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleMarkAllAbsent}
                  disabled={loading || saveInProgress}
                  className="bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 dark:text-red-300"
                >
                  <UserX className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Mark All</span> Absent
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Attendance Stats */}
        {selectedClass && students.length > 0 && (
          <AttendanceStats stats={attendanceStats} />
        )}
        
        {/* Main Content */}
        <Card className="flex-1">
          <CardHeader>
            <CardTitle className="text-xl">
              {selectedClass ? `${selectedClass} Attendance` : 'Select a Class'}
            </CardTitle>
            <CardDescription>
              {selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 sm:p-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Loading student data...</p>
              </div>
            ) : !selectedClass ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No Class Selected</h3>
                <p className="text-muted-foreground text-center mt-2">
                  Please select a class to mark attendance
                </p>
              </div>
            ) : students.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <UserX className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No Students Found</h3>
                <p className="text-muted-foreground text-center mt-2">
                  There are no students in this class
                </p>
              </div>
            ) : (
              <ScrollArea className="h-[calc(100vh-26rem)]">
                <AttendanceView
                  students={students}
                  onStatusChange={handleToggleAttendance}
                  isSaving={saveInProgress}
                  viewType={viewType}
                  onViewTypeChange={setViewType}
                />
              </ScrollArea>
            )}
          </CardContent>
          
          {/* Footer with save button for easy access at bottom */}
          {selectedClass && students.length > 0 && (
            <CardFooter className="flex justify-between p-4 sm:p-6 border-t">
              <div>
                <p className="text-sm text-muted-foreground">
                  Showing {students.length} students
                </p>
              </div>
              <Button
                onClick={handleSaveAttendance}
                disabled={loading || saveInProgress}
              >
                {saveInProgress ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ClipboardCheck className="mr-2 h-4 w-4" />
                )}
                Save Attendance
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}
