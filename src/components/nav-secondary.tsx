import * as React from "react"
import { type Icon } from "@tabler/icons-react"
import { LucideIcon } from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Divide } from "lucide-react"
import { cn } from "@/lib/utils"

type NavItem = {
  title: string
  url: string
  icon: Icon | LucideIcon
}

export function NavSecondary({
  items,
}: {
  items: NavItem[]
}) {
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
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <Divide className="h-px w-full bg-border" />
        <SidebarMenu>
          {items.map((item) => (
            <NavLink 
              key={item.title} 
              to={item.url} 
              className={({ isActive }) => cn(
                "block rounded-md transition-colors",
                isActive 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
              )}
            >
              <SidebarMenuItem>
                <SidebarMenuButton 
                  tooltip={item.title}
                  className={cn(
                    "transition-colors",
                    isActive(item.url) && "bg-primary/10 text-primary"
                  )}
                >
                  {item.icon && <item.icon className="size-4" />}
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </NavLink>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
