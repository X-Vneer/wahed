import * as z from "zod/v4"

export const contactSourceSchema = z.enum(["general", "project"])
export type ContactSource = z.infer<typeof contactSourceSchema>

export const createContactMessageSchema = z.object({
  firstName: z
    .string()
    .min(1, { error: "contacts.errors.firstName.required" }),
  lastName: z.string().min(1, { error: "contacts.errors.lastName.required" }),
  email: z
    .string()
    .min(1, { error: "contacts.errors.email.required" })
    .email({ error: "contacts.errors.email.invalid" }),
  phone: z.string().min(1, { error: "contacts.errors.phone.required" }),
  message: z.string().min(1, { error: "contacts.errors.message.required" }),
  source: contactSourceSchema.optional().default("general"),
  projectSlug: z.string().optional(),
})

export type CreateContactMessageInput = z.infer<
  typeof createContactMessageSchema
>
