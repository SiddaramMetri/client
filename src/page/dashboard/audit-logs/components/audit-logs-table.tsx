import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ChevronLeft, ChevronRight, Eye, User, Clock, MapPin,  AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface AuditLog {
  _id: string;
  timestamp: string;
  action: string;
  category: string;
  severity: string;
  resource?: string;
  resourceId?: string;
  success: boolean;
  userId?: {
    _id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
  userEmail?: string;
  ipAddress?: string;
  userAgent?: string;
  description?: string;
  duration?: number;
  metadata?: Record<string, any>;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  changedFields?: string[];
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

interface AuditLogsTableProps {
  data: AuditLog[];
  pagination?: Pagination;
  loading: boolean;
  onPageChange: (page: number) => void;
  currentPage: number;
}

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'CRITICAL':
      return 'destructive';
    case 'HIGH':
      return 'secondary';
    case 'MEDIUM':
      return 'default';
    case 'LOW':
      return 'outline';
    default:
      return 'outline';
  }
};

const getActionIcon = (success: boolean) => {
  return success ? (
    <CheckCircle className="h-4 w-4 text-green-600" />
  ) : (
    <XCircle className="h-4 w-4 text-red-600" />
  );
};

const AuditLogDetails = ({ log }: { log: AuditLog }) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="font-semibold mb-2">Basic Information</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Timestamp:</span>
              <span>{format(new Date(log.timestamp), 'PPpp')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Action:</span>
              <span className="font-mono">{log.action}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Category:</span>
              <span>{log.category.replace(/_/g, ' ')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Severity:</span>
              <Badge variant={getSeverityColor(log.severity) as any}>
                {log.severity}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              <div className="flex items-center gap-1">
                {getActionIcon(log.success)}
                <span>{log.success ? 'Success' : 'Failed'}</span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-2">User & Context</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">User:</span>
              <span>{log.userId?.email || log.userEmail || 'System'}</span>
            </div>
            {log.userId?.firstName && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name:</span>
                <span>{log.userId.firstName} {log.userId.lastName}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">IP Address:</span>
              <span className="font-mono">{log.ipAddress || 'N/A'}</span>
            </div>
            {log.resource && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Resource:</span>
                <span>{log.resource}</span>
              </div>
            )}
            {log.resourceId && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Resource ID:</span>
                <span className="font-mono text-xs">{log.resourceId}</span>
              </div>
            )}
            {log.duration && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duration:</span>
                <span>{log.duration}ms</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {log.description && (
        <div>
          <h4 className="font-semibold mb-2">Description</h4>
          <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
            {log.description}
          </p>
        </div>
      )}

      {log.userAgent && (
        <div>
          <h4 className="font-semibold mb-2">User Agent</h4>
          <p className="text-xs text-muted-foreground bg-muted p-3 rounded-md font-mono">
            {log.userAgent}
          </p>
        </div>
      )}

      {log.changedFields && log.changedFields.length > 0 && (
        <div>
          <h4 className="font-semibold mb-2">Changed Fields</h4>
          <div className="flex flex-wrap gap-1">
            {log.changedFields.map((field, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {field}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {log.oldValues && Object.keys(log.oldValues).length > 0 && (
        <div>
          <h4 className="font-semibold mb-2">Previous Values</h4>
          <pre className="text-xs bg-muted p-3 rounded-md overflow-auto max-h-40">
            {JSON.stringify(log.oldValues, null, 2)}
          </pre>
        </div>
      )}

      {log.newValues && Object.keys(log.newValues).length > 0 && (
        <div>
          <h4 className="font-semibold mb-2">New Values</h4>
          <pre className="text-xs bg-muted p-3 rounded-md overflow-auto max-h-40">
            {JSON.stringify(log.newValues, null, 2)}
          </pre>
        </div>
      )}

      {log.metadata && Object.keys(log.metadata).length > 0 && (
        <div>
          <h4 className="font-semibold mb-2">Metadata</h4>
          <pre className="text-xs bg-muted p-3 rounded-md overflow-auto max-h-40">
            {JSON.stringify(log.metadata, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export const AuditLogsTable: React.FC<AuditLogsTableProps> = ({
  data,
  pagination,
  loading,
  onPageChange,
  currentPage,
}) => {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Time</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>Resource</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <AlertTriangle className="h-8 w-8 text-muted-foreground" />
                    <p className="text-muted-foreground">No audit logs found</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              data.map((log) => (
                <TableRow key={log._id} className={!log.success ? 'bg-red-50/50' : ''}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium text-sm">
                          {format(new Date(log.timestamp), 'MMM dd, HH:mm')}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(log.timestamp), 'yyyy')}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {log.userId?.firstName?.[0] || log.userEmail?.[0]?.toUpperCase() || <User className="h-4 w-4" />}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-sm">
                          {log.userId?.firstName && log.userId?.lastName
                            ? `${log.userId.firstName} ${log.userId.lastName}`
                            : log.userId?.email || log.userEmail || 'System'
                          }
                        </div>
                        {log.ipAddress && (
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {log.ipAddress}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono text-xs">
                      {log.action.replace(/_/g, ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {log.category.replace(/_/g, ' ')}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getSeverityColor(log.severity) as any}>
                      {log.severity}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {log.resource ? (
                      <div>
                        <div className="font-medium text-sm capitalize">
                          {log.resource}
                        </div>
                        {log.resourceId && (
                          <div className="text-xs text-muted-foreground font-mono">
                            {log.resourceId.slice(-8)}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {getActionIcon(log.success)}
                      <span className={`text-sm ${log.success ? 'text-green-600' : 'text-red-600'}`}>
                        {log.success ? 'Success' : 'Failed'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {log.description ? (
                      <div className="max-w-xs truncate text-sm text-muted-foreground">
                        {log.description}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Audit Log Details</DialogTitle>
                        </DialogHeader>
                        <AuditLogDetails log={log} />
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t">
            <div className="text-sm text-muted-foreground">
              Showing {((currentPage - 1) * pagination.limit) + 1} to{' '}
              {Math.min(currentPage * pagination.limit, pagination.total)} of{' '}
              {pagination.total} results
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {[...Array(Math.min(5, pagination.pages))].map((_, i) => {
                  const pageNum = Math.max(1, currentPage - 2) + i;
                  if (pageNum > pagination.pages) return null;
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={pageNum === currentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => onPageChange(pageNum)}
                      className="w-8 h-8 p-0"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= pagination.pages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};