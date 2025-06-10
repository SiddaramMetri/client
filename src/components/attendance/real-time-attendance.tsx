import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Play, 
  Pause, 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Wifi,
  WifiOff,
  RefreshCw,
  Save,
  Download
} from 'lucide-react';
import { useAttendanceSocket } from '@/context/attendance-socket-provider';
import { format } from 'date-fns';

interface Student {
  _id: string;
  firstName: string;
  lastName: string;
  rollNumber: string;
  classId: string;
}

interface RealTimeAttendanceProps {
  classId: string;
  workspaceId: string;
  students: Student[];
  className: string;
}

const RealTimeAttendance: React.FC<RealTimeAttendanceProps> = ({
  classId,
  workspaceId,
  students,
  className
}) => {
  const {
    currentSession,
    isInSession,
    sessionProgress,
    attendanceRecords,
    connectedUsers,
    lastUpdate,
    createSession,
    joinSession,
    leaveSession,
    markAttendance,
    bulkMarkAttendance,
    closeSession,
    refreshSessionStatus,
    isSocketConnected
  } = useAttendanceSocket();

  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [bulkStatus, setBulkStatus] = useState<'present' | 'absent' | 'late'>('present');
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [notes, setNotes] = useState<string>('');
  const [isCreatingSession, setIsCreatingSession] = useState(false);

  // Handle session creation
  const handleCreateSession = async () => {
    setIsCreatingSession(true);
    try {
      createSession({
        classId,
        workspaceId,
        date: selectedDate,
        totalStudents: students.length
      });
    } finally {
      setIsCreatingSession(false);
    }
  };

  // Handle individual attendance marking
  const handleMarkAttendance = (studentId: string, status: 'present' | 'absent' | 'late') => {
    markAttendance(studentId, status, notes);
    setNotes('');
  };

  // Handle bulk attendance marking
  const handleBulkMarkAttendance = () => {
    if (selectedStudents.size === 0) return;

    const records = Array.from(selectedStudents).map(studentId => ({
      studentId,
      status: bulkStatus,
      notes: notes || undefined
    }));

    bulkMarkAttendance(records);
    setSelectedStudents(new Set());
    setNotes('');
  };

  // Toggle student selection for bulk operations
  const toggleStudentSelection = (studentId: string) => {
    const newSelected = new Set(selectedStudents);
    if (newSelected.has(studentId)) {
      newSelected.delete(studentId);
    } else {
      newSelected.add(studentId);
    }
    setSelectedStudents(newSelected);
  };

  // Select all students for bulk operations
  const selectAllStudents = () => {
    const unmarkedStudents = students
      .filter(student => !attendanceRecords[student._id])
      .map(student => student._id);
    setSelectedStudents(new Set(unmarkedStudents));
  };

  // Get student attendance status
  const getStudentStatus = (studentId: string) => {
    const record = attendanceRecords[studentId];
    return record ? record.status : null;
  };

  // Get status color
  const getStatusColor = (status: 'present' | 'absent' | 'late' | null) => {
    switch (status) {
      case 'present': return 'bg-green-500';
      case 'absent': return 'bg-red-500';
      case 'late': return 'bg-yellow-500';
      default: return 'bg-gray-200';
    }
  };

  // Get status icon
  const getStatusIcon = (status: 'present' | 'absent' | 'late' | null) => {
    switch (status) {
      case 'present': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'absent': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'late': return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Alert className={isSocketConnected ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
        <div className="flex items-center gap-2">
          {isSocketConnected ? (
            <Wifi className="h-4 w-4 text-green-600" />
          ) : (
            <WifiOff className="h-4 w-4 text-red-600" />
          )}
          <AlertDescription>
            {isSocketConnected 
              ? 'Connected to real-time attendance system' 
              : 'Disconnected from real-time system'
            }
          </AlertDescription>
        </div>
      </Alert>

      {/* Session Control */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Real-Time Attendance - {className}
            <div className="flex items-center gap-2">
              {isInSession && (
                <>
                  <Badge variant="outline" className="text-green-600">
                    Session Active
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={refreshSessionStatus}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </CardTitle>
          <CardDescription>
            Mark attendance in real-time with instant updates across all connected devices
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isInSession ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </div>
                <div className="flex items-end">
                  <Button 
                    onClick={handleCreateSession}
                    disabled={isCreatingSession || !isSocketConnected}
                    className="w-full"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    {isCreatingSession ? 'Creating...' : 'Start Attendance Session'}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Session Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {sessionProgress?.markedStudents || 0}
                  </div>
                  <div className="text-sm text-gray-500">Marked</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {sessionProgress?.totalStudents || 0}
                  </div>
                  <div className="text-sm text-gray-500">Total</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {sessionProgress?.percentage || 0}%
                  </div>
                  <div className="text-sm text-gray-500">Complete</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {connectedUsers.length}
                  </div>
                  <div className="text-sm text-gray-500">Connected</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{sessionProgress?.percentage || 0}%</span>
                </div>
                <Progress value={sessionProgress?.percentage || 0} className="h-2" />
              </div>

              {/* Connected Users */}
              {connectedUsers.length > 0 && (
                <div className="space-y-2">
                  <Label>Connected Users</Label>
                  <div className="flex flex-wrap gap-2">
                    {connectedUsers.map((user) => (
                      <Badge key={user.email} variant="secondary">
                        <Users className="h-3 w-3 mr-1" />
                        {user.email}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Last Update */}
              {lastUpdate && (
                <div className="text-sm text-gray-500">
                  Last updated: {format(lastUpdate, 'HH:mm:ss')}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Attendance Marking */}
      {isInSession && (
        <>
          {/* Bulk Operations */}
          <Card>
            <CardHeader>
              <CardTitle>Bulk Operations</CardTitle>
              <CardDescription>
                Select multiple students to mark attendance in bulk
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={selectAllStudents}
                  disabled={students.every(s => attendanceRecords[s._id])}
                >
                  Select All Unmarked
                </Button>
                <Select value={bulkStatus} onValueChange={(value: 'present' | 'absent' | 'late') => setBulkStatus(value)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="present">Present</SelectItem>
                    <SelectItem value="absent">Absent</SelectItem>
                    <SelectItem value="late">Late</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleBulkMarkAttendance}
                  disabled={selectedStudents.size === 0}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Mark {selectedStudents.size} Students
                </Button>
              </div>

              <div>
                <Label htmlFor="bulk-notes">Notes (optional)</Label>
                <Textarea
                  id="bulk-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes for selected students..."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Student List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Students
                <Button
                  variant="outline"
                  onClick={closeSession}
                  className="text-red-600 hover:text-red-700"
                >
                  <Pause className="h-4 w-4 mr-2" />
                  End Session
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {students.map((student) => {
                  const status = getStudentStatus(student._id);
                  const isSelected = selectedStudents.has(student._id);
                  const isMarked = status !== null;

                  return (
                    <div
                      key={student._id}
                      className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                        isSelected ? 'bg-blue-50 border-blue-200' : 
                        isMarked ? 'bg-gray-50 border-gray-200' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {!isMarked && (
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleStudentSelection(student._id)}
                            className="rounded border-gray-300"
                          />
                        )}
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(status)}`} />
                        <div>
                          <div className="font-medium">
                            {student.firstName} {student.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            Roll: {student.rollNumber}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {status && (
                          <div className="flex items-center gap-1">
                            {getStatusIcon(status)}
                            <Badge variant="outline" className="capitalize">
                              {status}
                            </Badge>
                          </div>
                        )}
                        
                        {!isMarked && (
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleMarkAttendance(student._id, 'present')}
                              className="text-green-600 hover:text-green-700"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleMarkAttendance(student._id, 'late')}
                              className="text-yellow-600 hover:text-yellow-700"
                            >
                              <AlertCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleMarkAttendance(student._id, 'absent')}
                              className="text-red-600 hover:text-red-700"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default RealTimeAttendance;