import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { 
  CheckCircle2, 
  Calendar, 
  UserX, 
  Users, 
  Zap,
  Loader2,
  RotateCcw,
  Save
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

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

interface BatchOperationsProps {
  students: Student[];
  onBatchStatusChange: (status: 'present' | 'absent' | 'leave') => void;
  onSaveAttendance: () => Promise<void>;
  onUndoLastAction?: () => void;
  isSaving?: boolean;
  className?: string;
  selectedDate: Date;
}

export default function BatchOperations({
  students,
  onBatchStatusChange,
  onSaveAttendance,
  onUndoLastAction,
  isSaving = false,
  className,
  selectedDate
}: BatchOperationsProps) {
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [lastAction, setLastAction] = useState<{ action: string; timestamp: Date } | null>(null);
  const { toast } = useToast();

  // Calculate statistics
  const stats = {
    total: students.length,
    present: students.filter(s => s.attendanceStatus === 'present').length,
    absent: students.filter(s => s.attendanceStatus === 'absent').length,
    leave: students.filter(s => s.attendanceStatus === 'leave').length,
    online: students.filter(s => s.isOnline).length
  };

  const percentages = {
    present: stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0,
    absent: stats.total > 0 ? Math.round((stats.absent / stats.total) * 100) : 0,
    leave: stats.total > 0 ? Math.round((stats.leave / stats.total) * 100) : 0
  };

  const handleBatchOperation = async (status: 'present' | 'absent' | 'leave', actionName: string) => {
    if (isSaving || isProcessing) return;
    
    setIsProcessing(status);
    
    try {
      // Add a small delay for better UX
      await new Promise(resolve => setTimeout(resolve, 300));
      
      onBatchStatusChange(status);
      setLastAction({ action: actionName, timestamp: new Date() });
      
      toast({
        title: "Batch Update Applied",
        description: `All ${stats.total} students marked as ${status}`,
        duration: 3000,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Batch Update Failed",
        description: "Failed to update attendance. Please try again.",
      });
    } finally {
      setIsProcessing(null);
    }
  };

  const handleSave = async () => {
    try {
      await onSaveAttendance();
      setLastAction(null); // Clear last action after successful save
    } catch (error) {
      // Error is handled by parent component
    }
  };

  const batchActions = [
    {
      key: 'present',
      label: 'All Present',
      icon: CheckCircle2,
      color: 'emerald',
      bgClass: 'bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/70',
      textClass: 'text-emerald-700 dark:text-emerald-300',
      iconClass: 'text-emerald-600 dark:text-emerald-400',
      count: stats.present,
      percentage: percentages.present
    },
    {
      key: 'leave',
      label: 'All Leave',
      icon: Calendar,
      color: 'amber',
      bgClass: 'bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/50 dark:hover:bg-amber-900/70',
      textClass: 'text-amber-700 dark:text-amber-300',
      iconClass: 'text-amber-600 dark:text-amber-400',
      count: stats.leave,
      percentage: percentages.leave
    },
    {
      key: 'absent',
      label: 'All Absent',
      icon: UserX,
      color: 'red',
      bgClass: 'bg-red-50 hover:bg-red-100 dark:bg-red-950/50 dark:hover:bg-red-900/70',
      textClass: 'text-red-700 dark:text-red-300',
      iconClass: 'text-red-600 dark:text-red-400',
      count: stats.absent,
      percentage: percentages.absent
    }
  ];

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Quick Actions</h3>
            </div>
            <Badge variant="outline" className="bg-background">
              <Users className="h-3 w-3 mr-1" />
              {stats.total} students
            </Badge>
          </div>

          {/* Current Stats */}
          <div className="grid grid-cols-3 gap-3">
            {batchActions.map((action) => (
              <div key={action.key} className="text-center">
                <div className="text-lg font-bold text-foreground">
                  {action.count}
                </div>
                <div className="text-xs text-muted-foreground">
                  {action.percentage}% {action.key}
                </div>
              </div>
            ))}
          </div>

          <Separator />

          {/* Batch Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {batchActions.map((action) => {
              const Icon = action.icon;
              const isProcessingThis = isProcessing === action.key;
              
              return (
                <motion.div
                  key={action.key}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    variant="outline"
                    className={cn(
                      "h-12 w-full flex flex-col items-center justify-center gap-1 transition-all duration-200",
                      action.bgClass,
                      action.textClass,
                      isProcessingThis && "scale-95"
                    )}
                    onClick={() => handleBatchOperation(action.key as any, action.label)}
                    disabled={isSaving || isProcessing !== null}
                  >
                    <AnimatePresence mode="wait">
                      {isProcessingThis ? (
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
                          className="flex flex-col items-center gap-1"
                        >
                          <Icon className={cn("h-4 w-4", action.iconClass)} />
                          <span className="text-xs font-medium">{action.label}</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Button>
                </motion.div>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2">
            {/* Save Button */}
            <Button
              onClick={handleSave}
              disabled={isSaving || isProcessing !== null}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Attendance
                </>
              )}
            </Button>

            {/* Undo Button */}
            {lastAction && onUndoLastAction && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <Button
                  variant="outline"
                  onClick={onUndoLastAction}
                  disabled={isSaving || isProcessing !== null}
                  className="sm:w-auto"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Undo
                </Button>
              </motion.div>
            )}
          </div>

          {/* Last Action Indicator */}
          <AnimatePresence>
            {lastAction && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-xs text-muted-foreground text-center"
              >
                Last action: {lastAction.action} at {lastAction.timestamp.toLocaleTimeString()}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Date Info */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Attendance for {selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
            {className && (
              <p className="text-xs text-muted-foreground mt-1">
                Class: {className}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}