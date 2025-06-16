import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "./ui/separator";
import { Link, useLocation } from "react-router-dom";
import { PROTECTED_ROUTES } from "@/routes/common/routePaths";

const Header = () => {
  const location = useLocation();
  const pathname = location.pathname;

  const getPageLabel = (pathname: string) => {
    // Remove the /dashboard prefix for matching
    const path = pathname.replace('/dashboard', '');
    
    // Handle root dashboard
    if (path === '') return 'Dashboard';
    
    // Handle nested routes (like attendance/daily)
    const segments = path.split('/').filter(Boolean);
    const mainRoute = segments[0];
    
    // Get the route key from PROTECTED_ROUTES
    const routeKey = Object.entries(PROTECTED_ROUTES).find(([_, value]) => 
      value.includes(`/dashboard/${mainRoute}`)
    )?.[0];
    
    if (!routeKey) return null;
    
    // Convert route key to display format (e.g., ATTENDANCE_DAILY -> "Daily Attendance")
    const displayName = routeKey
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
      
    return displayName;
  };

  const pageHeading = getPageLabel(pathname);
  
  return (
    <header className="flex sticky top-0 z-50 bg-white h-12 shrink-0 items-center border-b">
      <div className="flex flex-1 items-center gap-2 px-3">
        <SidebarTrigger />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block text-[15px]">
              {pageHeading ? (
                <BreadcrumbLink asChild>
                  <Link to={`/dashboard`}>Dashboard</Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage className="line-clamp-1">
                  Dashboard
                </BreadcrumbPage>
              )}
            </BreadcrumbItem>

            {pageHeading && (
              <>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem className="text-[15px]">
                  <BreadcrumbPage className="line-clamp-1">
                    {pageHeading}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>
  );
};

export default Header;
