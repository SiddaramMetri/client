import { useState } from "react";
import { CalendarIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ClassDropdown from "@/components/form/class-dropdown";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import AttendanceMarkingInterface from "./components/attendance-marking-interface";

const DailyAttendancePage = () => {
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const formatDate = (date: Date) => {
    return format(date, "PPP");
  };

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-4 md:space-y-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Daily Attendance</h1>
        <p className="text-muted-foreground">
          Mark daily attendance for students in selected class and date.
        </p>
      </div>

      {/* Class and Date Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Class and Date</CardTitle>
          <CardDescription>
            Choose a class and date to mark attendance
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Class</label>
            <ClassDropdown
              value={selectedClassId}
              onChange={setSelectedClassId}
              placeholder="Select a class..."
            />
          </div>
          
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? formatDate(selectedDate) : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Marking Interface */}
      <AttendanceMarkingInterface 
        classId={selectedClassId} 
        date={selectedDate}
      />
    </div>
  );
};

export default DailyAttendancePage;