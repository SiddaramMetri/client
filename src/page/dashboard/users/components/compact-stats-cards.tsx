import {
  BookOpen,
  TrendingUp,
  UserCheck,
  UserX
} from "lucide-react";
import React from "react";


const Card = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}
  >
    {children}
  </div>
);

const CardHeader = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => <div className={className}>{children}</div>;

const CardContent = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => <div className={className}>{children}</div>;

const CardTitle = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => <h3 className={className}>{children}</h3>;

export default function CompactStatsCards({ statsData }: { statsData: any }) {
  return (
    <>
      {statsData && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="hover:shadow-md transition-shadow duration-200 h-24">
            <CardHeader className="flex flex-row items-center justify-between px-4 pt-3 pb-1">
              <CardTitle className="text-xs font-medium text-gray-600">
                Total Users
              </CardTitle>
              <BookOpen className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent className="px-4 pb-3">
              <div className="flex items-center justify-between mb-1">
                <div className="text-xl font-bold tracking-tight text-gray-900">
                  {statsData.activeUsers}
                </div>
                <div className="text-xs text-gray-500">
                  of {statsData.totalUsers}
                </div>
              </div>
              <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300"
                  style={{
                    width: `${
                      (statsData.activeUsers / statsData.totalUsers) * 100
                    }%`,
                  }}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow duration-200 h-24">
            <CardHeader className="flex flex-row items-center justify-between px-4 pt-3 pb-1">
              <CardTitle className="text-xs font-medium text-gray-600">
                Active Users
              </CardTitle>
              <UserCheck className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent className="px-4 pb-3">
              <div className="text-2xl font-bold text-green-600">
                {statsData.activeUsers}
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow duration-200 h-24">
            <CardHeader className="flex flex-row items-center justify-between px-4 pt-3 pb-1">
              <CardTitle className="text-xs font-medium text-gray-600">
                Inactive Users
              </CardTitle>
              <UserX className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent className="px-4 pb-3">
              <div className="text-2xl font-bold text-red-600">
                {statsData.inactiveUsers}
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
                    {Math.round((statsData.activeUsers / statsData.totalUsers) * 100)}%
                  </div>
                  <div className="text-xs text-gray-500">
                    capacity
                  </div>
                </div>
                <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-300"
                    style={{ width: `${Math.round((statsData.activeUsers / statsData.totalUsers) * 100)}%` }}
                  />
                </div>
              </CardContent>
            </Card>
        </div>
      )}
    </>
  );
}
