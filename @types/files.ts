export type FileSource = "PROJECT" | "TASK"

export interface FileItem {
  id: string
  fileUrl: string
  fileName: string | null
  fileType: string | null
  fileSize: number | null
  createdAt: string
  source: FileSource
  projectId: string | null
  projectName: string | null
  taskId?: string | null
  taskTitle?: string | null
  isFinalFromTask?: boolean
}

export interface FilesFolder {
  id: string
  name: string
  type: "PROJECT" | "PUBLIC"
  files: FileItem[]
}

export interface FilesResponse {
  folders: FilesFolder[]
}

