import db from "@/lib/db"
import { getTranslations } from "next-intl/server"
import { type NextRequest, NextResponse } from "next/server"
import { hasPermission } from "@/utils/has-permission"
import { PERMISSIONS_GROUPED } from "@/config"
import { getReqLocale } from "@/utils/get-req-locale"
import { transformUser, userSelect } from "@/prisma/users/select"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const locale = await getReqLocale(request)
  const t = await getTranslations({ locale })

  try {
    const permissionCheck = await hasPermission(
      PERMISSIONS_GROUPED.STAFF.MANAGEMENT
    )
    if (!permissionCheck.hasPermission) {
      return permissionCheck.error!
    }

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

