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

export const projectAttachmentsSchema = z.object({
  attachments: z.array(attachmentSchema),
})
export type Attachment = z.infer<typeof attachmentSchema>
export type ProjectAttachments = z.infer<typeof projectAttachmentsSchema>
