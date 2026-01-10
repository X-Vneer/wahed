"use client"

import { AttachmentPreview } from "@/components/attachment-preview"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { ProjectAttachment } from "@/lib/generated/prisma/client"
import {
  type Attachment,
  projectAttachmentsSchema,
} from "@/lib/schemas/attachment"
import { UploadButton } from "@/lib/uploadthing"
import apiClient from "@/services"
import { useForm } from "@mantine/form"
import { Plus } from "lucide-react"
import { zod4Resolver } from "mantine-form-zod-resolver"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { useEffect, useCallback } from "react"
import { toast } from "sonner"

// Extended attachment type that includes optional id for form state
type AttachmentWithId = Attachment & { id?: string }

type ProjectAttachmentsFormValues = {
  attachments: AttachmentWithId[]
  isUploading: boolean
}

type ProjectAttachmentsProps = {
  projectId: string
  initialAttachments: Partial<ProjectAttachment>[]
}

export function ProjectAttachments({
  projectId,
  initialAttachments,
}: ProjectAttachmentsProps) {
  const t = useTranslations()
  const router = useRouter()

  const form = useForm<ProjectAttachmentsFormValues>({
    mode: "controlled",
    validate: zod4Resolver(projectAttachmentsSchema),
    initialValues: {
      attachments: [],
      isUploading: false,
    },
  })

  // Update form when initialAttachments change
  useEffect(() => {
    const attachments: AttachmentWithId[] = initialAttachments
      .filter((att): att is Partial<ProjectAttachment> & { fileUrl: string } =>
        Boolean(att.fileUrl)
      )
      .map((att) => ({
        id: att.id,
        fileUrl: att.fileUrl!,
        fileName: att.fileName || undefined,
        fileType: att.fileType || undefined,
        fileSize: att.fileSize || undefined,
      }))
    form.setFieldValue("attachments", attachments)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialAttachments])

  const handleFileUpload = async (
    files: Array<{ ufsUrl: string; name: string; size: number; type: string }>
  ) => {
    try {
      const newAttachments: Attachment[] = files.map((file) => ({
        fileUrl: file.ufsUrl,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
      }))

      // Combine existing attachments (with IDs) and new attachments (without IDs)
      const allAttachments: AttachmentWithId[] = [
        ...form.values.attachments,
        ...newAttachments,
      ]

      // Update form with new attachments (sync will happen on submit)
      form.setFieldValue("attachments", allAttachments)
    } catch (error) {
      console.error("Error adding attachments:", error)
      toast.error(t("projects.form.attachments.uploadError"))
    }
  }

  const handleFileRemove = useCallback(
    (id: string | undefined) => {
      if (!id) return
      const updatedAttachments = form.values.attachments.filter(
        (att) => att.id !== id
      )
      form.setFieldValue("attachments", updatedAttachments)
    },
    [form]
  )

  const handleSubmit = async (values: ProjectAttachmentsFormValues) => {
    try {
      // Send all attachments to the API
      // The API will handle creating new ones and deleting removed ones
      // Attachments with IDs are existing, without IDs are new
      await apiClient.post(`/api/projects/${projectId}/attachments`, {
        attachments: values.attachments.map((att) => ({
          id: att.id, // Include ID if it exists (for existing attachments)
          fileUrl: att.fileUrl,
          fileName: att.fileName,
          fileType: att.fileType,
          fileSize: att.fileSize,
          additionalInfo: att.additionalInfo,
        })),
      })

      // Refresh the page to get updated attachments
      router.refresh()
      toast.success(t("projects.success.attachments_added"))
    } catch (error) {
      console.error("Error saving attachments:", error)
      toast.error(t("projects.form.attachments.uploadError"))
    }
  }

  const attachments = form.values.attachments

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <div className="flex flex-col gap-4">
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
                disabled={form.submitting}
              />
            </div>

            <div className="flex flex-col gap-2">
              {attachments.length > 0 ? (
                attachments.map((attachment) => (
                  <AttachmentPreview
                    key={attachment.id ?? attachment.fileUrl}
                    attachment={attachment as Partial<ProjectAttachment>}
                    onDelete={() => handleFileRemove(attachment.id)}
                  />
                ))
              ) : (
                <p className="text-muted-foreground py-4 text-center text-sm">
                  {t("projects.form.attachments.noFiles") ||
                    "No files attached"}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex justify-end">
              <Button
                type="submit"
                className={"px-8"}
                disabled={form.submitting}
              >
                {form.submitting ? (
                  <Spinner className="me-2" />
                ) : (
                  t("common.save")
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </form>
  )
}
