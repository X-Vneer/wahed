"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useTranslations } from "next-intl"
import { format } from "date-fns"
import { ar, enUS } from "date-fns/locale"
import { useLocale } from "next-intl"
import { addDays } from "date-fns"
import type { TaskDetail } from "@/prisma/tasks"
import UserAvatar from "@/components/user-avatar"

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
  const estimatedWorkingDays = task.estimatedWorkingDays
  const createdByName = task.createdBy?.name ?? null

  return (
    <Card>
      <CardContent>
        <h3 className="text-foreground mb-4 text-sm font-semibold">
          {t("taskDetails")}
        </h3>
        <dl className="flex flex-col gap-3 text-sm">
          <div className="flex items-center gap-2">
            <dt className="text-muted-foreground min-w-30">
              {t("priorities")}
            </dt>{" "}
            :{" "}
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
            <div className="flex items-center gap-2">
              <dt className="text-muted-foreground min-w-30">{t("tags")}</dt> :{" "}
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
          <div className="flex items-center gap-2">
            <dt className="text-muted-foreground min-w-30">{t("status")}</dt> :{" "}
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
          {estimatedWorkingDays != null && (
            <div className="flex items-center gap-2">
              <dt className="text-muted-foreground min-w-30">
                {tTasks("form.estimatedWorkingDays")}
              </dt>
              :{" "}
              <dd className="text-foreground">
                {t("estimatedWorkingDaysShort", {
                  count: estimatedWorkingDays,
                })}
              </dd>
            </div>
          )}
          {startStr && (
            <div className="flex items-center gap-2">
              <dt className="text-muted-foreground min-w-30">
                {t("startDate")}
              </dt>
              : <dd className="text-foreground">{startStr}</dd>
            </div>
          )}
          {endStr && (
            <div className="flex items-center gap-2">
              <dt className="text-muted-foreground min-w-30">{t("endDate")}</dt>
              : <dd className="text-foreground">{endStr}</dd>
            </div>
          )}
          {createdByName && (
            <dd>
              <dt className="text-muted-foreground min-w-30">
                {t("createdBy")}
              </dt>
              <UserAvatar
                name={createdByName}
                email={task.createdBy?.email ?? ""}
                image={task.createdBy?.image ?? undefined}
              />
            </dd>
          )}
        </dl>
      </CardContent>
    </Card>
  )
}
