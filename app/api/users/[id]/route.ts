import db from "@/lib/db"
import {
  UserRole,
  type PermissionKey,
  Gender,
} from "@/lib/generated/prisma/enums"
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

    const payload = await getAccessTokenPayload()
    const currentRole = payload?.role

    if (existingUser.role === UserRole.ADMIN && currentRole !== UserRole.ADMIN) {
      return NextResponse.json(
        {
          error: t("employees.errors.cannot_edit_admin"),
        },
        { status: 403 }
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
    const targetRole = data.role ?? existingUser.role

    if (
      existingUser.role === UserRole.ADMIN &&
      targetRole !== existingUser.role
    ) {
      return NextResponse.json(
        {
          error: t("employees.errors.cannot_change_admin_role"),
        },
        { status: 403 }
      )
    }

    if (
      existingUser.role !== UserRole.ADMIN &&
      targetRole === UserRole.ADMIN &&
      currentRole !== UserRole.ADMIN
    ) {
      return NextResponse.json(
        {
          error: t("employees.errors.cannot_create_admin"),
        },
        { status: 403 }
      )
    }

    if (payload?.userId === id && data.isActive === false) {
      return NextResponse.json(
        {
          error: t("employees.errors.cannot_deactivate_self"),
        },
        { status: 403 }
      )
    }

    // Prevent deactivating the first admin user
    if (
      existingUser.role === UserRole.ADMIN &&
      data.isActive === false
    ) {
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

    const updateData: {
      name: string
      email: string
      phone: string | null
      roleName: string | null
      role: UserRole
      dateOfBirth: Date | null
      gender?: Gender
      nationality: string | null
      address: string | null
      city: string | null
      country: string | null
      image: string | null
      isActive?: boolean
      password?: string
    } = {
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      roleName: data.roleName || null,
      role: targetRole,
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

    // Set isActive if provided
    if (data.isActive !== undefined) {
      updateData.isActive = data.isActive
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
    const { password } = body as { password?: string }

    if (!password || typeof password !== "string" || password.trim().length < 8) {
      return NextResponse.json(
        {
          error: t("employees.errors.password.minLength"),
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

    const hashedPassword = await bcrypt.hash(password, 10)

    await db.user.update({
      where: { id },
      data: {
        password: hashedPassword,
      },
    })

    return NextResponse.json(
      { message: t("employees.success.user_updated") },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error updating user password:", error)
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

    const payload = await getAccessTokenPayload()

    // Prevent users from deleting themselves
    if (payload && payload.userId === id) {
      return NextResponse.json(
        {
          error: t("employees.errors.cannot_delete_self"),
        },
        { status: 403 }
      )
    }

    if (existingUser.role === UserRole.ADMIN) {
      if (payload?.role !== UserRole.ADMIN) {
        return NextResponse.json(
          {
            error: t("employees.errors.cannot_delete_admin"),
          },
          { status: 403 }
        )
      }

      const firstAdmin = await db.user.findFirst({
        where: { role: UserRole.ADMIN },
        orderBy: { createdAt: "asc" },
        select: { id: true },
      })

      if (firstAdmin && firstAdmin.id === existingUser.id) {
        return NextResponse.json(
          {
            error: t("employees.errors.cannot_delete_first_admin"),
          },
          { status: 403 }
        )
      }
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
