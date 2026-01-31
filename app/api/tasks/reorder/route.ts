import db from "@/lib/db"
import { getReqLocale } from "@/utils/get-req-locale"
import { getTranslations } from "next-intl/server"
import { type NextRequest, NextResponse } from "next/server"
import { hasPermission } from "@/utils/has-permission"
import { PERMISSIONS_GROUPED } from "@/config"
import { z } from "zod"

const reorderSchema = z.object({
  projectId: z.string().min(1),
  taskIds: z.array(z.string().min(1)),
})

export async function PATCH(request: NextRequest) {
  try {
    const permissionCheck = await hasPermission(
      PERMISSIONS_GROUPED.TASK.UPDATE
    )
    if (!permissionCheck.hasPermission) {
      return permissionCheck.error!
    }

    const body = await request.json()
    const parsed = reorderSchema.safeParse(body)

    if (!parsed.success) {
      const locale = await getReqLocale(request)
      const t = await getTranslations({ locale })
      return NextResponse.json(
        { error: t("errors.validation_failed") ?? "Validation failed" },
        { status: 400 }
      )
    }

    const { projectId, taskIds } = parsed.data

    const project = await db.project.findUnique({
      where: { id: projectId },
      select: { id: true },
    })

    if (!project) {
      const locale = await getReqLocale(request)
      const t = await getTranslations({ locale })
      return NextResponse.json(
        { error: t("projects.errors.not_found") },
        { status: 404 }
      )
    }

    await db.$transaction(
      taskIds.map((taskId, index) =>
        db.task.update({
          where: { id: taskId, projectId },
          data: { order: index },
        })
      )
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error reordering tasks:", error)
    const locale = await getReqLocale(request)
    const t = await getTranslations({ locale })
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}
