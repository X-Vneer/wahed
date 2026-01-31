import db from "@/lib/db"
import { userListSelect } from "@/prisma/users/select"
import { getReqLocale } from "@/utils/get-req-locale"
import { getTranslations } from "next-intl/server"
import { NextResponse, type NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const locale = await getReqLocale(request)
  const t = await getTranslations({ locale })
  try {
    // Get search query from URL params
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get("q")

    // Fetch users from database
    const users = await db.user.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ],
            isActive: true,
          }
        : {
            isActive: true,
          },
      select: userListSelect,
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error("Error fetching users:", error)

    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}
