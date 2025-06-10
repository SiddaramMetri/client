import Asidebar from "@/components/asidebar/asidebar";
import Header from "@/components/header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import CreateWorkspaceDialog from "@/components/workspace/create-workspace-dialog";
import CreateProjectDialog from "@/components/workspace/project/create-project-dialog";
import { AuthProvider } from "@/context/auth-provider";
import { Suspense } from "react";
import { Outlet } from "react-router-dom";

const AppLayout = () => {
  return (
    <AuthProvider>
      <div className="w-full bg-slate-50">
        <SidebarProvider>
          <Asidebar />
          <SidebarInset className="overflow-x-hidden">
            <div>
              <div className="sticky top-0 z-10 bg-background rounded-lg">
                <Header />
              </div>
              <div className="flex flex-1 flex-col">
              <div className="@container/main flex flex-1 flex-col gap-2 px-4">
                <Suspense fallback={<div>Loading...</div>}>
                  <Outlet />
                </Suspense>
              </div>
            </div>
              <CreateWorkspaceDialog />
              <CreateProjectDialog />
            </div>
          </SidebarInset>
        </SidebarProvider>
      </div>
    </AuthProvider>
  );
};

export default AppLayout;
