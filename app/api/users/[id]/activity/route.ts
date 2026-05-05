import db from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"
import {
  initLocale,
  requirePermission,
  type DynamicRouteContext,
} from "@/utils"
import { PERMISSIONS_GROUPED } from "@/config"
import { transformUser, userSelect } from "@/prisma/users/select"
import { getAccessTokenPayload } from "@/lib/get-access-token"
import { UserRole } from "@/lib/generated/prisma/enums"

export async function PATCH(
  request: NextRequest,
  { params }: DynamicRouteContext
) {
  const { t } = await initLocale(request)

  try {
    const permError = await requirePermission(
      PERMISSIONS_GROUPED.STAFF.MANAGEMENT
    )
    if (permError) return permError

    const { id } = await params
    const body = await request.json()
    const { isActive } = body as { isActive?: unknown }

    if (typeof isActive !== "boolean") {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: {
            isActive: "isActive must be a boolean",
          },
        },
        { status: 400 }
      )
    }

    const payload = await getAccessTokenPayload()

    if (payload?.userId === id && isActive === false) {
      return NextResponse.json(
        {
          error: t("employees.errors.cannot_deactivate_self"),
        },
        { status: 403 }
      )
    }

    const existingUser = await db.user.findUnique({
      where: { id },
    })

    if (!existingUser) {
      return NextResponse.json(
        {
          error: t("employees.errors.user_not_found"),
        },
        { status: 404 }
      )
    }

    // Prevent deactivating the first admin user
    if (existingUser.role === UserRole.ADMIN && isActive === false) {
      const firstAdmin = await db.user.findFirst({
        where: { role: UserRole.ADMIN },
        orderBy: { createdAt: "asc" },
        select: { id: true },
      })

      if (firstAdmin && firstAdmin.id === existingUser.id) {
        return NextResponse.json(
          {
            error: t("employees.errors.cannot_deactivate_first_admin"),
          },
          { status: 403 }
        )
      }
    }

    const user = await db.user.update({
      where: { id },
      data: {
        isActive,
      },
      select: userSelect,
    })

    const transformedUser = transformUser(user)

    return NextResponse.json(transformedUser)
  } catch (error) {
    console.error("Error updating user activity:", error)

    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}
