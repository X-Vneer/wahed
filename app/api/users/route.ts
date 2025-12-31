import { type NextRequest, NextResponse } from "next/server"
import { getAccessTokenPayload } from "@/lib/get-access-token"
import db from "@/lib/db"
import { getTranslations } from "next-intl/server"
import { createUserSchema } from "@/lib/schemas/user"
import bcrypt from "bcryptjs"
import type { PermissionKey } from "@/lib/generated/prisma/enums"

export async function GET(request: NextRequest) {
  try {
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
          }
        : undefined,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        roleName: true,
        role: true,
        isActive: true,
        permissions: {
          select: {
            permission: {
              select: {
                key: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    // Transform the data to match the expected format
    const transformedUsers = users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      roleName: user.roleName,
      role: user.role,
      isActive: user.isActive,
      permissions: user.permissions.map((up) => ({
        key: up.permission.key,
        name: up.permission.name,
      })),
    }))

    return NextResponse.json(transformedUsers)
  } catch (error) {
    console.error("Error fetching users:", error)
    const t = await getTranslations()
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get translations based on request locale
    const t = await getTranslations()

    // Parse and validate request body
    const body = await request.json()
    const validationResult = createUserSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.issues,
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
        { error: t("employees.errors.user_email_exists") },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10)

    // Combine phone country code and number
    const phone = data.phoneCountryCode
      ? `${data.phoneCountryCode}${data.phoneNumber}`
      : data.phoneNumber

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
        phone: phone || null,
        roleName: data.jobTitle || null,
        role: "STAFF", // Default role, can be changed later
        permissions:
          permissionKeys.length > 0
            ? {
                create: permissionKeys.map((permissionKey) => ({
                  permission: {
                    connect: {
                      key: permissionKey,
                    },
                  },
                })),
              }
            : undefined,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        roleName: true,
        role: true,
        isActive: true,
        permissions: {
          select: {
            permission: {
              select: {
                key: true,
                name: true,
              },
            },
          },
        },
      },
    })

    // Transform the data to match the expected format
    const transformedUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      roleName: user.roleName,
      role: user.role,
      isActive: user.isActive,
      permissions: user.permissions.map((up) => ({
        key: up.permission.key,
        name: up.permission.name,
      })),
    }

    return NextResponse.json(transformedUser, { status: 201 })
  } catch (error) {
    console.error("Error creating user:", error)
    const t = await getTranslations()
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}
