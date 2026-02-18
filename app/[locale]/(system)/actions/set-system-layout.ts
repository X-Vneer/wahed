"use server"

import { SYSTEM_LAYOUT_COOKIE_NAME } from "@/config"
import { getAccessTokenPayload } from "@/lib/get-access-token"
import { UserRole } from "@/lib/generated/prisma/enums"
import { cookies } from "next/headers"

export type SystemLayoutValue = "staff" | "admin"

export async function setSystemLayout(value: SystemLayoutValue) {
  const user = await getAccessTokenPayload()
  if (!user) return { ok: false, error: "Unauthorized" }

  // Only ADMIN can switch to admin layout; staff is always allowed
  if (value === "admin" && user.role !== UserRole.ADMIN) {
    return { ok: false, error: "Forbidden" }
  }

  const cookieStore = await cookies()
  cookieStore.set(SYSTEM_LAYOUT_COOKIE_NAME, value, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: "lax",
    httpOnly: false, // so client can read if needed
  })

  return { ok: true }
}
