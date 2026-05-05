import { PERMISSIONS_GROUPED } from "@/config"
import db from "@/lib/db"
import { Prisma } from "@/lib/generated/prisma/client"
import {
  initLocale,
  parsePagination,
  requirePermission,
  validateRequest,
} from "@/utils"
import { createCitySchema } from "@/schemas/cities"
import { transformCity } from "@/prisma/cities"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { locale, t } = await initLocale(request)
  try {
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get("q")
    const status = searchParams.get("status")
    const regionId = searchParams.get("region_id")
    const { page, perPage, skip, take } = parsePagination(searchParams, {
      perPage: 15,
    })

    const where: Prisma.CityWhereInput = {}

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

    if (regionId) {
      where.region = {
        id: regionId,
      }
    }

    const total = await db.city.count({ where })

    const cities = await db.city.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        region: true,
      },
      skip,
      take,
    })

    const transformedCities = cities.map((city) => transformCity(city, locale))

    const lastPage = Math.ceil(total / perPage)
    const from = total > 0 ? (page - 1) * perPage + 1 : 0
    const to = Math.min(page * perPage, total)

    return NextResponse.json({
      data: transformedCities,
      from,
      to,
      total,
      per_page: perPage,
      current_page: page,
      last_page: lastPage,
    })
  } catch (error) {
    console.error("Error fetching cities:", error)
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const { t } = await initLocale(request)
  try {
    const permError = await requirePermission(PERMISSIONS_GROUPED.LIST.CREATE)
    if (permError) return permError

    const body = await request.json()
    const validation = validateRequest(createCitySchema, body, t)
    if (validation.error) return validation.error
    const data = validation.data

    const city = await db.city.create({
      data: {
        nameAr: data.nameAr,
        nameEn: data.nameEn,
        regionId: data.regionId,
      },
    })

    return NextResponse.json(city, { status: 201 })
  } catch (error) {
    console.error("Error creating city:", error)
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}
