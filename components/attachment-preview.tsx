"use client"

import {
  FileText,
  File,
  FileImage,
  FileVideo,
  FileAudio,
  X,
  Download,
} from "lucide-react"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "./ui/card"
import { useTranslations } from "next-intl"
import type { ProjectAttachment } from "@/lib/generated/prisma/client"

type AttachmentPreviewProps = {
  attachment: Partial<ProjectAttachment>
  onDelete?: () => void
  className?: string
}

const getFileIcon = (fileType?: string | null) => {
  if (!fileType) return File
  const type = fileType.toLowerCase()

  if (type.includes("pdf")) return FileText
  if (type.includes("image")) return FileImage
  if (type.includes("video")) return FileVideo
  if (type.includes("audio")) return FileAudio
  if (type.includes("text") || type.includes("document")) return FileText
  return File
}

const getFileTypeColor = (fileType?: string | null) => {
  if (!fileType) return "bg-gray-100"
  const type = fileType.toLowerCase()

  if (type.includes("pdf")) return "bg-red-50"
  if (type.includes("image")) return "bg-blue-50"
  if (type.includes("video")) return "bg-purple-50"
  if (type.includes("audio")) return "bg-green-50"
  return "bg-gray-50"
}

const formatFileSize = (
  bytes?: number | null,
  unknownSizeText?: string
): string => {
  if (!bytes) return unknownSizeText || "Unknown size"
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
}

const renderFileIcon = (fileType?: string | null) => {
  const Icon = getFileIcon(fileType)
  return <Icon className="h-5 w-5 text-gray-700" />
}

export function AttachmentPreview({
  attachment,
  onDelete,
}: AttachmentPreviewProps) {
  const t = useTranslations()
  const bgColor = getFileTypeColor(attachment.fileType)
  const fileName = attachment.fileName || t("attachmentPreview.file")
  const fileType = attachment.fileType || t("attachmentPreview.unknownType")
  const fileSize = formatFileSize(
    attachment.fileSize,
    t("attachmentPreview.unknownSize")
  )

  const handleDownload = () => {
    window.open(attachment.fileUrl, "_blank")
  }

  return (
    <HoverCard>
      <HoverCardTrigger aria-label={t("attachmentPreview.viewFileDetails")}>
        <Card className="py-2 ring-1">
          <CardContent>
            <div className="flex gap-2">
              {/* File Icon */}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleDownload}
                aria-label={t("attachmentPreview.downloadFile")}
                className={"hover:text-primary size-10"}
              >
                <Download />
              </Button>
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded ${bgColor}`}
              >
                {renderFileIcon(attachment.fileType)}
              </div>

              {/* File Name */}
              <div className="min-w-0 flex-1">
                <p className="line-clamp-1 font-semibold text-gray-900">
                  {fileName}
                </p>
                <p className="text-sm text-gray-500">{fileSize}</p>
              </div>

              {/* Actions */}
              <div className="flex shrink-0 items-center gap-2">
                {/* Download Button */}
                {/* Delete Button */}
                {onDelete && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={onDelete}
                    className="bg-destructive/10 hover:bg-destructive/20 text-destructive size-10"
                    aria-label={t("attachmentPreview.deleteFile")}
                  >
                    <X />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </HoverCardTrigger>
      <HoverCardContent>
        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-semibold text-gray-900">
              {t("attachmentPreview.fileDetails")}
            </h4>
          </div>
          <div className="space-y-2 text-sm">
            <div>
              <p className="text-xs font-medium text-gray-500">
                {t("attachmentPreview.name")}
              </p>
              <p className="wrap-break-word text-gray-900">{fileName}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">
                {t("attachmentPreview.type")}
              </p>
              <p className="text-gray-900">{fileType}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">
                {t("attachmentPreview.size")}
              </p>
              <p className="text-gray-900">{fileSize}</p>
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}
