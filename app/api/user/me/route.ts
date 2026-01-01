import { NextResponse } from "next/server"
import { getAccessTokenPayload } from "@/lib/get-access-token"
import db from "@/lib/db"
import { getTranslations } from "next-intl/server"
import { transformUser, userSelect } from "@/prisma/users/select"

export async function GET() {
  try {
    // Get translations based on request locale
    const t = await getTranslations()

    // Get and verify token from cookies
    const payload = await getAccessTokenPayload()

    if (!payload || !payload.userId) {
      return NextResponse.json(
        { error: t("errors.unauthorized") },
        { status: 401 }
      )
    }

    // Fetch user from database
    const user = await db.user.findUnique({
      where: { id: payload.userId },
      select: userSelect,
    })

    if (!user) {
      return NextResponse.json(
        { error: t("errors.user_not_found") },
        { status: 404 }
      )
    }

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json(
        { error: t("errors.account_inactive") },
        { status: 403 }
      )
    }

    return NextResponse.json(transformUser(user))
  } catch (error) {
    console.error("Error fetching user:", error)
    const t = await getTranslations()
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}
