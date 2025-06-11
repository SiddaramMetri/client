import { Progress } from "@/components/ui/progress";
import { BookOpen, TrendingUp, UserCheck, UserX } from "lucide-react";
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

export default function AuditStatsCards({
  statsData,
  successRate,
}: {
  statsData: any;
  successRate: number;
}) {
  return (
    <>
      {statsData && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="hover:shadow-md transition-shadow duration-200 h-32">
            <CardHeader className="flex flex-row items-center justify-between px-4 pt-3 pb-1">
              <CardTitle className="text-xs font-medium text-gray-600">
                Total Actions
              </CardTitle>
              <BookOpen className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent className="px-4 pb-3">
              <div className="text-2xl font-bold">
                {statsData.totalActions.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                All recorded activities
              </p>
              <div className="mt-2 text-xs text-gray-500">
                Last 24 hours: {statsData.last24HoursUsers || 0}
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow duration-200 h-32">
            <CardHeader className="flex flex-row items-center justify-between px-4 pt-3 pb-1">
              <CardTitle className="text-xs font-medium text-gray-600">
                Success Rate
              </CardTitle>
              <UserCheck className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent className="px-4 pb-3">
              <div className="text-2xl font-bold text-green-600">
                {successRate.toFixed(1)}%
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
                <span>Success: {statsData.successfulActions}</span>
                <span>Failed: {statsData.failedActions}</span>
              </div>
              <div className="relative mt-2">
                <Progress value={successRate} className="h-2 bg-gray-100" />
                <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  {successRate >= 90
                    ? "Excellent"
                    : successRate >= 75
                    ? "Good"
                    : successRate >= 60
                    ? "Average"
                    : "Needs Improvement"}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow duration-200 h-32">
            <CardHeader className="flex flex-row items-center justify-between px-4 pt-3 pb-1">
              <CardTitle className="text-xs font-medium text-gray-600">
                Active Users
              </CardTitle>
              <UserX className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent className="px-4 pb-3">
              <div className="text-2xl font-bold">{statsData.uniqueUsers}</div>
              <p className="text-xs text-muted-foreground">
                Unique users with activity
              </p>
              <div className="mt-2 text-xs text-gray-500">
                Last 24 hours: {statsData.last24HoursUsers || 0}
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow duration-200 h-32">
            <CardHeader className="flex flex-row items-center justify-between px-4 pt-3 pb-1">
              <CardTitle className="text-xs font-medium text-gray-600">
                Failed Actions
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent className="px-4 pb-3">
              <div className="text-2xl font-bold text-red-600">
                {statsData.failedActions.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Actions that failed
              </p>
              <div className="mt-2 text-xs text-gray-500">
                Last 24 hours: {statsData.last24HoursFailed || 0}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
