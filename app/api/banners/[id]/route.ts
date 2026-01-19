import db from "@/lib/db"
import { updateBannerSchema } from "@/lib/schemas/banner"
import { transformZodError } from "@/lib/transform-errors"
import { getTranslations } from "next-intl/server"
import { type NextRequest, NextResponse } from "next/server"
import { hasPermission } from "@/utils/has-permission"
import { PERMISSIONS_GROUPED } from "@/config"
import { getReqLocale } from "@/utils/get-req-locale"
import { bannerInclude } from "@/prisma/banners"
import { transformBanner } from "@/prisma/banners"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const locale = await getReqLocale(request)
  const t = await getTranslations({ locale })
  try {
    // Check permission
    const permissionCheck = await hasPermission(PERMISSIONS_GROUPED.BANNER.VIEW)
    if (!permissionCheck.hasPermission) {
      return permissionCheck.error!
    }

    const { id } = await params

    // Fetch banner from database
    const banner = await db.banner.findUnique({
      where: { id },
      include: bannerInclude,
    })

    if (!banner) {
      return NextResponse.json(
        {
          error: t("banners.errors.banner_not_found"),
        },
        { status: 404 }
      )
    }

    return NextResponse.json(transformBanner(banner, locale))
  } catch (error) {
    console.error("Error fetching banner:", error)

    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const locale = await getReqLocale(request)
  const t = await getTranslations({ locale })
  try {
    // Check permission
    const permissionCheck = await hasPermission(
      PERMISSIONS_GROUPED.BANNER.UPDATE
    )
    if (!permissionCheck.hasPermission) {
      return permissionCheck.error!
    }

    const { id } = await params

    // Parse and validate request body
    const body = await request.json()
    const validationResult = updateBannerSchema.safeParse(body)

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

    // Check if banner exists
    const existingBanner = await db.banner.findUnique({
      where: { id },
    })

    if (!existingBanner) {
      return NextResponse.json(
        {
          error: t("banners.errors.banner_not_found"),
        },
        { status: 404 }
      )
    }

    // Validate users if provided
    if (data.users && data.users.length > 0) {
      const users = await db.user.findMany({
        where: { id: { in: data.users } },
        select: { id: true },
      })

      if (users.length !== data.users.length) {
        return NextResponse.json(
          {
            error: t("banners.errors.user_not_found"),
            details: {
              users: t("banners.errors.user_not_found"),
            },
          },
          { status: 404 }
        )
      }
    }

    // Prepare update data
    const updateData: {
      titleAr?: string
      titleEn?: string
      descriptionAr?: string | null
      descriptionEn?: string | null
      content?: string | null
      image?: string
      startDate?: Date
      endDate?: Date
      users?: { connect: { id: string }[] } | { set: { id: string }[] }
      isActive?: boolean
    } = {}

    if (data.titleAr !== undefined) {
      updateData.titleAr = data.titleAr
    }
    if (data.titleEn !== undefined) {
      updateData.titleEn = data.titleEn
    }
    if (data.descriptionAr !== undefined) {
      updateData.descriptionAr = data.descriptionAr
    }
    if (data.descriptionEn !== undefined) {
      updateData.descriptionEn = data.descriptionEn
    }
    if (data.content !== undefined) {
      updateData.content = data.content
    }
    if (data.image !== undefined) {
      updateData.image = data.image
    }
    if (data.startDate !== undefined) {
      updateData.startDate = data.startDate
    }
    if (data.endDate !== undefined) {
      updateData.endDate = data.endDate
    }
    if (data.users !== undefined) {
      updateData.users = data.users
        ? { set: data.users.map((user) => ({ id: user })) }
        : { set: [] }
    }
    if (data.isActive !== undefined) {
      updateData.isActive = data.isActive
    }

    // Update banner
    const banner = await db.banner.update({
      where: { id },
      data: updateData,
      include: bannerInclude,
    })

    const transformedBanner = transformBanner(banner, locale)

    return NextResponse.json(transformedBanner)
  } catch (error) {
    console.error("Error updating banner:", error)

    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const locale = await getReqLocale(request)
  const t = await getTranslations({ locale })
  try {
    // Check permission
    const permissionCheck = await hasPermission(
      PERMISSIONS_GROUPED.BANNER.DELETE
    )
    if (!permissionCheck.hasPermission) {
      return permissionCheck.error!
    }

    const { id } = await params

    // Check if banner exists
    const existingBanner = await db.banner.findUnique({
      where: { id },
    })

    if (!existingBanner) {
      return NextResponse.json(
        {
          error: t("banners.errors.banner_not_found"),
        },
        { status: 404 }
      )
    }

    // Delete banner
    await db.banner.delete({
      where: { id },
    })

    return NextResponse.json(
      { message: t("banners.success.banner_deleted") },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error deleting banner:", error)
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}
