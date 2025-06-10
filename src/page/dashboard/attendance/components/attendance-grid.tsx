import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
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

interface AttendanceGridProps {
  students: Student[];
  onToggleAttendance: (studentId: string) => void;
}

export default function AttendanceGrid({ students, onToggleAttendance }: AttendanceGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
      {students.map((student) => (
        <Card key={student.id} className={`${student.isPresent ? 'border-green-200' : 'border-red-200'} overflow-hidden transition-all duration-300 hover:shadow-md`}>
          <CardContent className="p-4 flex flex-col items-center">
            <div className="flex justify-between items-start w-full mb-2">
              <span className="text-xs font-medium text-muted-foreground">Roll: {student.rollNumber}</span>
              <span className="text-xs font-medium text-muted-foreground">{student.studentId}</span>
            </div>
            
            <Avatar className="h-16 w-16 mb-2">
              <AvatarImage src={student.profileImage || undefined} />
              <AvatarFallback className={student.gender === 'female' ? 'bg-pink-100 text-pink-800' : 'bg-blue-100 text-blue-800'}>
                {student.firstName.charAt(0)}{student.lastName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            
            <h3 className="font-medium text-center">
              {student.firstName} {student.lastName}
            </h3>
            
            <div className="flex items-center mt-4 justify-between w-full">
              <Badge variant={student.isPresent ? "success" : "destructive"} className={`${student.isPresent ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-red-100 text-red-800 hover:bg-red-200'}`}>
                {student.isPresent ? "Present" : "Absent"}
              </Badge>
              
              <div className="flex items-center">
                <span className="mr-2 text-sm text-muted-foreground">
                  {student.isPresent ? "Present" : "Absent"}
                </span>
                <Checkbox
                  checked={student.isPresent}
                  onCheckedChange={() => onToggleAttendance(student.id)}
                  aria-label={`Mark ${student.firstName} ${student.lastName} as ${student.isPresent ? 'absent' : 'present'}`}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
