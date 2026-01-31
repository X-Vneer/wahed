"use client"

import { Badge } from "@/components/ui/badge"
import { StackedUserAvatars } from "@/components/stacked-user-avatars"
import { Card, CardContent } from "@/components/ui/card"
import { Link } from "@/lib/i18n/navigation"
import { cn } from "@/lib/utils"
import { Task } from "@/prisma/tasks"
import { format, differenceInDays, addDays } from "date-fns"
import { ar, enUS } from "date-fns/locale"
import {
  AlertCircle,
  ChevronRight,
  Circle,
  MessageCircle,
  Clock,
} from "lucide-react"
import { useLocale, useTranslations } from "next-intl"

export type TaskCardData = Task
type TaskCardProps = {
  task: TaskCardData
  href?: string
  className?: string
}

const dateFnsLocale = (locale: string) => (locale === "ar" ? ar : enUS)
const dateFormat = "d - MMM - yyyy"

export function TaskCard({ task, href, className }: TaskCardProps) {
  const t = useTranslations("tasks")
  const locale = useLocale()
  const localeDate = dateFnsLocale(locale)

  const assignees = task.assignedTo
  const createdBy = task.createdBy
  const daysRemaining =
    task.startedAt != null
      ? Math.max(0, differenceInDays(new Date(task.startedAt), new Date()))
      : null
  const totalSubTasks = task.subTasks?.length ?? 0
  const doneSubTasks = task.subTasks?.filter((s) => s.done).length ?? 0
  const progressPercent =
    totalSubTasks > 0 ? (doneSubTasks / totalSubTasks) * 100 : null
  const priority = task.priority ?? "MEDIUM"

  const startStr = task.startedAt
    ? format(task.startedAt, dateFormat, { locale: localeDate })
    : null
  const workingDays = task.estimatedWorkingDays ?? null
  const estimatedDueDate =
    task.startedAt != null && workingDays != null && workingDays > 0
      ? addDays(task.startedAt, workingDays)
      : null
  const estimatedDueStr =
    estimatedDueDate &&
    format(estimatedDueDate, dateFormat, { locale: localeDate })

  const content = (
    <Card
      className={cn(
        "flex flex-col overflow-hidden rounded-xl ring-0 transition-colors",
        className
      )}
    >
      <CardContent className="flex flex-1 flex-col gap-3 px-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Title block: urgent + title + circle — appears on right in RTL */}
          <div className="flex min-w-0 flex-1 flex-col items-end gap-1 text-end sm:flex-row sm:items-start sm:justify-between sm:gap-2 sm:text-start">
            <div className="flex min-w-0 items-center gap-2">
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground focus-visible:ring-ring shrink-0 cursor-pointer rounded-full p-0.5 transition-colors focus-visible:ring-2 focus-visible:outline-none"
                aria-label={task.doneAt ? "Mark incomplete" : "Mark complete"}
              >
                <Circle
                  className={cn(
                    "size-5",
                    task.doneAt && "fill-primary text-primary"
                  )}
                />
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
          </div>

          {/* Metadata: comments, remaining, status, chevron — appears on left in RTL */}
          <div className="flex flex-wrap items-center gap-2">
            {task.comments.length > 0 && (
              <Badge
                variant="secondary"
                className="rounded-md bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200"
              >
                <MessageCircle className="size-3.5" />
                {t("commentsCount", { count: task.comments.length })}
              </Badge>
            )}
            {daysRemaining != null && (
              <span className="text-muted-foreground flex items-center gap-1 text-sm">
                <Clock className="size-3.5" />
                {t("daysRemaining", { count: daysRemaining })}
              </span>
            )}
            <Badge
              className="h-7 shrink-0 rounded-sm border-0"
              style={
                task.status.color
                  ? { backgroundColor: task.status.color, color: "white" }
                  : undefined
              }
            >
              {task.status.name}
            </Badge>
            <ChevronRight className="text-muted-foreground size-4 shrink-0 rtl:rotate-180" />
          </div>
        </div>

        {/* Project name */}
        {task.project.name && (
          <p className="text-muted-foreground text-sm">{task.project.name}</p>
        )}

        {/* Start date, estimated working days, estimated due + assignee */}
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

        {/* Progress bar */}
        {progressPercent != null && (
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground shrink-0 text-sm">
              {Math.round(progressPercent)}%
            </span>
            <div className="bg-muted h-2.5 min-w-0 flex-1 overflow-hidden rounded-full">
              <div
                className={cn(
                  "h-full rounded-full transition-[width]",
                  !task.status.color && "bg-green-500"
                )}
                style={{
                  width: `${Math.min(100, Math.max(0, progressPercent))}%`,
                  ...(task.status.color && {
                    backgroundColor: task.status.color,
                  }),
                }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )

  if (href) {
    return (
      <Link
        href={href}
        className="focus-visible:ring-ring block rounded-xl focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        {content}
      </Link>
    )
  }

  return content
}
