"use client"

import * as React from "react"
import { generatePermittedFileTypes } from "uploadthing/client"
import {
  FileText,
  File as FileIcon,
  FileImage,
  FileVideo,
  FileAudio,
  Upload,
  Plus,
  X,
  Pencil,
} from "lucide-react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { useUploadThing } from "@/lib/uploadthing"
import type { OurFileRouter } from "@/app/api/uploadthing/core"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export type UploadedFileAttachment = {
  fileUrl: string
  fileName: string
  fileType?: string
  fileSize?: number
}

type PendingFile = {
  file: globalThis.File
  displayName: string
  id: string
}

const getFileIcon = (file: globalThis.File) => {
  const type = file.type?.toLowerCase() ?? ""
  if (type.includes("pdf")) return FileText
  if (type.includes("image")) return FileImage
  if (type.includes("video")) return FileVideo
  if (type.includes("audio")) return FileAudio
  return FileIcon
}

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/** Get extension from filename, e.g. "report.pdf" -> ".pdf". Returns "" if none. */
const getFileExtension = (fileName: string): string => {
  const lastDot = fileName.lastIndexOf(".")
  if (lastDot <= 0) return ""
  return fileName.slice(lastDot)
}

type FormFileUploadProps<E extends keyof OurFileRouter> = {
  endpoint: E
  value: UploadedFileAttachment[]
  onChange: (files: UploadedFileAttachment[]) => void
  /** Button label when no files. When multiple, "Add files" makes sense. */
  triggerLabel?: React.ReactNode
  /** For single-file mode, use "Select file" / one file only. Default true = multiple. */
  multiple?: boolean
  disabled?: boolean
  className?: string
  /** Max number of files (existing + new) allowed. Omitted = no limit. */
  maxFiles?: number
}

export function FormFileUpload<E extends keyof OurFileRouter>({
  endpoint,
  value,
  onChange,
  triggerLabel,
  multiple = true,
  disabled = false,
  className,
  maxFiles,
}: FormFileUploadProps<E>) {
  const t = useTranslations("formFileUpload")
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [pendingFiles, setPendingFiles] = React.useState<PendingFile[]>([])
  const displayNamesRef = React.useRef<Record<string, string>>({})
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const uploadToastIdRef = React.useRef<string | null>(null)

  const handleUploadComplete = React.useCallback(
    (
      res: Array<{ ufsUrl: string; name: string; size: number; type: string }>
    ) => {
      const newAttachments: UploadedFileAttachment[] = res.map((file) => ({
        fileUrl: file.ufsUrl,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
      }))
      onChange([...value, ...newAttachments])
      setPendingFiles([])
      displayNamesRef.current = {}
    },
    [value, onChange]
  )

  const { startUpload, routeConfig } = useUploadThing(endpoint, {
    onClientUploadComplete: (res) => {
      const id = uploadToastIdRef.current
      if (id) {
        toast.success(t("successMessage"), { id })
        uploadToastIdRef.current = null
      }
      if (res?.length) {
        handleUploadComplete(
          res.map((f) => ({
            ufsUrl:
              (f as { ufsUrl?: string }).ufsUrl ??
              (f as { url?: string }).url ??
              "",
            name: f.name,
            size: f.size,
            type: f.type,
          }))
        )
      }
    },
    onUploadError: () => {
      const id = uploadToastIdRef.current
      if (id) {
        toast.error(t("dialogDescError"), { id })
        uploadToastIdRef.current = null
      }
    },
    onUploadProgress: (p) => {
      const id = uploadToastIdRef.current
      if (id) {
        toast.loading(t("uploadingProgress", { progress: Math.round(p) }), {
          id,
        })
      }
    },
    uploadProgressGranularity: "fine",
  })

  const acceptString = React.useMemo(() => {
    if (!routeConfig) return undefined
    const { fileTypes } = generatePermittedFileTypes(routeConfig)
    if (Array.isArray(fileTypes) && fileTypes.length > 0) {
      return fileTypes.join(",")
    }
    return undefined
  }, [routeConfig])

  const addFiles = React.useCallback(
    (files: FileList | null) => {
      if (!files?.length) return
      const list = Array.from(files)
      const atLimit =
        maxFiles != null && value.length + pendingFiles.length >= maxFiles
      if (atLimit) return

      setPendingFiles((prev) => {
        if (!multiple) {
          return [
            {
              id: `${list[0].name}-${list[0].size}-${Date.now()}`,
              file: list[0],
              displayName: list[0].name,
            },
          ]
        }
        const next = [...prev]
        for (const file of list) {
          if (maxFiles != null && value.length + next.length >= maxFiles) break
          next.push({
            id: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
            file,
            displayName: file.name,
          })
        }
        return next
      })
    },
    [multiple, maxFiles, value.length, pendingFiles.length]
  )

  const updateDisplayName = (id: string, name: string) => {
    setPendingFiles((prev) =>
      prev.map((p) => (p.id === id ? { ...p, displayName: name } : p))
    )
    displayNamesRef.current[id] = name
  }

  const removePending = (id: string) => {
    setPendingFiles((prev) => prev.filter((p) => p.id !== id))
    delete displayNamesRef.current[id]
  }

  const openDialog = () => {
    setPendingFiles([])
    displayNamesRef.current = {}
    setDialogOpen(true)
  }

  const handleSave = () => {
    if (pendingFiles.length === 0) return
    const files = pendingFiles.map((p) => p.file)
    const displayNames = pendingFiles.map(
      (p) => displayNamesRef.current[p.id] ?? p.displayName
    )
    const renamedFiles = files.map((f, i) => {
      const name = displayNames[i]?.trim() || f.name
      return new globalThis.File([f], name, { type: f.type })
    })
    const toastId = `upload-${Date.now()}`
    uploadToastIdRef.current = toastId
    toast.loading(t("uploadingProgress", { progress: 0 }), { id: toastId })
    // @ts-expect-error -- useUploadThing generic union makes (files, input?) strict for multi-endpoint
    startUpload(renamedFiles)
    setDialogOpen(false)
    setPendingFiles([])
    displayNamesRef.current = {}
  }

  const closeDialog = () => {
    setDialogOpen(false)
    setPendingFiles([])
    displayNamesRef.current = {}
  }

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open)
    if (!open) {
      setPendingFiles([])
      displayNamesRef.current = {}
    }
  }

  const atLimit = maxFiles != null && value.length >= maxFiles
  const triggerLabelResolved =
    triggerLabel ?? (multiple ? t("addFiles") : t("addFile"))

  return (
    <div className={cn("space-y-3", className)}>
      {/* Already uploaded files on the page */}
      {value.length > 0 && (
        <ul className="space-y-2">
          {value.map((att, i) => (
            <UploadedFileRow
              key={`${att.fileUrl}-${i}`}
              attachment={att}
              onRemove={() => {
                const next = value.filter((_, idx) => idx !== i)
                onChange(next)
              }}
              removeLabel={t("removeFile")}
            />
          ))}
        </ul>
      )}

      {/* Button that opens the dialog */}
      <Button
        type="button"
        onClick={openDialog}
        disabled={disabled || atLimit}
        className="gap-2"
      >
        <Plus className="size-4" />
        {triggerLabelResolved}
      </Button>

      {/* Dialog: select files, rename, then Save uploads in background and closes */}
      <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="bg-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("dialogTitle")}</DialogTitle>
            <DialogDescription>{t("dialogDescIdle")}</DialogDescription>
          </DialogHeader>

          <input
            ref={fileInputRef}
            type="file"
            className="sr-only"
            multiple={multiple}
            accept={acceptString}
            onChange={(e) => {
              addFiles(e.target.files)
              e.target.value = ""
            }}
          />
          <Button
            type="button"
            variant="outline"
            className="w-full gap-2"
            onClick={() => fileInputRef.current?.click()}
            disabled={
              maxFiles != null &&
              pendingFiles.length >= maxFiles - value.length
            }
          >
            <Upload className="size-4" />
            {multiple ? t("selectFiles") : t("selectFile")}
          </Button>

          {pendingFiles.length === 0 ? (
            <p className="text-muted-foreground py-4 text-center text-sm">
              {t("noFilesSelected")}
            </p>
          ) : (
            <div className="space-y-2">
              <p className="text-muted-foreground text-xs">
                {t("renameHint")}
              </p>
              <ul className="max-h-[240px] space-y-2 overflow-y-auto">
                {pendingFiles.map((item) => (
                  <PendingFileRow
                    key={item.id}
                    item={item}
                    onNameChange={(name) => updateDisplayName(item.id, name)}
                    onRemove={() => removePending(item.id)}
                    removeLabel={t("removeFile")}
                    renameTitle={t("clickToRename")}
                  />
                ))}
              </ul>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="px-10"
              onClick={closeDialog}
            >
              {t("cancel")}
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              className="px-10"
              disabled={pendingFiles.length === 0}
            >
              {t("save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function PendingFileRow({
  item,
  onNameChange,
  onRemove,
  removeLabel,
  renameTitle,
}: {
  item: PendingFile
  onNameChange: (name: string) => void
  onRemove: () => void
  removeLabel: string
  renameTitle: string
}) {
  const [editing, setEditing] = React.useState(false)
  const [name, setName] = React.useState(item.displayName)

  React.useEffect(() => {
    setName(item.displayName)
  }, [item.displayName])

  const handleBlur = () => {
    setEditing(false)
    const trimmed = name.trim() || item.file.name
    const ext = getFileExtension(item.file.name)
    const finalName =
      ext && !trimmed.toLowerCase().endsWith(ext.toLowerCase())
        ? `${trimmed}${ext}`
        : trimmed
    onNameChange(finalName)
  }

  const iconComponent = getFileIcon(item.file)

  return (
    <li className="border-border bg-muted/30 flex items-center gap-2 rounded-lg border px-3 py-2">
      <div className="text-muted-foreground flex size-8 shrink-0 items-center justify-center">
        {React.createElement(iconComponent, { className: "size-4" })}
      </div>
      <div className="min-w-0 flex-1">
        {editing ? (
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={(e) =>
              e.key === "Enter" && (e.target as HTMLInputElement).blur()
            }
            className="h-8 text-sm"
            autoFocus
          />
        ) : (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="flex min-w-0 items-center gap-1.5 text-left text-sm"
            title={renameTitle}
          >
            <span className="line-clamp-1">
              {item.displayName || item.file.name}
            </span>
            <Pencil className="text-muted-foreground size-3.5 shrink-0" aria-hidden />
          </button>
        )}
      </div>
      <span className="text-muted-foreground shrink-0 text-xs">
        {formatFileSize(item.file.size)}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="text-destructive hover:bg-destructive/10 size-8"
        onClick={onRemove}
        aria-label={removeLabel}
      >
        <X className="size-4" />
      </Button>
    </li>
  )
}

function UploadedFileRow({
  attachment,
  onRemove,
  removeLabel,
}: {
  attachment: UploadedFileAttachment
  onRemove: () => void
  removeLabel: string
}) {
  const type = attachment.fileType?.toLowerCase() ?? ""
  let IconComponent = FileIcon
  if (type.includes("pdf")) IconComponent = FileText
  else if (type.includes("image")) IconComponent = FileImage
  else if (type.includes("video")) IconComponent = FileVideo
  else if (type.includes("audio")) IconComponent = FileAudio

  const sizeStr =
    attachment.fileSize != null ? formatFileSize(attachment.fileSize) : null

  return (
    <li className="border-border bg-muted/30 flex items-center gap-2 rounded-lg border px-3 py-2">
      <div className="text-muted-foreground flex size-8 shrink-0 items-center justify-center">
        {React.createElement(IconComponent, { className: "size-4" })}
      </div>
      <a
        href={attachment.fileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-foreground min-w-0 flex-1 truncate text-sm font-medium underline-offset-2 hover:underline"
      >
        {attachment.fileName}
      </a>
      {sizeStr && (
        <span className="text-muted-foreground shrink-0 text-xs">
          {sizeStr}
        </span>
      )}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="text-destructive hover:bg-destructive/10 size-8"
        onClick={onRemove}
        aria-label={removeLabel}
      >
        <X className="size-4" />
      </Button>
    </li>
  )
}
