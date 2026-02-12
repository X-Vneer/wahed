"use client"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { useFiles } from "@/hooks/use-files"
import type { FileItem, FilesFolder, FileSource } from "@/@types/files"
import { UploadButton } from "@/lib/uploadthing"
import { Link } from "@/lib/i18n/navigation"
import { cn } from "@/lib/utils"
import { Download, File as FileIcon, Image as ImageIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import { useQueryClient } from "@tanstack/react-query"
import { useParams } from "next/navigation"
import { useMemo, useState } from "react"
import { toast } from "sonner"

type ViewMode = "list" | "grid"

const FolderFilesPage = () => {
  const t = useTranslations()
  const params = useParams<{ folderId: string }>()
  const { data, isLoading, error } = useFiles()
  const [viewMode, setViewMode] = useState<ViewMode>("list")
  const queryClient = useQueryClient()

  const folders: FilesFolder[] = useMemo(() => data?.folders ?? [], [data])

  const selectedFolder = useMemo(() => {
    if (!folders.length) return undefined
    return (
      folders.find((f) => f.id === params.folderId) ??
      folders.find((f) => f.id === "public")
    )
  }, [folders, params.folderId])

  const handleDownload = (url: string) => {
    if (!url) return
    window.open(url, "_blank")
  }

  const getSourceLabel = (source: FileSource) => {
    if (source === "PROJECT") {
      return t("projects.sidebar.files")
    }
    return t("taskPage.supportingDocuments")
  }

  const getFileTypeIcon = (fileType: string | null) => {
    if (!fileType) return FileIcon
    const type = fileType.toLowerCase()
    if (type.includes("image")) return ImageIcon
    return FileIcon
  }

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">
          {selectedFolder?.name || t("projects.sidebar.files")}
        </h1>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">{t("sidebar.home")}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/files">
                {t("projects.sidebar.files")}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>
                {selectedFolder?.name || t("projects.sidebar.files")}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {isLoading && (
        <div className="flex flex-1 items-center justify-center py-12">
          <Spinner className="size-8" />
        </div>
      )}

      {error && (
        <div className="flex flex-1 items-center justify-center py-12">
          <p className="text-destructive text-sm">
            {t("errors.internal_server_error")}
          </p>
        </div>
      )}

      {!isLoading && !error && !selectedFolder && (
        <div className="flex flex-1 items-center justify-center py-12">
          <p className="text-muted-foreground text-sm">
            {t("projects.form.attachments.noFiles") || "No files"}
          </p>
        </div>
      )}

      {!isLoading && !error && selectedFolder && (
        <div className="flex flex-1 flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-muted-foreground text-sm">
                <Link
                  href="/files"
                  className="hover:text-primary hover:underline"
                >
                  {t("projects.sidebar.files")}
                </Link>
              </p>
              <h2 className="text-lg font-semibold">{selectedFolder.name}</h2>
            </div>
            <div className="flex items-start gap-2">
              {selectedFolder.type === "PUBLIC" && (
                <UploadButton
                  endpoint="publicFilesUploader"
                  onClientUploadComplete={(res) => {
                    if (res && res.length > 0) {
                      // Files are already saved in DB in onUploadComplete; just refetch
                      queryClient.invalidateQueries({ queryKey: ["files"] })
                      toast.success(t("projects.form.attachments.uploaded"))
                    }
                  }}
                  onUploadError={(error: Error) => {
                    toast.error(
                      error.message ||
                        t("projects.form.attachments.uploadError")
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
                      </span>
                    ),
                    allowedContent: <span></span>,
                  }}
                />
              )}

              {selectedFolder.type === "PROJECT" && (
                <UploadButton
                  endpoint="projectAttachmentsUploader"
                  onClientUploadComplete={async (res: Array<{ url: string; file?: { name?: string; type?: string; size?: number } }>) => {
                    if (!res || res.length === 0) return

                    try {
                      // Keep existing project attachments and append the newly uploaded ones
                      const existingProjectAttachments = selectedFolder.files
                        .filter((file) => file.source === "PROJECT")
                        .map((file) => ({
                          id: file.id,
                          fileUrl: file.fileUrl,
                          fileName: file.fileName ?? undefined,
                          fileType: file.fileType ?? undefined,
                          fileSize: file.fileSize ?? undefined,
                        }))

                      const newAttachments = res.map((item) => ({
                        fileUrl: item.url,
                        fileName: item.file?.name as string | undefined,
                        fileType: item.file?.type as string | undefined,
                        fileSize: item.file?.size as number | undefined,
                      }))

                      const response = await fetch(
                        `/api/projects/${selectedFolder.id}/attachments`,
                        {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify({
                            attachments: [
                              ...existingProjectAttachments,
                              ...newAttachments,
                            ],
                          }),
                        }
                      )

                      if (!response.ok) {
                        throw new Error("Failed to save project attachments")
                      }

                      queryClient.invalidateQueries({ queryKey: ["files"] })
                      toast.success(t("projects.form.attachments.uploaded"))
                    } catch (error) {
                      console.error("Error saving project attachments", error)
                      toast.error(
                        t("projects.form.attachments.uploadError") ||
                          "Failed to save attachments"
                      )
                    }
                  }}
                  onUploadError={(error: Error) => {
                    toast.error(
                      error.message ||
                        t("projects.form.attachments.uploadError")
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
                      </span>
                    ),
                    allowedContent: <span></span>,
                  }}
                />
              )}
              <div className="inline-flex rounded-lg border bg-white p-1">
                <Button
                  type="button"
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="icon"
                  className={cn(
                    "size-8",
                    viewMode === "list" && "bg-primary text-primary-foreground"
                  )}
                  onClick={() => setViewMode("list")}
                  aria-label="List view"
                >
                  {/* simple list icon using three lines */}
                  <span className="flex flex-col gap-0.5">
                    <span className="h-0.5 w-3 rounded bg-current" />
                    <span className="h-0.5 w-3 rounded bg-current" />
                    <span className="h-0.5 w-3 rounded bg-current" />
                  </span>
                </Button>
                <Button
                  type="button"
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="icon"
                  className={cn(
                    "size-8",
                    viewMode === "grid" && "bg-primary text-primary-foreground"
                  )}
                  onClick={() => setViewMode("grid")}
                  aria-label="Grid view"
                >
                  <span className="grid grid-cols-2 gap-0.5">
                    <span className="h-1.5 w-1.5 rounded bg-current" />
                    <span className="h-1.5 w-1.5 rounded bg-current" />
                    <span className="h-1.5 w-1.5 rounded bg-current" />
                    <span className="h-1.5 w-1.5 rounded bg-current" />
                  </span>
                </Button>
              </div>
            </div>
          </div>
          {selectedFolder.files.length === 0 && (
            <div className="flex flex-1 items-center justify-center py-12">
              <p className="text-muted-foreground text-sm">
                {t("projects.form.attachments.noFiles") || "No files"}
              </p>
            </div>
          )}
          {selectedFolder.files.length > 0 && viewMode === "list" && (
            <div className="flex flex-col gap-2">
              {selectedFolder.files.map((file: FileItem) => {
                const Icon = getFileTypeIcon(file.fileType)
                return (
                  <Card key={file.id} className="bg-[#f7f7f7] py-2 ring-0">
                    <CardContent className="px-3">
                      <div className="flex items-center gap-3">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="hover:text-primary size-9"
                          onClick={() => handleDownload(file.fileUrl)}
                          aria-label={t("attachmentPreview.downloadFile")}
                        >
                          <Download className="size-5" />
                        </Button>
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-white">
                          <Icon className="size-5 text-gray-700" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-1 text-sm font-semibold text-gray-900">
                            {file.fileName || t("attachmentPreview.file")}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {file.projectName}
                            {file.taskTitle ? ` • ${file.taskTitle}` : ""}
                          </p>
                        </div>
                        <Badge variant="outline" className="shrink-0">
                          {getSourceLabel(file.source)}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
          {selectedFolder.files.length > 0 && viewMode === "grid" && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {selectedFolder.files.map((file: FileItem) => {
                const Icon = getFileTypeIcon(file.fileType)
                const isImage =
                  !!file.fileType &&
                  file.fileType.toLowerCase().includes("image")
                return (
                  <Card
                    key={file.id}
                    className="flex h-full flex-col overflow-hidden bg-[#f7f7f7] ring-0"
                  >
                    <CardContent className="flex flex-1 flex-col gap-3 p-3">
                      <div className="relative overflow-hidden rounded-lg bg-white">
                        {isImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={file.fileUrl}
                            alt={file.fileName || "file"}
                            className="h-40 w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-40 items-center justify-center">
                            <Icon className="size-10 text-gray-700" />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-1 flex-col gap-1">
                        <p className="line-clamp-2 text-sm font-semibold text-gray-900">
                          {file.fileName || t("attachmentPreview.file")}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {file.projectName}
                          {file.taskTitle ? ` • ${file.taskTitle}` : ""}
                        </p>
                      </div>
                      <div className="mt-auto flex items-center justify-between gap-2">
                        <Badge variant="outline">
                          {getSourceLabel(file.source)}
                        </Badge>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="hover:text-primary size-8"
                          onClick={() => handleDownload(file.fileUrl)}
                          aria-label={t("attachmentPreview.downloadFile")}
                        >
                          <Download className="size-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default FolderFilesPage
