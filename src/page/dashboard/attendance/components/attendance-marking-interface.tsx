import { useState, useEffect } from "react";
import { format } from "date-fns";
import { CheckCircle, XCircle, Clock, UserX, Calendar, BookOpen, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useGetClassAttendance, useMarkAttendance, useMarkBulkAttendance, type ClassAttendance } from "@/hooks/api/use-attendance";
import { useStudents } from "@/hooks/api/use-students";
import { toast } from "@/hooks/use-toast";

interface AttendanceMarkingInterfaceProps {
  classId: string;
  date: Date;
}

const ATTENDANCE_STATUS_OPTIONS = [
  { value: "present", label: "Present", icon: CheckCircle, color: "bg-green-500" },
  { value: "absent", label: "Absent", icon: XCircle, color: "bg-red-500" },
  { value: "late", label: "Late", icon: Clock, color: "bg-yellow-500" },
  { value: "half-day", label: "Half Day", icon: UserX, color: "bg-orange-500" },
  { value: "holiday", label: "Holiday", icon: Calendar, color: "bg-blue-500" },
  { value: "leave", label: "Leave", icon: BookOpen, color: "bg-purple-500" },
];

const AttendanceMarkingInterface: React.FC<AttendanceMarkingInterfaceProps> = ({ classId, date }) => {
  const [attendanceData, setAttendanceData] = useState<Record<string, { status: string; remarks: string }>>({});
  const [bulkStatus, setBulkStatus] = useState<string>("");
  const [bulkRemarks, setBulkRemarks] = useState<string>("");

  const formattedDate = format(date, "yyyy-MM-dd");
  const displayDate = format(date, "MMMM d, yyyy");

  // Fetch existing attendance data
  const { data: existingAttendance, isLoading: attendanceLoading } = useGetClassAttendance(classId, formattedDate);
  
  // Fetch students in the class
  const { data: studentsData, isLoading: studentsLoading } = useStudents({
    classId,
    limit: 1000,
    isActive: true
  });

  const markAttendanceMutation = useMarkAttendance();
  const markBulkAttendanceMutation = useMarkBulkAttendance();

  // Initialize attendance data when existing attendance is loaded
  useEffect(() => {
    if (existingAttendance && existingAttendance.length > 0) {
      const attendanceMap: Record<string, { status: string; remarks: string }> = {};
      existingAttendance.forEach(item => {
        if (item.attendance) {
          attendanceMap[item.student._id] = {
            status: item.attendance.status,
            remarks: item.attendance.remarks || ""
          };
        }
      });
      setAttendanceData(attendanceMap);
    }
  }, [existingAttendance]);

  const handleStatusChange = (studentId: string, status: string) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: {
        status,
        remarks: prev[studentId]?.remarks || ""
      }
    }));
  };

  const handleRemarksChange = (studentId: string, remarks: string) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: {
        status: prev[studentId]?.status || "present",
        remarks
      }
    }));
  };

  const handleBulkApply = () => {
    if (!bulkStatus) {
      toast({
        title: "Error",
        description: "Please select a status for bulk apply",
        variant: "destructive",
      });
      return;
    }

    const students = studentsData?.students || [];
    const newAttendanceData: Record<string, { status: string; remarks: string }> = {};
    
    students.forEach(student => {
      newAttendanceData[student._id] = {
        status: bulkStatus,
        remarks: bulkRemarks
      };
    });
    
    setAttendanceData(newAttendanceData);
    setBulkStatus("");
    setBulkRemarks("");
    
    toast({
      title: "Success",
      description: "Bulk status applied to all students",
    });
  };

  const handleSaveAttendance = async () => {
    if (!classId) {
      toast({
        title: "Error",
        description: "Please select a class first",
        variant: "destructive",
      });
      return;
    }

    const attendanceList = Object.entries(attendanceData).map(([studentId, data]) => ({
      studentId,
      status: data.status,
      remarks: data.remarks || undefined
    }));

    if (attendanceList.length === 0) {
      toast({
        title: "Error",
        description: "No attendance data to save",
        variant: "destructive",
      });
      return;
    }

    try {
      await markBulkAttendanceMutation.mutateAsync({
        classId,
        date: formattedDate,
        attendanceList
      });
    } catch (error) {
      // Error is handled in the mutation
    }
  };

  const getStatusOption = (status: string) => {
    return ATTENDANCE_STATUS_OPTIONS.find(option => option.value === status);
  };

  const isAttendanceMarked = existingAttendance && existingAttendance.length > 0 && 
    existingAttendance.some(item => item.attendance);

  if (!classId) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Class Selected</h3>
          <p className="text-muted-foreground text-center">
            Please select a class from the dropdown above to mark attendance.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (studentsLoading || attendanceLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading students and attendance data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const students = studentsData?.students || [];

  if (students.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <UserX className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Students Found</h3>
          <p className="text-muted-foreground text-center">
            There are no active students in the selected class.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with date and class info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Attendance for {displayDate}
          </CardTitle>
          <CardDescription>
            Class: {students[0]?.classId?.name} {students[0]?.classId?.section ? `- ${students[0]?.classId?.section}` : ""} 
            • {students.length} students
            {isAttendanceMarked && (
              <Badge variant="outline" className="ml-2">
                Previously Marked
              </Badge>
            )}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Duplicate prevention warning */}
      {isAttendanceMarked && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Attendance Already Marked</AlertTitle>
          <AlertDescription>
            Attendance has already been marked for this date. Making changes will update the existing records.
          </AlertDescription>
        </Alert>
      )}

      {/* Bulk Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Bulk Actions</CardTitle>
          <CardDescription>Apply the same status to all students at once</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Select value={bulkStatus} onValueChange={setBulkStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status for all students" />
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
            </div>
            <div className="flex-1">
              <Textarea
                placeholder="Bulk remarks (optional)"
                value={bulkRemarks}
                onChange={(e) => setBulkRemarks(e.target.value)}
                rows={1}
              />
            </div>
            <Button onClick={handleBulkApply} variant="outline">
              Apply to All
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Student Attendance List */}
      <Card>
        <CardHeader>
          <CardTitle>Student Attendance</CardTitle>
          <CardDescription>Mark attendance for each student individually</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {students.map((student, index) => {
            const studentAttendance = attendanceData[student._id];
            const statusOption = getStatusOption(studentAttendance?.status || "present");

            return (
              <div key={student._id}>
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-sm font-semibold text-primary">
                            {student.rollNumber}
                          </span>
                        </div>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {student.firstName} {student.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Roll: {student.rollNumber} • {student.parentInfo?.primaryMobileNo}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <Select
                      value={studentAttendance?.status || "present"}
                      onValueChange={(value) => handleStatusChange(student._id, value)}
                    >
                      <SelectTrigger className="w-full sm:w-[140px]">
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

                    <Textarea
                      placeholder="Remarks (optional)"
                      value={studentAttendance?.remarks || ""}
                      onChange={(e) => handleRemarksChange(student._id, e.target.value)}
                      rows={1}
                      className="w-full sm:w-[200px]"
                    />
                  </div>
                </div>
                {index < students.length - 1 && <Separator className="mt-4" />}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSaveAttendance}
          disabled={markBulkAttendanceMutation.isPending}
          size="lg"
        >
          {markBulkAttendanceMutation.isPending ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              {isAttendanceMarked ? "Update Attendance" : "Save Attendance"}
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default AttendanceMarkingInterface;