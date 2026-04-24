import { PERMISSIONS_GROUPED } from "@/config"
import { db } from "@/lib/db"
import { Prisma } from "@/lib/generated/prisma/client"
import { initLocale, requirePermission, validateRequest } from "@/lib/helpers"
import { createWebsiteSchema } from "@/lib/schemas/website"
import { transformWebsite } from "@/prisma/websites"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { locale, t } = await initLocale(request)
  try {
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get("q")
    const status = searchParams.get("status")

    const whereConditions: Prisma.WebsiteWhereInput[] = []

    if (search) {
      whereConditions.push({
        OR: [
          { nameAr: { contains: search, mode: "insensitive" } },
          { nameEn: { contains: search, mode: "insensitive" } },

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
  const { locale, t } = await initLocale(request)

  try {
    const permError = await requirePermission(
      PERMISSIONS_GROUPED.STAFF_PAGE.MANAGEMENT
    )
    if (permError) return permError

    const body = await request.json()
    const validation = validateRequest(createWebsiteSchema, body, t)
    if (validation.error) return validation.error
    const data = validation.data

    const website = await db.website.create({
      data: {
        nameAr: data.nameAr,
        nameEn: data.nameEn,

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
