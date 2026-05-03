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
import type { PublicProjectStatus } from "@/prisma/public-project-statuses"
import apiClient from "@/services"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { ColumnDef } from "@tanstack/react-table"
import { Edit, Trash2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { toast } from "sonner"

interface ActionsColumnProps {
  onEdit: (row: PublicProjectStatus) => void
}

interface ActionsCellProps {
  row: PublicProjectStatus
  onEdit: (row: PublicProjectStatus) => void
}

function ActionsCell({ row, onEdit }: ActionsCellProps) {
  const t = useTranslations()
  const queryClient = useQueryClient()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const deleteMutation = useMutation({
    mutationFn: async (rowId: string) => {
      const response = await apiClient.delete(
        `/api/public-project-status/${rowId}`
      )
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["public-project-status"] })
      setDeleteDialogOpen(false)
      toast.success(t("publicProjectStatus.success.deleted"))
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.error || t("errors.internal_server_error")
      )
      setDeleteDialogOpen(false)
    },
  })

  const handleDelete = async () => {
    deleteMutation.mutate(row.id)
  }

  const isSystem = row.isSystem === true

  return (
    <>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onEdit(row)}
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
              {t("publicProjectStatus.deleteConfirm.title")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("publicProjectStatus.deleteConfirm.description", {
                name: row.name || "",
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
              {t("publicProjectStatus.deleteConfirm.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive hover:bg-destructive/90 text-white"
            >
              {deleteMutation.isPending
                ? t("publicProjectStatus.deleteConfirm.deleting")
                : t("publicProjectStatus.deleteConfirm.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export function useActionsColumn({
  onEdit,
}: ActionsColumnProps): ColumnDef<PublicProjectStatus> {
  return {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const original = row.original
      return <ActionsCell row={original} onEdit={onEdit} />
    },
  }
}
