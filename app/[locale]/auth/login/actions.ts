"use server"

import bcrypt from "bcryptjs"
import { cookies } from "next/headers"
import db from "@/lib/db"
import { SESSION_COOKIE_NAME } from "@/config"
import { signToken } from "@/lib/jwt"

export type LoginActionResult =
  | { success: true }
  | { success: false; error: string }

export async function loginAction(
  email: string,
  password: string
): Promise<LoginActionResult> {
  try {
    // Find user by email
    const user = await db.user.findUnique({
      where: { email },
    })

    // Check if user exists
    if (!user) {
      return {
        success: false,
        error: "invalid_credentials",
      }
    }

    // Check if user is active
    if (!user.isActive) {
      return {
        success: false,
        error: "account_inactive",
      }
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return {
        success: false,
        error: "invalid_credentials",
      }
    }

    // Generate JWT token
    const token = await signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    // Set session cookie with JWT token
    const cookiesStore = await cookies()
    cookiesStore.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return { success: true }
  } catch (error) {
    console.error("Login error:", error)
    return {
      success: false,
      error: "server_error",
    }
  }
}
