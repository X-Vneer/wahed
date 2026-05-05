"use client"

import { StackedUserAvatars } from "@/components/stacked-user-avatars"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress, ProgressValue } from "@/components/ui/progress"
import { useToggleTaskDone } from "@/hooks/use-toggle-task-done"
import { Link } from "@/lib/i18n/navigation"
import { cn } from "@/utils/cn"
import { Task } from "@/prisma/tasks"
import { addWorkingDays } from "@/utils/working-days"
import { format, formatDistanceToNow } from "date-fns"
import { ar, enUS } from "date-fns/locale"
import {
  AlertCircle,
  ChevronRight,
  Circle,
  CircleCheckBig,
  Clock,
  MessageCircle,
} from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { TaskStatusDropdown } from "./task-status-dropdown"

export type TaskCardData = Task
type TaskCardProps = {
  task: TaskCardData
  className?: string
}

type Translator = ReturnType<typeof useTranslations>
type DateFnsLocale = typeof ar

const dateFnsLocale = (locale: string) => (locale === "ar" ? ar : enUS)
const dateFormat = "d - MMM - yyyy"

function getTimeLabel(args: {
  startedAt: Date | null
  estimatedDueDate: Date | null
  doneAt: Task["doneAt"]
  isOverdue: boolean
  now: Date
  t: Translator
  localeDate: DateFnsLocale
}): { text: string; overdue: boolean } | null {
  const { startedAt, estimatedDueDate, doneAt, isOverdue, now, t, localeDate } =
    args
  if (doneAt) return null
  if (startedAt == null) return { text: t("notStarted"), overdue: false }
  if (startedAt > now) {
    return {
      text: t("startsIn", {
        distance: formatDistanceToNow(startedAt, {
          addSuffix: true,
          locale: localeDate,
        }),
      }),
      overdue: false,
    }
  }
  if (estimatedDueDate != null) {
    const distance = formatDistanceToNow(estimatedDueDate, {
      addSuffix: true,
      locale: localeDate,
    })
    return {
      text: isOverdue ? t("overdue", { distance }) : t("dueIn", { distance }),
      overdue: isOverdue,
    }
  }
  return { text: t("notStarted"), overdue: false }
}

export function TaskCard({ task, className }: TaskCardProps) {
  const t = useTranslations("tasks")
  const locale = useLocale()
  const localeDate = dateFnsLocale(locale)
  const toggleDoneMutation = useToggleTaskDone()

  const handleToggleDone = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (toggleDoneMutation.isPending) return
    toggleDoneMutation.mutate({
      taskId: task.id,
      done: !task.doneAt,
    })
  }

  const assignees = task.assignedTo
  const createdBy = task.createdBy

  const totalSubTasks = task.subTasks?.length ?? 0
  const doneSubTasks = task.subTasks?.filter((s) => s.done).length ?? 0
  const progressPercent =
    totalSubTasks > 0
      ? (doneSubTasks / totalSubTasks) * 100
      : task.doneAt
        ? 100
        : 0
  const priority = task.priority ?? "MEDIUM"

  const startedAtDate = task.startedAt ? new Date(task.startedAt) : null
  const startStr = startedAtDate
    ? format(startedAtDate, dateFormat, { locale: localeDate })
    : null
  const workingDays = task.estimatedWorkingDays ?? null
  const estimatedDueDate =
    startedAtDate != null && workingDays != null && workingDays > 0
      ? addWorkingDays(startedAtDate, workingDays)
      : null
  const estimatedDueStr =
    estimatedDueDate &&
    formatDistanceToNow(estimatedDueDate, { locale: localeDate })
  const now = new Date()
  const isOverdue =
    estimatedDueDate != null && estimatedDueDate < now && !task.doneAt

  const timeLabel = getTimeLabel({
    startedAt: startedAtDate,
    estimatedDueDate,
    doneAt: task.doneAt,
    isOverdue,
    now,
    t,
    localeDate,
  })

  return (
    <Card
      className={cn(
        "flex flex-col overflow-hidden rounded-xl py-4 ring-0 transition-colors",
        className
      )}
    >
      <CardContent className="flex flex-1 flex-col gap-2 px-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
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
            <h3 className="text-foreground truncate text-base font-semibold">
              {task.title}
            </h3>
            {priority === "HIGH" && (
              <Badge
                variant="destructive"
                className="shrink-0 rounded-sm border-0 bg-red-600 py-2 text-xs text-white"
              >
                <AlertCircle className="size-3.5" />
                {t("priority.high")}
              </Badge>
            )}
            {priority === "MEDIUM" && (
              <Badge
                variant="secondary"
                className="shrink-0 rounded-sm border-0 bg-amber-100 py-2 text-xs text-amber-800 dark:bg-amber-900/40 dark:text-amber-200"
              >
                {t("priority.medium")}
              </Badge>
            )}
            {priority === "LOW" && (
              <Badge
                variant="secondary"
                className="bg-muted text-muted-foreground shrink-0 rounded-sm border-0 py-2 text-xs"
              >
                {t("priority.low")}
              </Badge>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="secondary"
              className="text-primary h-7 rounded-sm bg-[#ffcdbd5b]"
            >
              <MessageCircle className="size-3.5" />
              {t("commentsCount", { count: task.comments.length })}
            </Badge>
            {timeLabel && (
              <span
                className={cn(
                  "flex items-center gap-1 text-sm",
                  timeLabel.overdue
                    ? "text-destructive font-medium"
                    : "text-muted-foreground"
                )}
              >
                <Clock className="size-3.5 shrink-0" />
                {timeLabel.text}
              </span>
            )}
            <TaskStatusDropdown task={task} />
            <Button
              nativeButton={false}
              variant="ghost"
              size="icon"
              render={<Link href={`/task/${task.id}`} />}
            >
              <ChevronRight className="text-muted-foreground size-4 shrink-0 rtl:rotate-180" />
            </Button>
          </div>
        </div>

        {task.project?.name && (
          <p className="text-muted-foreground text-sm">{task.project.name}</p>
        )}

        <div className="flex flex-wrap items-center gap-3 text-sm">
          {startStr != null && (
            <span className="text-muted-foreground">
              {t("startDate", { date: startStr })}
            </span>
          )}
          {workingDays != null && workingDays > 0 && (
            <span className="text-muted-foreground">
              {t("estimatedWorkingDaysShort", { count: workingDays })}
            </span>
          )}
          {estimatedDueStr != null && (
            <span className="text-muted-foreground">
              {t("estimatedDueDate", { date: estimatedDueStr })}
            </span>
          )}
          {assignees.length > 0 ? (
            <span className="text-muted-foreground flex items-center gap-2">
              <StackedUserAvatars
                users={assignees.map((u) => ({
                  id: u.id,
                  name: u.name,
                  image: u.image,
                  email: u.email,
                }))}
                size="sm"
                maxVisible={3}
                popoverTitle={t("assignees")}
              />
              {t("by", { name: createdBy.name })}
            </span>
          ) : (
            <span className="text-muted-foreground">{t("noAssignee")}</span>
          )}
        </div>

        <Progress
          value={Math.min(100, Math.max(0, progressPercent))}
          className="flex min-w-0 flex-1 flex-nowrap items-center gap-2 **:data-[slot=progress-track]:h-2.5"
          style={
            task.status.color
              ? {
                  ["--progress-indicator-color" as string]: task.status.color,
                }
              : undefined
          }
        >
          <ProgressValue className="order-1 shrink-0" />
        </Progress>
      </CardContent>
    </Card>
  )
}
