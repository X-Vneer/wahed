"use client"

import {
  Calendar,
  CheckSquare,
  Command,
  Globe,
  Home,
  Layout,
  List,
  Settings,
  Users,
  Waves,
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
import { useLocale, useTranslations } from "next-intl"
import Image from "next/image"
import { NavMain } from "./nav-main"
import { NavProjects } from "./nav-projects"
import { NavUser } from "./nav-user"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const locale = useLocale()
  const t = useTranslations("sidebar")
  const isRtl = locale === "ar"

  const data = {
    teams: [
      {
        name: "Acme Inc",
        logo: Layout,
        plan: "Enterprise",
      },
      {
        name: "Acme Corp.",
        logo: Waves,
        plan: "Startup",
      },
      {
        name: "Evil Corp.",
        logo: Command,
        plan: "Free",
      },
    ],
    navMain: [
      {
        title: t("home"),
        url: "/",
        icon: Home,
        isActive: true,
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
            title: t("tasksArchive"),
            url: "/tasks/archive",
          },
          {
            title: t("tasksAdd"),
            url: "/tasks/add",
          },
        ],
      },
      {
        title: t("calendar"),
        url: "/calendar",
        icon: Calendar,
      },
      {
        title: t("lists"),
        url: "#",
        icon: List,
        items: [
          {
            title: t("listsProjectTypes"),
            url: "/lists/project-types",
          },
          {
            title: t("listsJobTitles"),
            url: "/lists/job-titles",
          },
          {
            title: t("listsCities"),
            url: "/lists/cities",
          },
          {
            title: t("listsTaskStatuses"),
            url: "/lists/task-statuses",
          },
          {
            title: t("listsTaskTypes"),
            url: "/lists/task-types",
          },
        ],
      },
      {
        title: t("usersPermissions"),
        url: "/users-permissions",
        icon: Users,
      },
      {
        title: t("website"),
        url: "#",
        icon: Globe,
        items: [],
      },
    ],
    projects: [],
  }
  return (
    <Sidebar
      dir={isRtl ? "rtl" : "ltr"}
      side={isRtl ? "right" : "left"}
      {...props}
    >
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <Image src={logoSquare} alt="Logo" className="size-11 rounded-md" />
          <div>
            <p className="leading-none font-bold">{t("companyName")}</p>
            <span className="text-sm text-gray-500">{t("companyName")}</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
