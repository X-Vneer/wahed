import { NextRequest, NextResponse } from "next/server"
import { getAccessTokenPayload } from "@/lib/get-access-token"
import db from "@/lib/db"
import { getTranslations } from "next-intl/server"
import { transformUser, userSelect } from "@/prisma/users/select"
import { getReqLocale } from "@/utils/get-req-locale"
import { updateUserSettingsSchema } from "@/lib/schemas/user"
import { transformZodError } from "@/lib/transform-errors"
import { Gender } from "@/lib/generated/prisma/enums"

export async function GET(request: NextRequest) {
  const locale = await getReqLocale(request)
  const t = await getTranslations({ locale })
  try {
    // Get translations based on request locale

    // Get and verify token from cookies
    const payload = await getAccessTokenPayload()

    if (!payload || !payload.userId) {
      return NextResponse.json(
        { error: t("errors.unauthorized") },
        { status: 401 }
      )
    }

    // Fetch user from database
    const user = await db.user.findUnique({
      where: { id: payload.userId },
      select: userSelect,
    })

    if (!user) {
      return NextResponse.json(
        { error: t("errors.user_not_found") },
        { status: 401 }
      )
    }

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json(
        { error: t("errors.account_inactive") },
        { status: 403 }
      )
    }

    return NextResponse.json(transformUser(user))
  } catch (error) {
    console.error("Error fetching user:", error)

    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  const locale = await getReqLocale(request)
  const t = await getTranslations({ locale })
  try {
    // Get and verify token from cookies
    const payload = await getAccessTokenPayload()

    if (!payload || !payload.userId) {
      return NextResponse.json(
        { error: t("errors.unauthorized") },
        { status: 401 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validationResult = updateUserSettingsSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: transformZodError(validationResult.error),
        },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: { id: payload.userId },
    })

    if (!existingUser) {
      return NextResponse.json(
        {
          error: t("errors.user_not_found"),
        },
        { status: 401 }
      )
    }

    // Check if email is being changed and if the new email already exists
    if (data.email !== existingUser.email) {
      const emailExists = await db.user.findUnique({
        where: { email: data.email },
      })

      if (emailExists) {
        return NextResponse.json(
          {
            error: t("employees.errors.user_email_exists"),
            details: {
              email: t("employees.errors.user_email_exists"),
            },
          },
          { status: 409 }
        )
      }
    }

    // Prepare update data
    const updateData: {
      name: string
      email: string
      phone: string | null
      dateOfBirth: Date | null
      gender?: Gender
      nationality: string | null
      address: string | null
      city: string | null
      country: string | null
      image: string | null
    } = {
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      dateOfBirth: data.dateOfBirth || null,
      nationality: data.nationality || null,
      address: data.address || null,
      city: data.city || null,
      country: data.country || null,
      image: data.image || null,
    }

    // Set gender if provided
    if (data.gender !== undefined) {
      updateData.gender = data.gender
    }

    // Update user (without permissions or password)
    const user = await db.user.update({
      where: { id: payload.userId },
      data: updateData,
      select: userSelect,
    })

    // Transform the data to match the expected format
    const transformedUser = transformUser(user)

    return NextResponse.json(transformedUser)
  } catch (error) {
    console.error("Error updating user:", error)

    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}
