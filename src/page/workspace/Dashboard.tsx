import { AlertTriangle, Plus } from "lucide-react";

import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { Button } from "@/components/ui/button";
import useCreateProjectDialog from "@/hooks/use-create-project-dialog";
import StudentsPage from "@/page/dashboard/students";
import { RBACPermissionGuard } from "@/components/resuable/permission-guard";
import { Card, CardContent } from "@/components/ui/card";

const WorkspaceDashboard = () => {
  const { onOpen } = useCreateProjectDialog();
  return (
    <RBACPermissionGuard 
    permissions="dashboard:view"
    fallback={
      <div className="flex items-center justify-center h-64">
        <Card className="p-6">
          <CardContent className="text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Super Admin Access Required</h3>
            <p className="text-gray-600">Only super administrators can access user role management.</p>
            <p className="text-sm text-gray-500 mt-2">Required permission: dashboard:manage</p>
          </CardContent>
        </Card>
      </div>
    }
  >
    <main className="flex flex-1 flex-col py-4 md:pt-3">
      <div className="flex items-center justify-between space-y-2 mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Workspace Overview
          </h2>
          <p className="text-muted-foreground">
            Here&apos;s an overview for this workspace!
          </p>
        </div>
        <Button onClick={onOpen}>
          <Plus />
          New Project
        </Button>
      </div>
      <div className="px-2 lg:px-2">
        <ChartAreaInteractive />
      
        <StudentsPage />
      </div>
    </main>
    </RBACPermissionGuard>
  );
};

export default WorkspaceDashboard;
