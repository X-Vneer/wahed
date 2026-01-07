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
import type { City } from "@/prisma/cities"
import type { ColumnDef } from "@tanstack/react-table"
import { Edit, Trash2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { toast } from "sonner"

interface ActionsColumnProps {
  onEdit: (city: City) => void
}

interface ActionsCellProps {
  city: City
  onEdit: (city: City) => void
}

function ActionsCell({ city, onEdit }: ActionsCellProps) {
  const t = useTranslations()
  const queryClient = useQueryClient()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const deleteMutation = useMutation({
    mutationFn: async (cityId: string) => {
      const response = await axios.delete(`/api/cities/${cityId}`, {
        withCredentials: true,
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cities"] })
      setDeleteDialogOpen(false)
      toast.success(t("cities.success.deleted"))
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
    deleteMutation.mutate(city.id)
  }

  return (
    <>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onEdit(city)}
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
              {t("cities.deleteConfirm.title")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("cities.deleteConfirm.description", {
                name: city.name || "",
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
              {t("cities.deleteConfirm.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive hover:bg-destructive/90 text-white"
            >
              {deleteMutation.isPending
                ? t("cities.deleteConfirm.deleting")
                : t("cities.deleteConfirm.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export function useActionsColumn({
  onEdit,
}: ActionsColumnProps): ColumnDef<City> {
  return {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const city = row.original
      return <ActionsCell city={city} onEdit={onEdit} />
    },
  }
}
