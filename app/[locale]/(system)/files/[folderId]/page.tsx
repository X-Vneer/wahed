"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
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
import {
  FormFileUpload,
  type UploadedFileAttachment,
} from "@/components/form-file-upload"
import { Link } from "@/lib/i18n/navigation"
import { cn } from "@/lib/utils"
import {
  Download,
  File as FileIcon,
  Image as ImageIcon,
  Trash2,
} from "lucide-react"
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

  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [fileToDelete, setFileToDelete] = useState<FileItem | null>(null)

  const performDelete = async (file: FileItem) => {
    if (!selectedFolder) return
    setDeletingId(file.id)
    try {
      if (file.source === "PUBLIC") {
        const res = await fetch(`/api/files/${file.id}`, { method: "DELETE" })
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data?.error ?? "Failed to delete file")
        }
      } else if (file.source === "PROJECT" && selectedFolder.type === "PROJECT") {
        const projectAttachments = selectedFolder.files
          .filter((f) => f.source === "PROJECT" && f.id !== file.id)
          .map((f) => ({
            id: f.id,
            fileUrl: f.fileUrl,
            fileName: f.fileName ?? undefined,
            fileType: f.fileType ?? undefined,
            fileSize: f.fileSize ?? undefined,
          }))
        const res = await fetch(
          `/api/projects/${selectedFolder.id}/attachments`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ attachments: projectAttachments }),
          }
        )
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data?.error ?? "Failed to delete file")
        }
      } else if (file.source === "TASK" && file.taskId) {
        const res = await fetch(
          `/api/tasks/${file.taskId}/attachments/${file.id}`,
          { method: "DELETE" }
        )
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data?.error ?? "Failed to delete file")
        }
      } else {
        setDeletingId(null)
        return
      }
      queryClient.invalidateQueries({ queryKey: ["files"] })
      toast.success(t("projects.form.attachments.fileRemoved"))
      setFileToDelete(null)
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : t("projects.form.attachments.uploadError")
      )
    } finally {
      setDeletingId(null)
    }
  }

  const handleDeleteClick = (file: FileItem) => {
    if (!selectedFolder) return
    setFileToDelete(file)
  }

  return (
    <div className="flex h-full flex-col gap-6">
      <AlertDialog
        open={fileToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setFileToDelete(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("projects.form.attachments.removeFileTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("projects.form.attachments.confirmRemoveFile")}
              {fileToDelete && (
                <span className="mt-1 block font-medium text-foreground">
                  {fileToDelete.fileName || t("attachmentPreview.file")}
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingId !== null}>
              {t("projects.form.attachments.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => fileToDelete && performDelete(fileToDelete)}
              disabled={deletingId !== null}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {deletingId !== null
                ? t("projects.form.attachments.removing")
                : t("projects.form.attachments.remove")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
                <FormFileUpload
                  endpoint="publicFilesUploader"
                  value={[]}
                  onChange={(files: UploadedFileAttachment[]) => {
                    if (files.length > 0) {
                      queryClient.invalidateQueries({ queryKey: ["files"] })
                      toast.success(t("projects.form.attachments.uploaded"))
                    }
                  }}
                  triggerLabel={t("projects.form.attachments.addDocuments")}
                />
              )}

              {selectedFolder.type === "PROJECT" && (
                <FormFileUpload
                  endpoint="projectAttachmentsUploader"
                  value={[]}
                  onChange={async (files: UploadedFileAttachment[]) => {
                    if (files.length === 0) return

                    try {
                      const existingProjectAttachments = selectedFolder.files
                        .filter((file) => file.source === "PROJECT")
                        .map((file) => ({
                          id: file.id,
                          fileUrl: file.fileUrl,
                          fileName: file.fileName ?? undefined,
                          fileType: file.fileType ?? undefined,
                          fileSize: file.fileSize ?? undefined,
                        }))

                      const newAttachments = files.map((f) => ({
                        fileUrl: f.fileUrl,
                        fileName: f.fileName,
                        fileType: f.fileType,
                        fileSize: f.fileSize,
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
                  triggerLabel={t("projects.form.attachments.addDocuments")}
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
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:bg-destructive/10 size-9"
                          onClick={() => handleDeleteClick(file)}
                          disabled={deletingId === file.id}
                          aria-label={t("projects.form.attachments.remove")}
                        >
                          <Trash2 className="size-5" />
                        </Button>
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
                        <div className="flex items-center gap-1">
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
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:bg-destructive/10 size-8"
                            onClick={() => handleDeleteClick(file)}
                            disabled={deletingId === file.id}
                            aria-label={t("projects.form.attachments.remove")}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
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
