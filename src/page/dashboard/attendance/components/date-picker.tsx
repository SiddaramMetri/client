import React from 'react';
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
  date: Date;
  onDateChange: (date: Date | undefined) => void;
}

export default function DatePicker({ date, onDateChange }: DatePickerProps) {
  return (
    <div className="flex flex-col space-y-1">
      <label htmlFor="date-picker" className="text-sm font-medium">
        Attendance Date
      </label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date-picker"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={onDateChange}
            initialFocus
            disabled={(date) => {
              // Disable future dates
              const today = new Date();
              return date > today;
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
