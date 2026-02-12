import { PERMISSIONS_GROUPED } from "@/config"
import db from "@/lib/db"
import { getLocaleFromRequest } from "@/lib/i18n/utils"
import type { FileItem, FilesFolder, FilesResponse } from "@/@types/files"
import { getReqLocale } from "@/utils/get-req-locale"
import { hasPermission } from "@/utils/has-permission"
import { getTranslations } from "next-intl/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Require project view permission to access the files archive
    const permissionCheck = await hasPermission(
      PERMISSIONS_GROUPED.PROJECT.VIEW
    )
    if (!permissionCheck.hasPermission) {
      return permissionCheck.error!
    }

    const locale = getLocaleFromRequest(request)

    const projects = await db.project.findMany({
      include: {
        attachments: true,
        tasks: {
          select: {
            id: true,
            title: true,
            taskAttachments: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    const projectFolders: FilesFolder[] = projects.map((project) => {
      const projectName =
        locale === "ar"
          ? (project.nameAr ?? project.nameEn)
          : (project.nameEn ?? project.nameAr)

      const projectFiles: FileItem[] = []

      // Project attachments
      for (const att of project.attachments) {
        projectFiles.push({
          id: att.id,
          fileUrl: att.fileUrl,
          fileName: att.fileName,
          fileType: att.fileType,
          fileSize: att.fileSize,
          createdAt: att.createdAt.toISOString(),
          source: "PROJECT",
          projectId: project.id,
          projectName,
          taskId: null,
          taskTitle: null,
          isFinalFromTask: false,
        })
      }

      // Task attachments that belong to this project
      for (const task of project.tasks) {
        for (const att of task.taskAttachments) {
          const additionalInfo = att.additionalInfo as
            | { isFinal?: boolean }
            | null
            | undefined

          projectFiles.push({
            id: att.id,
            fileUrl: att.fileUrl,
            fileName: att.fileName,
            fileType: att.fileType,
            fileSize: att.fileSize,
            createdAt: att.createdAt.toISOString(),
            source: "TASK",
            projectId: project.id,
            projectName,
            taskId: task.id,
            taskTitle: task.title,
            isFinalFromTask: additionalInfo?.isFinal === true,
          })
        }
      }

      // Newest files first inside each folder
      projectFiles.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))

      return {
        id: project.id,
        name: projectName,
        type: "PROJECT",
        files: projectFiles,
      }
    })

    // Public folder for any files not related to projects.
    // Currently there are no standalone file models, but the folder is prepared
    // for future use.
    const publicFolder: FilesFolder = {
      id: "public",
      name: locale === "ar" ? "الملفات العامة" : "Public files",
      type: "PUBLIC",
      files: [],
    }

    const response: FilesResponse = {
      folders: [publicFolder, ...projectFolders],
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error fetching files archive:", error)
    const locale = await getReqLocale(request)
    const t = await getTranslations({ locale })
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}
