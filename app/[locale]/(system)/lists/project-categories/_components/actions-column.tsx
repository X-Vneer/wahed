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
import type { ProjectCategory } from "@/prisma/project-categories"
import type { ColumnDef } from "@tanstack/react-table"
import { Edit, Trash2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { toast } from "sonner"

interface ActionsColumnProps {
  onEdit: (category: ProjectCategory) => void
}

interface ActionsCellProps {
  category: ProjectCategory
  onEdit: (category: ProjectCategory) => void
}

function ActionsCell({ category, onEdit }: ActionsCellProps) {
  const t = useTranslations()
  const queryClient = useQueryClient()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (categoryId: string) => {
      const response = await axios.delete(
        `/api/project-categories/${categoryId}`,
        {
          withCredentials: true,
        }
      )
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-categories"] })
      setDeleteDialogOpen(false)
      toast.success(t("projectCategories.success.deleted"))
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
              {t("projectCategories.deleteConfirm.title")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("projectCategories.deleteConfirm.description", {
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
              {t("projectCategories.deleteConfirm.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive hover:bg-destructive/90 text-white"
            >
              {deleteMutation.isPending
                ? t("projectCategories.deleteConfirm.deleting")
                : t("projectCategories.deleteConfirm.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export function useActionsColumn({
  onEdit,
}: ActionsColumnProps): ColumnDef<ProjectCategory> {
  return {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const category = row.original
      return <ActionsCell category={category} onEdit={onEdit} />
    },
  }
}
