import { NextRequest, NextResponse } from "next/server"
import { getAccessTokenPayload } from "@/lib/get-access-token"
import db from "@/lib/db"
import { getTranslations } from "next-intl/server"
import { getReqLocale } from "@/utils/get-req-locale"
import {
  updateUserLocationSchema,
  type UpdateUserLocationInput,
} from "@/lib/schemas/user"
import { transformZodError } from "@/lib/transform-errors"
import { transformUser, userSelect } from "@/prisma/users/select"

export async function PATCH(request: NextRequest) {
  const locale = await getReqLocale(request)
  const t = await getTranslations({ locale })
  try {
    const payload = await getAccessTokenPayload()

    if (!payload || !payload.userId) {
      return NextResponse.json(
        { error: t("errors.unauthorized") },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validationResult = updateUserLocationSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: transformZodError(validationResult.error),
        },
        { status: 400 }
      )
    }

    const data: UpdateUserLocationInput = validationResult.data

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
