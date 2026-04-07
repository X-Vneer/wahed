import * as z from "zod/v4"
import { attachmentSchema } from "@/lib/schemas/attachment"
import { ProjectStatusEnum } from "@/lib/schemas/project"

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function optionalNumber() {
  return z.preprocess(
    (val) =>
      val === "" || val === null || val === undefined ? undefined : val,
    z.coerce.number().positive().optional()
  )
}

function optionalInt() {
  return z.preprocess(
    (val) =>
      val === "" || val === null || val === undefined ? undefined : val,
    z.coerce.number().int().positive().optional()
  )
}

export const createPublicProjectSchema = z.object({
  titleAr: z.string().min(1, { error: "titleArRequired" }),
  titleEn: z.string().min(1, { error: "titleEnRequired" }),
  slug: z
    .string()
    .min(1, { error: "slugRequired" })
    .regex(slugRegex, { error: "slugInvalid" }),
  descriptionAr: z.string().optional(),
  descriptionEn: z.string().optional(),
  shortDescriptionAr: z.string().optional(),
  shortDescriptionEn: z.string().optional(),
  images: z.array(z.string().min(1)).default([]),
  isActive: z.boolean().optional().default(true),
  projectId: z
    .preprocess(
      (v) =>
        v === "" || v === null || v === undefined ? undefined : String(v),
      z.string().min(1).optional()
    ),
  locationAr: z.string().optional(),
  locationEn: z.string().optional(),
  area: optionalNumber(),
  numberOfFloors: optionalInt(),
  deedNumber: z.string().optional(),
  workDuration: optionalInt(),
  googleMapsAddress: z.string().optional(),
  status: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : v),
    ProjectStatusEnum.optional()
  ),
  cityId: z.string().min(1, { error: "cityIdRequired" }),
  categoryIds: z.array(z.string()).default([]),
  badgeIds: z.array(z.string()).default([]),
  featureIds: z.array(z.string()).default([]),
  startingPrice: optionalNumber(),
  endingPrice: optionalNumber(),
  attachments: z.array(attachmentSchema).optional().default([]),
})

export type CreatePublicProjectInput = z.infer<typeof createPublicProjectSchema>

/** Includes `regionId` for the form; omit before sending to the API. */
export const publicProjectFormSchema = createPublicProjectSchema.and(
  z.object({
    regionId: z.string().min(1, { error: "regionIdRequired" }),
  })
)

export type PublicProjectFormInput = z.infer<typeof publicProjectFormSchema>
