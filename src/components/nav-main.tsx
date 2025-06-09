import { type Icon } from "@tabler/icons-react"
import { NavLink, useLocation } from "react-router-dom"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Divide } from "lucide-react"
import { useCallback } from "react"

// Define proper TypeScript interfaces
interface NavItem {
  title: string
  url: string
  icon: Icon | LucideIcon
  items?: NavSubItem[]
}

interface NavSubItem {
  title: string
  url: string
}

interface NavMainProps {
  items: NavItem[]
  isLoading?: boolean
}

export function NavMain({
  items,
  isLoading = false,
}: NavMainProps) {
  const location = useLocation();
  // console.log("location ====", location.pathname);

  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  console.log("isActive ====", isActive("/dashboard"));

  // Loading state
  if (isLoading) {
    return (
      <SidebarGroup>
        <SidebarGroupContent className="flex flex-col gap-2">
          <Divide className="h-px w-full bg-border" />
          <SidebarMenu>
            {[1, 2, 3].map((i) => (
              <SidebarMenuItem key={i}>
                <SidebarMenuButton className="animate-pulse">
                  <div className="h-4 w-4 bg-muted rounded" />
                  <div className="h-4 w-24 bg-muted rounded" />
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    )
  }

  // Handle empty items
  if (!items?.length) {
    return (
      <SidebarGroup>
        <SidebarGroupContent className="flex flex-col gap-2">
          <Divide className="h-px w-full bg-border" />
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton className="text-muted-foreground">
                No navigation items available
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    )
  }

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <Divide className="h-px w-full bg-border" />
        <SidebarMenu>
          {items.map((item) => {
            const isDashboard = item.url === "/dashboard";
            console.log("item ====", item.url, isActive(item.url));
            return (
              <NavLink
                key={item.title}
                to={item.url}
                end={isDashboard ? true : undefined}
                className={({ isActive: linkIsActive }) => cn(
                  "block rounded-md transition-colors",
                  (linkIsActive || isActive(item.url))
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-primary/10 hover:text-primary"
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
                    {item.icon && <item.icon className="size-4" aria-hidden="true" />}
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </NavLink>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}