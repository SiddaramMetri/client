import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Loader2,
  Wifi,
  WifiOff,
  X
} from "lucide-react";
import { useState } from 'react';

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

interface EnhancedAttendanceCardProps {
  student: Student;
  onStatusChange: (studentId: string, status: 'present' | 'absent' | 'leave') => void;
  isSaving?: boolean;
  isFocused?: boolean;
  isExpanded?: boolean;
  onExpandToggle?: () => void;
}

const statusConfig = {
  present: {
    color: 'emerald',
    icon: CheckCircle2,
    label: 'Present',
    bgClass: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/50 dark:border-emerald-800',
    badgeClass: 'bg-emerald-500 hover:bg-emerald-600 text-white',
    buttonClass: 'bg-emerald-100 border-emerald-300 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 dark:border-emerald-700',
    glowClass: 'shadow-emerald-200/50 dark:shadow-emerald-900/50'
  },
  leave: {
    color: 'amber',
    icon: Calendar,
    label: 'On Leave',
    bgClass: 'bg-amber-50 border-amber-200 dark:bg-amber-950/50 dark:border-amber-800',
    badgeClass: 'bg-amber-500 hover:bg-amber-600 text-white',
    buttonClass: 'bg-amber-100 border-amber-300 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300 dark:border-amber-700',
    glowClass: 'shadow-amber-200/50 dark:shadow-amber-900/50'
  },
  absent: {
    color: 'red',
    icon: X,
    label: 'Absent',
    bgClass: 'bg-red-50 border-red-200 dark:bg-red-950/50 dark:border-red-800',
    badgeClass: 'bg-red-500 hover:bg-red-600 text-white',
    buttonClass: 'bg-red-100 border-red-300 text-red-700 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700',
    glowClass: 'shadow-red-200/50 dark:shadow-red-900/50'
  }
};

export default function EnhancedAttendanceCard({ 
  student, 
  onStatusChange, 
  isSaving = false, 
  isFocused = false,
  isExpanded = false,
  onExpandToggle
}: EnhancedAttendanceCardProps) {
  const [isChanging, setIsChanging] = useState(false);
  const [lastStatus, setLastStatus] = useState(student.attendanceStatus);
  
  const currentConfig = statusConfig[student.attendanceStatus];
  const StatusIcon = currentConfig.icon;

  const handleStatusChange = async (newStatus: 'present' | 'absent' | 'leave') => {
    if (newStatus === student.attendanceStatus || isSaving) return;
    
    setIsChanging(true);
    setLastStatus(student.attendanceStatus);
    
    // Add a small delay for better UX feedback
    setTimeout(() => {
      onStatusChange(student.id, newStatus);
      setIsChanging(false);
    }, 150);
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const formatLastSeen = (lastSeen?: string) => {
    if (!lastSeen) return 'Unknown';
    try {
      const date = new Date(lastSeen);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMins / 60);
      
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      return date.toLocaleDateString();
    } catch {
      return lastSeen;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className="h-full"
    >
      <Card className={cn(
        "h-full overflow-hidden transition-all duration-300 border-2 hover:shadow-lg",
        currentConfig.bgClass,
        currentConfig.glowClass,
        isFocused && "ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-slate-900",
        isChanging && "scale-[0.98]"
      )}>
        <CardContent className="p-4 flex flex-col h-full">
          {/* Header with roll number and online status */}
          <div className="flex justify-between items-center mb-3">
            <motion.span 
              className="text-xs font-semibold py-1 px-2 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-white/20 dark:border-slate-700/20"
              whileHover={{ scale: 1.05 }}
            >
              #{student.rollNumber}
            </motion.span>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div 
                    className="flex items-center gap-1"
                    animate={{ 
                      scale: student.isOnline ? [1, 1.2, 1] : 1 
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: student.isOnline ? Infinity : 0,
                      repeatType: "reverse"
                    }}
                  >
                    {student.isOnline ? (
                      <div className="relative">
                        <Wifi className="h-4 w-4 text-emerald-500" />
                        <div className="absolute -top-1 -right-1 h-2 w-2 bg-emerald-400 rounded-full animate-pulse"></div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <WifiOff className="h-3 w-3 text-slate-400" />
                        <Clock className="h-3 w-3 text-slate-400" />
                      </div>
                    )}
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <div className="text-center">
                    <p className="font-medium">
                      {student.isOnline ? '🟢 Online Now' : '🔴 Offline'}
                    </p>
                    {!student.isOnline && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Last seen: {formatLastSeen(student.lastSeen)}
                      </p>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          {/* Student Avatar and Info */}
          <div className="flex flex-col items-center mb-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="relative"
            >
              <Avatar className="h-16 w-16 mb-2 ring-2 ring-white/50 dark:ring-slate-800/50">
                <AvatarImage src={student.profileImage || undefined} />
                <AvatarFallback className={cn(
                  "text-sm font-semibold",
                  student.gender === 'female' 
                    ? 'bg-pink-100 text-pink-700 dark:bg-pink-900/50 dark:text-pink-300' 
                    : student.gender === 'male'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                    : 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300'
                )}>
                  {getInitials(student.firstName, student.lastName)}
                </AvatarFallback>
              </Avatar>
              
              {/* Online indicator */}
              {student.isOnline && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute bottom-2 -right-1 h-4 w-4 bg-emerald-400 border-2 border-white dark:border-slate-800 rounded-full"
                />
              )}
            </motion.div>
            
            <div className="text-center">
              <h3 className="font-semibold text-sm leading-tight line-clamp-2 mb-1">
                {student.firstName} {student.lastName}
              </h3>
              <p className="text-xs text-muted-foreground">{student.studentId}</p>
            </div>
          </div>
          
          {/* Status Badge */}
          <motion.div 
            className="mb-3"
            animate={{ 
              scale: isChanging ? [1, 1.05, 1] : 1,
            }}
            transition={{ duration: 0.3 }}
          >
            <Badge 
              className={cn(
                "flex items-center justify-center w-full py-2 text-sm font-medium shadow-sm",
                currentConfig.badgeClass
              )}
            >
              <StatusIcon className="h-4 w-4 mr-2" />
              {currentConfig.label}
            </Badge>
          </motion.div>
          
          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-2 mt-auto">
            {(['present', 'leave', 'absent'] as const).map((status) => {
              const config = statusConfig[status];
              const isActive = student.attendanceStatus === status;
              const isLoading = isSaving && isActive;
              
              return (
                <motion.div
                  key={status}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className={cn(
                      "h-10 text-xs font-medium transition-all duration-200 touch-manipulation",
                      isActive 
                        ? config.buttonClass + " shadow-md font-semibold"
                        : "bg-white/50 hover:bg-white/80 dark:bg-slate-800/50 dark:hover:bg-slate-700/80 hover:shadow-md"
                    )}
                    onClick={() => handleStatusChange(status)}
                    disabled={isSaving || isChanging}
                    data-action={status}
                    aria-label={`Mark ${student.firstName} as ${config.label}`}
                  >
                    <AnimatePresence mode="wait">
                      {isLoading ? (
                        <motion.div
                          key="loading"
                          initial={{ opacity: 0, rotate: 0 }}
                          animate={{ opacity: 1, rotate: 360 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }}
                        >
                          <Loader2 className="h-4 w-4" />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="icon"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="flex items-center gap-1"
                        >
                          <config.icon className="h-3 w-3" />
                          <span className="hidden sm:inline">
                            {status === 'present' ? 'P' : status === 'leave' ? 'L' : 'A'}
                          </span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Button>
                </motion.div>
              );
            })}
          </div>
          
          {/* Expandable details (for future use) */}
          {onExpandToggle && (
            <motion.button
              onClick={onExpandToggle}
              className="mt-3 flex items-center justify-center text-xs text-muted-foreground hover:text-foreground transition-colors"
              whileHover={{ scale: 1.05 }}
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="h-3 w-3 mr-1" />
                  Less
                </>
              ) : (
                <>
                  <ChevronDown className="h-3 w-3 mr-1" />
                  More
                </>
              )}
            </motion.button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}