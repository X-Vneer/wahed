"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useTranslations } from "next-intl"
import { format } from "date-fns"
import { ar, enUS } from "date-fns/locale"
import { useLocale } from "next-intl"
import { addDays } from "date-fns"
import type { TaskDetail } from "@/prisma/tasks"

type TaskDetailsSidebarProps = {
  task: TaskDetail
}

const dateFnsLocale = (locale: string) => (locale === "ar" ? ar : enUS)
const dateFormat = "d - MMM - yyyy"

export function TaskDetailsSidebar({ task }: TaskDetailsSidebarProps) {
  const t = useTranslations("taskPage")
  const tTasks = useTranslations("tasks")
  const locale = useLocale()
  const localeDate = dateFnsLocale(locale)

  const priorityLabel =
    task.priority === "HIGH"
      ? tTasks("priority.high")
      : task.priority === "LOW"
        ? tTasks("priority.low")
        : t("normal")

  const startStr = task.startedAt
    ? format(new Date(task.startedAt), dateFormat, { locale: localeDate })
    : null
  const endDate =
    task.startedAt != null && task.estimatedWorkingDays != null
      ? addDays(task.startedAt, task.estimatedWorkingDays)
      : null
  const endStr = endDate
    ? format(endDate, dateFormat, { locale: localeDate })
    : null

  return (
    <Card>
      <CardContent>
        <h3 className="text-foreground mb-4 text-lg font-semibold">
          {t("taskDetails")}
        </h3>
        <dl className="flex flex-col gap-3 text-sm">
          <div>
            <dt className="text-muted-foreground mb-0.5">{t("priorities")}</dt>
            <dd>
              <Badge
                variant="secondary"
                className={
                  task.priority === "HIGH"
                    ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200"
                    : task.priority === "LOW"
                      ? "bg-muted text-muted-foreground"
                      : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200"
                }
              >
                {priorityLabel}
              </Badge>
            </dd>
          </div>
          {task.category.length > 0 && (
            <div>
              <dt className="text-muted-foreground mb-0.5">{t("tags")}</dt>
              <dd className="flex flex-wrap gap-1">
                {task.category.map((cat) => (
                  <Badge
                    key={cat.id}
                    variant="secondary"
                    className="bg-primary/10 text-primary border-0"
                  >
                    {cat.name}
                  </Badge>
                ))}
              </dd>
            </div>
          )}
          <div>
            <dt className="text-muted-foreground mb-0.5">{t("status")}</dt>
            <dd>
              <Badge
                variant="secondary"
                className="border-0"
                style={{
                  backgroundColor: task.status.color
                    ? `${task.status.color}20`
                    : undefined,
                  color: task.status.color ?? undefined,
                }}
              >
                {task.status.name}
              </Badge>
            </dd>
          </div>
          {startStr && (
            <div>
              <dt className="text-muted-foreground mb-0.5">{t("startDate")}</dt>
              <dd className="text-foreground">{startStr}</dd>
            </div>
          )}
          {endStr && (
            <div>
              <dt className="text-muted-foreground mb-0.5">{t("endDate")}</dt>
              <dd className="text-foreground">{endStr}</dd>
            </div>
          )}
        </dl>
      </CardContent>
    </Card>
  )
}
