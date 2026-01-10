import { getAccessTokenPayload } from "./get-access-token"
import db from "./db"
import { User, userSelect } from "@/prisma/users/select"
import { transformUser } from "@/prisma/users/select"

export async function getUserDataServerSide(): Promise<User> {
  // Get and verify token from cookies
  const payload = await getAccessTokenPayload()

  if (!payload || !payload.userId) {
    throw new Error("Unauthorized")
  }

  // Fetch user from database
  const user = await db.user.findUnique({
    where: { id: payload.userId },
    select: userSelect,
  })

  if (!user) {
    throw new Error("User not found")
  }

  if (!user.isActive) {
    throw new Error("Account inactive")
  }

  return transformUser(user)
}
