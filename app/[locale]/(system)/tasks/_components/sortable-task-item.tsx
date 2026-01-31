"use client"

import { useDraggable, useDroppable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import { cn } from "@/lib/utils"
import type { Task } from "@/prisma/tasks"
import { TaskCard } from "./task-card"
import { GripVertical } from "lucide-react"

type SortableTaskItemProps = {
  task: Task
  isDragging?: boolean
}

export function SortableTaskItem({ task, isDragging }: SortableTaskItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef: setDraggableRef,
    transform,
    isDragging: isDraggingFromHook,
  } = useDraggable({
    id: task.id,
    data: { task },
  })

  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: task.id,
    data: { task },
  })

  const dragging = isDragging ?? isDraggingFromHook

  const style = transform
    ? {
        transform: CSS.Translate.toString(transform),
      }
    : undefined

  const setRef = (node: HTMLDivElement | null) => {
    setDraggableRef(node)
    setDroppableRef(node)
  }

  return (
    <div
      ref={setRef}
      style={style}
      className={cn(
        "flex items-stretch gap-2 transition-colors",
        isOver && !dragging && "rounded-xl ring-2 ring-primary/30",
        dragging && "opacity-50"
      )}
    >
      <button
        type="button"
        className="text-muted-foreground hover:text-foreground focus-visible:ring-ring flex touch-none cursor-grab items-center rounded p-1 transition-colors focus-visible:outline-none focus-visible:ring-2 active:cursor-grabbing"
        aria-label="Drag to reorder"
        {...listeners}
        {...attributes}
      >
        <GripVertical className="size-5" />
      </button>
      <div className="min-w-0 flex-1">
        <TaskCard task={task} className={dragging ? "shadow-lg" : undefined} />
      </div>
    </div>
  )
}
