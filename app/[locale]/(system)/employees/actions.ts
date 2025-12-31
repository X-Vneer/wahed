"use server"

import bcrypt from "bcryptjs"
import db from "@/lib/db"
import { PermissionKey } from "@/lib/generated/prisma/enums"

export type CreateUserResult =
  | { success: true; userId: string }
  | { success: false; error: string }

export async function createUserAction(data: {
  name: string
  email: string
  password: string
  role?: "ADMIN" | "STAFF"
  permissions?: PermissionKey[]
}): Promise<CreateUserResult> {
  try {
    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: data.email },
    })

    if (existingUser) {
      return {
        success: false,
        error: "user_email_exists",
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10)

    // Create user
    const user = await db.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: data.role || "STAFF",
        permissions: data.permissions
          ? {
              create: data.permissions.map((permissionKey) => ({
                permission: {
                  connect: {
                    key: permissionKey,
                  },
                },
              })),
            }
          : undefined,
      },
    })

    return {
      success: true,
      userId: user.id,
    }
  } catch (error) {
    console.error("Error creating user:", error)
    return {
      success: false,
      error: "create_failed",
    }
  }
}

export type UpdateUserResult =
  | { success: true }
  | { success: false; error: string }

export async function updateUserAction(
  userId: string,
  data: {
    name?: string
    email?: string
    password?: string
    role?: "ADMIN" | "STAFF"
    permissions?: PermissionKey[]
  }
): Promise<UpdateUserResult> {
  try {
    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: { id: userId },
    })

    if (!existingUser) {
      return {
        success: false,
        error: "user_not_found",
      }
    }

    // Check if email is being changed and if it's already taken
    if (data.email && data.email !== existingUser.email) {
      const emailTaken = await db.user.findUnique({
        where: { email: data.email },
      })

      if (emailTaken) {
        return {
          success: false,
          error: "email_taken",
        }
      }
    }

    // Hash password if provided
    const updateData: {
      name?: string
      email?: string
      role?: "ADMIN" | "STAFF"
      password?: string
    } = {}

    if (data.name) updateData.name = data.name
    if (data.email) updateData.email = data.email
    if (data.role) updateData.role = data.role
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10)
    }

    // Update permissions if provided
    if (data.permissions !== undefined) {
      // Delete existing permissions
      await db.userPermission.deleteMany({
        where: { userId },
      })

      // Create new permissions
      if (data.permissions.length > 0) {
        const permissionIds = await Promise.all(
          data.permissions.map(async (permissionKey) => {
            const permission = await db.permission.findUnique({
              where: { key: permissionKey },
            })
            return permission?.id
          })
        )

        const validPermissionIds = permissionIds.filter(
          (id): id is string => id !== undefined
        )

        if (validPermissionIds.length > 0) {
          await db.userPermission.createMany({
            data: validPermissionIds.map((permissionId) => ({
              userId,
              permissionId,
            })),
          })
        }
      }
    }

    // Update user
    await db.user.update({
      where: { id: userId },
      data: updateData,
    })

    return {
      success: true,
    }
  } catch (error) {
    console.error("Error updating user:", error)
    return {
      success: false,
      error: "update_failed",
    }
  }
}

export async function getAllPermissionsAction() {
  try {
    const permissions = await db.permission.findMany({
      orderBy: {
        key: "asc",
      },
    })

    return {
      success: true as const,
      permissions,
    }
  } catch (error) {
    console.error("Error fetching permissions:", error)
    return {
      success: false as const,
      error: "fetch_permissions_failed",
    }
  }
}
