import * as z from "zod/v4"

// Project status enum values
export const ProjectStatusEnum = z.enum([
  "PLANNING",
  "IN_PROGRESS",
  "ON_HOLD",
  "COMPLETED",
  "CANCELLED",
])

// Project form schema - matches the frontend form validation
// Error messages are translation keys that should be translated when displaying errors
export const createProjectSchema = z.object({
  nameAr: z.string().min(1, { error: "projects.errors.nameAr.required" }),
  nameEn: z.string().min(1, { error: "projects.errors.nameEn.required" }),
  image: z.string().optional(),
  descriptionAr: z
    .string()
    .min(1, { error: "projects.errors.descriptionAr.required" }),
  descriptionEn: z
    .string()
    .min(1, { error: "projects.errors.descriptionEn.required" }),
  area: z.coerce.number().positive({ error: "projects.errors.area.required" }),
  numberOfFloors: z.coerce.number().int().positive().optional(),
  deedNumber: z.string().optional(),
  workDuration: z.coerce.number().positive().optional(),
  googleMapsAddress: z.string().optional(),
  regionId: z.string().min(1, { error: "projects.errors.regionId.required" }),
  cityId: z.string().min(1, { error: "projects.errors.cityId.required" }),
  categoryIds: z
    .array(z.string())
    .min(1, { error: "projects.errors.categoryIds.required" }),
  status: ProjectStatusEnum.optional(),
  isActive: z.boolean().optional(),
  attachments: z
    .array(
      z.object({
        fileUrl: z
          .string()
          .min(1, { error: "projects.errors.attachments.fileUrl.required" }),
        fileName: z.string().optional(),
        fileType: z.string().optional(),
        fileSize: z.number().int().positive().optional(),
        additionalInfo: z.any().optional(),
      })
    )
    .optional()
    .default([]),
})

export type CreateProjectInput = z.infer<typeof createProjectSchema>

// Form values type - allows strings for numeric fields that will be converted on submit
export type ProjectFormValues = Omit<
  CreateProjectInput,
  "area" | "numberOfFloors"
> & {
  area: string | number
  numberOfFloors: string | number
}
