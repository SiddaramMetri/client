import React, { useState, useEffect, useMemo } from 'react';
import { useMediaQuery } from "@/hooks/use-media-query";
import EnhancedAttendanceCard from "./enhanced-attendance-card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  CalendarClock, 
  CheckCircle2, 
  Loader2, 
  RefreshCw, 
  UserCheck, 
  UserX, 
  X, 
  Keyboard,
  Grid3X3,
  List,
  Filter,
  Search,
  ArrowUpDown,
  Wifi,
  WifiOff,
  Clock,
  Users
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useKeyboardNavigation, getGridColumns } from "../utils/keyboard-navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

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

interface EnhancedAttendanceViewProps {
  students: Student[];
  onStatusChange: (studentId: string, status: 'present' | 'absent' | 'leave') => void;
  isSaving?: boolean;
  viewType?: 'grid' | 'table';
  onViewTypeChange?: (viewType: 'grid' | 'table') => void;
}

type SortField = 'name' | 'rollNumber' | 'status' | 'lastSeen';
type SortDirection = 'asc' | 'desc';

export default function EnhancedAttendanceView({
  students,
  onStatusChange,
  isSaving = false,
  viewType: initialViewType = 'table',
  onViewTypeChange
}: EnhancedAttendanceViewProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isTablet = useMediaQuery("(max-width: 1024px)");
  
  // State management
  const [viewType, setViewType] = useState<'grid' | 'table'>(initialViewType);
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('rollNumber');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  
  // Auto-switch to grid view on mobile
  useEffect(() => {
    if (isMobile && viewType === 'table') {
      handleViewTypeChange('grid');
    }
  }, [isMobile]);

  // Handle view type changes
  const handleViewTypeChange = (type: 'grid' | 'table') => {
    setViewType(type);
    onViewTypeChange?.(type);
  };

  // Filter and sort students
  const filteredAndSortedStudents = useMemo(() => {
    let filtered = students;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(student => 
        student.firstName.toLowerCase().includes(query) ||
        student.lastName.toLowerCase().includes(query) ||
        student.rollNumber.toLowerCase().includes(query) ||
        student.studentId.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter(student => student.attendanceStatus === statusFilter);
    }

    // Apply online filter
    if (showOnlineOnly) {
      filtered = filtered.filter(student => student.isOnline);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'name':
          comparison = `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
          break;
        case 'rollNumber':
          comparison = a.rollNumber.localeCompare(b.rollNumber, undefined, { numeric: true });
          break;
        case 'status':
          comparison = a.attendanceStatus.localeCompare(b.attendanceStatus);
          break;
        case 'lastSeen':
          const aTime = a.lastSeen ? new Date(a.lastSeen).getTime() : 0;
          const bTime = b.lastSeen ? new Date(b.lastSeen).getTime() : 0;
          comparison = bTime - aTime; // Most recent first
          break;
      }
      
      return sortDirection === 'desc' ? -comparison : comparison;
    });

    return filtered;
  }, [students, searchQuery, statusFilter, showOnlineOnly, sortField, sortDirection]);

  // Get counts for filters
  const counts = useMemo(() => ({
    total: students.length,
    present: students.filter(s => s.attendanceStatus === 'present').length,
    absent: students.filter(s => s.attendanceStatus === 'absent').length,
    leave: students.filter(s => s.attendanceStatus === 'leave').length,
    online: students.filter(s => s.isOnline).length,
    filtered: filteredAndSortedStudents.length
  }), [students, filteredAndSortedStudents]);

  // Keyboard navigation
  const gridColumns = getGridColumns();
  const { focusedIndex, setFocusedIndex } = useKeyboardNavigation(
    filteredAndSortedStudents.length,
    viewType === 'grid' ? gridColumns : 1,
    (index) => {
      const student = filteredAndSortedStudents[index];
      if (student) {
        const nextStatus = cycleStatus(student.attendanceStatus);
        onStatusChange(student.id, nextStatus);
      }
    }
  );

  const cycleStatus = (current: 'present' | 'absent' | 'leave'): 'present' | 'absent' | 'leave' => {
    switch (current) {
      case 'present': return 'leave';
      case 'leave': return 'absent';
      case 'absent': return 'present';
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const config = {
      present: { icon: CheckCircle2, className: 'bg-emerald-500 text-white' },
      leave: { icon: CalendarClock, className: 'bg-amber-500 text-white' },
      absent: { icon: X, className: 'bg-red-500 text-white' }
    }[status] || { icon: X, className: 'bg-gray-500 text-white' };

    const Icon = config.icon;
    
    return (
      <Badge className={cn("flex items-center gap-1", config.className)}>
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      {/* Controls Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        {/* View Toggle and Search */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
            <Button
              variant={viewType === 'grid' ? 'default' : 'ghost'}
              size="sm"
              className="h-8 px-3"
              onClick={() => handleViewTypeChange('grid')}
            >
              <Grid3X3 className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Grid</span>
            </Button>
            <Button
              variant={viewType === 'table' ? 'default' : 'ghost'}
              size="sm"
              className="h-8 px-3"
              onClick={() => handleViewTypeChange('table')}
              disabled={isMobile}
            >
              <List className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">List</span>
            </Button>
          </div>
          
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-8"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className={cn(
                    "h-8",
                    showFilters && "bg-primary text-primary-foreground"
                  )}
                >
                  <Filter className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Toggle filters</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                  <Keyboard className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Keys</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="w-80 p-4">
                <div>
                  <h4 className="font-medium mb-3">Keyboard Shortcuts</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="font-mono bg-muted px-2 py-1 rounded text-xs">↑↓←→</div>
                    <div>Navigate</div>
                    <div className="font-mono bg-muted px-2 py-1 rounded text-xs">P</div>
                    <div>Mark Present</div>
                    <div className="font-mono bg-muted px-2 py-1 rounded text-xs">L</div>
                    <div>Mark Leave</div>
                    <div className="font-mono bg-muted px-2 py-1 rounded text-xs">A</div>
                    <div>Mark Absent</div>
                    <div className="font-mono bg-muted px-2 py-1 rounded text-xs">Space</div>
                    <div>Cycle Status</div>
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Status Filter */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Status</Label>
                    <Select value={statusFilter || 'all'} onValueChange={(value) => setStatusFilter(value === 'all' ? null : value)}>
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Students ({counts.total})</SelectItem>
                        <SelectItem value="present">Present ({counts.present})</SelectItem>
                        <SelectItem value="leave">On Leave ({counts.leave})</SelectItem>
                        <SelectItem value="absent">Absent ({counts.absent})</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sort Field */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Sort By</Label>
                    <Select value={sortField} onValueChange={(value) => setSortField(value as SortField)}>
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rollNumber">Roll Number</SelectItem>
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="status">Status</SelectItem>
                        <SelectItem value="lastSeen">Last Seen</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sort Direction */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Direction</Label>
                    <Select value={sortDirection} onValueChange={(value) => setSortDirection(value as SortDirection)}>
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asc">Ascending</SelectItem>
                        <SelectItem value="desc">Descending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Online Filter */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Online Status</Label>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={showOnlineOnly}
                        onCheckedChange={setShowOnlineOnly}
                        id="online-filter"
                      />
                      <Label htmlFor="online-filter" className="text-sm">
                        Online only ({counts.online})
                      </Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>
            Showing {counts.filtered} of {counts.total} students
          </span>
          {(searchQuery || statusFilter || showOnlineOnly) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter(null);
                setShowOnlineOnly(false);
              }}
              className="h-6 px-2 text-xs"
            >
              Clear filters
            </Button>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          <span className="font-medium">{counts.filtered}</span>
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {viewType === 'grid' ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4"
              layout
            >
              <AnimatePresence>
                {filteredAndSortedStudents.map((student, index) => (
                  <motion.div
                    key={student.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2, delay: index * 0.02 }}
                    data-index={index}
                    className={cn(
                      "focus:outline-none focus:ring-2 focus:ring-primary rounded-md",
                      focusedIndex === index ? "ring-2 ring-primary" : ""
                    )}
                    tabIndex={0}
                    onFocus={() => setFocusedIndex(index)}
                  >
                    <EnhancedAttendanceCard
                      student={student}
                      onStatusChange={onStatusChange}
                      isSaving={isSaving}
                      isFocused={focusedIndex === index}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="table"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-auto rounded-lg border"
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="w-20 cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('rollNumber')}
                  >
                    <div className="flex items-center gap-1">
                      Roll No.
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center gap-1">
                      Student
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead className="w-24 hidden md:table-cell">ID</TableHead>
                  <TableHead className="w-24 hidden sm:table-cell">Online</TableHead>
                  <TableHead 
                    className="w-32 text-center cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center justify-center gap-1">
                      Status
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead className="w-44">Attendance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {filteredAndSortedStudents.map((student, index) => (
                    <motion.tr
                      key={student.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2, delay: index * 0.01 }}
                      data-index={index}
                      className={cn(
                        "border-b transition-colors hover:bg-muted/50",
                        focusedIndex === index ? "bg-accent" : ""
                      )}
                      tabIndex={0}
                      onFocus={() => setFocusedIndex(index)}
                    >
                      <TableCell className="font-medium">{student.rollNumber}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={student.profileImage || undefined} />
                            <AvatarFallback className={cn(
                              student.gender === 'female' 
                                ? 'bg-pink-100 text-pink-800 dark:bg-pink-900/50 dark:text-pink-300' 
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'
                            )}>
                              {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{student.firstName} {student.lastName}</div>
                            <div className="text-xs text-muted-foreground md:hidden">{student.studentId}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                        {student.studentId}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <div className="flex items-center gap-2">
                          {student.isOnline ? (
                            <>
                              <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse"></div>
                              <span className="text-xs text-emerald-600 dark:text-emerald-400">Online</span>
                            </>
                          ) : (
                            <>
                              <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                              <span className="text-xs text-muted-foreground">Offline</span>
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <StatusBadge status={student.attendanceStatus} />
                      </TableCell>
                      <TableCell>
                        <RadioGroup 
                          className="flex items-center justify-between bg-muted/50 rounded-md p-1"
                          value={student.attendanceStatus}
                          onValueChange={(value) => onStatusChange(student.id, value as 'present' | 'absent' | 'leave')}
                        >
                          {(['present', 'leave', 'absent'] as const).map((status) => (
                            <div key={status} className="flex items-center space-x-1">
                              <RadioGroupItem 
                                value={status} 
                                id={`${status}-${student.id}`} 
                                disabled={isSaving}
                                data-action={status}
                                className="h-4 w-4"
                              />
                              <Label 
                                htmlFor={`${status}-${student.id}`} 
                                className="text-xs cursor-pointer select-none"
                              >
                                {status.charAt(0).toUpperCase()}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </TableBody>
            </Table>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {filteredAndSortedStudents.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No students found</h3>
          <p className="text-muted-foreground">
            {searchQuery || statusFilter || showOnlineOnly
              ? "Try adjusting your filters or search query"
              : "No students in this class"}
          </p>
        </motion.div>
      )}
    </div>
  );
}