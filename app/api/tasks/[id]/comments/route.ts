import { PERMISSIONS_GROUPED } from "@/config"
import db from "@/lib/db"
import { getAccessTokenPayload } from "@/lib/get-access-token"
import { createTaskCommentSchema } from "@/lib/schemas/task"
import { transformZodError } from "@/lib/transform-errors"
import { getReqLocale } from "@/utils/get-req-locale"
import { hasPermission } from "@/utils/has-permission"
import { getTranslations } from "next-intl/server"
import { type NextRequest, NextResponse } from "next/server"

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const locale = await getReqLocale(request)
    const t = await getTranslations({ locale })
    const permissionCheck = await hasPermission(PERMISSIONS_GROUPED.TASK.UPDATE)
    if (!permissionCheck.hasPermission) {
      return permissionCheck.error!
    }

    const payload = await getAccessTokenPayload()
    if (!payload || !payload.userId) {
      return NextResponse.json(
        { error: t("errors.unauthorized") },
        { status: 401 }
      )
    }

    const { id: taskId } = await context.params
    const body = await request.json()
    const validationResult = createTaskCommentSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: t("errors.validation_failed"),
          details: transformZodError(validationResult.error),
        },
        { status: 400 }
      )
    }

    const data = validationResult.data

    const task = await db.task.findUnique({
      where: { id: taskId },
      select: { id: true },
    })

    if (!task) {
      return NextResponse.json(
        { error: t("tasks.errors.not_found") },
        { status: 404 }
      )
    }

    const comment = await db.taskComment.create({
      data: {
        content: data.content,
        taskId,
        createdById: payload.userId,
      },
      include: {
        createdBy: { select: { id: true, name: true, image: true } },
      },
    })

    return NextResponse.json(comment, { status: 201 })
  } catch (error) {
    console.error("Error creating task comment:", error)
    const locale = await getReqLocale(request)
    const t = await getTranslations({ locale })
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const locale = await getReqLocale(request)
    const t = await getTranslations({ locale })
    const permissionCheck = await hasPermission(PERMISSIONS_GROUPED.TASK.VIEW)
    if (!permissionCheck.hasPermission) {
      return permissionCheck.error!
    }

    const { id: taskId } = await context.params

    const task = await db.task.findUnique({
      where: { id: taskId },
      select: { id: true },
    })

    if (!task) {
      return NextResponse.json(
        { error: t("tasks.errors.not_found") },
        { status: 404 }
      )
    }

    const comments = await db.taskComment.findMany({
      where: { taskId },
      include: {
        createdBy: { select: { id: true, name: true, image: true } },
      },
      orderBy: { createdAt: "asc" },
    })

    return NextResponse.json(comments)
  } catch (error) {
    console.error("Error fetching task comments:", error)
    const locale = await getReqLocale(request)
    const t = await getTranslations({ locale })
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}


