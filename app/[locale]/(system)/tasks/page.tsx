"use client"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Spinner } from "@/components/ui/spinner"
import { useProjects } from "@/hooks/use-projects"
import { useUserData } from "@/hooks/use-user-data"
import { UserRole } from "@/lib/generated/prisma/enums"
import { useTranslations } from "next-intl"
import { GeneralTasksCard } from "./_components/general-tasks-card"
import { TaskProjectCard } from "./_components/task-project-card"

const TasksPage = () => {
  const t = useTranslations()
  const { data: user } = useUserData()
  const isAdmin = user?.role === UserRole.ADMIN
  const { data, isLoading, error } = useProjects()

  const projects = data?.projects ?? []
  const tProjects = useTranslations("projects")

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">{t("sidebar.tasks")}</h1>
        {isAdmin && (
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">{t("sidebar.home")}</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{t("sidebar.tasks")}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        )}
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Spinner className="size-8" />
        </div>
      )}

      {error && (
        <div className="flex items-center justify-center py-12">
          <p className="text-destructive text-sm">
            {tProjects("errors.failedToLoad") || "Failed to load projects"}
          </p>
        </div>
      )}

      {!isLoading && !error && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <TaskProjectCard key={project.id} project={project} />
          ))}
          <GeneralTasksCard />
        </div>
      )}
    </div>
  )
}

export default TasksPage
