;

import {
  IconDots,
  IconFolder,
  IconShare3,
  IconTrash,
  type Icon,
} from "@tabler/icons-react";
import { LucideIcon } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

type DocumentItem = {
  name: string;
  url: string;
  icon: Icon | LucideIcon;
};

export function NavDocuments({
  items,
}: {
  items: DocumentItem[];
}) {
  const { isMobile } = useSidebar();
  const pathname = useLocation().pathname;

  const isActive = (path: string) => {
    // Remove trailing slash for consistent comparison
    const currentPath = pathname.replace(/\/$/, '');
    const itemPath = path.replace(/\/$/, '');

    // For dashboard, only match exact path
    if (itemPath === '/dashboard') {
      return currentPath === '/dashboard';
    }

    // For other routes, match exact path or direct child routes
    const pathSegments = itemPath.split('/');
    const currentSegments = currentPath.split('/');
    
    // Must have the same number of segments or be a direct child
    return currentPath === itemPath || 
           (currentPath.startsWith(itemPath) && 
            currentSegments.length === pathSegments.length + 1);
  };

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel className="text-xs font-medium text-muted-foreground">Documents</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton asChild>
              <NavLink 
                to={item.url} 
                className={({ isActive }) => cn(
                  "flex items-center gap-2 transition-colors",
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
                )}
              >
                <item.icon className="size-4" />
                <span>{item.name}</span>
              </NavLink>
            </SidebarMenuButton>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuAction
                  showOnHover
                  className="data-[state=open]:bg-accent rounded-sm"
                >
                  <IconDots className="size-4" />
                  <span className="sr-only">More</span>
                </SidebarMenuAction>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-24 rounded-lg"
                side={isMobile ? "bottom" : "right"}
                align={isMobile ? "end" : "start"}
              >
                <DropdownMenuItem>
                  <IconFolder className="mr-2 size-4" />
                  <span>Open</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <IconShare3 className="mr-2 size-4" />
                  <span>Share</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive">
                  <IconTrash className="mr-2 size-4" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
