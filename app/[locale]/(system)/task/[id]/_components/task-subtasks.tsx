"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useDeleteSubtask } from "@/hooks/use-delete-subtask"
import { useToggleSubtaskDone } from "@/hooks/use-toggle-subtask-done"
import { SubTasks } from "@/lib/generated/prisma/client"
import { cn } from "@/lib/utils"
import type { TaskDetail } from "@/prisma/tasks"
import { useQueryClient } from "@tanstack/react-query"
import { MoreVertical, Pencil, Plus, Trash2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { SubtaskDialog } from "./subtask-dialog"

type TaskSubtasksProps = {
  taskId: string
  subTasks: TaskDetail["subTasks"]
}

export function TaskSubtasks({ taskId, subTasks }: TaskSubtasksProps) {
  const t = useTranslations()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [subtaskToDelete, setSubtaskToDelete] = useState<string | null>(null)

  const deleteSubtaskMutation = useDeleteSubtask()
  const toggleSubtaskDoneMutation = useToggleSubtaskDone()

  const total = subTasks.length
  const done = subTasks.filter((s) => s.done).length
  const editingSubtask =
    editingId != null
      ? (subTasks.find((s) => s.id === editingId) ?? null)
      : null

  const handleToggle = (subtask: SubTasks) => {
    if (toggleSubtaskDoneMutation.isPending) return

    toggleSubtaskDoneMutation.mutate({
      taskId,
      subtaskId: subtask.id,
      done: !subtask.done,
    })
  }

  const openAdd = () => {
    setEditingId(null)
    setDialogOpen(true)
  }

  const openEdit = (subtask: SubTasks) => {
    setEditingId(subtask.id)
    setDialogOpen(true)
  }

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open)
    if (!open) setEditingId(null)
  }

  const queryClient = useQueryClient()
  const handleDelete = (subtaskId: string) => {
    deleteSubtaskMutation.mutate(
      { taskId, subtaskId },
      {
        onSettled: () => {
          queryClient.invalidateQueries({ queryKey: ["task", taskId] })
        },
      }
    )
    setSubtaskToDelete(null)
  }

  return (
    <div>
      {/* Header: counter + Add button on left, title on right (matching design) */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-xs text-[#2B3445]">{t("taskPage.subTasks")}</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#2B3445]">
            {t("taskPage.completedSubTasks", { done, total })}
          </span>
          <Button
            type="button"
            variant="outline"
            className="border-primary text-primary hover:text-primary hover:bg-muted gap-2 rounded-sm bg-white"
            size="sm"
            onClick={openAdd}
          >
            <Plus className="size-4" />
            {t("taskPage.addSubTask")}
          </Button>
        </div>
      </div>

      <ul className="flex flex-col gap-3">
        {subTasks.map((subtask) => (
          <li
            key={subtask.id}
            className="bg-card flex items-center gap-3 rounded-lg border px-3 py-1.5"
          >
            <Checkbox
              checked={!!subtask.done}
              onCheckedChange={() => handleToggle(subtask)}
              className="shrink-0"
            />
            <div className="min-w-0 flex-1">
              <p className={cn("text-sm", subtask.done && "line-through")}>
                {subtask.title}
              </p>
              {subtask.description ? (
                <p className="text-muted-foreground text-xs">
                  {subtask.description}
                </p>
              ) : null}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-muted-foreground hover:text-foreground shrink-0"
                    aria-label={t("taskPage.subTaskOptions")}
                  >
                    <MoreVertical className="size-4" />
                  </Button>
                }
              />
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={() => openEdit(subtask)}>
                  <Pencil className="size-4" />
                  {t("taskPage.editSubTask")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => setSubtaskToDelete(subtask.id)}
                >
                  <Trash2 className="size-4" />
                  {t("common.delete")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </li>
        ))}
      </ul>

      {/* Delete confirmation (controlled, outside dropdown so it stays open) */}
      <AlertDialog
        open={subtaskToDelete !== null}
        onOpenChange={(open) => !open && setSubtaskToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("taskPage.deleteSubTaskConfirmTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("taskPage.deleteSubTaskConfirmDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90 text-white"
              onClick={() => subtaskToDelete && handleDelete(subtaskToDelete)}
            >
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <SubtaskDialog
        open={dialogOpen}
        onOpenChange={handleDialogOpenChange}
        taskId={taskId}
        editingSubtask={editingSubtask}
      />
    </div>
  )
}
