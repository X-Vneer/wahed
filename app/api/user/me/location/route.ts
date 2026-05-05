import { NextRequest, NextResponse } from "next/server"
import { initLocale, requireAuth, validateRequest } from "@/lib/helpers"
import db from "@/lib/db"
import {
  updateUserLocationSchema,
  type UpdateUserLocationInput,
} from "@/schemas/user"
import { transformUser, userSelect } from "@/prisma/users/select"

export async function PATCH(request: NextRequest) {
  const { t } = await initLocale(request)
  try {
    const auth = await requireAuth(t)
    if (auth.error) return auth.error
    const { payload } = auth

    const body = await request.json()
    const validation = validateRequest(updateUserLocationSchema, body, t)
    if (validation.error) return validation.error
    const data: UpdateUserLocationInput = validation.data

    const existingUser = await db.user.findUnique({
      where: { id: payload.userId },
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: t("errors.user_not_found") },
        { status: 401 }
      )
    }

    const user = await db.user.update({
      where: { id: payload.userId },
      data: {
        latitude: data.latitude,
        longitude: data.longitude,
      },
      select: userSelect,
    })

    return NextResponse.json(transformUser(user))
  } catch (error) {
    console.error("Error updating user location:", error)
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}
