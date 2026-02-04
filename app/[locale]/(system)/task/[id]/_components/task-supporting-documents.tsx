"use client"

import { AttachmentPreview } from "@/components/attachment-preview"
import { Card, CardContent } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { UploadButton } from "@/lib/uploadthing"
import type { TaskDetail } from "@/prisma/tasks"
import apiClient from "@/services"
import { useQueryClient } from "@tanstack/react-query"
import { Plus } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { toast } from "sonner"

type TaskSupportingDocumentsProps = {
  taskId: string
  attachments: TaskDetail["taskAttachments"]
}

type AttachmentItem = TaskDetail["taskAttachments"][number]

function toApiAttachment(att: AttachmentItem) {
  return {
    id: att.id,
    fileUrl: att.fileUrl,
    fileName: att.fileName ?? undefined,
    fileType: att.fileType ?? undefined,
    fileSize: att.fileSize ?? undefined,
  }
}

export function TaskSupportingDocuments({
  taskId,
  attachments,
}: TaskSupportingDocumentsProps) {
  const t = useTranslations("taskPage")
  const tTasks = useTranslations("tasks")
  const queryClient = useQueryClient()
  const [isSaving, setIsSaving] = useState(false)

  const syncAttachments = async (
    payload: Array<{
      id?: string
      fileUrl: string
      fileName?: string
      fileType?: string
      fileSize?: number
    }>
  ) => {
    setIsSaving(true)
    try {
      await apiClient.post(`/api/tasks/${taskId}/attachments`, {
        attachments: payload,
      })
      await queryClient.invalidateQueries({ queryKey: ["task", taskId] })
      toast.success(tTasks("success.attachments_updated"))
    } catch (err) {
      console.error("Error syncing task attachments:", err)
      toast.error(t("attachmentSyncError") || tTasks("errors.not_found"))
    } finally {
      setIsSaving(false)
    }
  }

  const handleUploadComplete = (
    res: Array<{ ufsUrl: string; name: string; size: number; type: string }>
  ) => {
    if (!res?.length) return
    const existing = attachments.map(toApiAttachment)
    const newOnes = res.map((file) => ({
      fileUrl: file.ufsUrl,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
    }))
    syncAttachments([...existing, ...newOnes])
  }

  const handleRemove = (id: string) => {
    const remaining = attachments
      .filter((a) => a.id !== id)
      .map(toApiAttachment)
    syncAttachments(remaining)
  }

  return (
    <Card>
      <CardContent>
        <div className="mb-4 flex items-center justify-between gap-2">
          <h3 className="text-foreground font-semibold">
            {t("supportingDocuments")}
          </h3>
          <div className="flex shrink-0 items-center gap-2">
            {isSaving && <Spinner className="size-4" />}
            <UploadButton
              endpoint="taskAttachmentsUploader"
              onClientUploadComplete={(res) => {
                if (res?.length) {
                  handleUploadComplete(
                    res.map((file) => ({
                      ufsUrl: file.ufsUrl ?? file.url ?? "",
                      name: file.name,
                      size: file.size ?? 0,
                      type: file.type ?? "",
                    }))
                  )
                }
              }}
              onUploadError={(error: Error) => {
                toast.error(error.message || t("attachmentUploadError"))
              }}
              appearance={{
                button:
                  "bg-primary/5 hover:bg-primary/10 border-primary/30 text-primary!  rounded-lg px-3 py-2 text-sm font-medium border shrink-0 gap-2 ut-ready:bg-primary/10 ut-uploading:bg-primary/10 whitespace-nowrap",
                container: "w-[unset]",
                allowedContent: "h-0!",
              }}
              content={{
                button: (
                  <span className="flex items-center gap-2">
                    <Plus className="size-4" />
                    {t("addDocuments")}
                  </span>
                ),
                allowedContent: <span />,
              }}
              disabled={isSaving}
            />
          </div>
        </div>
        <ul className="flex flex-col gap-2">
          {attachments.length === 0 ? (
            <p className="text-muted-foreground py-2 text-sm">
              {t("noDocumentsAttached")}
            </p>
          ) : (
            attachments.map((att) => (
              <li key={att.id}>
                <AttachmentPreview
                  attachment={{
                    id: att.id,
                    fileUrl: att.fileUrl,
                    fileName: att.fileName ?? undefined,
                    fileType: att.fileType ?? undefined,
                    fileSize: att.fileSize ?? undefined,
                  }}
                  onDelete={() => att.id && handleRemove(att.id)}
                />
              </li>
            ))
          )}
        </ul>
      </CardContent>
    </Card>
  )
}
