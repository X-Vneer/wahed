"use client"

import {
  FormFileUpload,
  type UploadedFileAttachment,
} from "@/components/form-file-upload"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { ProjectAttachment } from "@/lib/generated/prisma/client"
import {
  type Attachment,
  projectAttachmentsSchema,
} from "@/lib/schemas/attachment"
import apiClient from "@/services"
import { useForm } from "@mantine/form"
import { useQueryClient } from "@tanstack/react-query"
import { zod4Resolver } from "mantine-form-zod-resolver"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
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
  }, [JSON.stringify(initialAttachments)])

  const attachmentsValue: UploadedFileAttachment[] =
    form.values.attachments.map((att) => ({
      fileUrl: att.fileUrl,
      fileName: att.fileName ?? "",
      fileType: att.fileType,
      fileSize: att.fileSize,
    }))

  const handleAttachmentsChange = (files: UploadedFileAttachment[]) => {
    const merged: AttachmentWithId[] = files.map((f) => {
      const existing = form.values.attachments.find(
        (a) => a.fileUrl === f.fileUrl && a.fileName === f.fileName
      )
      return {
        ...f,
        id: existing?.id,
        additionalInfo: existing?.additionalInfo,
      }
    })
    form.setFieldValue("attachments", merged)
  }

  const queryClient = useQueryClient()
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

      queryClient.invalidateQueries({ queryKey: ["projects"] })

      toast.success(t("projects.success.attachments_added"))
    } catch (error) {
      console.error("Error saving attachments:", error)
      toast.error(t("projects.form.attachments.uploadError"))
    }
  }

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <div className="flex flex-col gap-4">
        <Card>
          <CardContent>
            <div className="mb-4">
              <h3 className="text-lg font-bold">
                {t("projects.form.attachments.title")}
              </h3>
            </div>

            <FormFileUpload
              endpoint="projectAttachmentsUploader"
              value={attachmentsValue}
              onChange={handleAttachmentsChange}
              triggerLabel={t("projects.form.attachments.addDocuments")}
              multiple
              disabled={form.submitting}
            />
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
