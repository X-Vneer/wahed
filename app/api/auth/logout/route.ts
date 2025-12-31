import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { SESSION_COOKIE_NAME } from "@/config"
import { getTranslations } from "next-intl/server"

export async function POST() {
  const t = await getTranslations()
  try {
    const cookiesStore = await cookies()
    cookiesStore.delete(SESSION_COOKIE_NAME)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}
