"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Link } from "@/lib/i18n/navigation"
import { cn } from "@/lib/utils"
import { Task } from "@/prisma/tasks"
import { format, differenceInDays } from "date-fns"
import { ar, enUS } from "date-fns/locale"
import { Bell, ChevronLeft, Circle, MessageCircle, Clock } from "lucide-react"
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

  const statusName =
    task.status &&
    (locale === "ar" ? task.status.nameAr : task.status.nameEn)
  const statusColor = task.status?.color ?? undefined
  const projectName =
    task.project &&
    (locale === "ar" ? task.project.nameAr : task.project.nameEn)
  const assignee = task.assignedTo?.[0]
    ? {
        name: task.assignedTo[0].name,
        image: task.assignedTo[0].image ?? undefined,
      }
    : null
  const commentsCount = task.comments?.length ?? 0
  const daysRemaining =
    task.dueDate != null
      ? Math.max(0, differenceInDays(new Date(task.dueDate), new Date()))
      : null
  const totalSubTasks = task.subTasks?.length ?? 0
  const doneSubTasks = task.subTasks?.filter((s) => s.done).length ?? 0
  const progressPercent =
    totalSubTasks > 0 ? (doneSubTasks / totalSubTasks) * 100 : null
  const isUrgent = task.priority === "HIGH"

  const startStr =
    task.createdAt &&
    format(new Date(task.createdAt), dateFormat, { locale: localeDate })
  const endStr =
    task.dueDate &&
    format(new Date(task.dueDate), dateFormat, { locale: localeDate })
  const periodLabel =
    startStr && endStr
      ? t("periodBetween", { start: startStr, end: endStr })
      : endStr
      ? t("dueDate", { date: endStr })
      : null

  const content = (
    <Card
      className={cn(
        "bg-card hover:bg-muted/30 flex flex-col overflow-hidden rounded-xl border shadow-none ring-0 transition-colors",
        className
      )}
    >
      <CardContent className="flex flex-1 flex-col gap-3 px-5 py-4">
        {/* Top row: status badges (start) | title + urgent | chevron (end in RTL) */}
        <div className="flex flex-wrap items-start justify-between gap-2">
          {/* Start side: comments, remaining, status, chevron */}
          <div className="flex flex-wrap items-center gap-2">
            {commentsCount > 0 && (
              <Badge
                variant="secondary"
                className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200"
              >
                <MessageCircle className="size-3.5" />
                {t("commentsCount", { count: commentsCount })}
              </Badge>
            )}
            {daysRemaining != null && (
              <span className="text-muted-foreground flex items-center gap-1 text-sm">
                <Clock className="size-3.5" />
                {t("daysRemaining", { count: daysRemaining })}
              </span>
            )}
            <Badge
              className="shrink-0 border-0"
              style={
                statusColor
                  ? { backgroundColor: statusColor, color: "white" }
                  : undefined
              }
            >
              {statusName}
            </Badge>
            <ChevronLeft className="text-muted-foreground size-4 shrink-0 rtl:rotate-180" />
          </div>

          {/* End side: urgent badge + title */}
          <div className="flex min-w-0 flex-1 flex-col items-end gap-1 text-end sm:flex-row sm:items-start sm:gap-2 sm:text-start">
            {isUrgent && (
              <Badge
                variant="destructive"
                className="shrink-0 border-0 bg-red-600 text-white"
              >
                <Bell className="size-3.5" />
                {t("urgent")}
              </Badge>
            )}
            <div className="flex min-w-0 items-center gap-2">
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground focus-visible:ring-ring shrink-0 rounded-full p-0.5 transition-colors focus-visible:ring-2 focus-visible:outline-none"
                aria-label={task.done ? "Mark incomplete" : "Mark complete"}
              >
                <Circle
                  className={cn(
                    "size-5",
                    task.done && "fill-primary text-primary"
                  )}
                />
              </button>
              <h3 className="text-foreground truncate text-base font-semibold">
                {task.title}
              </h3>
            </div>
          </div>
        </div>

        {/* Project name */}
        {projectName && (
          <p className="text-muted-foreground text-sm">{projectName}</p>
        )}

        {/* Date range + assignee */}
        <div className="flex flex-wrap items-center gap-3 text-sm">
          {periodLabel && (
            <span className="text-muted-foreground">{periodLabel}</span>
          )}
          {assignee && (
            <span className="text-muted-foreground flex items-center gap-2">
              <Avatar className="size-6">
                {assignee.image ? (
                  <AvatarImage
                    src={assignee.image}
                    alt={assignee.name}
                  />
                ) : null}
                <AvatarFallback className="text-xs">
                  {assignee.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {t("by", { name: assignee.name })}
            </span>
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
                className="h-full rounded-full bg-green-500 transition-[width]"
                style={{
                  width: `${Math.min(100, Math.max(0, progressPercent))}%`,
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
