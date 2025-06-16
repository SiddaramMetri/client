import React from 'react';
import { Badge } from '@/components/ui/badge';
import { MonthlyAttendanceSummary } from '@/hooks/api/use-attendance';
import { cn } from '@/lib/utils';

interface AttendanceCalendarGridProps {
  data: MonthlyAttendanceSummary;
}

const AttendanceCalendarGrid: React.FC<AttendanceCalendarGridProps> = ({ data }) => {
  // Get status color and background
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'P':
        return {
          text: 'text-green-700',
          bg: 'bg-green-100',
          border: 'border-green-200'
        };
      case 'A':
        return {
          text: 'text-red-700',
          bg: 'bg-red-100',
          border: 'border-red-200'
        };
      case 'L':
        return {
          text: 'text-orange-700',
          bg: 'bg-orange-100',  
          border: 'border-orange-200'
        };
      case 'H':
        return {
          text: 'text-yellow-700',
          bg: 'bg-yellow-100',
          border: 'border-yellow-200'
        };
      case 'WO':
        return {
          text: 'text-blue-700',
          bg: 'bg-blue-100',
          border: 'border-blue-200'
        };
      default:
        return {
          text: 'text-gray-500',
          bg: 'bg-gray-50',
          border: 'border-gray-200'
        };
    }
  };

  // Get status tooltip
  const getStatusTooltip = (status: string) => {
    switch (status) {
      case 'P': return 'Present';
      case 'A': return 'Absent';
      case 'L': return 'Late';
      case 'H': return 'Half Day';
      case 'WO': return 'Week Off/Holiday';
      default: return 'No Data';
    }
  };

  return (
    <div className="w-full">
      {/* Legend */}
      <div className="px-6 py-4 border-b bg-gray-50">
        <div className="flex flex-wrap gap-4 items-center">
          <span className="text-sm font-medium">Legend:</span>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-green-100 border border-green-200 rounded-sm"></div>
            <span className="text-xs text-gray-600">Present (P)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-red-100 border border-red-200 rounded-sm"></div>
            <span className="text-xs text-gray-600">Absent (A)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-orange-100 border border-orange-200 rounded-sm"></div>
            <span className="text-xs text-gray-600">Late (L)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-yellow-100 border border-yellow-200 rounded-sm"></div>
            <span className="text-xs text-gray-600">Half Day (H)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-blue-100 border border-blue-200 rounded-sm"></div>
            <span className="text-xs text-gray-600">Holiday (WO)</span>
          </div>
        </div>
      </div>

      {/* Scroll Instructions */}
      <div className="px-6 py-2 bg-blue-50 border-b text-sm text-blue-700">
        <div className="flex items-center gap-2">
          <span>💡 Tip:</span>
          <span>Scroll horizontally to view all days and summary columns</span>
        </div>
      </div>

      {/* Table Container */}
      <div className="w-full overflow-x-auto overflow-y-auto h-[600px] border border-gray-200 rounded-lg scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300">
        <div 
          className="min-w-fit relative" 
          style={{ minWidth: `${336 + (data.monthDays.length * 40) + 320}px` }}
        >
          {/* Header Row */}
          <div className="sticky top-0 bg-white border-b-2 border-gray-200 z-10">
            <div className="flex">
              {/* Student Info Headers */}
              <div className="flex bg-gray-50 flex-shrink-0">
                <div className="w-16 min-w-[64px] px-3 py-4 text-center border-r border-gray-200 flex-shrink-0">
                  <span className="text-sm font-semibold">Sr No.</span>
                </div>
                <div className="w-20 min-w-[80px] px-3 py-4 text-center border-r border-gray-200 flex-shrink-0">
                  <span className="text-sm font-semibold">ID</span>
                </div>
                <div className="w-48 min-w-[192px] px-3 py-4 text-left border-r border-gray-200 flex-shrink-0">
                  <span className="text-sm font-semibold">Name</span>
                </div>
              </div>

              {/* Days Headers */}
              <div className="flex bg-gray-50">
                {data.monthDays.map((day) => (
                  <div key={day} className="w-10 min-w-[40px] px-1 py-4 text-center border-r border-gray-200 flex-shrink-0">
                    <span className="text-xs font-medium">{day}</span>
                  </div>
                ))}
              </div>

              {/* Summary Headers */}
              <div className="flex bg-gray-100 flex-shrink-0">
                <div className="w-20 min-w-[80px] px-2 py-4 text-center border-r border-gray-200 flex-shrink-0">
                  <span className="text-xs font-semibold">Total</span>
                  <br />
                  <span className="text-xs font-semibold">Attended</span>
                </div>
                <div className="w-20 min-w-[80px] px-2 py-4 text-center border-r border-gray-200 flex-shrink-0">
                  <span className="text-xs font-semibold">Missed</span>
                </div>
                <div className="w-20 min-w-[80px] px-2 py-4 text-center border-r border-gray-200 flex-shrink-0">
                  <span className="text-xs font-semibold">COT</span>
                  <br />
                  <span className="text-xs font-semibold">WO</span>
                </div>
                <div className="w-20 min-w-[80px] px-2 py-4 text-center flex-shrink-0">
                  <span className="text-xs font-semibold">Holiday</span>
                </div>
              </div>
            </div>
          </div>

          {/* Student Rows */}
          <div className="divide-y divide-gray-200">
            {data.students.map((student, index) => (
              <div key={student.studentId} className={cn("flex", index % 2 === 0 ? 'bg-white' : 'bg-gray-50')}>
                {/* Student Info */}
                <div className="flex flex-shrink-0">
                  <div className="w-16 min-w-[64px] px-3 py-3 text-center border-r border-gray-200 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm">{student.srNo}</span>
                  </div>
                  <div className="w-20 min-w-[80px] px-3 py-3 text-center border-r border-gray-200 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-mono">{student.rollNumber}</span>
                  </div>
                  <div className="w-48 min-w-[192px] px-3 py-3 border-r border-gray-200 flex flex-col justify-center flex-shrink-0">
                    <span className="text-sm font-medium text-gray-900 truncate">
                      {student.studentName}
                    </span>
                    <span className="text-xs text-gray-500 truncate">
                      {student.parentInfo?.primaryMobileNo}
                    </span>
                  </div>
                </div>

                {/* Daily Attendance Cells */}
                <div className="flex">
                  {student.dailyAttendance.map((day) => {
                    const style = getStatusStyle(day.status);
                    return (
                      <div 
                        key={day.day} 
                        className="w-10 min-w-[40px] px-1 py-3 text-center border-r border-gray-200 flex items-center justify-center flex-shrink-0"
                      >
                        {day.hasData ? (
                          <div
                            className={cn(
                              "w-6 h-6 rounded-sm flex items-center justify-center text-xs font-medium border cursor-default",
                              style.bg,
                              style.text,
                              style.border
                            )}
                            title={`${day.day}: ${getStatusTooltip(day.status)}`}
                          >
                            {day.status}
                          </div>
                        ) : (
                          <div className="w-6 h-6 flex items-center justify-center">
                            <span className="text-gray-300">-</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Summary Columns */}
                <div className="flex bg-gray-50 flex-shrink-0">
                  <div className="w-20 min-w-[80px] px-2 py-3 text-center border-r border-gray-200 flex items-center justify-center flex-shrink-0">
                    <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100">
                      {student.summary.totalAttended}
                    </Badge>
                  </div>
                  <div className="w-20 min-w-[80px] px-2 py-3 text-center border-r border-gray-200 flex items-center justify-center flex-shrink-0">
                    <Badge variant="secondary" className="bg-red-100 text-red-700 hover:bg-red-100">
                      {student.summary.totalMissed}
                    </Badge>
                  </div>
                  <div className="w-20 min-w-[80px] px-2 py-3 text-center border-r border-gray-200 flex items-center justify-center flex-shrink-0">
                    <Badge variant="secondary" className="bg-orange-100 text-orange-700 hover:bg-orange-100">
                      {student.summary.totalLate}
                    </Badge>
                  </div>
                  <div className="w-20 min-w-[80px] px-2 py-3 text-center flex items-center justify-center flex-shrink-0">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                      {student.summary.totalHolidays}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary Row */}
          {data.students.length > 0 && (
            <div className="border-t-2 border-gray-300 bg-gray-100 font-semibold">
              <div className="flex">
                {/* Student Info Summary */}
                <div className="flex flex-shrink-0">
                  <div className="w-16 min-w-[64px] px-3 py-4 text-center border-r border-gray-200 flex-shrink-0">
                    <span className="text-sm">-</span>
                  </div>
                  <div className="w-20 min-w-[80px] px-3 py-4 text-center border-r border-gray-200 flex-shrink-0">
                    <span className="text-sm">-</span>
                  </div>
                  <div className="w-48 min-w-[192px] px-3 py-4 text-left border-r border-gray-200 flex-shrink-0">
                    <span className="text-sm font-bold">TOTALS</span>
                  </div>
                </div>

                {/* Days Summary (could show class-wide stats per day) */}
                <div className="flex">
                  {data.monthDays.map((day) => (
                    <div key={day} className="w-10 min-w-[40px] px-1 py-4 text-center border-r border-gray-200 flex-shrink-0">
                      <span className="text-xs text-gray-500">-</span>
                    </div>
                  ))}
                </div>

                {/* Overall Summary */}
                <div className="flex bg-gray-200 flex-shrink-0">
                  <div className="w-20 min-w-[80px] px-2 py-4 text-center border-r border-gray-200 flex-shrink-0">
                    <span 
                      className="text-sm font-bold text-green-700" 
                      title="Total days attended by all students"
                    >
                      {data.students.reduce((sum, s) => sum + s.summary.totalAttended, 0)}
                    </span>
                  </div>
                  <div className="w-20 min-w-[80px] px-2 py-4 text-center border-r border-gray-200 flex-shrink-0">
                    <span 
                      className="text-sm font-bold text-red-700"
                      title="Total days missed by all students"
                    >
                      {data.students.reduce((sum, s) => sum + s.summary.totalMissed, 0)}
                    </span>
                  </div>
                  <div className="w-20 min-w-[80px] px-2 py-4 text-center border-r border-gray-200 flex-shrink-0">
                    <span 
                      className="text-sm font-bold text-orange-700"
                      title="Total late arrivals by all students"
                    >
                      {data.students.reduce((sum, s) => sum + s.summary.totalLate, 0)}
                    </span>
                  </div>
                  <div className="w-20 min-w-[80px] px-2 py-4 text-center flex-shrink-0">
                    <span 
                      className="text-sm font-bold text-blue-700"
                      title="Total holidays in this month"
                    >
                      {data.students.length > 0 ? data.students[0].summary.totalHolidays : 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendanceCalendarGrid;