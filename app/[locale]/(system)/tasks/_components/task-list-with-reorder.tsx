"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { useDeleteTask, useReorderTasks } from "@/hooks/use-project-tasks"
import type { Task } from "@/prisma/tasks"
import { Edit, GripVertical, Trash2 } from "lucide-react"
import { Reorder, useDragControls } from "motion/react"
import { useTranslations } from "next-intl"
import { parseAsBoolean, useQueryState } from "nuqs"
import { useMemo, useRef, useState } from "react"
import { TaskCard } from "./task-card"
import { TaskDialog } from "./task-dialog"

type TaskListWithReorderProps = {
  tasks: Task[]
  projectId: string
}

type ReorderTaskItemProps = {
  task: Task
  dragEnabled: boolean
  onDragEnd: () => void
  isEditMode: boolean
  onEditClick: (task: Task) => void
  onDeleteClick: (task: Task) => void
}

function ReorderTaskItem({
  task,
  dragEnabled,
  onDragEnd,
  isEditMode,
  onEditClick,
  onDeleteClick,
}: ReorderTaskItemProps) {
  const t = useTranslations("tasks")
  const controls = useDragControls()
  const handlePointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragEnabled) return
    event.preventDefault()
    controls.start(event)
  }

  return (
    <Reorder.Item
      value={task.id}
      drag="y"
      dragListener={false}
      dragControls={controls}
      className="flex items-stretch gap-2"
      onDragEnd={onDragEnd}
    >
      {isEditMode && (
        <div className="flex flex-col items-center gap-1">
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground focus-visible:ring-ring flex cursor-grab touch-none items-center rounded p-1 transition-colors focus-visible:ring-2 focus-visible:outline-none active:cursor-grabbing"
            aria-label="Drag to reorder"
            onPointerDown={handlePointerDown}
          >
            <GripVertical className="size-5" />
          </button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onEditClick(task)}
            aria-label={t("edit")}
          >
            <Edit className="size-4" />
            <span className="sr-only">Edit</span>
          </Button>

          <Button
            type="button"
            variant="ghost"
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
            size="icon"
            onClick={() => onDeleteClick(task)}
            aria-label={t("deleteConfirm.delete")}
          >
            <Trash2 className="size-4" />
            <span className="sr-only">Delete</span>
          </Button>
        </div>
      )}
      <div className="min-w-0 flex-1">
        <TaskCard task={task} />
      </div>
    </Reorder.Item>
  )
}

export function TaskListWithReorder({
  tasks: serverTasks,
  projectId,
}: TaskListWithReorderProps) {
  const t = useTranslations("tasks")
  const [isEditMode] = useQueryState(
    "editMode",
    parseAsBoolean.withDefault(false)
  )
  const [orderedIds, setOrderedIds] = useState<string[] | null>(null)
  const orderedIdsRef = useRef<string[] | null>(null)
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null)
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null)
  const reorderMutation = useReorderTasks(projectId)
  const deleteMutation = useDeleteTask(projectId)

  // Map tasks by id for quick lookup
  const tasksById = useMemo(() => {
    const map: Record<string, Task> = {}
    for (const task of serverTasks) {
      map[task.id] = task
    }
    return map
  }, [serverTasks])

  const defaultIds = useMemo(
    () => serverTasks.map((task) => task.id),
    [serverTasks]
  )

  const ids = orderedIds ?? defaultIds
  const tasks = ids.map((id) => tasksById[id]).filter((t): t is Task => !!t)

  const handleDragEnd = () => {
    if (!orderedIdsRef.current || !projectId) return
    reorderMutation.mutate(orderedIdsRef.current)
  }

  const handleEditClick = (task: Task) => setTaskToEdit(task)
  const handleDeleteClick = (task: Task) => setTaskToDelete(task)

  const handleConfirmDelete = () => {
    if (!taskToDelete) return
    const taskId = taskToDelete.id
    setOrderedIds((prev) => (prev ? prev.filter((id) => id !== taskId) : null))
    if (orderedIdsRef.current) {
      orderedIdsRef.current = orderedIdsRef.current.filter(
        (id) => id !== taskId
      )
    }
    deleteMutation.mutate(taskId)
    setTaskToDelete(null)
  }

  if (tasks.length === 0) {
    return (
      <div className="flex justify-center py-12">
        <p className="text-muted-foreground text-sm">{t("noTasksInProject")}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <Reorder.Group
        as="ul"
        axis="y"
        values={ids}
        onReorder={(newOrder) => {
          setOrderedIds(newOrder)
          orderedIdsRef.current = newOrder
        }}
        className="flex flex-col gap-3"
      >
        {tasks.map((task) => (
          <ReorderTaskItem
            key={task.id}
            task={task}
            dragEnabled={isEditMode}
            onDragEnd={handleDragEnd}
            isEditMode={isEditMode}
            onEditClick={handleEditClick}
            onDeleteClick={handleDeleteClick}
          />
        ))}
      </Reorder.Group>

      <AlertDialog
        open={!!taskToDelete}
        onOpenChange={(open) => !open && setTaskToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteConfirm.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteConfirm.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setTaskToDelete(null)}>
              {t("deleteConfirm.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive hover:bg-destructive/90 text-white"
            >
              {t("deleteConfirm.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <TaskDialog
        open={!!taskToEdit}
        onOpenChange={(open) => !open && setTaskToEdit(null)}
        projectId={projectId}
        task={taskToEdit}
      />
    </div>
  )
}
