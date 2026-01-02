import type { Prisma } from "@/lib/generated/prisma/client"

export const userSelect = {
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
} satisfies Prisma.UserSelect

export type UserSelect = Prisma.UserGetPayload<{ select: typeof userSelect }>

export const transformUser = (user: UserSelect) => {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    roleName: user.roleName,
    role: user.role,
    isActive: user.isActive,
    permissions: user.permissions.map((p) => p.permission.key),
  }
}

export type User = ReturnType<typeof transformUser>
