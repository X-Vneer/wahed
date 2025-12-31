"use client"

type IconDefinition = React.ElementType

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavProjects({
  projects,
}: {
  projects: {
    name: string
    url: string
    icon: IconDefinition
  }[]
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Projects</SidebarGroupLabel>
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
