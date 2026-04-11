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
    .min(3, { error: "slugMinLength" })
    .regex(slugRegex, { error: "slugInvalid" }),
  descriptionAr: z.string().min(1, { error: "descriptionArRequired" }),
  descriptionEn: z.string().min(1, { error: "descriptionEnRequired" }),
  shortDescriptionAr: z.string().min(1, { error: "shortDescriptionArRequired" }),
  shortDescriptionEn: z.string().min(1, { error: "shortDescriptionEnRequired" }),
  images: z
    .array(z.string().min(1))
    .min(5, { error: "imagesMinFive" }),
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

/** Includes `regionId` and linked-project attachment UI state; merge `attachments` before POST. */
export const publicProjectFormSchema = createPublicProjectSchema
  .omit({ attachments: true })
  .extend({
    regionId: z.string().min(1, { error: "regionIdRequired" }),
    /** Newly uploaded files only; linked project files live in `linkedAttachmentCandidates`. */
    attachments: z.array(attachmentSchema).default([]),
    linkedAttachmentCandidates: z.array(attachmentSchema).default([]),
    selectedLinkedFileUrls: z.array(z.string()).default([]),
  })

export type PublicProjectFormInput = z.infer<typeof publicProjectFormSchema>

/** One schema per wizard step; used with `safeParse(form.values)` for step navigation. */
export const publicProjectFormStepSchemas = [
  publicProjectFormSchema.pick({
    titleAr: true,
    titleEn: true,
    slug: true,
    isActive: true,
    projectId: true,
    shortDescriptionAr: true,
    shortDescriptionEn: true,
    descriptionAr: true,
    descriptionEn: true,
  }),
  publicProjectFormSchema.pick({
    images: true,
    attachments: true,
  }),
  publicProjectFormSchema.pick({
    regionId: true,
    cityId: true,
    locationAr: true,
    locationEn: true,
    googleMapsAddress: true,
    area: true,
    numberOfFloors: true,
    deedNumber: true,
    workDuration: true,
    status: true,
  }),
  publicProjectFormSchema.pick({
    categoryIds: true,
    badgeIds: true,
    featureIds: true,
    startingPrice: true,
    endingPrice: true,
  }),
] as const

export const PUBLIC_PROJECT_FORM_STEP_COUNT = publicProjectFormStepSchemas.length
