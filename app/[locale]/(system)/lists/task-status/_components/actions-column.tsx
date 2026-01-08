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
import type { TaskStatus } from "@/prisma/task-statuses"
import apiClient from "@/services"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { ColumnDef } from "@tanstack/react-table"
import { Edit, Trash2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { toast } from "sonner"

interface ActionsColumnProps {
  onEdit: (taskStatus: TaskStatus) => void
}

interface ActionsCellProps {
  taskStatus: TaskStatus
  onEdit: (taskStatus: TaskStatus) => void
}

function ActionsCell({ taskStatus, onEdit }: ActionsCellProps) {
  const t = useTranslations()
  const queryClient = useQueryClient()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (taskStatusId: string) => {
      const response = await apiClient.delete(
        `/api/task-status/${taskStatusId}`
      )
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task-status"] })
      setDeleteDialogOpen(false)
      toast.success(t("taskStatus.success.deleted"))
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.error || t("errors.internal_server_error")
      )
      setDeleteDialogOpen(false)
    },
  })

  const handleDelete = async () => {
    deleteMutation.mutate(taskStatus.id)
  }

  return (
    <>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onEdit(taskStatus)}
          aria-label="Edit"
        >
          <Edit className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setDeleteDialogOpen(true)}
          aria-label="Delete"
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="size-4" />
        </Button>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("taskStatus.deleteConfirm.title")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("taskStatus.deleteConfirm.description", {
                name: taskStatus.name || "",
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={deleteMutation.isPending}
              onClick={() => {
                setDeleteDialogOpen(false)
              }}
            >
              {t("taskStatus.deleteConfirm.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive hover:bg-destructive/90 text-white"
            >
              {deleteMutation.isPending
                ? t("taskStatus.deleteConfirm.deleting")
                : t("taskStatus.deleteConfirm.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export function useActionsColumn({
  onEdit,
}: ActionsColumnProps): ColumnDef<TaskStatus> {
  return {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const taskStatus = row.original
      return <ActionsCell taskStatus={taskStatus} onEdit={onEdit} />
    },
  }
}
