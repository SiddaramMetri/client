import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Calendar, Users, FileText, Activity, Shield, Eye } from 'lucide-react';
import { useAuditTrailCalendar } from '@/hooks/api/use-audit-trail';
import { useAllClasses } from '@/hooks/api/use-classes';
import { Class } from '@/services/class.service';
import AuditTrailDetailModal from '@/components/attendance/audit-trail-detail-modal';
import { cn } from '@/lib/utils';

const AuditTrailCalendar: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const classId = searchParams.get('classId') || '';
  const year = searchParams.get('year') || new Date().getFullYear().toString();
  const month = searchParams.get('month') || (new Date().getMonth() + 1).toString().padStart(2, '0');

  const [selectedAudit, setSelectedAudit] = useState<{
    date: number;
    studentId: string;
    studentName: string;
    entries: any[];
  } | null>(null);

  const { data: classesData, isLoading: classesLoading, error: classesError, refetch: refetchClasses } = useAllClasses();
  const { data: auditData, isLoading: auditLoading, error: auditError } = useAuditTrailCalendar(classId, year, month);

  const classes = classesData?.data || [];
  const auditCalendar = auditData?.auditCalendar;

  // Log errors for debugging
  React.useEffect(() => {
    if (classesError) {
      console.error('Error loading classes:', classesError);
    }
  }, [classesError]);

  // Generate year and month options
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 3 }, (_, i) => currentYear - 1 + i);
  const months = [
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];

  const handleFilterChange = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set(key, value);
    setSearchParams(newParams);
  };


  const openAuditDetails = (date: number, studentId: string, studentName: string, entries: any[]) => {
    setSelectedAudit({ date, studentId, studentName, entries });
  };

  if (auditError) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">Error loading audit trail data</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-600" />
            Attendance Audit Trail
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Track all attendance changes and modifications with complete accountability
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">
                Class
              </label>
              <Select 
                value={classId} 
                onValueChange={(value) => {
                  if (value && !['loading', 'error', 'no-classes'].includes(value)) {
                    handleFilterChange('classId', value);
                  }
                }}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {classesLoading ? (
                    <SelectItem value="loading" disabled>Loading...</SelectItem>
                  ) : classesError ? (
                    <SelectItem value="error" disabled>Error loading classes</SelectItem>
                  ) : classes.length === 0 ? (
                    <SelectItem value="no-classes" disabled>No classes available</SelectItem>
                  ) : (
                    classes.map((cls: Class) => (
                      <SelectItem key={cls._id} value={cls._id}>
                        {cls.name}{cls.section ? ` - ${cls.section}` : ''}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">
                Year
              </label>
              <Select value={year} onValueChange={(value) => handleFilterChange('year', value)}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((y) => (
                    <SelectItem key={y} value={y.toString()}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">
                Month
              </label>
              <Select value={month} onValueChange={(value) => handleFilterChange('month', value)}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {auditLoading && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Audit Trail Content */}
      {auditCalendar && !auditLoading && (
        <>
          {/* Summary Info */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">Class:</span>
                  <span>{auditCalendar.classInfo?.name} {auditCalendar.classInfo?.section}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-green-600" />
                  <span className="font-medium">Period:</span>
                  <span>{auditCalendar.monthName} {auditCalendar.year}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-orange-600" />
                  <span className="font-medium">Active Days:</span>
                  <span>{auditCalendar.dailySummary.filter(day => day.hasActivity).length}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-purple-600" />
                  <span className="font-medium">Total Changes:</span>
                  <span>{auditCalendar.dailySummary.reduce((sum, day) => sum + day.totalChanges, 0)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Legend */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center gap-4 text-xs">
                <span className="font-medium text-gray-700">Change Indicators:</span>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 bg-yellow-100 border border-yellow-200 rounded-full flex items-center justify-center text-xs">📝</div>
                  <span>1-2 Changes</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 bg-orange-100 border border-orange-200 rounded-full flex items-center justify-center text-xs">⚠️</div>
                  <span>3-4 Changes</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 bg-red-100 border border-red-200 rounded-full flex items-center justify-center text-xs">🔥</div>
                  <span>5+ Changes</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 bg-gray-50 border border-gray-200 rounded-full"></div>
                  <span>No Changes</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Student List with Audit Trail */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <div 
                  className="min-w-fit" 
                  style={{ minWidth: `${400 + (auditCalendar.daysInMonth * 35)}px` }}
                >
                  {/* Header Row */}
                  <div className="sticky top-0 bg-gray-50 border-b-2 border-gray-200 z-10">
                    <div className="flex">
                      {/* Student Info Headers */}
                      <div className="flex flex-shrink-0 bg-gray-100">
                        <div className="w-12 min-w-[48px] px-2 py-3 text-center border-r border-gray-200 flex-shrink-0">
                          <span className="text-xs font-semibold">#</span>
                        </div>
                        <div className="w-16 min-w-[64px] px-2 py-3 text-center border-r border-gray-200 flex-shrink-0">
                          <span className="text-xs font-semibold">Roll</span>
                        </div>
                        <div className="w-48 min-w-[192px] px-3 py-3 text-left border-r border-gray-200 flex-shrink-0">
                          <span className="text-xs font-semibold">Student Name</span>
                        </div>
                        <div className="w-20 min-w-[80px] px-2 py-3 text-center border-r border-gray-200 flex-shrink-0">
                          <span className="text-xs font-semibold">Changes</span>
                        </div>
                      </div>

                      {/* Days Headers */}
                      <div className="flex bg-gray-50">
                        {Array.from({ length: auditCalendar.daysInMonth }, (_, i) => i + 1).map((day) => (
                          <div key={day} className="w-8 min-w-[32px] px-1 py-3 text-center border-r border-gray-200 flex-shrink-0">
                            <span className="text-xs font-medium">{day}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Student Rows */}
                  <div className="divide-y divide-gray-200">
                    {/* Group students by unique student IDs */}
                    {(() => {
                      const studentMap = new Map();
                      
                      // Collect all students from all days
                      auditCalendar.dailySummary.forEach(dayData => {
                        dayData.entries.forEach(entry => {
                          if (!studentMap.has(entry.student.id)) {
                            studentMap.set(entry.student.id, {
                              student: entry.student,
                              totalChanges: 0,
                              dailyData: new Map()
                            });
                          }
                          
                          const studentData = studentMap.get(entry.student.id);
                          studentData.totalChanges += entry.changeCount;
                          studentData.dailyData.set(dayData.day, dayData.entries.filter(e => e.student.id === entry.student.id));
                        });
                      });

                      const students = Array.from(studentMap.values()).sort((a, b) => 
                        a.student.rollNumber.localeCompare(b.student.rollNumber)
                      );

                      return students.map((studentData, index) => (
                        <div key={studentData.student.id} className={cn("flex", index % 2 === 0 ? 'bg-white' : 'bg-gray-50')}>
                          {/* Student Info */}
                          <div className="flex flex-shrink-0">
                            <div className="w-12 min-w-[48px] px-2 py-3 text-center border-r border-gray-200 flex items-center justify-center flex-shrink-0">
                              <span className="text-xs">{index + 1}</span>
                            </div>
                            <div className="w-16 min-w-[64px] px-2 py-3 text-center border-r border-gray-200 flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-mono">{studentData.student.rollNumber}</span>
                            </div>
                            <div className="w-48 min-w-[192px] px-3 py-3 border-r border-gray-200 flex flex-col justify-center flex-shrink-0">
                              <span className="text-xs font-medium text-gray-900 truncate">
                                {studentData.student.name}
                              </span>
                            </div>
                            <div className="w-20 min-w-[80px] px-2 py-3 text-center border-r border-gray-200 flex items-center justify-center flex-shrink-0">
                              {studentData.totalChanges > 0 ? (
                                <Badge 
                                  variant="secondary" 
                                  className={cn(
                                    "text-xs",
                                    studentData.totalChanges >= 5 ? "bg-red-100 text-red-700" :
                                    studentData.totalChanges >= 3 ? "bg-orange-100 text-orange-700" :
                                    "bg-yellow-100 text-yellow-700"
                                  )}
                                >
                                  {studentData.totalChanges}
                                </Badge>
                              ) : (
                                <span className="text-xs text-gray-400">-</span>
                              )}
                            </div>
                          </div>

                          {/* Daily Audit Indicators */}
                          <div className="flex">
                            {Array.from({ length: auditCalendar.daysInMonth }, (_, i) => i + 1).map((day) => {
                              const dayEntries = studentData.dailyData.get(day) || [];
                              const hasChanges = dayEntries.some((entry: any) => entry.changeCount > 0);
                              
                              return (
                                <div 
                                  key={day} 
                                  className="w-8 min-w-[32px] px-1 py-3 text-center border-r border-gray-200 flex items-center justify-center flex-shrink-0"
                                >
                                  {hasChanges ? (
                                    <button
                                      onClick={() => openAuditDetails(day, studentData.student.id, studentData.student.name, dayEntries)}
                                      className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 border border-blue-200 hover:bg-blue-200 transition-colors flex items-center justify-center text-xs cursor-pointer"
                                      title={`${dayEntries.reduce((sum: number, entry: any) => sum + entry.changeCount, 0)} changes on day ${day}`}
                                    >
                                      <Eye className="h-3 w-3" />
                                    </button>
                                  ) : (
                                    <div className="w-6 h-6 flex items-center justify-center">
                                      <span className="text-gray-300 text-xs">-</span>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* No Data State */}
      {!classId && !auditLoading && (
        <Card>
          <CardContent className="p-8 text-center">
            <Shield className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Class</h3>
            <p className="text-gray-500">Choose a class from the dropdown to view the audit trail.</p>
            {classesError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600 mb-2">
                  Error loading classes. Please check your connection and try again.
                </p>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => refetchClasses()}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  Retry
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Audit Trail Detail Modal */}
      {selectedAudit && (
        <AuditTrailDetailModal
          isOpen={!!selectedAudit}
          onClose={() => setSelectedAudit(null)}
          date={selectedAudit.date}
          entries={selectedAudit.entries}
          monthName={auditCalendar?.monthName || ''}
          year={year}
        />
      )}
    </div>
  );
};

export default AuditTrailCalendar;