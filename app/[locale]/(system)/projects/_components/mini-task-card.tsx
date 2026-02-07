"use client"

import { TASK_STATUS_ID_IN_PROGRESS } from "@/config"
import { Link } from "@/lib/i18n/navigation"
import { cn } from "@/lib/utils"
import { type TransformedProject } from "@/prisma/projects"
import { addDays } from "date-fns"
import { formatDistanceToNow } from "date-fns"
import { ar, enUS } from "date-fns/locale"
import { Clock, Play } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"

const dateFnsLocale = (locale: string) => (locale === "ar" ? ar : enUS)

type ProjectTask = NonNullable<TransformedProject["tasks"]>[number]

function MiniTaskCard({ task }: { task: ProjectTask | null }) {
  const t = useTranslations()
  const locale = useLocale()
  const localeDate = dateFnsLocale(locale)

  if (task == null) {
    return <div className="h-10">{t("projects.noCurrentTask")}</div>
  }

  const taskStartedAt = task.startedAt ? new Date(task.startedAt) : null
  const taskWorkingDays = task.estimatedWorkingDays ?? null
  const taskEstimatedDueDate =
    taskStartedAt != null && taskWorkingDays != null && taskWorkingDays > 0
      ? addDays(taskStartedAt, taskWorkingDays)
      : null
  const taskDueDistance =
    taskEstimatedDueDate != null
      ? formatDistanceToNow(taskEstimatedDueDate, {
          addSuffix: true,
          locale: localeDate,
        })
      : null
  const taskIsOverdue =
    taskEstimatedDueDate != null &&
    taskEstimatedDueDate < new Date() &&
    !task.doneAt
  const taskIsInProgress = task.status.id === TASK_STATUS_ID_IN_PROGRESS

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg bg-[#F7F7F7] px-3 py-2 max-md:w-full lg:gap-8">
      <div className="flex items-center gap-1">
        <p
          className={cn(
            "line-clamp-1 max-w-40 truncate max-md:text-sm",
            task.doneAt != null ? "line-through" : ""
          )}
        >
          {task.title}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Clock className="text-muted-foreground size-4" />
        <span
          className={cn(
            "text-xs",
            taskDueDistance != null &&
              (taskIsOverdue
                ? "text-destructive font-medium"
                : "text-muted-foreground")
          )}
        >
          {task.doneAt != null
            ? t("tasks.completed")
            : taskIsInProgress
              ? taskDueDistance != null
                ? taskIsOverdue
                  ? t("tasks.overdue", {
                      distance: taskDueDistance,
                    })
                  : t("tasks.dueIn", {
                      distance: taskDueDistance,
                    })
                : task.estimatedWorkingDays != null &&
                    task.estimatedWorkingDays > 0
                  ? t("projects.daysRemaining", {
                      count: task.estimatedWorkingDays,
                    })
                  : t("tasks.notStarted")
              : t("tasks.notStarted")}
        </span>
        <div
          style={{
            background: task.status.color,
            ["--tw-ring-color" as string]: task.status.color,
          }}
          className="ms-2 h-2 w-2 animate-pulse rounded-full ring-1 ring-offset-1"
        />
        <Link href={`/task/${task.id}`}>
          <Play className="text-muted-foreground size-4 rtl:rotate-180" />
        </Link>
      </div>
    </div>
  )
}

export default MiniTaskCard
