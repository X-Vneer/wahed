"use client"

import {
  FormFileUpload,
  type UploadedFileAttachment,
} from "@/components/form-file-upload"
import { Card, CardContent } from "@/components/ui/card"
import apiClient from "@/services"
import { useQueryClient } from "@tanstack/react-query"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import { toast } from "sonner"

type ProjectAttachmentInput = {
  id?: string
  fileUrl?: string | null
  fileName?: string | null
  fileType?: string | null
  fileSize?: number | null
  taskId?: string | null
}

type ProjectAttachmentsProps = {
  projectId: string
  initialAttachments: ProjectAttachmentInput[]
}

export function ProjectAttachments({
  projectId,
  initialAttachments,
}: ProjectAttachmentsProps) {
  const t = useTranslations()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [isSaving, setIsSaving] = useState(false)

  // Map attachment id -> taskId. Items without a taskId belong to the project
  // itself; items with one belong to a task and must DELETE via /api/tasks/...
  const taskIdByAttachmentId = useMemo(() => {
    const map = new Map<string, string | null>()
    for (const att of initialAttachments) {
      if (att.id) map.set(att.id, att.taskId ?? null)
    }
    return map
  }, [initialAttachments])

  const value: UploadedFileAttachment[] = initialAttachments
    .filter((att): att is ProjectAttachmentInput & { fileUrl: string } =>
      Boolean(att.fileUrl)
    )
    .map((att) => ({
      id: att.id,
      fileUrl: att.fileUrl,
      fileName: att.fileName ?? "",
      fileType: att.fileType ?? undefined,
      fileSize: att.fileSize ?? undefined,
    }))

  const refresh = async () => {
    router.refresh()
    await queryClient.invalidateQueries({ queryKey: ["projects"] })
  }

  const handleAdd = async (files: UploadedFileAttachment[]) => {
    setIsSaving(true)
    try {
      await apiClient.post(`/api/projects/${projectId}/attachments`, {
        attachments: files.map((f) => ({
          fileUrl: f.fileUrl,
          fileName: f.fileName,
          fileType: f.fileType,
          fileSize: f.fileSize,
        })),
      })
      await refresh()
      toast.success(t("projects.success.attachments_added"))
    } catch (err) {
      console.error("Error adding project attachments:", err)
      toast.error(t("projects.form.attachments.uploadError"))
    } finally {
      setIsSaving(false)
    }
  }

  const handleRemove = async (file: UploadedFileAttachment) => {
    if (!file.id) return
    const taskId = taskIdByAttachmentId.get(file.id) ?? null
    setIsSaving(true)
    try {
      const url = taskId
        ? `/api/tasks/${taskId}/attachments/${file.id}`
        : `/api/projects/${projectId}/attachments/${file.id}`
      await apiClient.delete(url)
      await refresh()
      toast.success(t("projects.success.attachments_added"))
    } catch (err) {
      console.error("Error deleting attachment:", err)
      toast.error(t("projects.form.attachments.uploadError"))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card>
      <CardContent>
        <div className="mb-4">
          <h3 className="text-lg font-bold">
            {t("projects.form.attachments.title")}
          </h3>
        </div>

        <FormFileUpload
          endpoint="projectAttachmentsUploader"
          value={value}
          onChange={() => {}}
          onAdd={handleAdd}
          onRemove={handleRemove}
          triggerLabel={t("projects.form.attachments.addDocuments")}
          multiple
          disabled={isSaving}
        />
      </CardContent>
    </Card>
  )
}
