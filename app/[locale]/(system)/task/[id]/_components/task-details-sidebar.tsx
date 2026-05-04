"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent } from "@/components/ui/card"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import UserAvatar from "@/components/user-avatar"
import { PERMISSIONS_GROUPED } from "@/config/permissions"
import { usePermission } from "@/hooks/use-permission"
import type { TaskDetail } from "@/prisma/tasks"
import apiClient from "@/services"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { addWorkingDays } from "@/lib/working-days"
import { format } from "date-fns"
import { ar, enUS } from "date-fns/locale"
import { Calendar as CalendarIcon, X } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { useState } from "react"
import { toast } from "sonner"

type TaskDetailsSidebarProps = {
  task: TaskDetail
}

const dateFnsLocale = (locale: string) => (locale === "ar" ? ar : enUS)
const dateFormat = "d - MMM - yyyy"

export function TaskDetailsSidebar({ task }: TaskDetailsSidebarProps) {
  const t = useTranslations("taskPage")
  const tTasks = useTranslations("tasks")
  const tErrors = useTranslations("errors")
  const tCommon = useTranslations("common")
  const locale = useLocale()
  const localeDate = dateFnsLocale(locale)
  const queryClient = useQueryClient()
  const { checkPermission } = usePermission()
  const canEdit = checkPermission(PERMISSIONS_GROUPED.TASK.UPDATE)
  const [datePickerOpen, setDatePickerOpen] = useState(false)

  const priorityLabel =
    task.priority === "HIGH"
      ? tTasks("priority.high")
      : task.priority === "LOW"
        ? tTasks("priority.low")
        : t("normal")

  const startedAtDate = task.startedAt ? new Date(task.startedAt) : null
  const startStr = startedAtDate
    ? format(startedAtDate, dateFormat, { locale: localeDate })
    : null
  const endDate =
    startedAtDate != null && task.estimatedWorkingDays != null
      ? addWorkingDays(startedAtDate, task.estimatedWorkingDays)
      : null
  const endStr = endDate
    ? format(endDate, dateFormat, { locale: localeDate })
    : null
  const estimatedWorkingDays = task.estimatedWorkingDays
  const createdByName = task.createdBy?.name ?? null

  const updateStartedAt = useMutation({
    mutationFn: async (startedAt: Date | null) => {
      const { data } = await apiClient.patch<TaskDetail>(
        `/api/tasks/${task.id}`,
        { startedAt }
      )
      return data
    },
    onSuccess: () => {
      toast.success(tCommon("saved"))
      queryClient.invalidateQueries({ queryKey: ["task", task.id] })
    },
    onError: () => {
      toast.error(tErrors("internal_server_error"))
    },
  })

  const handleSelectDate = (date: Date | undefined) => {
    setDatePickerOpen(false)
    updateStartedAt.mutate(date ?? null)
  }

  const handleClearDate = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation()
    e.preventDefault()
    updateStartedAt.mutate(null)
  }

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
          <div className="flex items-center gap-2">
            <dt className="text-muted-foreground min-w-30">
              {t("startDate")}
            </dt>
            :{" "}
            <dd className="text-foreground flex-1">
              {canEdit ? (
                <Popover
                  open={datePickerOpen}
                  onOpenChange={setDatePickerOpen}
                >
                  <PopoverTrigger
                    render={(props) => (
                      <Button
                        variant="outline"
                        size="sm"
                        type="button"
                        className="h-8 justify-start bg-white px-2 font-normal"
                        disabled={updateStartedAt.isPending}
                        {...props}
                      >
                        <CalendarIcon className="me-2 size-3.5" />
                        {startStr ?? (
                          <span className="text-muted-foreground">
                            {tTasks("form.startedAtPlaceholder")}
                          </span>
                        )}
                        {startedAtDate && (
                          <span
                            role="button"
                            tabIndex={0}
                            aria-label={tTasks("form.clear")}
                            className="hover:bg-muted ms-2 inline-flex size-4 items-center justify-center rounded"
                            onClick={handleClearDate}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                handleClearDate(e)
                              }
                            }}
                          >
                            <X className="size-3" />
                          </span>
                        )}
                      </Button>
                    )}
                  />
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startedAtDate ?? undefined}
                      onSelect={handleSelectDate}
                      locale={localeDate}
                    />
                  </PopoverContent>
                </Popover>
              ) : (
                <span>{startStr ?? "—"}</span>
              )}
            </dd>
          </div>
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
