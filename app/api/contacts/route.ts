import { PERMISSIONS_GROUPED } from "@/config"
import db from "@/lib/db"
import { Prisma } from "@/lib/generated/prisma/client"
import { transformContact } from "@/prisma/contacts"
import { initLocale, parsePagination, requirePermission } from "@/utils"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { t } = await initLocale(request)

  try {
    const permError = await requirePermission(
      PERMISSIONS_GROUPED.WEBSITE.MANAGEMENT
    )
    if (permError) return permError

    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get("q")
    const isRead = searchParams.get("is_read")
    const source = searchParams.get("source")
    const { page, perPage, skip, take } = parsePagination(searchParams, {
      perPage: 15,
    })

    const where: Prisma.ContactMessageWhereInput = {}

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
        { message: { contains: search, mode: "insensitive" } },
      ]
    }

    if (isRead === "true") {
      where.isRead = true
    } else if (isRead === "false") {
      where.isRead = false
    }

    if (source && source !== "all") {
      where.source = source
    }

    const total = await db.contactMessage.count({ where })

    const contacts = await db.contactMessage.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take,
    })

    const transformedContacts = contacts.map(transformContact)

    const lastPage = Math.ceil(total / perPage)
    const from = total > 0 ? skip + 1 : 0
    const to = Math.min(page * perPage, total)

    return NextResponse.json({
      data: transformedContacts,
      from,
      to,
      total,
      per_page: perPage,
      current_page: page,
      last_page: lastPage,
    })
  } catch (error) {
    console.error("Error fetching contacts:", error)
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}
