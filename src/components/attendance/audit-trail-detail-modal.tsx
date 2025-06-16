import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Clock,
  User,
  Globe,
  Monitor,
  ArrowRight,
  FileText,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { StudentAuditEntry, AuditTrailEntry } from '@/hooks/api/use-audit-trail';
import { cn } from '@/lib/utils';

interface AuditTrailDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: number;
  entries: StudentAuditEntry[];
  monthName: string;
  year: string;
}

const AuditTrailDetailModal: React.FC<AuditTrailDetailModalProps> = ({
  isOpen,
  onClose,
  date,
  entries,
  monthName,
  year,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'absent':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'late':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'half-day':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'holiday':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'leave':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'present': return 'Present';
      case 'absent': return 'Absent';
      case 'late': return 'Late';
      case 'half-day': return 'Half Day';
      case 'holiday': return 'Holiday';
      case 'leave': return 'Leave';
      default: return status;
    }
  };

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  const formatFullDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  // Filter entries to only show unique students with changes
  const uniqueEntries = React.useMemo(() => {
    const seenStudents = new Set();
    return entries.filter(entry => {
      if (seenStudents.has(entry.student.id)) {
        return false;
      }
      seenStudents.add(entry.student.id);
      return entry.hasChanges && entry.changeCount > 0;
    });
  }, [entries]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-xl font-bold">
            Audit Trail - {monthName} {date}, {year}
          </DialogTitle>
          <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
            <span>Students with Changes: {uniqueEntries.length}</span>
            <span>Total Changes: {uniqueEntries.reduce((sum, entry) => sum + entry.changeCount, 0)}</span>
          </div>
        </DialogHeader>

        <Separator />

        <ScrollArea className="flex-1 px-6 pb-6">
          <div className="space-y-6">
            {uniqueEntries.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Changes Found</h3>
                <p className="text-gray-500">
                  No attendance modifications were made on this date.
                </p>
              </div>
            ) : (
              uniqueEntries.map((entry) => (
                <div key={entry.student.id} className="border rounded-lg p-4 bg-white">
                  {/* Student Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{entry.student.name}</h4>
                        <p className="text-xs text-gray-500">Roll No: {entry.student.rollNumber}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={cn("text-xs", getStatusColor(entry.currentStatus))}>
                        {getStatusDisplay(entry.currentStatus)}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        v{entry.version}
                      </Badge>
                    </div>
                  </div>

                  {/* Audit Trail */}
                  <div className="space-y-3">
                    <h5 className="text-sm font-medium text-gray-700 flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      Change History ({entry.changeCount} changes)
                    </h5>

                    <div className="space-y-3">
                      {entry.auditTrail && entry.auditTrail.length > 0 ? (
                        entry.auditTrail.map((audit: AuditTrailEntry, auditIndex: number) => (
                          <div
                            key={auditIndex}
                            className={cn(
                              "border-l-4 pl-4 py-2",
                              audit.isInitialEntry 
                                ? "border-green-400 bg-green-50" 
                                : "border-blue-400 bg-blue-50"
                            )}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                {audit.isInitialEntry ? (
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                ) : (
                                  <AlertCircle className="h-4 w-4 text-blue-600" />
                                )}
                                <span className="text-xs font-medium text-gray-700">
                                  {audit.isInitialEntry ? 'Initial Entry' : 'Status Changed'}
                                </span>
                              </div>
                              <span className="text-xs text-gray-500">
                                {formatDateTime(audit.changedAt)}
                              </span>
                            </div>

                            {/* Status Change */}
                            <div className="flex items-center gap-2 mb-2">
                              {audit.previousStatus ? (
                                <>
                                  <Badge className={cn("text-xs", getStatusColor(audit.previousStatus))}>
                                    {getStatusDisplay(audit.previousStatus)}
                                  </Badge>
                                  <ArrowRight className="h-3 w-3 text-gray-400" />
                                </>
                              ) : (
                                <span className="text-xs text-gray-500">New → </span>
                              )}
                              <Badge className={cn("text-xs", getStatusColor(audit.newStatus))}>
                                {getStatusDisplay(audit.newStatus)}
                              </Badge>
                            </div>

                            {/* Change Reason */}
                            {audit.changeReason && (
                              <div className="text-xs text-gray-600 mb-2">
                                <span className="font-medium">Reason: </span>
                                {audit.changeReason}
                              </div>
                            )}

                            {/* Remarks Change */}
                            {(audit.previousRemarks || audit.newRemarks) && (
                              <div className="text-xs text-gray-600 mb-2">
                                <span className="font-medium">Remarks: </span>
                                {audit.previousRemarks && (
                                  <span className="line-through text-red-600">{audit.previousRemarks}</span>
                                )}
                                {audit.previousRemarks && audit.newRemarks && ' → '}
                                {audit.newRemarks && (
                                  <span className="text-green-600">{audit.newRemarks}</span>
                                )}
                              </div>
                            )}

                            {/* User Information */}
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                <span>
                                  {audit.changedBy.firstName} {audit.changedBy.lastName}
                                </span>
                              </div>
                              {audit.ipAddress && (
                                <div className="flex items-center gap-1">
                                  <Globe className="h-3 w-3" />
                                  <span>{audit.ipAddress}</span>
                                </div>
                              )}
                            </div>

                            {/* User Agent (truncated) */}
                            {audit.userAgent && (
                              <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                                <Monitor className="h-3 w-3" />
                                <span className="truncate max-w-md" title={audit.userAgent}>
                                  {audit.userAgent}
                                </span>
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-sm text-gray-500">No detailed audit trail available</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Last Modified */}
                  <div className="mt-4 pt-3 border-t text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>Last modified: {formatFullDateTime(entry.lastModified)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default AuditTrailDetailModal;