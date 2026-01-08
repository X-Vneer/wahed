"use client"

import { Field, FieldLabel } from "@/components/ui/field"
import { UploadButton } from "@/lib/uploadthing"
import {
  FileText,
  File,
  FileImage,
  FileVideo,
  FileAudio,
  Download,
  X,
  Plus,
} from "lucide-react"
import { useTranslations } from "next-intl"
import { useEffect } from "react"
import { toast } from "sonner"
import { useProjectFormContext } from "./project-form-context"
import { Card, CardContent } from "@/components/ui/card"

type Attachment = {
  fileUrl: string
  fileName?: string
  fileType?: string
  fileSize?: number
}

const getFileIcon = (fileType?: string) => {
  if (!fileType) return File
  const type = fileType.toLowerCase()

  if (type.includes("pdf")) return FileText
  if (type.includes("image")) return FileImage
  if (type.includes("video")) return FileVideo
  if (type.includes("audio")) return FileAudio
  if (type.includes("text") || type.includes("document")) return FileText
  return File
}

const getFileTypeColor = (fileType?: string) => {
  if (!fileType) return "bg-gray-100"
  const type = fileType.toLowerCase()

  if (type.includes("pdf")) return "bg-red-50"
  if (type.includes("image")) return "bg-blue-50"
  if (type.includes("video")) return "bg-purple-50"
  if (type.includes("audio")) return "bg-green-50"
  return "bg-gray-50"
}

export function AttachmentsUploadField() {
  const t = useTranslations()
  const form = useProjectFormContext()
  const attachments: Attachment[] = form.values.attachments || []

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

  const handleDownload = (url: string) => {
    window.open(url, "_blank")
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
                  const Icon = getFileIcon(attachment.fileType)
                  const bgColor = getFileTypeColor(attachment.fileType)

                  return (
                    <div
                      key={index}
                      className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3"
                    >
                      {/* Download Icon */}
                      <button
                        type="button"
                        onClick={() => handleDownload(attachment.fileUrl)}
                        className="hover:text-primary shrink-0 text-gray-600"
                        aria-label={t("projects.form.attachments.download")}
                      >
                        <Download className="h-5 w-5" />
                      </button>

                      {/* File Icon and Name */}
                      <div className="flex flex-1 items-center gap-3">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded ${bgColor}`}
                        >
                          <Icon className="h-5 w-5 text-gray-700" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">
                            {attachment.fileName || `File ${index + 1}`}
                          </p>
                          <p className="text-sm text-gray-500">
                            {attachment.fileName || `File ${index + 1}`}
                          </p>
                        </div>
                      </div>

                      {/* Remove Icon */}
                      <button
                        type="button"
                        onClick={() => handleFileRemove(index)}
                        className="hover:text-destructive shrink-0 text-gray-400"
                        aria-label={t("projects.form.attachments.remove")}
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
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
