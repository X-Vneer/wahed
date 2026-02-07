import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { SESSION_COOKIE_NAME } from "@/config"
import { getTranslations } from "next-intl/server"
import { getReqLocale } from "@/utils/get-req-locale"

/** Logout never returns 401; it always clears the session cookie and returns 200. */
export async function POST(request: NextRequest) {
  const locale = await getReqLocale(request)
  const t = await getTranslations({ locale })
  const cookiesStore = await cookies()
  try {
    cookiesStore.delete(SESSION_COOKIE_NAME)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Logout error:", error)
    // Still clear cookie so the client is logged out even on server error
    try {
      cookiesStore.delete(SESSION_COOKIE_NAME)
    } catch {
      // ignore
    }
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}
