import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Users, UserCheck, UserX } from "lucide-react";

interface AttendanceStatsProps {
  stats: {
    present: number;
    absent: number;
    total: number;
  };
}

export default function AttendanceStats({ stats }: AttendanceStatsProps) {
  // Calculate percentages for the progress bars
  const presentPercentage = stats.total > 0 ? (stats.present / stats.total) * 100 : 0;
  const absentPercentage = stats.total > 0 ? (stats.absent / stats.total) * 100 : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Total Students */}
      <Card>
        <CardContent className="p-6 flex items-center">
          <div className="bg-blue-100 p-3 rounded-full mr-4">
            <Users className="h-6 w-6 text-blue-700" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Students</p>
            <h3 className="text-2xl font-bold">{stats.total}</h3>
          </div>
        </CardContent>
      </Card>

      {/* Present Students */}
      <Card>
        <CardContent className="p-6 flex items-center">
          <div className="bg-green-100 p-3 rounded-full mr-4">
            <UserCheck className="h-6 w-6 text-green-700" />
          </div>
          <div className="flex-grow">
            <div className="flex justify-between">
              <p className="text-sm font-medium text-muted-foreground">Present</p>
              <p className="text-sm font-medium">{stats.present > 0 && stats.total > 0 ? `${Math.round((stats.present / stats.total) * 100)}%` : '0%'}</p>
            </div>
            <h3 className="text-2xl font-bold">{stats.present}</h3>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-green-600 h-2 rounded-full" 
                style={{ width: `${presentPercentage}%` }}
              ></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Absent Students */}
      <Card>
        <CardContent className="p-6 flex items-center">
          <div className="bg-red-100 p-3 rounded-full mr-4">
            <UserX className="h-6 w-6 text-red-700" />
          </div>
          <div className="flex-grow">
            <div className="flex justify-between">
              <p className="text-sm font-medium text-muted-foreground">Absent</p>
              <p className="text-sm font-medium">{stats.absent > 0 && stats.total > 0 ? `${Math.round((stats.absent / stats.total) * 100)}%` : '0%'}</p>
            </div>
            <h3 className="text-2xl font-bold">{stats.absent}</h3>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-red-600 h-2 rounded-full" 
                style={{ width: `${absentPercentage}%` }}
              ></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
