import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";

export default function AttendanceHelpGuide() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
          <HelpCircle className="h-5 w-5" />
          <span className="sr-only">Help</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Attendance System Guide</DialogTitle>
          <DialogDescription>
            Learn how to efficiently manage student attendance
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 my-2 max-h-[60vh] overflow-y-auto pr-2">
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Getting Started</h3>
            <ol className="list-decimal pl-5 space-y-2 text-sm">
              <li>Select a class from the dropdown menu</li>
              <li>Choose the date for attendance</li>
              <li>Students for the selected class will automatically load</li>
            </ol>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Marking Attendance</h3>
            <p className="text-sm text-muted-foreground">
              Each student card has three options for attendance status:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li><span className="font-medium text-green-600">Present (P)</span> - Student attended the class</li>
              <li><span className="font-medium text-amber-600">Leave (L)</span> - Student is on approved leave</li>
              <li><span className="font-medium text-red-600">Absent (A)</span> - Student did not attend class</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-medium">Bulk Actions</h3>
            <p className="text-sm text-muted-foreground">
              For quick mass updates, use the buttons at the top to mark all students as:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>"Mark All Present" - Sets all students to present</li>
              <li>"Mark All Leave" - Sets all students to leave</li>
              <li>"Mark All Absent" - Sets all students to absent</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-medium">View Modes</h3>
            <p className="text-sm text-muted-foreground">
              Toggle between different view modes:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li><span className="font-medium">Grid View</span> - Card-based layout, better for touch devices and mobile screens</li>
              <li><span className="font-medium">List View</span> - Traditional table layout, more efficient on desktop</li>
            </ul>
            <p className="text-xs text-muted-foreground mt-1">
              Note: The system automatically switches to Grid View on mobile devices for better usability.
            </p>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Keyboard Navigation</h3>
            <p className="text-sm text-muted-foreground">
              The system supports full keyboard navigation:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li><strong>Arrow keys</strong> - Navigate between students</li>
              <li><strong>Home / End</strong> - Jump to first / last student</li>
              <li><strong>Enter / Space</strong> - Cycle through attendance statuses</li>
              <li><strong>P key</strong> - Mark selected student as Present</li>
              <li><strong>L key</strong> - Mark selected student as on Leave</li>
              <li><strong>A key</strong> - Mark selected student as Absent</li>
            </ul>
            <p className="text-xs text-muted-foreground mt-1">
              Click the "Keys" button in the view toolbar to see these shortcuts anytime.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-medium">Status Indicators</h3>
            <p className="text-sm text-muted-foreground">
              Student cards show additional information:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Online/offline status indicator</li>
              <li>Last seen timestamp for offline students</li>
              <li>Color-coded borders based on current attendance status</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-medium">Saving & Exporting</h3>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Click "Save Attendance" to record the current attendance</li>
              <li>Use the "Actions" button to export attendance data as PDF or Excel</li>
              <li>View attendance history reports (coming soon)</li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Best Practices</h3>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Save attendance regularly to prevent data loss</li>
              <li>Use the filter feature to quickly find students by status</li>
              <li>Check the summary statistics to verify all students are accounted for</li>
              <li>Export reports for record keeping and administrative purposes</li>
              <li>Use keyboard shortcuts for faster data entry when working on desktop</li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Accessibility</h3>
            <p className="text-sm text-muted-foreground">
              This system includes several accessibility features:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Full keyboard navigation support</li>
              <li>Screen reader compatibility with ARIA labels</li>
              <li>High contrast status indicators</li>
              <li>Responsive design for all devices</li>
              <li>Click the "Accessibility" button for more detailed information</li>
            </ul>
          </div>
        </div>
        
        <DialogFooter>
          <Button type="button">Got it</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
