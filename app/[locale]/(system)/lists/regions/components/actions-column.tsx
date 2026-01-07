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
import type { Region } from "@/prisma/regions"
import type { ColumnDef } from "@tanstack/react-table"
import { Edit, Trash2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { toast } from "sonner"

interface ActionsColumnProps {
  onEdit: (region: Region) => void
}

interface ActionsCellProps {
  region: Region
  onEdit: (region: Region) => void
}

function ActionsCell({ region, onEdit }: ActionsCellProps) {
  const t = useTranslations()
  const queryClient = useQueryClient()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const deleteMutation = useMutation({
    mutationFn: async (regionId: string) => {
      const response = await axios.delete(`/api/regions/${regionId}`, {
        withCredentials: true,
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["regions"] })
      setDeleteDialogOpen(false)
      toast.success(t("regions.success.deleted"))
    },
    onError: (error: unknown) => {
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.error || t("errors.internal_server_error")
        )
      } else {
        toast.error(t("errors.internal_server_error"))
      }
      setDeleteDialogOpen(false)
    },
  })

  const handleDelete = () => {
    deleteMutation.mutate(region.id)
  }

  return (
    <>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onEdit(region)}
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
              {t("regions.deleteConfirm.title")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("regions.deleteConfirm.description", {
                name: region.name || "",
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
              {t("regions.deleteConfirm.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive hover:bg-destructive/90 text-white"
            >
              {deleteMutation.isPending
                ? t("regions.deleteConfirm.deleting")
                : t("regions.deleteConfirm.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export function useActionsColumn({
  onEdit,
}: ActionsColumnProps): ColumnDef<Region> {
  return {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const region = row.original
      return <ActionsCell region={region} onEdit={onEdit} />
    },
  }
}
