import db from "@/lib/db"
import { UserRole, type PermissionKey } from "@/lib/generated/prisma/enums"
import { createUserSchema } from "@/lib/schemas/user"
import { transformZodError } from "@/lib/transform-errors"
import { transformUser, userSelect } from "@/prisma/users/select"
import bcrypt from "bcryptjs"
import { getTranslations } from "next-intl/server"
import { type NextRequest, NextResponse } from "next/server"
import { hasPermission } from "@/utils/has-permission"
import { PERMISSIONS_GROUPED } from "@/config"
import { getReqLocale } from "@/utils/get-req-locale"

export async function GET(request: NextRequest) {
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

    // Get search query from URL params
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get("q")

    // Fetch users from database
    const users = await db.user.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ],
            role: {
              not: UserRole.ADMIN,
            },
          }
        : {
            role: {
              not: UserRole.ADMIN,
            },
          },
      select: userSelect,
      orderBy: {
        createdAt: "desc",
      },
    })

    // Transform the data to match the expected format
    const transformedUsers = users.map((user) => {
      return transformUser(user)
    })

    return NextResponse.json(transformedUsers)
  } catch (error) {
    console.error("Error fetching users:", error)

    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  // Get translations based on request locale
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

    // Parse and validate request body
    const body = await request.json()
    const validationResult = createUserSchema.safeParse(body)

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

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: data.email },
    })

    if (existingUser) {
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

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10)

    // Get all permissions if allowAllPermissions is true, otherwise use selected permissions
    const permissionKeys: PermissionKey[] = data.allowAllPermissions
      ? await db.permission
          .findMany()
          .then((perms) => perms.map((p) => p.key as PermissionKey))
      : (data.permissions as PermissionKey[])

    // Create user with permissions
    const user = await db.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        phone: data.phone || null,
        roleName: data.roleName || null,
        permissions:
          permissionKeys.length > 0
            ? {
                create: permissionKeys.map((permissionKey) => ({
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
                })),
              }
            : undefined,
      },
      select: userSelect,
    })

    // Transform the data to match the expected format
    const transformedUser = transformUser(user)

    return NextResponse.json(transformedUser, { status: 201 })
  } catch (error) {
    console.error("Error creating user:", error)

    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}
