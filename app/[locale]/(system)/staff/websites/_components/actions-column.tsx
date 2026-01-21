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
import type { WebsiteWithLocale } from "@/hooks/use-websites"
import type { ColumnDef } from "@tanstack/react-table"
import { Edit, Trash2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { useDeleteWebsite } from "@/hooks/use-websites"

interface ActionsColumnProps {
  onEdit: (website: WebsiteWithLocale) => void
}

interface ActionsCellProps {
  website: WebsiteWithLocale
  onEdit: (website: WebsiteWithLocale) => void
}

function ActionsCell({ website, onEdit }: ActionsCellProps) {
  const t = useTranslations()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const deleteWebsite = useDeleteWebsite()

  const handleDelete = () => {
    deleteWebsite.mutate(website.id, {
      onSuccess: () => {
        setDeleteDialogOpen(false)
      },
    })
  }

  const name = website.nameAr || website.nameEn || ""

  return (
    <>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onEdit(website)}
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
              {t("websites.deleteConfirm.title")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("websites.deleteConfirm.description", {
                name,
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={deleteWebsite.isPending}
              onClick={() => {
                setDeleteDialogOpen(false)
              }}
            >
              {t("websites.deleteConfirm.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteWebsite.isPending}
              className="bg-destructive hover:bg-destructive/90 text-white"
            >
              {deleteWebsite.isPending
                ? t("websites.deleteConfirm.deleting")
                : t("websites.deleteConfirm.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export function useActionsColumn({
  onEdit,
}: ActionsColumnProps): ColumnDef<WebsiteWithLocale> {
  return {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const website = row.original
      return <ActionsCell website={website} onEdit={onEdit} />
    },
  }
}
