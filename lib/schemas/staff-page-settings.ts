import * as z from "zod/v4"

export const updateStaffPageSettingsSchema = z.object({
  heroBackgroundImageUrl: z
    .union([z.url(), z.literal("")])
    .optional()
    .nullable(),
  attendanceLink: z.string().min(1).default("/attendance"),
  accountingLink: z.string().min(1).default("/accounting"),
})

export type UpdateStaffPageSettingsInput = z.infer<
  typeof updateStaffPageSettingsSchema
>
