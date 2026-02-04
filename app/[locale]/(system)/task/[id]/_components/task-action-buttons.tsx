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
import { useTranslations } from "next-intl"
import { useRouter } from "@/lib/i18n/navigation"
import apiClient from "@/services"
import { useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { Trash2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

type TaskActionButtonsProps = {
  taskId: string
}

export function TaskActionButtons({ taskId }: TaskActionButtonsProps) {
  const t = useTranslations("tasks")
  const tPage = useTranslations("taskPage")
  const router = useRouter()
  const queryClient = useQueryClient()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await apiClient.delete(`/api/tasks/${taskId}`)
      queryClient.invalidateQueries({ queryKey: ["tasks"] })
      queryClient.invalidateQueries({ queryKey: ["project"] })
      toast.success(t("deleteSuccess"))
      router.push("/tasks")
    } catch (err) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.error ?? t("deleteError"))
      } else {
        toast.error(t("deleteError"))
      }
    } finally {
      setDeleting(false)
      setDeleteOpen(false)
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button className="bg-primary hover:bg-primary/90" disabled>
        {t("save")}
      </Button>
      <Button
        variant="outline"
        onClick={() => setDeleteOpen(true)}
        disabled={deleting}
        className="text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/50"
      >
        <Trash2 className="size-4" />
        {tPage("delete")}
      </Button>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteConfirm.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteConfirm.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>
              {t("deleteConfirm.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive hover:bg-destructive/90 text-white"
            >
              {deleting ? "..." : t("deleteConfirm.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
