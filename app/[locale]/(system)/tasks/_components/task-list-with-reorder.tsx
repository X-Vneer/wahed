"use client"

import { Button } from "@/components/ui/button"
import { useReorderTasks } from "@/hooks/use-project-tasks"
import { useTranslations } from "next-intl"
import { useMemo, useRef, useState } from "react"
import type { Task } from "@/prisma/tasks"
import { TaskCard } from "./task-card"
import { GripVertical } from "lucide-react"
import { Reorder, useDragControls } from "motion/react"

type TaskListWithReorderProps = {
  tasks: Task[]
  projectId: string
}

type ReorderTaskItemProps = {
  task: Task
  dragEnabled: boolean
  onDragEnd: () => void
  isDragMode: boolean
}

function ReorderTaskItem({
  task,
  dragEnabled,
  onDragEnd,
  isDragMode,
}: ReorderTaskItemProps) {
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
      {isDragMode && (
        <button
          type="button"
          className="text-muted-foreground hover:text-foreground focus-visible:ring-ring flex cursor-grab touch-none items-center rounded p-1 transition-colors focus-visible:ring-2 focus-visible:outline-none active:cursor-grabbing"
          aria-label="Drag to reorder"
          onPointerDown={handlePointerDown}
        >
          <GripVertical className="size-5" />
        </button>
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
  const tTasks = useTranslations("tasks")
  const [isDragMode, setIsDragMode] = useState(false)
  const [orderedIds, setOrderedIds] = useState<string[] | null>(null)
  const orderedIdsRef = useRef<string[] | null>(null)
  const reorderMutation = useReorderTasks(projectId)

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

  if (tasks.length === 0) {
    return (
      <div className="flex justify-center py-12">
        <p className="text-muted-foreground text-sm">
          {tTasks("noTasksInProject")}
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button
          type="button"
          variant={isDragMode ? "default" : "outline"}
          size="sm"
          onClick={() => setIsDragMode((prev) => !prev)}
          aria-pressed={isDragMode}
        >
          <GripVertical className="size-4" />
          {isDragMode ? tTasks("disableReorder") : tTasks("enableReorder")}
        </Button>
      </div>

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
            dragEnabled={isDragMode}
            onDragEnd={handleDragEnd}
            isDragMode={isDragMode}
          />
        ))}
      </Reorder.Group>
    </div>
  )
}
