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
import { useGeneralTasks } from "@/hooks/use-general-tasks"
import type { Task } from "@/prisma/tasks"
import { useTranslations } from "next-intl"
import { parseAsBoolean, parseAsString, useQueryStates } from "nuqs"
import { TaskCard } from "../_components/task-card"
import { TaskFilters } from "../_components/task-filters"
import { TaskDialog } from "../_components/task-dialog"
import { TaskTemplateImportDialog } from "../_components/task-template-import-dialog"
import { ChevronDown, Plus } from "lucide-react"

const GeneralTasksPage = () => {
  const t = useTranslations()
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false)
  const [isTemplateImportDialogOpen, setIsTemplateImportDialogOpen] =
    useState(false)

  const [filters] = useQueryStates({
    query: parseAsString.withDefault(""),
    status: parseAsString.withDefault("all"),
    done: parseAsString.withDefault("all"),
    editMode: parseAsBoolean.withDefault(false),
  })

  const { data, isLoading, error } = useGeneralTasks()
  const allTasks = data?.tasks ?? []

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
                <BreadcrumbPage>General tasks</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
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
          <div className="flex flex-col gap-3">
            {filteredTasks.length === 0 ? (
              <div className="flex justify-center py-12">
                <p className="text-muted-foreground text-sm">
                  No general tasks found.
                </p>
              </div>
            ) : (
              filteredTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))
            )}
          </div>
        </>
      )}

      <TaskDialog
        open={isTaskDialogOpen}
        onOpenChange={setIsTaskDialogOpen}
        projectId={null}
      />

      <TaskTemplateImportDialog
        open={isTemplateImportDialogOpen}
        onOpenChange={setIsTemplateImportDialogOpen}
        projectId={null}
      />
    </div>
  )
}

export default GeneralTasksPage
