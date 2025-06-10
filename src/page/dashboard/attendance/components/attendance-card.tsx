import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { CheckCircle, Calendar, X, Loader2, AlertCircle, Wifi, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
  lastSeen?: string; // Optional timestamp for "last seen" status
  isOnline?: boolean; // Optional online status indicator
}

interface AttendanceCardProps {
  student: Student;
  onStatusChange: (studentId: string, status: 'present' | 'absent' | 'leave') => void;
  isSaving?: boolean;
  isFocused?: boolean;
}

export default function AttendanceCard({ student, onStatusChange, isSaving = false, isFocused = false }: AttendanceCardProps) {
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'present': return 'bg-green-100 border-green-300 dark:bg-green-900/30 dark:border-green-700';
      case 'leave': return 'bg-amber-100 border-amber-300 dark:bg-amber-900/30 dark:border-amber-700';
      case 'absent': return 'bg-red-100 border-red-300 dark:bg-red-900/30 dark:border-red-700';
      default: return 'bg-gray-100 border-gray-300 dark:bg-gray-800 dark:border-gray-700';
    }
  };

  const getBadgeStyle = (status: string): { variant: "outline" | "secondary" | "destructive" | "default", className: string } => {
    switch (status) {
      case 'present': 
        return { 
          variant: "default",
          className: "bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700"
        };
      case 'leave': 
        return { 
          variant: "outline",
          className: "bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200 dark:bg-amber-900/50 dark:text-amber-300 dark:border-amber-700"
        };
      case 'absent': 
        return { 
          variant: "destructive",
          className: "bg-red-500 hover:bg-red-600 dark:bg-red-700 dark:hover:bg-red-800"
        };
      default: 
        return { 
          variant: "secondary",
          className: ""
        };
    }
  };

  const StatusIcon = ({ status }: { status: string }) => {
    switch (status) {
      case 'present': return <CheckCircle className="h-4 w-4 mr-1" />;
      case 'leave': return <Calendar className="h-4 w-4 mr-1" />;
      case 'absent': return <X className="h-4 w-4 mr-1" />;
      default: return <AlertCircle className="h-4 w-4 mr-1" />;
    }
  };

  const badgeStyle = getBadgeStyle(student.attendanceStatus);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      <Card className={cn(
        "h-full overflow-hidden transition-all duration-300 border-2",
        getStatusColor(student.attendanceStatus),
        isFocused && "ring-2 ring-primary ring-offset-2"
      )}>
        <CardContent className="p-4 flex flex-col h-full">
          <div className="flex justify-between items-start w-full mb-3">
            <span className="text-xs font-medium py-0.5 px-2 rounded-full bg-gray-100 dark:bg-gray-800">
              Roll: {student.rollNumber}
            </span>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1">
                    {student.isOnline ? (
                      <Wifi className="h-3 w-3 text-green-500" />
                    ) : (
                      <WifiOff className="h-3 w-3 text-gray-400" />
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  {student.isOnline 
                    ? "Online now" 
                    : `Last seen: ${student.lastSeen || 'Unknown'}`}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <div className="flex flex-col items-center mb-4">
            <Avatar className="h-16 w-16 mb-2">
              <AvatarImage src={student.profileImage || undefined} />
              <AvatarFallback className={student.gender === 'female' 
                ? 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200' 
                : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
              }>
                {student.firstName.charAt(0)}{student.lastName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <h3 className="font-medium text-center line-clamp-1">
              {student.firstName} {student.lastName}
            </h3>
            <p className="text-xs text-muted-foreground mb-1">{student.studentId}</p>
          </div>
          
          <div className="space-y-2 flex-grow flex flex-col justify-end">
            <Badge 
              variant={badgeStyle.variant}
              className={cn(
                "flex items-center justify-center w-full py-1.5",
                badgeStyle.className
              )}
            >
              <StatusIcon status={student.attendanceStatus} />
              {student.attendanceStatus.charAt(0).toUpperCase() + student.attendanceStatus.slice(1)}
            </Badge>
            
            <div className="grid grid-cols-3 gap-1 mt-auto">                <Button 
                  variant="outline" 
                  size="sm" 
                  className={cn(
                    "flex-1 h-8",
                    student.attendanceStatus === 'present' 
                      ? "bg-green-100 border-green-500 text-green-700 dark:bg-green-900/50 dark:text-green-300" 
                      : "bg-gray-100 hover:bg-green-100 dark:bg-gray-800 dark:hover:bg-green-900/30"
                  )}
                  onClick={() => onStatusChange(student.id, 'present')}
                  disabled={isSaving}
                  data-action="present"
              >
                {isSaving && student.attendanceStatus === 'present' ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  "P"
                )}
              </Button>                <Button 
                  variant="outline" 
                  size="sm" 
                  className={cn(
                    "flex-1 h-8",
                    student.attendanceStatus === 'leave' 
                      ? "bg-amber-100 border-amber-500 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300" 
                      : "bg-gray-100 hover:bg-amber-100 dark:bg-gray-800 dark:hover:bg-amber-900/30"
                  )}
                  onClick={() => onStatusChange(student.id, 'leave')}
                  disabled={isSaving}
                  data-action="leave"
              >
                {isSaving && student.attendanceStatus === 'leave' ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  "L"
                )}
              </Button>                <Button 
                  variant="outline" 
                  size="sm" 
                  className={cn(
                    "flex-1 h-8",
                    student.attendanceStatus === 'absent' 
                      ? "bg-red-100 border-red-500 text-red-700 dark:bg-red-900/50 dark:text-red-300" 
                      : "bg-gray-100 hover:bg-red-100 dark:bg-gray-800 dark:hover:bg-red-900/30"
                  )}
                  onClick={() => onStatusChange(student.id, 'absent')}
                  disabled={isSaving}
                  data-action="absent"
              >
                {isSaving && student.attendanceStatus === 'absent' ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  "A"
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
