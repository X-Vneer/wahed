import type { Prisma } from "@/lib/generated/prisma/client"

export const userSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  roleName: true,
  role: true,
  isActive: true,
  image: true,
  dateOfBirth: true,
  gender: true,
  nationality: true,
  address: true,
  city: true,
  country: true,
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

export const userListSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  roleName: true,
  image: true,
} satisfies Prisma.UserSelect

export type UserSelect = Prisma.UserGetPayload<{ select: typeof userSelect }>
export type UserListSelect = Prisma.UserGetPayload<{
  select: typeof userListSelect
}>

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
    image: user.image,
    dateOfBirth: user.dateOfBirth,
    gender: user.gender,
    nationality: user.nationality,
    address: user.address,
    city: user.city,
    country: user.country,
  }
}

export type User = ReturnType<typeof transformUser>
