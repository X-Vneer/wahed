"use server"

import { SESSION_COOKIE_NAME } from "@/config"
import { cookies } from "next/headers"

export const getAccessToken = async () => {
  const cookiesStore = await cookies()
  const accessToken = cookiesStore.get(SESSION_COOKIE_NAME)?.value
  if (!accessToken) return null
  return accessToken
}
