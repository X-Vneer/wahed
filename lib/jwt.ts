"use server"

import { SignJWT, jwtVerify } from "jose"

const JWT_SECRET = process.env.JWT_SECRET
const JWT_SECRET_KEY = new TextEncoder().encode(JWT_SECRET)

export interface JWTPayload {
  userId: string
  email: string
  role: string
  iat?: number
  exp?: number
}

export async function signToken(
  payload: Omit<JWTPayload, "iat" | "exp">
): Promise<string> {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d") // 7 days
    .sign(JWT_SECRET_KEY)

  return token
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET_KEY, {
      algorithms: ["HS256"],
    })

    return payload as unknown as JWTPayload
  } catch (error) {
    console.error("JWT verification error:", error)
    return null
  }
}
