"use client"

import { Button } from "@/components/ui/button"
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
import type { TaskCategory } from "@/prisma/task-categories"
import type { ColumnDef } from "@tanstack/react-table"
import { Edit, Trash2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { toast } from "sonner"

interface ActionsColumnProps {
  onEdit: (category: TaskCategory) => void
}

interface ActionsCellProps {
  category: TaskCategory
  onEdit: (category: TaskCategory) => void
}

function ActionsCell({ category, onEdit }: ActionsCellProps) {
  const t = useTranslations()
  const queryClient = useQueryClient()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (categoryId: string) => {
      const response = await axios.delete(`/api/task-category/${categoryId}`, {
        withCredentials: true,
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task-category"] })
      setDeleteDialogOpen(false)
      toast.success(t("taskCategory.success.deleted"))
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.error || t("errors.internal_server_error")
      )
      setDeleteDialogOpen(false)
    },
  })

  const handleDelete = async () => {
    deleteMutation.mutate(category.id)
  }

  return (
    <>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onEdit(category)}
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
              {t("taskCategory.deleteConfirm.title")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("taskCategory.deleteConfirm.description", {
                name: category.name || "",
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
              {t("taskCategory.deleteConfirm.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive hover:bg-destructive/90 text-white"
            >
              {deleteMutation.isPending
                ? t("taskCategory.deleteConfirm.deleting")
                : t("taskCategory.deleteConfirm.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export function useActionsColumn({
  onEdit,
}: ActionsColumnProps): ColumnDef<TaskCategory> {
  return {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const category = row.original
      return <ActionsCell category={category} onEdit={onEdit} />
    },
  }
}
