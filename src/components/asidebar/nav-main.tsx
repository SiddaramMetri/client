import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { Permissions } from "@/constant";
import { useAuthContext } from "@/context/auth-provider";
import {
  CheckCircle,
  GraduationCap,
  LayoutDashboard,
  LucideIcon,
  Settings,
  Users,
  Calendar,
  BarChart3,
  FileText,
  ChevronRight,
  Database,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

type ItemType = {
  title: string;
  url: string;
  icon: LucideIcon;
  items?: ItemType[];
};

export function NavMain() {
  const { hasPermission } = useAuthContext();
  const [openItems, setOpenItems] = useState<string[]>([]);

  const canManageSettings = hasPermission(
    Permissions.MANAGE_WORKSPACE_SETTINGS
  );

  const location = useLocation();
  const pathname = location.pathname;

  // Auto-expand menus based on current route
  useEffect(() => {
    // Check if we're on an attendance page and auto-expand if needed
    if (pathname.startsWith('/dashboard/attendance') && !openItems.includes('Attendance')) {
      setOpenItems(prev => [...prev, 'Attendance']);
    }
    
    // Add similar logic for other expandable menus if needed in the future
  }, [pathname]); // Only depend on pathname, not openItems to avoid loops

  const items: ItemType[] = [
    {
      title: "Dashboard",
      url: `/dashboard`,
      icon: LayoutDashboard,
    },
    {
      title: "Users",
      url: `/dashboard/users`,
      icon: Users,
    },
    {
      title: "Classes",
      url: `/dashboard/classes`,
      icon: GraduationCap,
    },
    {
      title: "Students",
      url: `/dashboard/students`,
      icon: Users,
    },
    {
      title: "Attendance",
      url: `/dashboard/attendance`,
      icon: Database,
      items: [
        {
          title: "Dashboard",
          url: `/dashboard/attendance`,
          icon: BarChart3,
        },
        {
          title: "Daily Attendance",
          url: `/dashboard/attendance/daily`,
          icon: Calendar,
        },
        {
          title: "Monthly Summary",
          url: `/dashboard/attendance/monthly`,
          icon: BarChart3,
        },
        {
          title: "Audit Trail",
          url: `/dashboard/attendance/audit-trail`,
          icon: Calendar,
        },
        {
          title: "Reports",
          url: `/dashboard/attendance/reports`,
          icon: FileText,
        },
        {
          title: "Configuration",
          url: `/dashboard/attendance/config`,
          icon: Settings,
        },
      ],
    },
    {
      title: "Redis Test",
      url: `/dashboard/redis-test`,
      icon: Users,
    },
    {
      title: "Audit Logs",
      url: `/dashboard/audit-logs`,
      icon: Users,
    },
    {
      title: "Tasks",
      url: `/dashboard/tasks`,
      icon: CheckCircle,
    },
    {
      title: "User Roles",
      url: `/dashboard/user-roles`,
      icon: Users,
    },
    {
      title: "Permissions",
      url: `/dashboard/permissions`,
      icon: Users,
    },
    {
      title: "Members",
      url: `/dashboard/members`,
      icon: Users,
    },

    ...(canManageSettings
      ? [
          {
            title: "Settings",
            url: `/dashboard/settings`,
            icon: Settings,
          },
        ]
      : []),
  ];
  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => {
          // Better active state logic
          const hasActiveSubItem = item.items && item.items.some(subItem => pathname === subItem.url);
          const isParentActive = pathname === item.url;
          const isActive = isParentActive || hasActiveSubItem;
          
          // Smart opening logic
          const shouldBeOpen = openItems.includes(item.title) || hasActiveSubItem;
          
          if (item.items && item.items.length > 0) {
            return (
              <Collapsible
                key={item.title}
                open={shouldBeOpen}
                onOpenChange={(open: boolean) => {
                  if (open) {
                    // Add to open items if not already there
                    setOpenItems(prev => 
                      prev.includes(item.title) ? prev : [...prev, item.title]
                    );
                  } else {
                    // Only close if user is not on an active sub-item
                    if (!hasActiveSubItem) {
                      setOpenItems(prev => prev.filter(t => t !== item.title));
                    }
                  }
                }}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton 
                      className={cn(
                        "!text-[15px] group/button transition-all duration-200",
                        isActive && "bg-primary/10 text-primary font-medium",
                        "hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      <item.icon className={cn(
                        "transition-colors duration-200",
                        isActive ? "text-primary" : "text-muted-foreground"
                      )} />
                      <span>{item.title}</span>
                      <ChevronRight className={cn(
                        "ml-auto h-4 w-4 transition-all duration-200 text-muted-foreground group-hover/button:text-accent-foreground", 
                        shouldBeOpen && "rotate-90",
                        isActive && "text-primary"
                      )} />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up overflow-hidden transition-all">
                    <SidebarMenuSub className="ml-4 border-l-2 border-primary/20 pl-3 pt-2 pb-1 space-y-1">
                      {item.items.map((subItem) => {
                        const isSubActive = pathname === subItem.url;
                        return (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton 
                              asChild 
                              className={cn(
                                "transition-all duration-200 text-[13px] py-2 px-3 rounded-md relative",
                                "hover:bg-accent/50 hover:text-accent-foreground",
                                isSubActive && "bg-primary/10 text-primary font-medium border border-primary/20 shadow-sm",
                                !isSubActive && "text-muted-foreground"
                              )}
                            >
                              <Link to={subItem.url} className="flex items-center gap-3 w-full relative">
                                {isSubActive && (
                                  <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-primary rounded-full" />
                                )}
                                <subItem.icon className={cn(
                                  "w-4 h-4 transition-colors duration-200 flex-shrink-0",
                                  isSubActive ? "text-primary" : "text-muted-foreground"
                                )} />
                                <span className="truncate font-medium">{subItem.title}</span>
                                {isSubActive && (
                                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                )}
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        );
                      })}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            );
          }

          // Regular menu items without submenus
          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton 
                asChild
                className={cn(
                  "transition-all duration-200 !text-[15px]",
                  pathname === item.url && "bg-primary/10 text-primary font-medium"
                )}
              >
                <Link to={item.url} className="flex items-center gap-2">
                  <item.icon className={cn(
                    "transition-colors duration-200",
                    pathname === item.url ? "text-primary" : "text-muted-foreground"
                  )} />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
