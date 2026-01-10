"use client"

import { Button } from "@/components/ui/button"
import { PERMISSIONS_GROUPED } from "@/config"
import { useUserData } from "@/hooks/use-user-data"
import { UserRole } from "@/lib/generated/prisma/enums"
import { useRouter } from "@/lib/i18n/navigation"
import apiClient from "@/services"
import { useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { Archive, ArchiveRestore } from "lucide-react"
import { useTranslations } from "next-intl"
import { useParams } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

type ArchiveButtonProps = {
  isArchived: boolean
}

export function ArchiveButton({ isArchived }: ArchiveButtonProps) {
  const t = useTranslations()
  const queryClient = useQueryClient()
  const router = useRouter()
  const params = useParams()
  const projectId = params.id as string
  const [isLoading, setIsLoading] = useState(false)
  const { data: user } = useUserData()

  // Check permissions
  const canArchive =
    user?.role === UserRole.ADMIN ||
    user?.permissions?.includes(PERMISSIONS_GROUPED.PROJECT.ARCHIVE) ||
    false
  const canUnarchive =
    user?.role === UserRole.ADMIN ||
    user?.permissions?.includes(PERMISSIONS_GROUPED.PROJECT.UNARCHIVE) ||
    false

  const hasPermission = isArchived ? canUnarchive : canArchive

  if (!hasPermission) {
    return null
  }

  const handleArchive = async () => {
    setIsLoading(true)
    try {
      await apiClient.patch(`/api/projects/${projectId}/archive`, {
        archive: !isArchived,
      })

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["projects"] })
      queryClient.invalidateQueries({ queryKey: ["project", projectId] })

      toast.success(
        isArchived
          ? t("projects.success.unarchived")
          : t("projects.success.archived")
      )

      // Refresh the page to update the server component
      router.refresh()
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
    }
  }

  return (
    <Button
      variant="outline"
      onClick={handleArchive}
      disabled={isLoading}
      className="flex items-center gap-2"
    >
      {isArchived ? (
        <>
          <ArchiveRestore className="size-4" />
          {t("projects.unarchive")}
        </>
      ) : (
        <>
          <Archive className="size-4" />
          {t("projects.archive")}
        </>
      )}
    </Button>
  )
}
