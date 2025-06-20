import Logo from "@/components/logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuthContext } from "@/context/auth-provider";
import { EllipsisIcon, Loader, LogOut } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Separator } from "../ui/separator";
import LogoutDialog from "./logout-dialog";
import { NavMain } from "./nav-main";

const Asidebar = () => {
  const { isLoading, user } = useAuthContext();

  const { open } = useSidebar();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Sidebar collapsible="icon" variant="inset" className="bg-background border-r border-border">
        <SidebarHeader className="!py-0 bg-background border-b border-border">
          <div className="flex h-[50px] items-center justify-start w-full px-1 bg-background">
            <Logo url={`/dashboard`} />
            {open && (
              <Link
                to={`/dashboard`}
                className="hidden md:flex ml-2 items-center gap-2 self-center font-medium text-foreground"
              >
                CMSys <small className="text-xs text-muted-foreground">v1.0</small>
              </Link>
            )}
          </div>
        </SidebarHeader>
        <SidebarContent className="!mt-0 bg-background">
          <SidebarGroup className="!py-0">
            <SidebarGroupContent className="bg-background">
              <Separator />
              <NavMain />
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="bg-background border-t border-border">
          <SidebarMenu>
            <SidebarMenuItem>
              {isLoading ? (
                <Loader
                  size="24px"
                  className="place-self-center self-center animate-spin"
                />
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton
                      size="lg"
                      className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                    >
                      <Avatar className="h-8 w-8 rounded-full">
                        <AvatarImage src={user?.profilePicture || ""} />
                        <AvatarFallback className="rounded-full border border-gray-500">
                          {user?.name?.split(" ")?.[0]?.charAt(0)}
                          {user?.name?.split(" ")?.[1]?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">
                          {user?.name}
                        </span>
                        <span className="truncate text-xs">{user?.email}</span>
                      </div>
                      <EllipsisIcon className="ml-auto size-4" />
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                    side={"bottom"}
                    align="start"
                    sideOffset={4}
                  >
                    <DropdownMenuGroup></DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setIsOpen(true)}>
                      <LogOut />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      <LogoutDialog isOpen={isOpen} setIsOpen={setIsOpen} />
    </>
  );
};

export default Asidebar;
