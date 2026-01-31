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
import {
  DndContext,
  MouseSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import { useProjectTasks, useReorderTasks } from "@/hooks/use-project-tasks"
import { useParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { useCallback, useState } from "react"
import { SortableTaskItem } from "../_components/sortable-task-item"
import type { Task } from "@/prisma/tasks"

function reorderTasks(tasks: Task[], activeId: string, overId: string): Task[] {
  const ids = tasks.map((t) => t.id)
  const activeIndex = ids.indexOf(activeId)
  const overIndex = ids.indexOf(overId)
  if (activeIndex === -1 || overIndex === -1 || activeIndex === overIndex) {
    return tasks
  }
  const newIds = [...ids]
  newIds.splice(activeIndex, 1)
  newIds.splice(overIndex, 0, activeId)
  return newIds
    .map((id) => tasks.find((t) => t.id === id))
    .filter((t): t is Task => t != null)
}

const TasksProjectPage = () => {
  const t = useTranslations()
  const tTasks = useTranslations("tasks")
  const params = useParams()
  const projectId = (params?.["project-id"] as string) ?? null

  const { data, isLoading, error } = useProjectTasks(projectId)
  const reorderMutation = useReorderTasks(projectId)

  const [optimisticTasks, setOptimisticTasks] = useState<Task[] | null>(null)
  const tasks = optimisticTasks ?? data?.tasks ?? []
  const projectName = data?.project?.name

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    }),
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      if (!over || active.id === over.id) {
        setOptimisticTasks(null)
        return
      }
      const currentTasks = optimisticTasks ?? data?.tasks ?? []
      const newOrder = reorderTasks(
        currentTasks,
        String(active.id),
        String(over.id)
      )
      setOptimisticTasks(newOrder)
      reorderMutation.mutate(
        newOrder.map((task) => task.id),
        {
          onSettled: () => setOptimisticTasks(null),
        }
      )
    },
    [data?.tasks, optimisticTasks, reorderMutation]
  )

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
        <>
          {tasks.length > 0 ? (
            <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
              <ul className="flex flex-col gap-3">
                {tasks.map((task) => (
                  <li key={task.id}>
                    <SortableTaskItem task={task} />
                  </li>
                ))}
              </ul>
            </DndContext>
          ) : (
            <div className="flex justify-center py-12">
              <p className="text-muted-foreground text-sm">
                {tTasks("noTasksInProject")}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default TasksProjectPage
