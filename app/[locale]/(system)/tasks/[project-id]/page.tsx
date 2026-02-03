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
import { Spinner } from "@/components/ui/spinner"
import { useProjectTasks } from "@/hooks/use-project-tasks"
import { useParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { TaskListWithReorder } from "../_components/task-list-with-reorder"
import { ChevronDown, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Link } from "@/lib/i18n/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { TaskDialog } from "../_components/task-dialog"

const TasksProjectPage = () => {
  const t = useTranslations()
  const params = useParams()
  const projectId = (params?.["project-id"] as string) ?? null
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false)

  const { data, isLoading, error } = useProjectTasks(projectId)
  const tasks = data?.tasks ?? []
  const projectName = data?.project?.name

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
              <DropdownMenuItem className="cursor-pointer">
                <Link href="/tasks/import-from-system" className="flex w-full">
                  {t("tasks.addFromSystem")}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => setIsTaskDialogOpen(true)}
              >
                {t("tasks.addNew")}
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
        <TaskListWithReorder tasks={tasks} projectId={projectId} />
      )}

      <TaskDialog
        open={isTaskDialogOpen}
        onOpenChange={setIsTaskDialogOpen}
        projectId={projectId}
      />
    </div>
  )
}

export default TasksProjectPage
