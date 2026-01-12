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
import { PERMISSIONS_GROUPED } from "@/config"
import { useUserData } from "@/hooks/use-user-data"
import { UserRole } from "@/lib/generated/prisma/enums"
import { useRouter } from "@/lib/i18n/navigation"
import apiClient from "@/services"
import { useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { Trash2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { useParams } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

export function DeleteButton() {
  const t = useTranslations()
  const queryClient = useQueryClient()
  const router = useRouter()
  const params = useParams()
  const projectId = params.id as string
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { data: user } = useUserData()

  // Check permissions
  const canDelete =
    user?.role === UserRole.ADMIN ||
    user?.permissions?.includes(PERMISSIONS_GROUPED.PROJECT.DELETE) ||
    false

  if (!canDelete) {
    return null
  }

  const handleDelete = async () => {
    setIsLoading(true)
    try {
      await apiClient.delete(`/api/projects/${projectId}`)

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["projects"] })
      queryClient.invalidateQueries({ queryKey: ["project", projectId] })

      toast.success(t("projects.success.deleted"))

      // Redirect to projects list
      router.push("/projects")
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.error || t("errors.internal_server_error")
        toast.error(errorMessage)
      } else {
        toast.error(t("errors.internal_server_error"))
      }
    } finally {
      setIsLoading(false)
      setDeleteDialogOpen(false)
    }
  }

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setDeleteDialogOpen(true)}
        disabled={isLoading}
        className="text-destructive hover:text-destructive hover:bg-destructive/10 flex items-center gap-2"
      >
        <Trash2 className="size-4" />
        {t("projects.delete")}
      </Button>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("projects.deleteConfirm.title")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("projects.deleteConfirm.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isLoading}
              onClick={() => {
                setDeleteDialogOpen(false)
              }}
            >
              {t("projects.deleteConfirm.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isLoading}
              className="bg-destructive hover:bg-destructive/90 text-white"
            >
              {isLoading
                ? t("projects.deleteConfirm.deleting")
                : t("projects.deleteConfirm.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
