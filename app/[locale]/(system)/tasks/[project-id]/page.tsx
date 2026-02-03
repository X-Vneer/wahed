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
import { useProjectTasks } from "@/hooks/use-project-tasks"
import { useParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { TaskListWithReorder } from "../_components/task-list-with-reorder"

const TasksProjectPage = () => {
  const t = useTranslations()
  const tTasks = useTranslations("tasks")
  const params = useParams()
  const projectId = (params?.["project-id"] as string) ?? null

  const { data, isLoading, error } = useProjectTasks(projectId)
  const tasks = data?.tasks ?? []
  const projectName = data?.project?.name

  if (!projectId) {
    return (
      <div className="flex justify-center py-12">
        <p className="text-muted-foreground text-sm">
          {tTasks("noTasksInProject")}
        </p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">{t("sidebar.tasks")}</h1>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">{t("sidebar.home")}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/tasks">{t("sidebar.tasks")}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{projectName ?? projectId}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Spinner className="size-8" />
        </div>
      )}

      {error && (
        <div className="flex justify-center py-12">
          <p className="text-destructive text-sm">
            {error.message ?? t("errors.internal_server_error")}
          </p>
        </div>
      )}

      {!isLoading && !error && (
        <TaskListWithReorder tasks={tasks} projectId={projectId} />
      )}
    </div>
  )
}

export default TasksProjectPage
