"use client"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useChangeTaskStatus } from "@/hooks/use-change-task-status"
import { useTaskStatuses } from "@/hooks/use-task-status"
import { cn } from "@/lib/utils"
import { Check, ChevronDown, Loader2 } from "lucide-react"
import { useTranslations } from "next-intl"
import type { TaskCardData } from "./task-card"
import type { TaskStatus } from "@/prisma/task-statuses"
import { Button } from "@/components/ui/button"

type TaskStatusDropdownProps = {
  task: TaskCardData
}

export function TaskStatusDropdown({ task }: TaskStatusDropdownProps) {
  const tCommon = useTranslations("common")
  const { data, isLoading } = useTaskStatuses()
  const changeStatusMutation = useChangeTaskStatus()

  const statuses = data?.data.data ?? []

  const handleChangeStatus = (status: TaskStatus) => {
    if (changeStatusMutation.isPending) return
    if (!status?.id) return

    changeStatusMutation.mutate({
      taskId: task.id,
      statusId: status.id,
      statusName: status.name,
      statusColor: status.color ?? null,
    })
  }

  const isCurrentStatus = (statusName: string) =>
    statusName === task.status.name

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button size={"sm"} />}
        className={cn(
          changeStatusMutation.isPending && "cursor-wait opacity-70"
        )}
        style={
          task.status.color
            ? { backgroundColor: task.status.color, color: "white" }
            : undefined
        }
      >
        <span className="truncate">{task.status.name}</span>
        <ChevronDown className="size-3" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={4}>
        {isLoading ? (
          <div className="text-muted-foreground flex items-center gap-2 px-2 py-1.5 text-xs">
            <Loader2 className="size-3 animate-spin" />
            <span>{tCommon("loading")}</span>
          </div>
        ) : (
          statuses.map((status) => (
            <DropdownMenuItem
              key={status.id}
              className="flex items-center gap-2 text-xs"
              onClick={() => {
                handleChangeStatus(status)
              }}
            >
              <span
                className="inline-block size-3 rounded-full"
                style={
                  status.color ? { backgroundColor: status.color } : undefined
                }
              />
              <span className="flex-1 truncate">{status.name}</span>
              {isCurrentStatus(status.name) && (
                <Check className="text-primary size-3 shrink-0" />
              )}
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
