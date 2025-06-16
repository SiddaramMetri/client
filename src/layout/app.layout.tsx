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
      <div className="w-full min-h-screen bg-slate-50 dark:bg-slate-900">
        <SidebarProvider>
          <Asidebar />
          <SidebarInset className="overflow-x-hidden bg-slate-50 dark:bg-slate-900">
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
              <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40">
                <Header />
              </div>
              <div className="flex flex-1 flex-col bg-slate-50 dark:bg-slate-900">
                <div className="@container/main flex flex-1 flex-col gap-2 px-4 py-4 bg-slate-50 dark:bg-slate-900">
                  <Suspense fallback={
                    <div className="flex items-center justify-center h-64 bg-background rounded-lg">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  }>
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
