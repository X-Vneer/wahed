"use client"

import { useState } from "react"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Spinner } from "@/components/ui/spinner"
import { useProjectTasks } from "@/hooks/use-project-tasks"
import type { Task } from "@/prisma/tasks"
import { ChevronDown, Plus } from "lucide-react"
import { useTranslations } from "next-intl"
import { useParams } from "next/navigation"
import { parseAsBoolean, parseAsString, useQueryStates } from "nuqs"
import { TaskDialog } from "../_components/task-dialog"
import { TaskFilters } from "../_components/task-filters"
import { TaskListWithReorder } from "../_components/task-list-with-reorder"
import { TaskTemplateImportDialog } from "../_components/task-template-import-dialog"

const TasksProjectPage = () => {
  const t = useTranslations()
  const params = useParams()
  const projectId = (params?.["project-id"] as string) ?? null
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false)
  const [isTemplateImportDialogOpen, setIsTemplateImportDialogOpen] =
    useState(false)

  const [filters] = useQueryStates({
    query: parseAsString.withDefault(""),
    status: parseAsString.withDefault("all"),
    done: parseAsString.withDefault("all"),
    editMode: parseAsBoolean.withDefault(false),
  })

  const { data, isLoading, error } = useProjectTasks(projectId)
  const allTasks = data?.tasks ?? []
  const projectName = data?.project?.name

  const filteredTasks = allTasks.filter((task: Task) => {
    if (filters.status !== "all" && task.status.id !== filters.status)
      return false
    if (filters.done === "done" && !task.doneAt) return false
    if (filters.done === "not_done" && task.doneAt) return false
    if (
      filters.query &&
      !task.title.toLowerCase().includes(filters.query.toLowerCase())
    )
      return false
    return true
  })

  if (!projectId) {
    return (
      <div className="flex justify-center py-12">
        <p className="text-muted-foreground text-sm">
          {t("tasks.noTasksInProject")}
        </p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="flex flex-wrap justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">{t("sidebar.tasks")}</h1>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">{t("sidebar.home")}</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/tasks">
                  {t("sidebar.tasks")}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{projectName ?? projectId}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="flex grow justify-end gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button className="gap-2">
                  <Plus className="size-4" />
                  <span>{t("sidebar.tasksAdd")}</span>
                  <ChevronDown className="size-4" />
                </Button>
              }
            />
            <DropdownMenuContent align="end" sideOffset={4}>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => setIsTaskDialogOpen(true)}
              >
                {t("tasks.addNew")}
              </DropdownMenuItem>

              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => setIsTemplateImportDialogOpen(true)}
              >
                {t("tasks.addFromSystem")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
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
        <>
          {allTasks.length > 0 && <TaskFilters />}
          <TaskListWithReorder tasks={filteredTasks} projectId={projectId} />
        </>
      )}

      <TaskDialog
        open={isTaskDialogOpen}
        onOpenChange={setIsTaskDialogOpen}
        projectId={projectId}
      />

      <TaskTemplateImportDialog
        open={isTemplateImportDialogOpen}
        onOpenChange={setIsTemplateImportDialogOpen}
        projectId={projectId}
      />
    </div>
  )
}

export default TasksProjectPage
