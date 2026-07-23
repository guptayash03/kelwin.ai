"use client";

import { useRouter } from "next/navigation";
import { ChevronsUpDown, LogOut, Settings, User } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { signOut } from "@/lib/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";

export function NavUser() {
  const router = useRouter();
  const { user } = useAuth();
  const { isMobile } = useSidebar();

  if (!user) return null;

  const initials = (user.displayName || user.email || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  async function handleSignOut() {
    await signOut();
    router.push("/sign-in");
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="data-open:bg-sidebar-accent data-open:text-sidebar-accent-foreground"
              />
            }
          >
            <Avatar className="size-8 rounded-lg">
              {user.photoURL && <AvatarImage src={user.photoURL} />}
              <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">
                {user.displayName || "User"}
              </span>
              <span className="truncate text-xs text-muted-foreground">
                {user.email}
              </span>
            </div>
            <ChevronsUpDown className="ml-auto size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel>
              <div className="flex items-center gap-2 py-1">
                <Avatar className="size-8 rounded-lg">
                  {user.photoURL && <AvatarImage src={user.photoURL} />}
                  <AvatarFallback className="rounded-lg">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="grid text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    {user.displayName || "User"}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                onSelect={() => router.push("/dashboard/profile")}
              >
                <User />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => router.push("/dashboard/settings")}
              >
                <Settings />
                Settings
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={handleSignOut}>
              <LogOut />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
