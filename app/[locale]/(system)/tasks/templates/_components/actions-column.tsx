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
import type { TaskTemplate } from "@/prisma/task-templates"
import apiClient from "@/services"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { ColumnDef } from "@tanstack/react-table"
import { Edit, Trash2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { toast } from "sonner"

interface ActionsColumnProps {
  onEdit: (template: TaskTemplate) => void
}

interface ActionsCellProps {
  template: TaskTemplate
  onEdit: (template: TaskTemplate) => void
}

function ActionsCell({ template, onEdit }: ActionsCellProps) {
  const t = useTranslations()
  const queryClient = useQueryClient()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/api/tasks/templates/${id}`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", "templates"] })
      setDeleteDialogOpen(false)
      toast.success(t("taskTemplate.success.deleted"))
    },
    onError: (error: { response?: { data?: { error?: string } } }) => {
      toast.error(
        error.response?.data?.error ?? t("errors.internal_server_error")
      )
      setDeleteDialogOpen(false)
    },
  })

  const handleDelete = () => {
    deleteMutation.mutate(template.id)
  }

  return (
    <>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onEdit(template)}
          aria-label={t("taskTemplate.form.actions")}
        >
          <Edit className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setDeleteDialogOpen(true)}
          aria-label={t("taskTemplate.deleteConfirm.delete")}
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="size-4" />
        </Button>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("taskTemplate.deleteConfirm.title")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("taskTemplate.deleteConfirm.description", {
                name: template.title,
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={deleteMutation.isPending}
              onClick={() => setDeleteDialogOpen(false)}
            >
              {t("taskTemplate.deleteConfirm.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {deleteMutation.isPending
                ? t("taskTemplate.deleteConfirm.deleting")
                : t("taskTemplate.deleteConfirm.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export function useActionsColumn({
  onEdit,
}: ActionsColumnProps): ColumnDef<TaskTemplate> {
  return {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const template = row.original
      return <ActionsCell template={template} onEdit={onEdit} />
    },
  }
}
