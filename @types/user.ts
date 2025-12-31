import type { UserGetPayload } from "@/lib/generated/prisma/models/User"

// Utility type to convert Date to string (for JSON serialization)
type DateToString<T> = T extends Date
  ? string
  : T extends Date | null
    ? string | null
    : T

// Get the type based on the select statement used in the API route
type UserSelect = {
  id: true
  name: true
  email: true
  role: true
  isActive: true
  createdAt: true
  updatedAt: true
}

type UserFromPrisma = UserGetPayload<{ select: UserSelect }>

// Convert Date fields to string for JSON serialization
export type UserData = {
  [K in keyof UserFromPrisma]: K extends "createdAt" | "updatedAt"
    ? DateToString<UserFromPrisma[K]>
    : UserFromPrisma[K]
}
