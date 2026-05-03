/* eslint-disable @next/next/no-img-element */
"use client"

import {
  Calendar,
  CheckSquare,
  Folder,
  Globe,
  Home,
  List,
  MessageSquare,
  Settings,
  SlidersHorizontal,
  Users,
  Users2,
} from "lucide-react"
import * as React from "react"

import { logoSquare } from "@/assets"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { useSystemBranding } from "@/contexts/system-branding-context"
import { usePathname } from "@/lib/i18n/navigation"
import { useLocale, useTranslations } from "next-intl"
import { NavMain } from "./nav-main"
import { NavProjects } from "./nav-projects"
import { NavUser } from "./nav-user"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const locale = useLocale()
  const t = useTranslations("sidebar")
  const pathname = usePathname()
  const isRtl = locale === "ar"
  const branding = useSystemBranding()
  const sidebarLogo = branding.logoSquareUrl
  const sidebarLabel = branding.systemName || t("companyName")

  const data = {
    navMain: [
      {
        title: t("home"),
        url: "/",
        icon: Home,
        isActive: pathname === "/",
      },
      {
        title: t("projects"),
        url: "#",
        icon: Settings,
        items: [
          {
            title: t("projectsMain"),
            url: "/projects",
          },
          {
            title: t("projectsArchive"),
            url: "/projects/archive",
          },
          {
            title: t("projectsAdd"),
            url: "/projects/add",
          },
        ],
        isActive: pathname?.startsWith("/projects") ?? false,
      },
      {
        title: t("tasks"),
        url: "#",
        icon: CheckSquare,
        items: [
          {
            title: t("tasksMain"),
            url: "/tasks",
          },
          {
            title: t("tasksTemplates"),
            url: "/tasks/templates",
          },
        ],
        isActive: pathname?.startsWith("/tasks") ?? false,
      },
      {
        title: t("calendar"),
        url: "/calendar",
        icon: Calendar,
        isActive: pathname === "/calendar",
      },
      {
        title: t("lists"),
        url: "#",
        icon: List,
        items: [
          {
            title: t("listsProjectTypes"),
            url: "/lists/project-categories",
          },
          {
            title: t("listsRegions"),
            url: "/lists/regions",
          },
          {
            title: t("listsCities"),
            url: "/lists/cities",
          },
          {
            title: t("listsTaskStatuses"),
            url: "/lists/task-status",
          },
          {
            title: t("listsProjectStatuses"),
            url: "/lists/project-status",
          },
          {
            title: t("listsTaskTypes"),
            url: "/lists/task-category",
          },
        ],
        isActive: pathname?.startsWith("/lists") ?? false,
      },
      {
        title: t("usersPermissions"),
        url: "/employees",
        icon: Users,
        isActive: pathname === "/employees",
      },
      {
        title: t("staff-page"),
        url: "#",
        icon: Users2,
        items: [
          {
            title: t("staff-settings"),
            url: "/staff/settings",
          },
          {
            title: t("staff-banners"),
            url: "/staff/banners",
          },
          {
            title: t("staff-websites"),
            url: "/staff/websites",
          },
        ],
        isActive: false,
      },
      {
        title: t("files"),
        url: "/files",
        icon: Folder,
        isActive: pathname === "/files",
      },
      {
        title: t("websiteContacts"),
        url: "/contacts",
        icon: MessageSquare,
        isActive: pathname?.startsWith("/contacts") ?? false,
      },
      {
        title: t("website"),
        url: "/website",
        icon: Globe,
        items: [],
        isActive: pathname === "/website",
      },
      {
        title: t("systemSettings"),
        url: "/system-settings",
        icon: SlidersHorizontal,
        isActive: pathname?.startsWith("/system-settings") ?? false,
      },
    ],
  }
  const isDarkSidebar = branding.sidebarVariant === "dark"
  const darkSidebarStyle = {
    "--sidebar": "oklch(0.205 0 0)",
    "--sidebar-foreground": "oklch(0.985 0 0)",
    "--sidebar-primary": "oklch(0.488 0.243 264.376)",
    "--sidebar-primary-foreground": "oklch(0.985 0 0)",
    "--sidebar-accent": "oklch(0.269 0 0)",
    "--sidebar-accent-foreground": "oklch(0.985 0 0)",
    "--sidebar-border": "oklch(1 0 0 / 10%)",
    "--sidebar-ring": "oklch(0.556 0 0)",
  } as React.CSSProperties

  const sidebarNode = (
    <Sidebar
      dir={isRtl ? "rtl" : "ltr"}
      side={isRtl ? "right" : "left"}
      {...props}
    >
      <SidebarHeader>
        <div className="flex items-center gap-2">
          {sidebarLogo ? (
            <img
              src={sidebarLogo}
              alt={sidebarLabel}
              className="size-11 rounded-md object-contain"
            />
          ) : (
            <img
              src={logoSquare.src}
              alt={sidebarLabel}
              className="size-11 rounded-md"
            />
          )}
          <div>
            <p className="leading-none font-bold">{sidebarLabel}</p>
            <span className="text-sidebar-foreground/60 text-sm">
              {sidebarLabel}
            </span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )

  if (isDarkSidebar) {
    return <div style={darkSidebarStyle}>{sidebarNode}</div>
  }
  return sidebarNode
}
