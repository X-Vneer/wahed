import { PERMISSIONS_GROUPED } from "@/config"
import db from "@/lib/db"
import {
  DynamicRouteContext,
  initLocale,
  requirePermission,
  validateRequest,
} from "@/lib/helpers"
import { updateSubTaskSchema } from "@/lib/schemas/task"
import { type NextRequest, NextResponse } from "next/server"

export async function PATCH(
  request: NextRequest,
  context: DynamicRouteContext<{ id: string; subtaskId: string }>
) {
  const { t } = await initLocale(request)
  try {
    const permError = await requirePermission(PERMISSIONS_GROUPED.TASK.UPDATE)
    if (permError) return permError

    const { id: taskId, subtaskId } = await context.params
    const body = await request.json()
    const validation = validateRequest(updateSubTaskSchema, body, t)
    if (validation.error) return validation.error

    const data = validation.data

    const existing = await db.subTasks.findFirst({
      where: { id: subtaskId, taskId },
      select: { id: true },
    })

    if (!existing) {
      return NextResponse.json(
        { error: t("tasks.errors.subtask_not_found") },
        { status: 404 }
      )
    }

    const updateData: Parameters<typeof db.subTasks.update>[0]["data"] = {}
    if (data.title !== undefined) updateData.title = data.title
    if (data.description !== undefined)
      updateData.description = data.description
    if (data.done !== undefined) {
      updateData.done = data.done
      updateData.doneAt = data.done ? new Date() : null
    }

    const subtask = await db.subTasks.update({
      where: { id: subtaskId },
      data: updateData,
    })

    return NextResponse.json(subtask)
  } catch (error) {
    console.error("Error updating subtask:", error)
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  context: DynamicRouteContext<{ id: string; subtaskId: string }>
) {
  const { t } = await initLocale(request)
  try {
    const permError = await requirePermission(PERMISSIONS_GROUPED.TASK.UPDATE)
    if (permError) return permError

    const { id: taskId, subtaskId } = await context.params

    const existing = await db.subTasks.findFirst({
      where: { id: subtaskId, taskId },
      select: { id: true },
    })

    if (!existing) {
      return NextResponse.json(
        { error: t("tasks.errors.subtask_not_found") },
        { status: 404 }
      )
    }

    await db.subTasks.delete({
      where: { id: subtaskId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting subtask:", error)
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}
