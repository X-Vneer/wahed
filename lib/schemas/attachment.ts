import * as z from "zod/v4"

export const attachmentSchema = z.object({
  fileUrl: z
    .string()
    .min(1, { error: "projects.errors.attachments.fileUrl.required" }),
  fileName: z.string().optional(),
  fileType: z.string().optional(),
  fileSize: z.number().int().positive().optional(),
  additionalInfo: z.any().optional(),
})

export type Attachment = z.infer<typeof attachmentSchema>
