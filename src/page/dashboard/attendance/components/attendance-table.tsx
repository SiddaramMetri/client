import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface Student {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  rollNumber: string;
  className: string;
  isPresent: boolean;
  profileImage: string | null;
  gender: 'male' | 'female' | 'other';
}

interface AttendanceTableProps {
  students: Student[];
  onToggleAttendance: (studentId: string) => void;
}

export default function AttendanceTable({ students, onToggleAttendance }: AttendanceTableProps) {
  return (
    <div className="w-full">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-14">Roll No.</TableHead>
            <TableHead>Student</TableHead>
            <TableHead className="w-24">ID</TableHead>
            <TableHead className="w-24 text-center">Present</TableHead>
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
              <TableCell className="text-center">
                <div className="flex justify-center">
                  <Checkbox
                    checked={student.isPresent}
                    onCheckedChange={() => onToggleAttendance(student.id)}
                    aria-label={`Mark ${student.firstName} ${student.lastName} as ${student.isPresent ? 'absent' : 'present'}`}
                  />
                </div>
              </TableCell>
              <TableCell className="text-center">
                <Badge variant={student.isPresent ? "success" : "destructive"} className={`${student.isPresent ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-red-100 text-red-800 hover:bg-red-200'}`}>
                  {student.isPresent ? "Present" : "Absent"}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
