import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

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
}

interface AttendanceTableProps {
  students: Student[];
  onToggleAttendance: (studentId: string, newStatus: 'present' | 'absent' | 'leave') => void;
}

export default function AttendanceTable({ students, onToggleAttendance }: AttendanceTableProps) {
  const getBadgeVariant = (status: string) => {
    switch(status) {
      case 'present': return 'success';
      case 'leave': return 'warning';
      default: return 'destructive';
    }
  };
  
  const getBadgeClass = (status: string) => {
    switch(status) {
      case 'present': return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'leave': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      default: return 'bg-red-100 text-red-800 hover:bg-red-200';
    }
  };
  
  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'present': return 'Present';
      case 'leave': return 'Leave';
      default: return 'Absent';
    }
  };

  return (
    <div className="w-full">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-14">Roll No.</TableHead>
            <TableHead>Student</TableHead>
            <TableHead className="w-24">ID</TableHead>
            <TableHead className="w-32 text-center">Attendance</TableHead>
            <TableHead className="w-24 text-center">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map((student) => (
            <TableRow key={student.id}>
              <TableCell className="font-medium">{student.rollNumber}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={student.profileImage || undefined} />
                    <AvatarFallback className={student.gender === 'female' ? 'bg-pink-100 text-pink-800' : 'bg-blue-100 text-blue-800'}>
                      {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{student.firstName} {student.lastName}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {student.studentId}
              </TableCell>
              <TableCell>
                <RadioGroup 
                  className="flex justify-between items-center bg-slate-50 rounded-md p-1"
                  value={student.attendanceStatus}
                  onValueChange={(value) => onToggleAttendance(student.id, value as 'present' | 'absent' | 'leave')}
                >
                  <div className="flex items-center space-x-0.5">
                    <RadioGroupItem value="present" id={`table-present-${student.id}`} />
                    <Label htmlFor={`table-present-${student.id}`} className="text-xs cursor-pointer">P</Label>
                  </div>
                  <div className="flex items-center space-x-0.5">
                    <RadioGroupItem value="leave" id={`table-leave-${student.id}`} />
                    <Label htmlFor={`table-leave-${student.id}`} className="text-xs cursor-pointer">L</Label>
                  </div>
                  <div className="flex items-center space-x-0.5">
                    <RadioGroupItem value="absent" id={`table-absent-${student.id}`} />
                    <Label htmlFor={`table-absent-${student.id}`} className="text-xs cursor-pointer">A</Label>
                  </div>
                </RadioGroup>
              </TableCell>
              <TableCell className="text-center">
                <Badge 
                  variant={getBadgeVariant(student.attendanceStatus)}
                  className={getBadgeClass(student.attendanceStatus)}
                >
                  {getStatusLabel(student.attendanceStatus)}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
