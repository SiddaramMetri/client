import { AppSidebar } from "@/components/app-sidebar";
import Header from "@/components/header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import CreateWorkspaceDialog from "@/components/workspace/create-workspace-dialog";
import CreateProjectDialog from "@/components/workspace/project/create-project-dialog";
import { data } from "@/config/navigation";
import { AuthProvider } from "@/context/auth-provider";
import { Outlet } from "react-router-dom";

const AppLayout = () => {
  return (
    <AuthProvider>
      <SidebarProvider>
        {/* <Asidebar /> */}
        <AppSidebar variant="inset" items={data} />
        <SidebarInset className="overflow-x-hidden">
          <div className="w-full">
            <>
              <Header />
              <div className="px-3 lg:px-20 py-3">
                <Outlet />
              </div>
            </>
            <CreateWorkspaceDialog />
            <CreateProjectDialog />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </AuthProvider>
  );
};

export default AppLayout;
