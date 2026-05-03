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
import type { ProjectStatus } from "@/prisma/project-statuses"
import apiClient from "@/services"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { ColumnDef } from "@tanstack/react-table"
import { Edit, Trash2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { toast } from "sonner"

interface ActionsColumnProps {
  onEdit: (projectStatus: ProjectStatus) => void
}

interface ActionsCellProps {
  projectStatus: ProjectStatus
  onEdit: (projectStatus: ProjectStatus) => void
}

function ActionsCell({ projectStatus, onEdit }: ActionsCellProps) {
  const t = useTranslations()
  const queryClient = useQueryClient()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const deleteMutation = useMutation({
    mutationFn: async (projectStatusId: string) => {
      const response = await apiClient.delete(
        `/api/project-status/${projectStatusId}`
      )
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-status"] })
      setDeleteDialogOpen(false)
      toast.success(t("projectStatus.success.deleted"))
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.error || t("errors.internal_server_error")
      )
      setDeleteDialogOpen(false)
    },
  })

  const handleDelete = async () => {
    deleteMutation.mutate(projectStatus.id)
  }

  const isSystem = projectStatus.isSystem === true

  return (
    <>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onEdit(projectStatus)}
          aria-label="Edit"
        >
          <Edit className="size-4" />
        </Button>
        {!isSystem && (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setDeleteDialogOpen(true)}
            aria-label="Delete"
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="size-4" />
          </Button>
        )}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("projectStatus.deleteConfirm.title")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("projectStatus.deleteConfirm.description", {
                name: projectStatus.name || "",
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
              {t("projectStatus.deleteConfirm.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive hover:bg-destructive/90 text-white"
            >
              {deleteMutation.isPending
                ? t("projectStatus.deleteConfirm.deleting")
                : t("projectStatus.deleteConfirm.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export function useActionsColumn({
  onEdit,
}: ActionsColumnProps): ColumnDef<ProjectStatus> {
  return {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const projectStatus = row.original
      return <ActionsCell projectStatus={projectStatus} onEdit={onEdit} />
    },
  }
}
