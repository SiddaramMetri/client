import {
  IconInnerShadowTop,
  IconChevronDown
} from "@tabler/icons-react";
import * as React from "react";
import { NavLink } from "react-router-dom";
import { useState } from "react";

// import { NavDocuments } from "@/components/nav-documents";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";

import { cn } from "@/lib/utils";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  items?: any; 
}

export function AppSidebar({ items, ...props }: AppSidebarProps) {
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);

  const toggleMenu = (title: string) => {
    setExpandedMenu(expandedMenu === title ? null : title);
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <NavLink to="/dashboard" className="flex items-center gap-2">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">
                  CMSys <small className="text-xs font-normal">v1.0.0</small>
                </span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain 
          items={items.navMain} 
          isLoading={false}
        />
        
        {/* Cloud Navigation */}
        <SidebarGroup className="mt-6">
          <SidebarGroupLabel>Quick Access</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.navClouds.map((group: any) => (
                <React.Fragment key={group.title}>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      className={cn(
                        "group-data-[collapsible=icon]:justify-center",
                        group.isActive && "bg-primary/10 text-primary"
                      )}
                      onClick={() => toggleMenu(group.title)}
                    >
                      <NavLink to={group.items && group.items.length > 0 ? "#" : group.url}
                        className={({ isActive }) =>
                          cn(
                            "flex items-center gap-2 text-sm",
                            isActive && "text-primary",
                            group.items && group.items.length > 0 && "cursor-pointer"
                          )
                        }
                        >
                      <div className="flex items-center gap-2 w-full">
                        <group.icon className="size-4" />
                        <span>{group.title}</span>
                        {group.items && group.items.length > 0 && <IconChevronDown 
                          className={cn(
                            "ml-auto size-4 opacity-50 transition-transform",
                            expandedMenu === group.title && "rotate-180"
                          )} 
                        />}
                      </div>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  
                  {/* Child Items */}
                  {group.items && group.items.length > 0 && expandedMenu === group.title && (
                    <div className="pl-6 space-y-1">
                      {group.items.map((item:any) => (
                        <SidebarMenuItem key={item.title}>
                          <SidebarMenuButton
                            asChild
                            className="group-data-[collapsible=icon]:justify-center"
                          >
                            <NavLink 
                              to={item.url}
                              className={({ isActive }) =>
                                cn(
                                  "flex items-center gap-2 text-sm",
                                  isActive && "text-primary"
                                )
                              }
                            >
                              {item.title}
                            </NavLink>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </div>
                  )}
                </React.Fragment>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

      </SidebarContent>
      <SidebarFooter>
        <NavSecondary items={items.navSecondary} />
        <NavUser user={items.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
