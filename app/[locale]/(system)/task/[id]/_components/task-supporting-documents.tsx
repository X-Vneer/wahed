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

function toApiAttachment(att: AttachmentItem) {
  const additionalInfo = (att as unknown as { additionalInfo?: unknown })
    .additionalInfo

  const isFinal =
    additionalInfo && typeof additionalInfo === "object"
      ? (additionalInfo as { isFinal?: boolean }).isFinal === true
      : false

  return {
    id: att.id,
    fileUrl: att.fileUrl,
    fileName: att.fileName ?? undefined,
    fileType: att.fileType ?? undefined,
    fileSize: att.fileSize ?? undefined,
    additionalInfo: {
      ...(additionalInfo && typeof additionalInfo === "object"
        ? (additionalInfo as Record<string, unknown>)
        : {}),
      isFinal,
    },
    isFinal,
  }
}

export function TaskSupportingDocuments({
  taskId,
  attachments,
}: TaskSupportingDocumentsProps) {
  const t = useTranslations()
  const queryClient = useQueryClient()
  const [isSaving, setIsSaving] = useState(false)

  const syncAttachments = async (
    payload: Array<{
      id?: string
      fileUrl: string
      fileName?: string
      fileType?: string
      fileSize?: number
      additionalInfo?: unknown
      isFinal?: boolean
    }>
  ) => {
    setIsSaving(true)
    try {
      await apiClient.post(`/api/tasks/${taskId}/attachments`, {
        attachments: payload,
      })
      await queryClient.invalidateQueries({ queryKey: ["task", taskId] })
      toast.success(t("tasks.success.attachments_updated"))
    } catch (err) {
      console.error("Error syncing task attachments:", err)
      toast.error(t("errors.internal_server_error"))
    } finally {
      setIsSaving(false)
    }
  }

  const finalAttachments = attachments.filter(isFinalAttachment)
  const otherAttachments = attachments.filter((att) => !isFinalAttachment(att))

  const supportingValue: UploadedFileAttachment[] = otherAttachments.map(
    (att) => ({
      fileUrl: att.fileUrl,
      fileName: att.fileName ?? "",
      fileType: att.fileType ?? undefined,
      fileSize: att.fileSize ?? undefined,
    })
  )

  const finalValue: UploadedFileAttachment[] = finalAttachments.map((att) => ({
    fileUrl: att.fileUrl,
    fileName: att.fileName ?? "",
    fileType: att.fileType ?? undefined,
    fileSize: att.fileSize ?? undefined,
  }))

  const handleSupportingChange = (files: UploadedFileAttachment[]) => {
    const supportingPayload = files.map((f) => {
      const existing = otherAttachments.find(
        (a) =>
          a.fileUrl === f.fileUrl && (a.fileName ?? "") === f.fileName
      )
      const additionalInfo = (
        (existing as unknown as { additionalInfo?: unknown })?.additionalInfo
      ) as Record<string, unknown> | undefined
      return {
        id: existing?.id,
        fileUrl: f.fileUrl,
        fileName: f.fileName,
        fileType: f.fileType,
        fileSize: f.fileSize,
        additionalInfo: {
          ...(additionalInfo && typeof additionalInfo === "object"
            ? additionalInfo
            : {}),
          isFinal: false,
        },
        isFinal: false,
      }
    })
    syncAttachments([
      ...supportingPayload,
      ...finalAttachments.map((att) => toApiAttachment(att)),
    ])
  }

  const handleFinalChange = (files: UploadedFileAttachment[]) => {
    const finalPayload = files.map((f) => {
      const existing = finalAttachments.find(
        (a) =>
          a.fileUrl === f.fileUrl && (a.fileName ?? "") === f.fileName
      )
      const additionalInfo = (
        (existing as unknown as { additionalInfo?: unknown })?.additionalInfo
      ) as Record<string, unknown> | undefined
      return {
        id: existing?.id,
        fileUrl: f.fileUrl,
        fileName: f.fileName,
        fileType: f.fileType,
        fileSize: f.fileSize,
        additionalInfo: {
          ...(additionalInfo && typeof additionalInfo === "object"
            ? additionalInfo
            : {}),
          isFinal: true,
        },
        isFinal: true,
      }
    })
    syncAttachments([
      ...otherAttachments.map((att) => toApiAttachment(att)),
      ...finalPayload,
    ])
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Supporting documents */}
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
            onChange={handleSupportingChange}
            triggerLabel={t("taskPage.addDocuments")}
            multiple
            disabled={isSaving}
          />
        </CardContent>
      </Card>

      {/* Final files */}
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
            onChange={handleFinalChange}
            triggerLabel={t("taskPage.addFinalFiles")}
            multiple
            disabled={isSaving}
          />
        </CardContent>
      </Card>
    </div>
  )
}
