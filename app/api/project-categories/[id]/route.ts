import db from "@/lib/db"
import { updateProjectCategorySchema } from "@/lib/schemas/project-categories"
import { transformZodError } from "@/lib/transform-errors"
import { getReqLocale } from "@/utils/get-req-locale"
import { getTranslations } from "next-intl/server"
import { type NextRequest, NextResponse } from "next/server"

type RouteContext = {
  params: Promise<{
    id: string
  }>
}
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const locale = await getReqLocale(request)
    const t = await getTranslations(locale)

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
    const locale = await getReqLocale(request)
    const t = await getTranslations(locale)
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const locale = await getReqLocale(request)
  const t = await getTranslations(locale)
  try {
    const { id } = await context.params

    // Parse and validate request body
    const body = await request.json()
    const validationResult = updateProjectCategorySchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: transformZodError(validationResult.error),
        },
        { status: 400 }
      )
    }

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

    const data = validationResult.data

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

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const locale = await getReqLocale(_request)
  const t = await getTranslations(locale)
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
