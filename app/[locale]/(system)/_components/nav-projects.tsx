"use client"

type IconDefinition = React.ElementType

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useTranslations } from "next-intl"

export function NavProjects({
  projects,
}: {
  projects: {
    name: string
    url: string
    icon: IconDefinition
  }[]
}) {
  const t = useTranslations("sidebar")
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{t("projects")}</SidebarGroupLabel>
      <SidebarMenu>
        {projects.map((project) => (
          <SidebarMenuItem key={project.name}>
            <SidebarMenuButton
              render={(props) => (
                <a href={project.url} {...props}>
                  <project.icon className="size-4" />
                  <span>{project.name}</span>
                </a>
              )}
            />
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
