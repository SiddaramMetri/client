import { Settings } from "lucide-react";
import AttendanceConfiguration from "./components/attendance-configuration";

const AttendanceConfigPage = () => {
  return (
    <div className="container mx-auto p-4 md:p-6 space-y-4 md:space-y-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Settings className="h-8 w-8" />
          Attendance Configuration
        </h1>
        <p className="text-muted-foreground">
          Configure communication settings, automation rules, and behavior for the attendance management system.
        </p>
      </div>

      {/* Configuration Component */}
      <AttendanceConfiguration />
    </div>
  );
};

export default AttendanceConfigPage;