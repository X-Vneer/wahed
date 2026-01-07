import { PERMISSIONS_GROUPED } from "@/config"
import db from "@/lib/db"
import { Prisma } from "@/lib/generated/prisma/client"
import { createRegionSchema } from "@/lib/schemas/regions"
import { transformZodError } from "@/lib/transform-errors"
import { transformRegion } from "@/prisma/regions"
import { hasPermission } from "@/utils/has-permission"
import { getLocale, getTranslations } from "next-intl/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get("q")
    const status = searchParams.get("status")
    const page = parseInt(searchParams.get("page") || "1", 10)
    const perPage = parseInt(searchParams.get("per_page") || "15", 10)

    const where: Prisma.RegionWhereInput = {}

    if (search) {
      where.OR = [
        { nameAr: { contains: search, mode: "insensitive" } },
        { nameEn: { contains: search, mode: "insensitive" } },
      ]
    }

    if (status && status !== "all") {
      // if you later add isActive back, you can filter here
      // where.isActive = status === "active"
    }

    const total = await db.region.count({ where })

    const regions = await db.region.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        _count: {
          select: {
            cities: true,
          },
        },
      },
      skip: (page - 1) * perPage,
      take: perPage,
    })

    const locale = await getLocale()

    const transformedRegions = regions.map((region) =>
      transformRegion(region, locale)
    )

    const lastPage = Math.ceil(total / perPage)
    const from = total > 0 ? (page - 1) * perPage + 1 : 0
    const to = Math.min(page * perPage, total)

    return NextResponse.json({
      data: transformedRegions,
      from,
      to,
      total,
      per_page: perPage,
      current_page: page,
      last_page: lastPage,
    })
  } catch (error) {
    console.error("Error fetching regions:", error)
    const t = await getTranslations()
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const t = await getTranslations()
  try {
    const permissionCheck = await hasPermission(PERMISSIONS_GROUPED.LIST.CREATE)
    if (!permissionCheck.hasPermission) {
      return permissionCheck.error!
    }

    const body = await request.json()
    const validationResult = createRegionSchema.safeParse(body)

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

    const region = await db.region.create({
      data: {
        nameAr: data.nameAr,
        nameEn: data.nameEn,
      },
    })

    return NextResponse.json(region, { status: 201 })
  } catch (error) {
    console.error("Error creating region:", error)
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}
