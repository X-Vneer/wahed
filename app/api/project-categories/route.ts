import { PERMISSIONS_GROUPED } from "@/config"
import db from "@/lib/db"
import { createProjectCategorySchema } from "@/lib/schemas/project-categories"
import { transformZodError } from "@/lib/transform-errors"
import { hasPermission } from "@/utils/has-permission"
import { getLocale, getTranslations } from "next-intl/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Get search query from URL params
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get("q")

    // Fetch project categories from database
    const projectCategories = await db.projectCategory.findMany({
      where: search
        ? {
            OR: [
              { nameAr: { contains: search, mode: "insensitive" } },
              { nameEn: { contains: search, mode: "insensitive" } },
            ],
          }
        : undefined,
      orderBy: {
        createdAt: "desc",
      },
    })

    const locale = await getLocale()
    const transformedProjectCategories = projectCategories.map(
      (projectCategory) => {
        return {
          id: projectCategory.id,
          isActive: projectCategory.isActive,
          createdAt: projectCategory.createdAt,
          updatedAt: projectCategory.updatedAt,
          name:
            locale === "ar" ? projectCategory.nameAr : projectCategory.nameEn,
        }
      }
    )

    return NextResponse.json(transformedProjectCategories)
  } catch (error) {
    console.error("Error fetching project categories:", error)
    const t = await getTranslations()
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  // Get translations based on request locale
  const t = await getTranslations()
  try {
    // Check permission
    const permissionCheck = await hasPermission(PERMISSIONS_GROUPED.LIST.CREATE)
    if (!permissionCheck.hasPermission) {
      return permissionCheck.error!
    }

    // Parse and validate request body
    const body = await request.json()
    const validationResult = createProjectCategorySchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: transformZodError(validationResult.error),
        },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Create project category
    const projectCategory = await db.projectCategory.create({
      data: {
        nameAr: data.nameAr,
        nameEn: data.nameEn,
        isActive: data.isActive,
      },
    })

    return NextResponse.json(projectCategory, { status: 201 })
  } catch (error) {
    console.error("Error creating project category:", error)
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}
