"use server"

import { Permission } from "@/config"
import { getAccessTokenPayload } from "@/lib/get-access-token"

import db from "@/lib/db"
import { UserRole } from "@/lib/generated/prisma/enums"
import { getTranslations } from "next-intl/server"
import { NextResponse } from "next/server"

export async function hasPermission(permission: Permission): Promise<{
  hasPermission: boolean
  error?: NextResponse
}> {
  const t = await getTranslations()
  const payload = await getAccessTokenPayload()

  if (!payload || !payload.userId) {
    return {
      hasPermission: false,
      error: NextResponse.json(
        { error: t("errors.unauthorized") },
        { status: 401 }
      ),
    }
  }

  // Fetch current user with permissions
  const currentUser = await db.user.findUnique({
    where: { id: payload.userId },
    include: {
      permissions: {
        include: {
          permission: true,
        },
      },
    },
  })

  if (!currentUser) {
    return {
      hasPermission: false,
      error: NextResponse.json(
        { error: t("errors.user_not_found") },
        { status: 404 }
      ),
    }
  }

  // Admin has all permissions
  if (currentUser.role === UserRole.ADMIN) {
    return { hasPermission: true }
  }

  // Staff needs STAFF_MANAGEMENT permission
  const hasPermission = currentUser.permissions.some(
    (up) => up.permission.key === permission
  )

  if (!hasPermission) {
    return {
      hasPermission: false,
      error: NextResponse.json(
        { error: t("errors.forbidden") },
        { status: 403 }
      ),
    }
  }

  return { hasPermission: true }
}
