import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
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

interface AttendanceGridProps {
  students: Student[];
  onToggleAttendance: (studentId: string, newStatus: 'present' | 'absent' | 'leave') => void;
}

export default function AttendanceGrid({ students, onToggleAttendance }: AttendanceGridProps) {
  const getBorderColor = (status: string) => {
    switch(status) {
      case 'present': return 'border-green-200';
      case 'leave': return 'border-yellow-200';
      default: return 'border-red-200';
    }
  };
  
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
      {students.map((student) => (
        <Card 
          key={student.id} 
          className={`${getBorderColor(student.attendanceStatus)} overflow-hidden transition-all duration-300 hover:shadow-md`}
        >
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
            
            <div className="mt-4 w-full">
              <Badge 
                variant={getBadgeVariant(student.attendanceStatus)}
                className={getBadgeClass(student.attendanceStatus)}
              >
                {getStatusLabel(student.attendanceStatus)}
              </Badge>
              
              <div className="mt-3">
                <RadioGroup 
                  className="flex justify-between p-1 bg-slate-50 rounded-md"
                  value={student.attendanceStatus}
                  onValueChange={(value) => onToggleAttendance(student.id, value as 'present' | 'absent' | 'leave')}
                >
                  <div className="flex items-center space-x-1">
                    <RadioGroupItem value="present" id={`present-${student.id}`} />
                    <Label htmlFor={`present-${student.id}`} className="text-xs cursor-pointer">Present</Label>
                  </div>
                  <div className="flex items-center space-x-1">
                    <RadioGroupItem value="leave" id={`leave-${student.id}`} />
                    <Label htmlFor={`leave-${student.id}`} className="text-xs cursor-pointer">Leave</Label>
                  </div>
                  <div className="flex items-center space-x-1">
                    <RadioGroupItem value="absent" id={`absent-${student.id}`} />
                    <Label htmlFor={`absent-${student.id}`} className="text-xs cursor-pointer">Absent</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
