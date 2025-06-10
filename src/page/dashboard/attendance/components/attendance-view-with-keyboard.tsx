import React, { useState, useEffect } from 'react';
import { useMediaQuery } from "@/hooks/use-media-query";
import AttendanceCard from "./attendance-card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarClock, CheckCircle, CheckCircle2, Loader2, RefreshCw, UserCheck, UserX, X, Keyboard } from "lucide-react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useKeyboardNavigation, getGridColumns } from "../utils/keyboard-navigation";
import KeyboardNotification, { KeyboardActionType } from "./keyboard-notification";

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

interface AttendanceViewProps {
  students: Student[];
  onStatusChange: (studentId: string, status: 'present' | 'absent' | 'leave') => void;
  isSaving?: boolean;
  viewType?: 'grid' | 'table';
  onViewTypeChange?: (viewType: 'grid' | 'table') => void;
}

export default function AttendanceView({
  students,
  onStatusChange,
  isSaving = false,
  viewType: initialViewType = 'table',
  onViewTypeChange
}: AttendanceViewProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [viewType, setViewType] = useState<'grid' | 'table'>(initialViewType);
  const [showStatusFilter, setShowStatusFilter] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState<boolean>(false);
  const [keyboardAction, setKeyboardAction] = useState<KeyboardActionType | undefined>(undefined);
  const [actionMessage, setActionMessage] = useState<string | undefined>(undefined);
  
  // Filter students based on status
  const filteredStudents = statusFilter
    ? students.filter(student => student.attendanceStatus === statusFilter)
    : students;
  
  // Get the number of columns in the grid for keyboard navigation
  const gridColumns = React.useMemo(() => {
    if (typeof window === 'undefined') return 3;
    
    const width = window.innerWidth;
    if (width < 640) return 1;      // Mobile: 1 column
    if (width < 768) return 2;      // Small tablet: 2 columns
    if (width < 1024) return 3;     // Tablet: 3 columns
    if (width < 1280) return 4;     // Small desktop: 4 columns
    return 5;                       // Desktop: 5 columns
  }, []);
  
  // Helper function to get next status in cycle
  const getNextStatus = (current: 'present' | 'absent' | 'leave'): 'present' | 'absent' | 'leave' => {
    switch (current) {
      case 'present': return 'leave';
      case 'leave': return 'absent';
      case 'absent': return 'present';
    }
  };
  
  // Initialize keyboard navigation
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  
  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if modal is open or user is typing in an input
      if (
        e.target instanceof HTMLInputElement || 
        e.target instanceof HTMLTextAreaElement ||
        document.querySelector('[role="dialog"]')
      ) {
        return;
      }

      // Skip if no students are loaded
      if (filteredStudents.length === 0) return;

      switch (e.key) {
        case 'ArrowRight': {
          e.preventDefault();
          setFocusedIndex((prevIndex) => {
            const nextIndex = prevIndex < filteredStudents.length - 1 
              ? prevIndex + 1 
              : (prevIndex === -1 ? 0 : prevIndex);
            
            const element = document.querySelector(`[data-index="${nextIndex}"]`) as HTMLElement;
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
              element.focus();
            }
            return nextIndex;
          });
          setKeyboardAction('navigate');
          break;
        }
        
        case 'ArrowLeft': {
          e.preventDefault();
          setFocusedIndex((prevIndex) => {
            const nextIndex = prevIndex > 0 
              ? prevIndex - 1 
              : (prevIndex === -1 ? 0 : prevIndex);
            
            const element = document.querySelector(`[data-index="${nextIndex}"]`) as HTMLElement;
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
              element.focus();
            }
            return nextIndex;
          });
          setKeyboardAction('navigate');
          break;
        }
        
        case 'ArrowDown': {
          e.preventDefault();
          setFocusedIndex((prevIndex) => {
            // If no item is focused yet, focus the first one
            if (prevIndex === -1) return 0;
            
            const columnsCount = viewType === 'grid' ? gridColumns : 1;
            const nextIndex = prevIndex + columnsCount < filteredStudents.length 
              ? prevIndex + columnsCount 
              : prevIndex;
            
            const element = document.querySelector(`[data-index="${nextIndex}"]`) as HTMLElement;
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
              element.focus();
            }
            return nextIndex;
          });
          setKeyboardAction('navigate');
          break;
        }
        
        case 'ArrowUp': {
          e.preventDefault();
          setFocusedIndex((prevIndex) => {
            // If no item is focused yet, focus the first one
            if (prevIndex === -1) return 0;
            
            const columnsCount = viewType === 'grid' ? gridColumns : 1;
            const nextIndex = prevIndex - columnsCount >= 0 
              ? prevIndex - columnsCount 
              : prevIndex;
            
            const element = document.querySelector(`[data-index="${nextIndex}"]`) as HTMLElement;
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
              element.focus();
            }
            return nextIndex;
          });
          setKeyboardAction('navigate');
          break;
        }
        
        case 'Home': {
          e.preventDefault();
          setFocusedIndex(0);
          const firstElement = document.querySelector('[data-index="0"]') as HTMLElement;
          if (firstElement) {
            firstElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            firstElement.focus();
          }
          setKeyboardAction('navigate');
          setActionMessage('First student');
          break;
        }
        
        case 'End': {
          e.preventDefault();
          const lastIndex = filteredStudents.length - 1;
          setFocusedIndex(lastIndex);
          const lastElement = document.querySelector(`[data-index="${lastIndex}"]`) as HTMLElement;
          if (lastElement) {
            lastElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            lastElement.focus();
          }
          setKeyboardAction('navigate');
          setActionMessage('Last student');
          break;
        }
          
        case 'Enter':
        case ' ': {
          if (focusedIndex >= 0) {
            e.preventDefault();
            // Cycle through attendance status
            const student = filteredStudents[focusedIndex];
            const newStatus = getNextStatus(student.attendanceStatus);
            onStatusChange(student.id, newStatus);
            setKeyboardAction('cycle');
          }
          break;
        }
          
        // Quick status change keys
        case 'p':
        case 'P': {
          if (focusedIndex >= 0) {
            const student = filteredStudents[focusedIndex];
            onStatusChange(student.id, 'present');
            
            // Visual feedback by finding and triggering the action button
            const button = document.querySelector(`[data-index="${focusedIndex}"] [data-action="present"]`) as HTMLElement;
            if (button) {
              button.classList.add('animate-pulse');
              setTimeout(() => button.classList.remove('animate-pulse'), 300);
            }
            
            setKeyboardAction('present');
            setActionMessage(`${student.firstName} ${student.lastName} marked present`);
          }
          break;
        }
          
        case 'l':
        case 'L': {
          if (focusedIndex >= 0) {
            const student = filteredStudents[focusedIndex];
            onStatusChange(student.id, 'leave');
            
            // Visual feedback
            const button = document.querySelector(`[data-index="${focusedIndex}"] [data-action="leave"]`) as HTMLElement;
            if (button) {
              button.classList.add('animate-pulse');
              setTimeout(() => button.classList.remove('animate-pulse'), 300);
            }
            
            setKeyboardAction('leave');
            setActionMessage(`${student.firstName} ${student.lastName} marked on leave`);
          }
          break;
        }
          
        case 'a':
        case 'A': {
          if (focusedIndex >= 0) {
            const student = filteredStudents[focusedIndex];
            onStatusChange(student.id, 'absent');
            
            // Visual feedback
            const button = document.querySelector(`[data-index="${focusedIndex}"] [data-action="absent"]`) as HTMLElement;
            if (button) {
              button.classList.add('animate-pulse');
              setTimeout(() => button.classList.remove('animate-pulse'), 300);
            }
            
            setKeyboardAction('absent');
            setActionMessage(`${student.firstName} ${student.lastName} marked absent`);
          }
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [filteredStudents, focusedIndex, gridColumns, onStatusChange, viewType]);
  
  // Update the parent component if provided
  const handleViewTypeChange = (type: 'grid' | 'table') => {
    setViewType(type);
    setFocusedIndex(-1); // Reset focus when changing view
    if (onViewTypeChange) {
      onViewTypeChange(type);
    }
  };
  
  // Auto-switch to grid view on mobile devices
  useEffect(() => {
    if (isMobile) {
      handleViewTypeChange('grid');
    } else if (initialViewType && initialViewType !== viewType) {
      handleViewTypeChange(initialViewType);
    }
  }, [isMobile, initialViewType, viewType, handleViewTypeChange]);

  // Get status counts for filters
  const presentCount = students.filter(s => s.attendanceStatus === 'present').length;
  const absentCount = students.filter(s => s.attendanceStatus === 'absent').length;
  const leaveCount = students.filter(s => s.attendanceStatus === 'leave').length;

  const cardContainerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  return (
    <div className="space-y-4" onFocus={() => focusedIndex === -1 && filteredStudents.length > 0 && setFocusedIndex(0)}>
      <KeyboardNotification action={keyboardAction} message={actionMessage} />
      
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="flex items-center space-x-2">
          <Label htmlFor="view-toggle" className="text-sm font-medium">View:</Label>
          <div className="flex items-center space-x-1 bg-muted p-1 rounded-md">
            <Button
              variant={viewType === 'table' ? 'default' : 'ghost'}
              size="sm"
              className="text-xs h-8"
              onClick={() => handleViewTypeChange('table')}
              disabled={isMobile} // Disable table view on mobile
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7m0-18H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h7m0-18v18"/></svg>
              List
            </Button>
            <Button
              variant={viewType === 'grid' ? 'default' : 'ghost'}
              size="sm"
              className="text-xs h-8"
              onClick={() => handleViewTypeChange('grid')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
              Grid
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-8"
                  onClick={() => setShowKeyboardHelp(!showKeyboardHelp)}
                >
                  <Keyboard className="h-3 w-3 mr-1" />
                  Keys
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="w-80 p-0">
                <div className="bg-popover p-4 rounded-md shadow-md">
                  <h4 className="font-medium mb-2">Keyboard Navigation</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Arrow keys</div>
                    <div>Navigate between students</div>
                    <div>Home / End</div>
                    <div>Jump to first / last student</div>
                    <div>Enter / Space</div>
                    <div>Cycle status of selected student</div>
                    <div>P key</div>
                    <div>Mark selected as Present</div>
                    <div>L key</div>
                    <div>Mark selected as on Leave</div>
                    <div>A key</div>
                    <div>Mark selected as Absent</div>
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <Button
            variant="outline"
            size="sm"
            className="text-xs h-8"
            onClick={() => setShowStatusFilter(!showStatusFilter)}
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Filter
          </Button>
          <div className="text-xs text-muted-foreground">
            {students.length} student{students.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Status filter bar */}
      {showStatusFilter && (
        <div className="flex gap-2 overflow-x-auto py-2">
          <Button 
            variant="outline" 
            size="sm" 
            className={cn(
              "text-xs h-8",
              !statusFilter ? "bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-800" : ""
            )}
            onClick={() => setStatusFilter(null)}
          >
            All ({students.length})
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className={cn(
              "text-xs h-8",
              statusFilter === 'present' ? "bg-green-50 border-green-200 dark:bg-green-900/30 dark:border-green-800" : ""
            )}
            onClick={() => setStatusFilter(statusFilter === 'present' ? null : 'present')}
          >
            <UserCheck className="h-3 w-3 mr-1 text-green-500" />
            Present ({presentCount})
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className={cn(
              "text-xs h-8",
              statusFilter === 'leave' ? "bg-amber-50 border-amber-200 dark:bg-amber-900/30 dark:border-amber-800" : ""
            )}
            onClick={() => setStatusFilter(statusFilter === 'leave' ? null : 'leave')}
          >
            <CalendarClock className="h-3 w-3 mr-1 text-amber-500" />
            Leave ({leaveCount})
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className={cn(
              "text-xs h-8",
              statusFilter === 'absent' ? "bg-red-50 border-red-200 dark:bg-red-900/30 dark:border-red-800" : ""
            )}
            onClick={() => setStatusFilter(statusFilter === 'absent' ? null : 'absent')}
          >
            <UserX className="h-3 w-3 mr-1 text-red-500" />
            Absent ({absentCount})
          </Button>
        </div>
      )}

      {viewType === 'grid' ? (
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4"
          variants={cardContainerVariants}
          initial="hidden"
          animate="show"
        >
          {filteredStudents.map((student, index) => (
            <div 
              key={student.id}
              data-index={index}
              data-testid={`student-card-${index}`}
              tabIndex={0}
              className={cn(
                "focus:outline-none",
                focusedIndex === index ? "ring-2 ring-offset-2 ring-primary rounded-md" : ""
              )}
              onFocus={() => setFocusedIndex(index)}
            >
              <AttendanceCard
                student={student}
                onStatusChange={onStatusChange}
                isSaving={isSaving}
                isFocused={focusedIndex === index}
              />
            </div>
          ))}
        </motion.div>
      ) : (
        <div className="overflow-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-14">Roll No.</TableHead>
                <TableHead>Student</TableHead>
                <TableHead className="w-24 hidden md:table-cell">ID</TableHead>
                <TableHead className="w-32 text-center">Status</TableHead>
                <TableHead className="w-44">Attendance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student, index) => (
                <TableRow 
                  key={student.id}
                  data-index={index}
                  data-testid={`student-card-${index}`}
                  tabIndex={0}
                  className={cn(
                    focusedIndex === index ? "bg-accent" : ""
                  )}
                  onFocus={() => setFocusedIndex(index)}
                >
                  <TableCell className="font-medium">{student.rollNumber}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarImage src={student.profileImage || undefined} />
                        <AvatarFallback className={student.gender === 'female' ? 'bg-pink-100 text-pink-800' : 'bg-blue-100 text-blue-800'}>
                          {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{student.firstName} {student.lastName}</div>
                        <div className="text-xs text-muted-foreground md:hidden">{student.studentId}</div>
                      </div>
                      {student.isOnline && (
                        <div className="h-2 w-2 rounded-full bg-green-500 ml-1"></div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                    {student.studentId}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge 
                      variant={student.attendanceStatus === 'present' ? 'default' : 
                              student.attendanceStatus === 'leave' ? 'outline' : 
                              'destructive'}
                      className={student.attendanceStatus === 'present' ? 'bg-green-500' :
                                student.attendanceStatus === 'leave' ? 'bg-amber-100 text-amber-800 border-amber-300' : ''
                      }
                    >
                      {student.attendanceStatus === 'present' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                      {student.attendanceStatus === 'leave' && <CalendarClock className="h-3 w-3 mr-1" />}
                      {student.attendanceStatus === 'absent' && <X className="h-3 w-3 mr-1" />}
                      {student.attendanceStatus.charAt(0).toUpperCase() + student.attendanceStatus.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <RadioGroup 
                      className="flex items-center justify-between bg-slate-50 dark:bg-slate-900 rounded-md p-1.5"
                      value={student.attendanceStatus}
                      onValueChange={(value) => onStatusChange(student.id, value as 'present' | 'absent' | 'leave')}
                    >
                      <div className="flex items-center space-x-1.5">
                        <RadioGroupItem 
                          value="present" 
                          id={`present-${student.id}`} 
                          disabled={isSaving}
                          data-action="present"
                          className="border-green-500 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500 h-4 w-4 shadow-sm focus:ring-offset-2 focus:ring-green-500 hover:border-green-600"
                        />
                        <Label htmlFor={`present-${student.id}`} className="text-sm font-medium cursor-pointer text-green-700 dark:text-green-500">P</Label>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <RadioGroupItem 
                          value="leave" 
                          id={`leave-${student.id}`} 
                          disabled={isSaving}
                          data-action="leave"
                          className="border-amber-500 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500 h-4 w-4 shadow-sm focus:ring-offset-2 focus:ring-amber-500 hover:border-amber-600"
                        />
                        <Label htmlFor={`leave-${student.id}`} className="text-sm font-medium cursor-pointer text-amber-700 dark:text-amber-500">L</Label>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <RadioGroupItem 
                          value="absent" 
                          id={`absent-${student.id}`} 
                          disabled={isSaving}
                          data-action="absent"
                          className="border-red-500 data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500 h-4 w-4 shadow-sm focus:ring-offset-2 focus:ring-red-500 hover:border-red-600"
                        />
                        <Label htmlFor={`absent-${student.id}`} className="text-sm font-medium cursor-pointer text-red-700 dark:text-red-500">A</Label>
                      </div>
                    </RadioGroup>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      
      {/* Keyboard shortcuts info */}
      {showKeyboardHelp && (
        <motion.div 
          className="rounded-md border bg-muted p-4 mt-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium">Keyboard Shortcuts</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0" 
              onClick={() => setShowKeyboardHelp(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <kbd className="px-1 py-0.5 bg-background border rounded text-xs">↑</kbd>
              <kbd className="px-1 py-0.5 bg-background border rounded text-xs">↓</kbd>
              <kbd className="px-1 py-0.5 bg-background border rounded text-xs">←</kbd>
              <kbd className="px-1 py-0.5 bg-background border rounded text-xs">→</kbd>
              <span className="text-xs">Navigate</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-1 py-0.5 bg-background border rounded text-xs">Space</kbd>
              <span className="text-xs">Cycle status</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-1 py-0.5 bg-background border rounded text-xs">Home</kbd>
              <kbd className="px-1 py-0.5 bg-background border rounded text-xs">End</kbd>
              <span className="text-xs">First/Last</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-1 py-0.5 bg-background border rounded text-xs">P</kbd>
              <span className="text-xs">Mark Present</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-1 py-0.5 bg-background border rounded text-xs">L</kbd>
              <span className="text-xs">Mark Leave</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-1 py-0.5 bg-background border rounded text-xs">A</kbd>
              <span className="text-xs">Mark Absent</span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
