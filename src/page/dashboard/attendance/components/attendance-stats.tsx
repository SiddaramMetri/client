import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Users, UserCheck, UserX } from "lucide-react";
import { Calendar } from "lucide-react";
import { motion } from "framer-motion";

interface AttendanceStatsProps {
  stats: {
    present: number;
    absent: number;
    leave: number;
    total: number;
  };
}

export default function AttendanceStats({ stats }: AttendanceStatsProps) {
  // Calculate percentages for the progress bars
  const presentPercentage = stats.total > 0 ? (stats.present / stats.total) * 100 : 0;
  const absentPercentage = stats.total > 0 ? (stats.absent / stats.total) * 100 : 0;
  const leavePercentage = stats.total > 0 ? (stats.leave / stats.total) * 100 : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* Total Students */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0 }}
      >
        <Card className="overflow-hidden border-blue-100 dark:border-blue-900 h-full">
          <div className="h-1 bg-blue-500" />
          <CardContent className="p-6 flex items-center">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full mr-4">
              <Users className="h-6 w-6 text-blue-700 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Students</p>
              <h3 className="text-2xl font-bold">{stats.total}</h3>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Present Students */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card className="overflow-hidden border-green-100 dark:border-green-900 h-full">
          <div className="h-1 bg-green-500" />
          <CardContent className="p-6 flex items-center">
            <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full mr-4">
              <UserCheck className="h-6 w-6 text-green-700 dark:text-green-400" />
            </div>
            <div className="flex-grow">
              <div className="flex justify-between">
                <p className="text-sm font-medium text-muted-foreground">Present</p>
                <p className="text-sm font-medium">{stats.present > 0 && stats.total > 0 ? `${Math.round((stats.present / stats.total) * 100)}%` : '0%'}</p>
              </div>
              <h3 className="text-2xl font-bold">{stats.present}</h3>
              <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2 mt-2">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${presentPercentage}%` }}
                  transition={{ duration: 1, delay: 0.3 }}
                  className="bg-green-600 dark:bg-green-500 h-2 rounded-full" 
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Leave Students */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Card className="overflow-hidden border-amber-100 dark:border-amber-900 h-full">
          <div className="h-1 bg-amber-500" />
          <CardContent className="p-6 flex items-center">
            <div className="bg-amber-100 dark:bg-amber-900/30 p-3 rounded-full mr-4">
              <Calendar className="h-6 w-6 text-amber-700 dark:text-amber-400" />
            </div>
            <div className="flex-grow">
              <div className="flex justify-between">
                <p className="text-sm font-medium text-muted-foreground">Leave</p>
                <p className="text-sm font-medium">{stats.leave > 0 && stats.total > 0 ? `${Math.round((stats.leave / stats.total) * 100)}%` : '0%'}</p>
              </div>
              <h3 className="text-2xl font-bold">{stats.leave}</h3>
              <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2 mt-2">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${leavePercentage}%` }}
                  transition={{ duration: 1, delay: 0.3 }}
                  className="bg-amber-500 h-2 rounded-full" 
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Absent Students */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <Card className="overflow-hidden border-red-100 dark:border-red-900 h-full">
          <div className="h-1 bg-red-500" />
          <CardContent className="p-6 flex items-center">
            <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full mr-4">
              <UserX className="h-6 w-6 text-red-700 dark:text-red-400" />
            </div>
            <div className="flex-grow">
              <div className="flex justify-between">
                <p className="text-sm font-medium text-muted-foreground">Absent</p>
                <p className="text-sm font-medium">{stats.absent > 0 && stats.total > 0 ? `${Math.round((stats.absent / stats.total) * 100)}%` : '0%'}</p>
              </div>
              <h3 className="text-2xl font-bold">{stats.absent}</h3>
              <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2 mt-2">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${absentPercentage}%` }}
                  transition={{ duration: 1, delay: 0.3 }}
                  className="bg-red-600 dark:bg-red-500 h-2 rounded-full" 
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
