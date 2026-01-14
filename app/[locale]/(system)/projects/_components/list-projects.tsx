"use client"

import { Spinner } from "@/components/ui/spinner"
import { useProjects } from "@/hooks/use-projects"
import { useTranslations } from "next-intl"
import ProjectCard from "./project-card"
import { Card, CardContent } from "@/components/ui/card"
import { useUserData } from "@/hooks/use-user-data"
import { UserRole } from "@/lib/generated/prisma/enums"

type ListProjectsProps = {
  archived?: boolean
}

export function ListProjects({ archived }: ListProjectsProps = {}) {
  const t = useTranslations("projects")
  const { data, isLoading, error } = useProjects(
    archived ? { archived: "true" } : undefined
  )
  const { data: user } = useUserData()
  const isAdmin = user?.role === UserRole.ADMIN

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner className="size-8" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-destructive text-sm">
          {t("errors.failedToLoad") || "Failed to load projects"}
        </p>
      </div>
    )
  }

  const projects = data?.projects || []
  const totalProjects = (data?.total || 0) + (data?.archived || 0)
  const archivedProjects = data?.archived || 0
  const totalTasks = data?.totalTasks || 0

  return (
    <div className="space-y-4">
      {isAdmin && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Total Tasks Card */}
          <Card className="ring-0">
            <CardContent>
              <div className="flex flex-col gap-2">
                <h3 className="text-muted-foreground font-medium">
                  {t("statusCards.allTasks")}
                </h3>
                <div className="flex items-end gap-2">
                  <p className="text-4xl font-bold">{totalTasks}</p>
                  <p className="text-muted-foreground text-sm">
                    {t("statusCards.task")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Archived Projects Card */}
          <Card className="ring-0">
            <CardContent>
              <div className="flex flex-col gap-2">
                <h3 className="text-muted-foreground font-medium">
                  {t("statusCards.archived")}
                </h3>
                <div className="flex items-end gap-2">
                  <p className="text-4xl font-bold">{archivedProjects}</p>
                  <p className="text-muted-foreground text-sm">
                    {t("statusCards.archivedProject")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Projects Card */}
          <Card className="ring-0">
            <CardContent>
              <div className="flex flex-col gap-2">
                <h3 className="text-muted-foreground font-medium">
                  {t("statusCards.numberOfProjects")}
                </h3>
                <div className="flex items-end gap-2">
                  <p className="text-4xl font-bold">{totalProjects}</p>
                  <p className="text-muted-foreground text-sm">
                    {t("statusCards.project")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      {projects.length > 0 ? (
        projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))
      ) : (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground text-sm">{t("noProjects")}</p>
        </div>
      )}
    </div>
  )
}
