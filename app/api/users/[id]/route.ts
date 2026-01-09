import db from "@/lib/db"
import { UserRole, type PermissionKey } from "@/lib/generated/prisma/enums"
import { updateUserSchema } from "@/lib/schemas/user"
import { transformZodError } from "@/lib/transform-errors"
import { transformUser, userSelect } from "@/prisma/users/select"
import { getAccessTokenPayload } from "@/lib/get-access-token"
import bcrypt from "bcryptjs"
import { getTranslations } from "next-intl/server"
import { type NextRequest, NextResponse } from "next/server"
import { hasPermission } from "@/utils/has-permission"
import { PERMISSIONS_GROUPED } from "@/config"
import { getReqLocale } from "@/utils/get-req-locale"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const locale = await getReqLocale(request)
  const t = await getTranslations({ locale })
  try {
    // Check permission
    const permissionCheck = await hasPermission(
      PERMISSIONS_GROUPED.STAFF.MANAGEMENT
    )
    if (!permissionCheck.hasPermission) {
      return permissionCheck.error!
    }

    // Get translations based on request locale
    const { id } = await params

    // Parse and validate request body
    const body = await request.json()
    const validationResult = updateUserSchema.safeParse(body)

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
      roleName: string | null
      password?: string
    } = {
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      roleName: data.roleName || null,
    }

    // Hash password only if provided
    if (data.password && data.password.trim() !== "") {
      updateData.password = await bcrypt.hash(data.password, 10)
    }

    // Get all permissions if allowAllPermissions is true, otherwise use selected permissions
    const permissionKeys: PermissionKey[] = data.allowAllPermissions
      ? await db.permission
          .findMany()
          .then((perms) => perms.map((p) => p.key as PermissionKey))
      : (data.permissions as PermissionKey[])

    // Update user with permissions
    const user = await db.user.update({
      where: { id },
      data: {
        ...updateData,
        permissions: {
          // Delete existing permissions
          deleteMany: {},
          // Create new permissions
          create:
            permissionKeys.length > 0
              ? permissionKeys.map((permissionKey) => ({
                  permission: {
                    connectOrCreate: {
                      where: {
                        key: permissionKey,
                      },
                      create: {
                        key: permissionKey,
                        name: permissionKey
                          .replace(/_/g, " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase()),
                      },
                    },
                  },
                }))
              : [],
        },
      },
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const locale = await getReqLocale(request)
  const t = await getTranslations({ locale })
  try {
    // Check permission
    const permissionCheck = await hasPermission(
      PERMISSIONS_GROUPED.STAFF.MANAGEMENT
    )
    if (!permissionCheck.hasPermission) {
      return permissionCheck.error!
    }

    // Get translations based on request locale
    const { id } = await params

    // Check if user exists
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

    // Prevent deleting admin users
    if (existingUser.role === UserRole.ADMIN) {
      return NextResponse.json(
        {
          error: t("employees.errors.cannot_delete_admin"),
        },
        { status: 403 }
      )
    }

    // Prevent users from deleting themselves
    const payload = await getAccessTokenPayload()
    if (payload && payload.userId === id) {
      return NextResponse.json(
        {
          error: t("employees.errors.cannot_delete_self"),
        },
        { status: 403 }
      )
    }

    // Delete user (cascade will handle related permissions)
    await db.user.delete({
      where: { id },
    })

    return NextResponse.json(
      { message: t("employees.success.user_deleted") },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}
