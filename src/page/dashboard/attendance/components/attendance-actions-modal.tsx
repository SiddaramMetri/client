import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Calendar as CalendarIcon, Download, FileText, Loader2, Upload } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Student, exportAttendanceToExcel, generateAttendancePDF } from "../utils/attendance-utils";

interface AttendanceActionsModalProps {
  classId: string;
  className: string;
  date: Date;
  students: Student[];
  isLoading?: boolean;
}

export default function AttendanceActionsModal({
  classId, 
  className, 
  date,
  students,
  isLoading = false
}: AttendanceActionsModalProps) {
  const [activeTab, setActiveTab] = useState("export");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(date);
  const [dateStr, setDateStr] = useState(format(date, 'PPP'));
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<"pdf" | "excel">("pdf");
  
  const handleExport = async () => {
    setIsExporting(true);
    try {
      setTimeout(() => {
        if (exportFormat === "pdf") {
          generateAttendancePDF(students, className, date);
        } else {
          exportAttendanceToExcel(students, className, date);
        }
        setIsExporting(false);
      }, 1000);
    } catch (error) {
      console.error("Export failed:", error);
      setIsExporting(false);
    }
  };
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex gap-2 items-center">
          <FileText className="h-4 w-4" />
          <span>Actions</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Attendance Actions</DialogTitle>
          <DialogDescription>
            Export attendance data or view history for {className}.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="export" value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="export">Export Data</TabsTrigger>
            <TabsTrigger value="history">View History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="export" className="space-y-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="export-date">Date</Label>
                <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      id="export-date"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, 'PPP') : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => {
                        setSelectedDate(date);
                        if (date) {
                          setDateStr(format(date, 'PPP'));
                        }
                        setIsCalendarOpen(false);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="grid gap-2">
                <Label>Export Format</Label>
                <RadioGroup 
                  defaultValue="pdf" 
                  value={exportFormat} 
                  onValueChange={(value) => setExportFormat(value as "pdf" | "excel")}
                  className="flex space-x-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="pdf" id="format-pdf" />
                    <Label htmlFor="format-pdf" className="cursor-pointer font-normal">PDF</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="excel" id="format-excel" />
                    <Label htmlFor="format-excel" className="cursor-pointer font-normal">Excel</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <Card className="p-4 bg-muted/50">
                <div className="text-sm">
                  <strong>Summary:</strong> Exporting attendance data for {className} on {dateStr}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {students.filter(s => s.attendanceStatus === 'present').length} present, 
                  {' '}{students.filter(s => s.attendanceStatus === 'absent').length} absent, 
                  {' '}{students.filter(s => s.attendanceStatus === 'leave').length} on leave
                </div>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="history" className="space-y-4">
            <div className="text-center py-8">
              <div className="flex justify-center mb-3">
                <CalendarIcon className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium">Attendance History</h3>
              <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
                View past attendance records for this class.
                This feature will be available in a future update.
              </p>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          {activeTab === "export" ? (
            <Button 
              onClick={handleExport} 
              disabled={isExporting || isLoading}
              className="gap-2"
            >
              {isExporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : exportFormat === "pdf" ? (
                <FileText className="h-4 w-4" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {isExporting ? "Exporting..." : `Export as ${exportFormat.toUpperCase()}`}
            </Button>
          ) : (
            <Button disabled>
              <Upload className="h-4 w-4 mr-2" />
              Coming Soon
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
