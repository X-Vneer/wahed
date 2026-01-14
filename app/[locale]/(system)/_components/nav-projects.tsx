"use client"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useTranslations } from "next-intl"
import { Link } from "@/lib/i18n/navigation"
import { useProjects } from "@/hooks/use-projects"
import { Spinner } from "@/components/ui/spinner"

export function NavProjects() {
  const t = useTranslations("sidebar")
  const { isMobile, setOpenMobile } = useSidebar()
  const { data, isLoading } = useProjects(
    { archived: "false" },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  )

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  // Filter out archived projects and limit to active ones
  const activeProjects =
    data?.projects.filter((project) => !project.archivedAt) || []

  if (isLoading) {
    return (
      <SidebarGroup>
        <SidebarGroupLabel>{t("projects")}</SidebarGroupLabel>
        <div className="flex items-center justify-center p-4">
          <Spinner className="size-4" />
        </div>
      </SidebarGroup>
    )
  }

  if (activeProjects.length === 0) {
    return null
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{t("projects")}</SidebarGroupLabel>
      <SidebarMenu>
        {activeProjects.map((project) => (
          <SidebarMenuItem key={project.id}>
            <SidebarMenuButton
              render={(props) => (
                <Link
                  href={`/projects/${project.id}`}
                  onClick={handleLinkClick}
                  {...props}
                >
                  <Avatar className="size-10 shrink-0">
                    {project.image && (
                      <AvatarImage src={project.image} alt={project.name} />
                    )}
                    <AvatarFallback className="text-sm">
                      {project.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="line-clamp-1 font-medium">
                    {project.name}
                  </span>
                </Link>
              )}
            />
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
