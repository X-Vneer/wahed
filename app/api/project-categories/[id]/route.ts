import db from "@/lib/db"
import { initLocale, validateRequest, type DynamicRouteContext } from "@/utils"
import { updateProjectCategorySchema } from "@/schemas/project-categories"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, context: DynamicRouteContext) {
  const { t } = await initLocale(request)
  try {
    const { id } = await context.params

    const projectCategory = await db.projectCategory.findUnique({
      where: { id },
    })

    if (!projectCategory) {
      return NextResponse.json(
        { error: t("projectCategories.errors.not_found") },
        { status: 404 }
      )
    }

    return NextResponse.json(projectCategory)
  } catch (error) {
    console.error("Error fetching project category:", error)
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, context: DynamicRouteContext) {
  const { t } = await initLocale(request)
  try {
    const { id } = await context.params

    // Parse and validate request body
    const body = await request.json()
    const validation = validateRequest(updateProjectCategorySchema, body, t)
    if (validation.error) return validation.error

    // Check if project category exists
    const existingProjectCategory = await db.projectCategory.findUnique({
      where: { id },
    })

    if (!existingProjectCategory) {
      return NextResponse.json(
        { error: t("projectCategories.errors.not_found") },
        { status: 404 }
      )
    }

    const data = validation.data

    // Update project category
    const projectCategory = await db.projectCategory.update({
      where: { id },
      data: {
        nameAr: data.nameAr,
        nameEn: data.nameEn,
        isActive: data.isActive,
      },
    })

    return NextResponse.json(projectCategory)
  } catch (error) {
    console.error("Error updating project category:", error)

    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  context: DynamicRouteContext
) {
  const { t } = await initLocale(_request)
  try {
    const { id } = await context.params

    // Check if project category exists
    const existingProjectCategory = await db.projectCategory.findUnique({
      where: { id },
    })

    if (!existingProjectCategory) {
      return NextResponse.json(
        { error: t("projectCategories.errors.not_found") },
        { status: 404 }
      )
    }

    // Delete project category
    await db.projectCategory.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting project category:", error)

    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}
