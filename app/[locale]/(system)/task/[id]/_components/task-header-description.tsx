"use client"

import { Card, CardContent } from "@/components/ui/card"
import { useToggleTaskDone } from "@/hooks/use-toggle-task-done"
import type { TaskDetail } from "@/prisma/tasks"
import { Circle, CircleCheckBig } from "lucide-react"
import { useTranslations } from "next-intl"
import { TaskStatusDropdown } from "../../../tasks/_components/task-status-dropdown"
import { TaskSubtasks } from "./task-subtasks"

type TaskHeaderDescriptionProps = {
  task: TaskDetail
}

export function TaskHeaderDescription({ task }: TaskHeaderDescriptionProps) {
  const t = useTranslations()
  const toggleDoneMutation = useToggleTaskDone()

  const handleToggleDone = () => {
    if (toggleDoneMutation.isPending) return
    toggleDoneMutation.mutate({
      taskId: task.id,
      done: !task.doneAt,
    })
  }

  return (
    <Card>
      <CardContent className="">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              onClick={handleToggleDone}
              disabled={toggleDoneMutation.isPending}
              className="text-muted-foreground hover:text-foreground focus-visible:ring-ring shrink-0 cursor-pointer rounded-full p-0.5 transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
              aria-label={task.doneAt ? "Mark incomplete" : "Mark complete"}
            >
              {task.doneAt ? (
                <CircleCheckBig className="text-primary size-5" />
              ) : (
                <Circle className="size-5" />
              )}
            </button>
            <h2 className="text-foreground truncate text-xl font-bold">
              {t("task.title")} {task.order + 1} : {task.title}
            </h2>
          </div>
          <TaskStatusDropdown task={task} />
        </div>
        {task.description ? (
          <div className="text-sm leading-relaxed whitespace-pre-wrap text-[#2B3445]">
            {task.description}
          </div>
        ) : null}
        <div className="mt-10"></div>
        <TaskSubtasks taskId={task.id} subTasks={task.subTasks} />
      </CardContent>
    </Card>
  )
}
