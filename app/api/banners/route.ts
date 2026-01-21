import db from "@/lib/db"
import { createBannerSchema } from "@/lib/schemas/banner"
import { transformZodError } from "@/lib/transform-errors"
import { getTranslations } from "next-intl/server"
import { type NextRequest, NextResponse } from "next/server"
import { hasPermission } from "@/utils/has-permission"
import { PERMISSIONS_GROUPED } from "@/config"
import { getReqLocale } from "@/utils/get-req-locale"
import { bannerInclude } from "@/prisma/banners"
import { transformBanner } from "@/prisma/banners"
import { Prisma } from "@/lib/generated/prisma/client"

export async function GET(request: NextRequest) {
  const locale = await getReqLocale(request)
  const t = await getTranslations({ locale })
  try {
    // Get search query and status filter from URL params
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get("q")
    const status = searchParams.get("status")

    const now = new Date()

    // Build where clause
    const whereConditions: Prisma.BannerWhereInput[] = []

    // Search condition
    if (search) {
      whereConditions.push({
        OR: [
          { titleAr: { contains: search, mode: "insensitive" } },
          { titleEn: { contains: search, mode: "insensitive" } },
          { descriptionAr: { contains: search, mode: "insensitive" } },
          { descriptionEn: { contains: search, mode: "insensitive" } },
          { content: { contains: search, mode: "insensitive" } },
        ],
      })
    }

    // Status filter condition
    if (status && status !== "all") {
      switch (status) {
        case "active":
          // Active: isActive = true AND within date range
          whereConditions.push({
            isActive: true,
            startDate: { lte: now },
            endDate: { gte: now },
          })
          break
        case "inactive":
          // Inactive: isActive = false
          whereConditions.push({
            isActive: false,
          })
          break
        case "scheduled":
          // Scheduled: isActive = true AND startDate > now
          whereConditions.push({
            isActive: true,
            startDate: { gt: now },
          })
          break
        case "expired":
          // Expired: endDate < now
          whereConditions.push({
            endDate: { lt: now },
          })
          break
      }
    }

    // Combine conditions
    const where: Prisma.BannerWhereInput =
      whereConditions.length > 0 ? { AND: whereConditions } : {}

    // Fetch banners from database
    const banners = await db.banner.findMany({
      where,
      include: bannerInclude,
      orderBy: {
        createdAt: "desc",
      },
    })

    const transformedBanners = banners.map((banner) =>
      transformBanner(banner, locale)
    )
    return NextResponse.json(transformedBanners)
  } catch (error) {
    console.error("Error fetching banners:", error)

    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const locale = await getReqLocale(request)
  const t = await getTranslations({ locale })
  try {
    // Check permission
    const permissionCheck = await hasPermission(
      PERMISSIONS_GROUPED.BANNER.CREATE
    )
    if (!permissionCheck.hasPermission) {
      return permissionCheck.error!
    }

    // Parse and validate request body
    const body = await request.json()
    const validationResult = createBannerSchema.safeParse(body)

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

    // Create banner
    const banner = await db.banner.create({
      data: {
        titleAr: data.titleAr,
        titleEn: data.titleEn,
        descriptionAr: data.descriptionAr || null,
        descriptionEn: data.descriptionEn || null,
        content: data.content || null,
        image: data.image,
        startDate: data.startDate,
        endDate: data.endDate,
        users: data.users
          ? { connect: data.users.map((user) => ({ id: user })) }
          : undefined,
        isActive: data.isActive ?? true,
      },
      include: bannerInclude,
    })

    return NextResponse.json(transformBanner(banner, locale), { status: 201 })
  } catch (error) {
    console.error("Error creating banner:", error)

    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}
