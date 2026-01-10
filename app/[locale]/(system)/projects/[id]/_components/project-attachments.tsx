"use client"

import { Card, CardContent } from "@/components/ui/card"
import { UploadButton } from "@/lib/uploadthing"
import { FileText, Download, Plus } from "lucide-react"
import { useTranslations } from "next-intl"
import { useEffect } from "react"
import { toast } from "sonner"
import apiClient from "@/services"
import { useRouter } from "next/navigation"
import { useForm } from "@mantine/form"
import { AttachmentPreview } from "@/components/attachment-preview"

type Attachment = {
  id?: string
  fileUrl: string
  fileName?: string | null
  fileType?: string | null
  fileSize?: number | null
}

type ProjectAttachmentsProps = {
  projectId: string
  initialAttachments: Attachment[]
}

type AttachmentsFormValues = {
  attachments: Attachment[]
  isUploading: boolean
}

export function ProjectAttachments({
  projectId,
  initialAttachments,
}: ProjectAttachmentsProps) {
  const t = useTranslations()
  const router = useRouter()

  const form = useForm<AttachmentsFormValues>({
    mode: "controlled",
    initialValues: {
      attachments: initialAttachments,
      isUploading: false,
    },
  })

  // Update form when initialAttachments change
  useEffect(() => {
    form.setFieldValue("attachments", initialAttachments)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialAttachments])

  const handleFileUpload = async (
    files: Array<{ ufsUrl: string; name: string; size: number; type: string }>
  ) => {
    form.setFieldValue("isUploading", true)
    try {
      const newAttachments = files.map((file) => ({
        fileUrl: file.ufsUrl,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
      }))

      // Combine existing attachments (with IDs) and new attachments (without IDs)
      const allAttachments = [
        ...form.values.attachments.map((att) => ({
          id: att.id,
          fileUrl: att.fileUrl,
          fileName: att.fileName || undefined,
          fileType: att.fileType || undefined,
          fileSize: att.fileSize || undefined,
        })),
        ...newAttachments,
      ]

      // Save to backend - send all attachments so backend can sync
      await apiClient.post(`/api/projects/${projectId}/attachments`, {
        attachments: allAttachments,
      })

      // Update form with new attachments
      form.setFieldValue("attachments", allAttachments)

      // Refresh the page to get updated attachments
      router.refresh()
      toast.success(t("projects.form.attachments.uploaded"))
    } catch (error) {
      console.error("Error uploading attachments:", error)
      toast.error(t("projects.form.attachments.uploadError"))
    } finally {
      form.setFieldValue("isUploading", false)
    }
  }

  const handleDownload = (url: string) => {
    window.open(url, "_blank")
  }

  const handleFileRemove = (id: string) => {
    const updatedAttachments = attachments.filter((att) => att.id !== id)
    form.setFieldValue("attachments", updatedAttachments)
  }

  const attachments = form.values.attachments
  const isUploading = form.values.isUploading

  return (
    <Card>
      <CardContent>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold">
            {t("projects.form.attachments.title")}
          </h3>
          <UploadButton
            endpoint="projectAttachmentsUploader"
            onClientUploadComplete={(res) => {
              if (res && res.length > 0) {
                handleFileUpload(
                  res.map((file) => ({
                    ufsUrl: file.ufsUrl,
                    name: file.name,
                    size: file.size,
                    type: file.type,
                  }))
                )
              }
            }}
            onUploadError={(error: Error) => {
              toast.error(
                error.message || t("projects.form.attachments.uploadError")
              )
            }}
            appearance={{
              container: "w-fit",
              button:
                "border-orange-500 text-orange-500 hover:bg-orange-500 bg-white hover:text-white ut-ready:bg-orange-500 ut-ready:text-white ut-uploading:bg-orange-500 ut-uploading:text-white rounded-lg px-4 py-2",
            }}
            content={{
              button: (
                <span className="flex items-center gap-2">
                  <span className="shrink-0">
                    {t("projects.form.attachments.addDocuments")}
                  </span>
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded border border-orange-500 bg-white">
                    <Plus className="h-3 w-3 text-orange-500" />
                  </div>
                </span>
              ),
              allowedContent: <span></span>,
            }}
            disabled={isUploading}
          />
        </div>

        <div className="flex flex-col gap-2">
          {attachments.length > 0 ? (
            attachments.map((attachment) => (
              <AttachmentPreview
                key={attachment.id ?? attachment.fileUrl}
                attachment={attachment}
                onDelete={() => handleFileRemove(attachment.id ?? "")}
              />
            ))
          ) : (
            <p className="text-muted-foreground py-4 text-center text-sm">
              {t("projects.form.attachments.noFiles") || "No files attached"}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
