"use client"

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useUserData } from "@/hooks/use-user-data"
import { LogOut, User } from "lucide-react"
import { useRouter } from "@/lib/i18n/navigation"
import { useTranslations } from "next-intl"
import axios from "axios"

export function NavUser() {
  const { data: user, isLoading, error } = useUserData()
  const router = useRouter()
  const t = useTranslations("sidebar")

  const handleLogout = async () => {
    try {
      await axios.post("/api/auth/logout", {}, { withCredentials: true })
      router.refresh()
      router.push("/auth/login")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  // Show loading state
  if (isLoading) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" disabled>
            <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
              <User className="size-4" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">{t("loading")}</span>
              <span className="truncate text-xs">{t("loadingSubtitle")}</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  // Show error state or fallback if no user data
  if (error || !user) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" disabled>
            <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
              <User className="size-4" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">{t("user")}</span>
              <span className="truncate text-xs">{t("notAvailable")}</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
            <User className="size-4" />
          </div>
          <div className="grid flex-1 text-start text-sm leading-tight">
            <span className="truncate font-semibold">
              {user.name || t("user")}
            </span>
            <span className="truncate text-xs">{user.email || ""}</span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton
          variant="outline"
          onClick={handleLogout}
          className="border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive hover:border-destructive focus-visible:ring-destructive/20"
        >
          <LogOut className="size-4" />
          <span>{t("logout")}</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
