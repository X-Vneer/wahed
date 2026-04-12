import type { ContactMessage as PrismaContactMessage } from "@/lib/generated/prisma/client"

export const transformContact = (contact: PrismaContactMessage) => {
  return {
    ...contact,
    fullName: `${contact.firstName} ${contact.lastName}`,
  }
}

export type Contact = ReturnType<typeof transformContact>
