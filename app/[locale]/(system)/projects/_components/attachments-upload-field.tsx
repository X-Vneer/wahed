"use client"

import { AttachmentPreview } from "@/components/attachment-preview"
import { Card, CardContent } from "@/components/ui/card"
import { Field, FieldLabel } from "@/components/ui/field"
import { UploadButton } from "@/lib/uploadthing"
import { Plus } from "lucide-react"
import { useTranslations } from "next-intl"
import { useEffect } from "react"
import { toast } from "sonner"
import { useProjectFormContext } from "./project-form-context"

export function AttachmentsUploadField() {
  const t = useTranslations()
  const form = useProjectFormContext()
  const attachments = form.values.attachments || []

  // Clean up body overflow style after upload completes
  useEffect(() => {
    const checkAndCleanup = () => {
      // Use a small delay to ensure the modal has closed
      setTimeout(() => {
        if (document.body.style.overflow === "hidden") {
          document.body.style.overflow = ""
        }
      }, 100)
    }

    // Set up a MutationObserver to watch for body style changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "style" &&
          document.body.style.overflow === "hidden"
        ) {
          // Check again after a delay to see if it should be cleaned up
          checkAndCleanup()
        }
      })
    })

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["style"],
    })

    // Also check periodically as a fallback
    const interval = setInterval(checkAndCleanup, 500)

    return () => {
      observer.disconnect()
      clearInterval(interval)
      // Clean up on unmount
      if (document.body.style.overflow === "hidden") {
        document.body.style.overflow = ""
      }
    }
  }, [])

  const handleFileUpload = (
    files: Array<{ ufsUrl: string; name: string; size: number; type: string }>
  ) => {
    const newAttachments = files.map((file) => ({
      fileUrl: file.ufsUrl,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
    }))

    form.setFieldValue("attachments", [...attachments, ...newAttachments])
    toast.success(t("projects.form.attachments.uploaded"))
  }

  const handleFileRemove = (index: number) => {
    const updatedAttachments = attachments.filter((_, i) => i !== index)
    form.setFieldValue("attachments", updatedAttachments)
  }

  return (
    <Card className="ring-none shadow-none ring-0">
      <CardContent>
        <Field>
          <div className="relative flex flex-row items-center justify-between gap-4">
            <FieldLabel className="mb-4 text-lg font-bold">
              {t("projects.form.attachments.title")}
            </FieldLabel>
            {/* Add Documents Button */}
            <div className="flex justify-start">
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
                    "border-primary text-primary hover:bg-primary bg-white hover:text-white ut-ready:bg-primary ut-ready:text-white ut-uploading:bg-primary ut-uploading:text-white",
                }}
                content={{
                  button: (
                    <span className="flex items-center gap-2">
                      {t("projects.form.attachments.addDocuments")}
                      <div className="border-primary flex h-5 w-5 items-center justify-center rounded border bg-white">
                        <Plus className="text-primary h-3 w-3" />
                      </div>
                    </span>
                  ),
                  allowedContent: <span></span>,
                }}
              />
            </div>
          </div>

          <div className="space-y-4">
            {/* Attached Files List */}
            {attachments.length > 0 && (
              <div className="space-y-2">
                {attachments.map((attachment, index) => {
                  return (
                    <AttachmentPreview
                      key={attachment.fileUrl}
                      attachment={attachment}
                      onDelete={() => handleFileRemove(index)}
                    />
                  )
                })}
              </div>
            )}
          </div>
        </Field>
      </CardContent>
    </Card>
  )
}
