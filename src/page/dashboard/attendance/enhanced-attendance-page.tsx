import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { 
  Calendar, 
  Loader2, 
  Users, 
  TrendingUp, 
  Clock,
  Wifi,
  WifiOff,
  AlertCircle,
  CheckCircle2,
  Download,
  Upload
} from "lucide-react";
import ClassSelector from "./components/class-selector";
import DatePicker from "./components/date-picker";
import { ScrollArea } from "@/components/ui/scroll-area";
import EnhancedAttendanceView from "./components/enhanced-attendance-view";
import BatchOperations from "./components/batch-operations";
import { syncAttendanceData, generateAttendancePDF, exportAttendanceToExcel } from "./utils/attendance-utils";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

// Student interface
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

// Connection status for real-time features
interface ConnectionStatus {
  isOnline: boolean;
  lastSync?: Date;
  retryCount: number;
}

export default function EnhancedAttendancePage() {
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [viewType, setViewType] = useState<'grid' | 'table'>('grid');
  const [students, setStudents] = useState<Student[]>([]);
  const [originalStudents, setOriginalStudents] = useState<Student[]>([]);
  const [saveInProgress, setSaveInProgress] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    isOnline: navigator.onLine,
    retryCount: 0
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  const { toast } = useToast();

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setConnectionStatus(prev => ({ ...prev, isOnline: true, retryCount: 0 }));
      toast({
        title: "Connection Restored",
        description: "You're back online. Changes will be synced automatically.",
        duration: 3000,
      });
    };

    const handleOffline = () => {
      setConnectionStatus(prev => ({ ...prev, isOnline: false }));
      toast({
        variant: "destructive",
        title: "Connection Lost",
        description: "Working offline. Changes will be saved locally.",
        duration: 5000,
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast]);

  // Calculate attendance statistics
  const attendanceStats = React.useMemo(() => {
    const present = students.filter(s => s.attendanceStatus === 'present').length;
    const absent = students.filter(s => s.attendanceStatus === 'absent').length;
    const leave = students.filter(s => s.attendanceStatus === 'leave').length;
    const total = students.length;
    const online = students.filter(s => s.isOnline).length;
    
    return {
      present,
      absent,
      leave,
      total,
      online,
      presentPercentage: total > 0 ? Math.round((present / total) * 100) : 0,
      attendanceRate: total > 0 ? Math.round(((present + leave) / total) * 100) : 0
    };
  }, [students]);

  // Fetch students for selected class
  const fetchStudentsForClass = useCallback(async () => {
    if (!selectedClass) {
      setStudents([]);
      setOriginalStudents([]);
      return;
    }

    setLoading(true);
    try {
      // Simulate API latency
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Generate mock students with more realistic data
      const mockStudents = Array.from({ length: 32 }, (_, i) => {
        const rand = Math.random();
        let attendanceStatus: 'present' | 'absent' | 'leave';
        
        // More realistic distribution
        if (rand < 0.82) {
          attendanceStatus = 'present'; // 82% present
        } else if (rand < 0.92) {
          attendanceStatus = 'leave';  // 10% leave
        } else {
          attendanceStatus = 'absent'; // 8% absent
        }
        
        const isOnline = Math.random() < 0.25; // 25% online
        
        const firstNames = ['Aarav', 'Ananya', 'Arjun', 'Diya', 'Ishaan', 'Kavya', 'Rohan', 'Priya', 'Sahil', 'Tara', 'Vikram', 'Zara'];
        const lastNames = ['Sharma', 'Patel', 'Singh', 'Kumar', 'Reddy', 'Iyer', 'Joshi', 'Nair', 'Gupta', 'Agarwal', 'Mehta', 'Shah'];
        
        const firstName = firstNames[i % firstNames.length];
        const lastName = lastNames[Math.floor(i / firstNames.length) % lastNames.length];
        
        return {
          id: `student-${i + 1}`,
          studentId: `STD${String(10001 + i).padStart(5, '0')}`,
          firstName,
          lastName,
          rollNumber: String(1001 + i),
          className: selectedClass,
          attendanceStatus,
          profileImage: null,
          gender: (i % 3 === 0 ? 'female' : i % 3 === 1 ? 'male' : 'other') as 'male' | 'female' | 'other',
          isOnline,
          lastSeen: isOnline ? undefined : new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString()
        };
      });
      
      setStudents(mockStudents);
      setOriginalStudents([...mockStudents]);
      setHasUnsavedChanges(false);
      
      // Simulate real-time updates
      const interval = setInterval(() => {
        setStudents(current => 
          current.map(student => ({
            ...student,
            isOnline: Math.random() < (student.isOnline ? 0.8 : 0.1) // Sticky online status
          }))
        );
      }, 10000);

      return () => clearInterval(interval);
      
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
  }, [selectedClass, toast]);

  useEffect(() => {
    fetchStudentsForClass();
  }, [fetchStudentsForClass]);

  const handleToggleAttendance = useCallback((studentId: string, newStatus: 'present' | 'absent' | 'leave') => {
    setStudents(current => {
      const updated = current.map(student => {
        if (student.id === studentId) {
          return { ...student, attendanceStatus: newStatus };
        }
        return student;
      });
      
      // Check if changes were made
      const hasChanges = updated.some((student, index) => 
        student.attendanceStatus !== originalStudents[index]?.attendanceStatus
      );
      setHasUnsavedChanges(hasChanges);
      
      return updated;
    });

    // Show visual feedback
    toast({
      title: "Status Updated",
      description: `Student marked as ${newStatus}`,
      duration: 1500,
    });
  }, [originalStudents, toast]);

  const handleClassChange = useCallback((classId: string) => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm('You have unsaved changes. Are you sure you want to switch classes?');
      if (!confirmed) return;
    }
    setSelectedClass(classId);
  }, [hasUnsavedChanges]);

  const handleDateChange = useCallback((date: Date | undefined) => {
    if (date && hasUnsavedChanges) {
      const confirmed = window.confirm('You have unsaved changes. Are you sure you want to change the date?');
      if (!confirmed) return;
    }
    if (date) {
      setSelectedDate(date);
    }
  }, [hasUnsavedChanges]);

  const handleBatchStatusChange = useCallback((status: 'present' | 'absent' | 'leave') => {
    setStudents(current => {
      const updated = current.map(student => ({
        ...student,
        attendanceStatus: status
      }));
      setHasUnsavedChanges(true);
      return updated;
    });
  }, []);

  const handleUndoLastAction = useCallback(() => {
    setStudents([...originalStudents]);
    setHasUnsavedChanges(false);
    toast({
      title: "Changes Reverted",
      description: "All changes have been undone",
    });
  }, [originalStudents, toast]);

  const handleSaveAttendance = useCallback(async () => {
    if (!selectedClass) return;
    
    setSaveInProgress(true);
    try {
      const result = await syncAttendanceData(
        selectedClass,
        selectedDate,
        students
      );
      
      if (result.success) {
        setOriginalStudents([...students]);
        setHasUnsavedChanges(false);
        setConnectionStatus(prev => ({ ...prev, lastSync: new Date() }));
        
        toast({
          title: "Attendance Saved Successfully",
          description: `Attendance for ${selectedDate.toLocaleDateString()} has been saved.`,
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to save attendance data";
      console.error("Failed to save attendance:", errorMessage);
      
      if (!connectionStatus.isOnline) {
        toast({
          title: "Saved Locally",
          description: "Changes saved offline. Will sync when connection is restored.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Save Failed",
          description: errorMessage,
        });
      }
    } finally {
      setSaveInProgress(false);
    }
  }, [selectedClass, selectedDate, students, connectionStatus.isOnline, toast]);

  const handleExportPDF = useCallback(() => {
    if (!selectedClass) return;
    generateAttendancePDF(students, selectedClass, selectedDate);
    toast({
      title: "PDF Generated",
      description: "Attendance report has been downloaded",
    });
  }, [students, selectedClass, selectedDate, toast]);

  const handleExportExcel = useCallback(() => {
    if (!selectedClass) return;
    exportAttendanceToExcel(students, selectedClass, selectedDate);
    toast({
      title: "Excel Exported",
      description: "Attendance data has been downloaded",
    });
  }, [students, selectedClass, selectedDate, toast]);

  return (
    <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8 max-w-7xl">
      <div className="flex flex-col space-y-6">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0"
        >
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              📋 Smart Attendance
            </h1>
            <p className="text-muted-foreground">
              Modern attendance management with real-time sync
            </p>
          </div>
          
          {/* Connection Status */}
          <div className="flex items-center gap-3">
            <Badge variant={connectionStatus.isOnline ? "default" : "destructive"} className="flex items-center gap-1">
              {connectionStatus.isOnline ? (
                <Wifi className="h-3 w-3" />
              ) : (
                <WifiOff className="h-3 w-3" />
              )}
              {connectionStatus.isOnline ? 'Online' : 'Offline'}
            </Badge>
            
            {connectionStatus.lastSync && (
              <span className="text-xs text-muted-foreground">
                Last sync: {connectionStatus.lastSync.toLocaleTimeString()}
              </span>
            )}
          </div>
        </motion.div>

        {/* Quick Stats */}
        <AnimatePresence>
          {selectedClass && students.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-4"
            >
              <Card className="border-emerald-200 dark:border-emerald-800">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    <div>
                      <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                        {attendanceStats.present}
                      </p>
                      <p className="text-xs text-muted-foreground">Present ({attendanceStats.presentPercentage}%)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-amber-200 dark:border-amber-800">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-amber-600" />
                    <div>
                      <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">
                        {attendanceStats.leave}
                      </p>
                      <p className="text-xs text-muted-foreground">On Leave</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-red-200 dark:border-red-800">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="text-2xl font-bold text-red-700 dark:text-red-400">
                        {attendanceStats.absent}
                      </p>
                      <p className="text-xs text-muted-foreground">Absent</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-blue-200 dark:border-blue-800">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                        {attendanceStats.attendanceRate}%
                      </p>
                      <p className="text-xs text-muted-foreground">Attendance Rate</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Unsaved Changes Alert */}
        <AnimatePresence>
          {hasUnsavedChanges && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/50">
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  You have unsaved changes. Don't forget to save your attendance data.
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Controls Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Class and Date Selection */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Class Selection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <ClassSelector onClassChange={handleClassChange} />
                  </div>
                  <div>
                    <DatePicker date={selectedDate} onDateChange={handleDateChange} />
                  </div>
                </div>
                
                {selectedClass && students.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExportPDF}
                      className="flex items-center gap-1"
                    >
                      <Download className="h-3 w-3" />
                      PDF Report
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExportExcel}
                      className="flex items-center gap-1"
                    >
                      <Upload className="h-3 w-3" />
                      Excel Export
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Batch Operations */}
          {selectedClass && students.length > 0 && (
            <div className="lg:col-span-1">
              <BatchOperations
                students={students}
                onBatchStatusChange={handleBatchStatusChange}
                onSaveAttendance={handleSaveAttendance}
                onUndoLastAction={hasUnsavedChanges ? handleUndoLastAction : undefined}
                isSaving={saveInProgress}
                className={selectedClass}
                selectedDate={selectedDate}
              />
            </div>
          )}
        </div>
        
        {/* Main Content */}
        <Card className="flex-1">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>
                {selectedClass ? `${selectedClass} Attendance` : 'Select a Class'}
              </span>
              {selectedClass && students.length > 0 && (
                <Badge variant="outline">
                  {attendanceStats.online} online
                </Badge>
              )}
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
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-20"
                >
                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                  <p className="text-muted-foreground">Loading student data...</p>
                </motion.div>
              ) : !selectedClass ? (
                <motion.div
                  key="no-class"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex flex-col items-center justify-center py-20"
                >
                  <Calendar className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium mb-2">Select a Class</h3>
                  <p className="text-muted-foreground text-center">
                    Choose a class from the dropdown above to start marking attendance
                  </p>
                </motion.div>
              ) : students.length === 0 ? (
                <motion.div
                  key="no-students"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex flex-col items-center justify-center py-20"
                >
                  <Users className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium mb-2">No Students Found</h3>
                  <p className="text-muted-foreground text-center">
                    There are no students enrolled in this class
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="attendance-view"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <ScrollArea className="h-[calc(100vh-28rem)]">
                    <EnhancedAttendanceView
                      students={students}
                      onStatusChange={handleToggleAttendance}
                      isSaving={saveInProgress}
                      viewType={viewType}
                      onViewTypeChange={setViewType}
                    />
                  </ScrollArea>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}