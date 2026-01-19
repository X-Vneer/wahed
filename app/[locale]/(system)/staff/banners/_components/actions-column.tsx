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
import type { BannerInclude } from "@/prisma/banners"
import type { ColumnDef } from "@tanstack/react-table"
import { Edit, Trash2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { useDeleteBanner } from "@/hooks/use-banners"

interface ActionsColumnProps {
  onEdit: (banner: BannerInclude) => void
}

interface ActionsCellProps {
  banner: BannerInclude
  onEdit: (banner: BannerInclude) => void
}

function ActionsCell({ banner, onEdit }: ActionsCellProps) {
  const t = useTranslations()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const deleteBanner = useDeleteBanner()

  const handleDelete = () => {
    deleteBanner.mutate(banner.id, {
      onSuccess: () => {
        setDeleteDialogOpen(false)
      },
    })
  }

  const title = banner.titleAr || banner.titleEn || ""

  return (
    <>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onEdit(banner)}
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
              {t("banners.deleteConfirm.title")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("banners.deleteConfirm.description", {
                title,
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={deleteBanner.isPending}
              onClick={() => {
                setDeleteDialogOpen(false)
              }}
            >
              {t("banners.deleteConfirm.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteBanner.isPending}
              className="bg-destructive hover:bg-destructive/90 text-white"
            >
              {deleteBanner.isPending
                ? t("banners.deleteConfirm.deleting")
                : t("banners.deleteConfirm.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export function useActionsColumn({
  onEdit,
}: ActionsColumnProps): ColumnDef<BannerInclude> {
  return {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const banner = row.original
      return <ActionsCell banner={banner} onEdit={onEdit} />
    },
  }
}
