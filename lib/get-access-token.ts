"use server"

import { SESSION_COOKIE_NAME } from "@/config"
import { cookies } from "next/headers"
import { verifyToken } from "@/lib/jwt"

export const getAccessToken = async () => {
  const cookiesStore = await cookies()
  const token = cookiesStore.get(SESSION_COOKIE_NAME)?.value
  if (!token) return null

  // Verify and return the token if valid
  const payload = await verifyToken(token)
  if (!payload) return null

  return token
}

export const getAccessTokenPayload = async () => {
  const cookiesStore = await cookies()
  const token = cookiesStore.get(SESSION_COOKIE_NAME)?.value
  if (!token) return null

  return await verifyToken(token)
}
