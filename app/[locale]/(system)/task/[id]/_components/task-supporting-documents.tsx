"use client"

import {
  FormFileUpload,
  type UploadedFileAttachment,
} from "@/components/form-file-upload"
import { Card, CardContent } from "@/components/ui/card"
import type { TaskDetail } from "@/prisma/tasks"
import apiClient from "@/services"
import { useQueryClient } from "@tanstack/react-query"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { toast } from "sonner"

type TaskSupportingDocumentsProps = {
  taskId: string
  attachments: TaskDetail["taskAttachments"]
}

type AttachmentItem = TaskDetail["taskAttachments"][number]

function isFinalAttachment(att: AttachmentItem) {
  const additionalInfo = (att as unknown as { additionalInfo?: unknown })
    .additionalInfo

  if (!additionalInfo || typeof additionalInfo !== "object") return false

  return (additionalInfo as { isFinal?: boolean }).isFinal === true
}

function toView(att: AttachmentItem): UploadedFileAttachment {
  return {
    id: att.id,
    fileUrl: att.fileUrl,
    fileName: att.fileName ?? "",
    fileType: att.fileType ?? undefined,
    fileSize: att.fileSize ?? undefined,
  }
}

export function TaskSupportingDocuments({
  taskId,
  attachments,
}: TaskSupportingDocumentsProps) {
  const t = useTranslations()
  const queryClient = useQueryClient()
  const [isSaving, setIsSaving] = useState(false)

  const finalAttachments = attachments.filter(isFinalAttachment)
  const otherAttachments = attachments.filter((att) => !isFinalAttachment(att))

  const supportingValue = otherAttachments.map(toView)
  const finalValue = finalAttachments.map(toView)

  const postNew = async (
    files: UploadedFileAttachment[],
    isFinal: boolean
  ) => {
    setIsSaving(true)
    try {
      await apiClient.post(`/api/tasks/${taskId}/attachments`, {
        attachments: files.map((f) => ({
          fileUrl: f.fileUrl,
          fileName: f.fileName,
          fileType: f.fileType,
          fileSize: f.fileSize,
          additionalInfo: { isFinal },
          isFinal,
        })),
      })
      await queryClient.invalidateQueries({ queryKey: ["task", taskId] })
      toast.success(t("tasks.success.attachments_updated"))
    } catch (err) {
      console.error("Error adding task attachments:", err)
      toast.error(t("errors.internal_server_error"))
    } finally {
      setIsSaving(false)
    }
  }

  const removeOne = async (file: UploadedFileAttachment) => {
    if (!file.id) return
    setIsSaving(true)
    try {
      await apiClient.delete(`/api/tasks/${taskId}/attachments/${file.id}`)
      await queryClient.invalidateQueries({ queryKey: ["task", taskId] })
      toast.success(t("tasks.success.attachments_updated"))
    } catch (err) {
      console.error("Error deleting task attachment:", err)
      toast.error(t("errors.internal_server_error"))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardContent>
          <div className="mb-4">
            <h3 className="text-foreground font-semibold">
              {t("taskPage.supportingDocuments")}
            </h3>
          </div>
          <FormFileUpload
            endpoint="taskAttachmentsUploader"
            value={supportingValue}
            onChange={() => {}}
            onAdd={(files) => postNew(files, false)}
            onRemove={removeOne}
            triggerLabel={t("taskPage.addDocuments")}
            multiple
            disabled={isSaving}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <div className="mb-4">
            <h3 className="text-foreground font-semibold">
              {t("taskPage.finalFiles")}
            </h3>
          </div>
          <FormFileUpload
            endpoint="taskAttachmentsUploader"
            value={finalValue}
            onChange={() => {}}
            onAdd={(files) => postNew(files, true)}
            onRemove={removeOne}
            triggerLabel={t("taskPage.addFinalFiles")}
            multiple
            disabled={isSaving}
          />
        </CardContent>
      </Card>
    </div>
  )
}
