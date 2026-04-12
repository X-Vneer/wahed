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
import type { Contact } from "@/prisma/contacts"
import type { ColumnDef } from "@tanstack/react-table"
import { Eye, Trash2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import apiClient from "@/services"
import { toast } from "sonner"
import axios from "axios"

interface ActionsColumnProps {
  onView: (contact: Contact) => void
}

interface ActionsCellProps {
  contact: Contact
  onView: (contact: Contact) => void
}

function ActionsCell({ contact, onView }: ActionsCellProps) {
  const t = useTranslations()
  const queryClient = useQueryClient()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/api/contacts/${id}`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] })
      setDeleteDialogOpen(false)
      toast.success(t("contacts.success.deleted"))
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
    deleteMutation.mutate(contact.id)
  }

  return (
    <>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onView(contact)}
          aria-label="View"
        >
          <Eye className="size-4" />
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
              {t("contacts.deleteConfirm.title")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("contacts.deleteConfirm.description", {
                name: contact.fullName || "",
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={deleteMutation.isPending}
              onClick={() => setDeleteDialogOpen(false)}
            >
              {t("contacts.deleteConfirm.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive hover:bg-destructive/90 text-white"
            >
              {deleteMutation.isPending
                ? t("contacts.deleteConfirm.deleting")
                : t("contacts.deleteConfirm.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export function useActionsColumn({
  onView,
}: ActionsColumnProps): ColumnDef<Contact> {
  return {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const contact = row.original
      return <ActionsCell contact={contact} onView={onView} />
    },
  }
}
