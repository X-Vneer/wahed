import { db } from "@/lib/db"
import { transformWebsite } from "@/prisma/websites"
import { getReqLocale } from "@/utils/get-req-locale"
import { getTranslations } from "next-intl/server"
import { NextRequest, NextResponse } from "next/server"
import { Prisma } from "@/lib/generated/prisma/client"
import { createWebsiteSchema } from "@/lib/schemas/website"
import { transformZodError } from "@/lib/transform-errors"
import { hasPermission } from "@/utils/has-permission"
import { PERMISSIONS_GROUPED } from "@/config"

export async function GET(request: NextRequest) {
  const locale = await getReqLocale(request)
  const t = await getTranslations({ locale })
  try {
    const permissionCheck = await hasPermission(
      PERMISSIONS_GROUPED.STAFF_PAGE.MANAGEMENT
    )
    if (!permissionCheck.hasPermission) {
      return permissionCheck.error!
    }
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get("q")
    const status = searchParams.get("status")

    const whereConditions: Prisma.WebsiteWhereInput[] = []

    if (search) {
      whereConditions.push({
        OR: [
          { nameAr: { contains: search, mode: "insensitive" } },
          { nameEn: { contains: search, mode: "insensitive" } },
          { descriptionAr: { contains: search, mode: "insensitive" } },
          { descriptionEn: { contains: search, mode: "insensitive" } },
          { url: { contains: search, mode: "insensitive" } },
        ],
      })
    }

    if (status && status !== "all") {
      switch (status) {
        case "active":
          whereConditions.push({ isActive: true })
          break
        case "inactive":
          whereConditions.push({ isActive: false })
          break
      }
    }

    const where: Prisma.WebsiteWhereInput =
      whereConditions.length > 0 ? { AND: whereConditions } : {}

    const websites = await db.website.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
    })

    const transformedWebsites = websites.map((website) =>
      transformWebsite(website, locale)
    )

    return NextResponse.json(transformedWebsites)
  } catch (error) {
    console.error("Error fetching websites:", error)
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
    const permissionCheck = await hasPermission(
      PERMISSIONS_GROUPED.STAFF_PAGE.MANAGEMENT
    )
    if (!permissionCheck.hasPermission) {
      return permissionCheck.error!
    }

    const body = await request.json()
    const validationResult = createWebsiteSchema.safeParse(body)

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

    const website = await db.website.create({
      data: {
        nameAr: data.nameAr,
        nameEn: data.nameEn,
        descriptionAr: data.descriptionAr ?? null,
        descriptionEn: data.descriptionEn ?? null,
        url: data.url,
        image: data.image ?? null,
        isActive: data.isActive ?? true,
      },
    })

    return NextResponse.json(transformWebsite(website, locale), {
      status: 201,
    })
  } catch (error) {
    console.error("Error creating website:", error)
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}
