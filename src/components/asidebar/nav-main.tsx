import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
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
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

type ItemType = {
  title: string;
  url: string;
  icon: LucideIcon;
  children?: ItemType[];
};

export function NavMain() {
  const { hasPermission } = useAuthContext();

  const canManageSettings = hasPermission(
    Permissions.MANAGE_WORKSPACE_SETTINGS
  );

  const location = useLocation();

  const pathname = location.pathname;

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
        {items.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton isActive={item.url === pathname} asChild>
              <Link to={item.url} className="!text-[15px]">
                <item.icon />
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
