import { Plus } from "lucide-react";

import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { Button } from "@/components/ui/button";
import useCreateProjectDialog from "@/hooks/use-create-project-dialog";
import StudentsPage from "../students";

const WorkspaceDashboard = () => {
  const { onOpen } = useCreateProjectDialog();
  return (
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
      <div className="px-4 lg:px-6">
        <ChartAreaInteractive />
      </div>
      {/* <WorkspaceAnalytics /> */}
      <div className="mt-4">
        <StudentsPage />
        {/* <DataTable data={data} /> */}
      </div>
    </main>
  );
};

export default WorkspaceDashboard;
