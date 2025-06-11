import React from 'react';
import { BookOpen, Users, GraduationCap, TrendingUp } from 'lucide-react';


const Card = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={className}>
    {children}
  </div>
);

const CardContent = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={className}>
    {children}
  </div>
);

const CardTitle = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <h3 className={className}>
    {children}
  </h3>
);

export default function CompactStatsCards({ statsData }: { statsData: any }) {
  return (
    <>
    {statsData && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="hover:shadow-md transition-shadow duration-200 h-24">
              <CardHeader className="flex flex-row items-center justify-between px-4 pt-3 pb-1">
                <CardTitle className="text-xs font-medium text-gray-600">
                  Total Classes
                </CardTitle>
                <BookOpen className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent className="px-4 pb-3">
                <div className="flex items-center justify-between">
                  <div className="text-xl font-bold tracking-tight text-gray-900">{statsData.totalClasses}</div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="flex items-center gap-1 text-green-600">
                      <span className="h-1 w-1 rounded-full bg-green-500"></span>
                      {statsData.activeClasses}
                    </span>
                    <span className="flex items-center gap-1 text-red-600">
                      <span className="h-1 w-1 rounded-full bg-red-500"></span>
                      {statsData.inactiveClasses}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow duration-200 h-24">
              <CardHeader className="flex flex-row items-center justify-between px-4 pt-3 pb-1">
                <CardTitle className="text-xs font-medium text-gray-600">
                  Total Students
                </CardTitle>
                <Users className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent className="px-4 pb-3">
                <div className="flex items-center justify-between mb-1">
                  <div className="text-xl font-bold tracking-tight text-gray-900">{statsData.totalStudents}</div>
                  <div className="text-xs text-gray-500">
                    of {statsData.totalCapacity}
                  </div>
                </div>
                <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300"
                    style={{ width: `${(statsData.totalStudents / statsData.totalCapacity) * 100}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow duration-200 h-24">
              <CardHeader className="flex flex-row items-center justify-between px-4 pt-3 pb-1">
                <CardTitle className="text-xs font-medium text-gray-600">
                  Average Class Size
                </CardTitle>
                <GraduationCap className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent className="px-4 pb-3">
                <div className="flex items-center justify-between">
                  <div className="text-xl font-bold tracking-tight text-gray-900">
                    {Math.round(statsData.averageClassSize)}
                  </div>
                  <div className="text-xs text-gray-500">
                    per class
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow duration-200 h-24">
              <CardHeader className="flex flex-row items-center justify-between px-4 pt-3 pb-1">
                <CardTitle className="text-xs font-medium text-gray-600">
                  Utilization
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent className="px-4 pb-3">
                <div className="flex items-center justify-between mb-1">
                  <div className="text-xl font-bold tracking-tight text-gray-900">
                    {statsData.utilizationPercentage}%
                  </div>
                  <div className="text-xs text-gray-500">
                    capacity
                  </div>
                </div>
                <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-300"
                    style={{ width: `${statsData.utilizationPercentage}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
    </>
  );
}