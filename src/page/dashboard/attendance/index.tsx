import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Calendar, CheckCircle2, ClipboardCheck, Filter, Loader2, Search, UserX } from "lucide-react";
import AttendanceTable from "./components/attendance-table";
import AttendanceGrid from "./components/attendance-grid";
import ClassSelector from "./components/class-selector";
import DatePicker from "./components/date-picker";
import { useMediaQuery } from "@/hooks/use-media-query";
import { ScrollArea } from "@/components/ui/scroll-area";
import AttendanceStats from "./components/attendance-stats";

export default function AttendancePage() {
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [viewType, setViewType] = useState<'table' | 'grid'>('table');
  const [students, setStudents] = useState<any[]>([]);
  const [saveInProgress, setSaveInProgress] = useState(false);
  const [attendanceStats, setAttendanceStats] = useState({
    present: 0,
    absent: 0,
    total: 0
  });
  const isMobile = useMediaQuery("(max-width: 640px)");
  
  const { toast } = useToast();

  // Fetch students for selected class
  useEffect(() => {
    const fetchStudentsForClass = async () => {
      if (!selectedClass) {
        setStudents([]);
        return;
      }

      setLoading(true);
      try {
        // In real app, this would be an API call to fetch students by class
        // const response = await apiClient.get(`/api/classes/${selectedClass}/students`);
        // setStudents(response.data);
        
        // For this demo, use mock data
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API latency
        
        // Create 30 students for demo (or use the 1000 for pagination demo)
        const mockStudents = Array.from({ length: 30 }, (_, i) => ({
          id: `student-${i + 1}`,
          studentId: `STD${10001 + i}`,
          firstName: `Student`,
          lastName: `${i + 1}`,
          rollNumber: `${1001 + i}`,
          className: selectedClass,
          isPresent: Math.random() > 0.2, // 80% are present by default
          profileImage: null,
          gender: i % 2 === 0 ? 'male' : 'female',
        }));
        
        setStudents(mockStudents);
        updateAttendanceStats(mockStudents);
      } catch (error) {
        console.error("Failed to fetch students:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load student data",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStudentsForClass();
  }, [selectedClass, toast]);

  // Update attendance stats whenever student attendance changes
  const updateAttendanceStats = (students: any[]) => {
    const present = students.filter(s => s.isPresent).length;
    const absent = students.length - present;
    
    setAttendanceStats({
      present,
      absent,
      total: students.length
    });
  };

  const handleToggleAttendance = (studentId: string) => {
    const updatedStudents = students.map(student => {
      if (student.id === studentId) {
        return { ...student, isPresent: !student.isPresent };
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
      isPresent: true
    }));
    
    setStudents(updatedStudents);
    updateAttendanceStats(updatedStudents);
  };

  const handleMarkAllAbsent = () => {
    const updatedStudents = students.map(student => ({
      ...student,
      isPresent: false
    }));
    
    setStudents(updatedStudents);
    updateAttendanceStats(updatedStudents);
  };

  const handleSaveAttendance = async () => {
    setSaveInProgress(true);
    try {
      // In a real app, this would be an API call to save attendance
      // const response = await apiClient.post('/api/attendance', {
      //   classId: selectedClass,
      //   date: selectedDate,
      //   students: students.map(s => ({
      //     studentId: s.id,
      //     isPresent: s.isPresent
      //   }))
      // });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Attendance Saved",
        description: `Attendance for ${selectedDate.toLocaleDateString()} has been recorded successfully.`,
      });
    } catch (error) {
      console.error("Failed to save attendance:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save attendance data",
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
        </div>

        {/* Filters & Actions Row */}
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 items-center">
              <div className="col-span-1 sm:col-span-1">
                <ClassSelector onClassChange={handleClassChange} />
              </div>
              <div className="col-span-1 sm:col-span-1">
                <DatePicker date={selectedDate} onDateChange={handleDateChange} />
              </div>
              
              <div className="sm:col-span-1">
                <Tabs defaultValue={viewType} onValueChange={(v) => setViewType(v as 'table' | 'grid')}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="table" className="text-xs sm:text-sm">
                      Table View
                    </TabsTrigger>
                    <TabsTrigger value="grid" className="text-xs sm:text-sm">
                      Grid View
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              
              <div className="col-span-1 sm:col-span-1 md:col-span-1 flex space-x-2 justify-end">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleMarkAllPresent}
                  disabled={!selectedClass || loading}
                >
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Mark All</span> Present
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleMarkAllAbsent}
                  disabled={!selectedClass || loading}
                >
                  <UserX className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Mark All</span> Absent
                </Button>
              </div>
              
              <div className="col-span-1 md:col-span-1 flex justify-center md:justify-end">
                <Button
                  onClick={handleSaveAttendance}
                  disabled={!selectedClass || loading || saveInProgress}
                  className="w-full md:w-auto"
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
          </CardContent>
        </Card>

        {/* Attendance Stats */}
        <AttendanceStats stats={attendanceStats} />
        
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
          <CardContent className="p-0">
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
              <ScrollArea className={`h-[calc(100vh-26rem)] ${viewType === 'grid' ? 'px-6 py-4' : ''}`}>
                {viewType === 'grid' ? (
                  <AttendanceGrid 
                    students={students}
                    onToggleAttendance={handleToggleAttendance}
                  />
                ) : (
                  <AttendanceTable 
                    students={students}
                    onToggleAttendance={handleToggleAttendance}
                  />
                )}
              </ScrollArea>
            )}
          </CardContent>
          
          {/* Footer with save button for easy access at bottom */}
          {selectedClass && students.length > 0 && (
            <CardFooter className="flex justify-between p-4 sm:p-6">
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
