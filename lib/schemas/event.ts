import * as z from "zod/v4"

// Event color enum values (matching Prisma enum)
export const EventColorEnum = z.enum([
  "SKY",
  "AMBER",
  "VIOLET",
  "ROSE",
  "EMERALD",
  "ORANGE",
])

// Event schema for creating/updating events
export const createEventSchema = z
  .object({
    title: z.string().min(1, { error: "events.errors.title.required" }),
    description: z.string().optional(),
    start: z.coerce.date({ error: "events.errors.start.required" }),
    end: z.coerce.date({ error: "events.errors.end.required" }),
    allDay: z.boolean().optional().default(false),
    color: EventColorEnum.optional().default("SKY"),
    location: z.string().optional(),
    attendeeIds: z.array(z.string()).optional().default([]),
  })
  .refine((data) => data.end > data.start, {
    path: ["end"],
    message: "events.errors.end_before_start",
  })

export type CreateEventInput = z.infer<typeof createEventSchema>

// Update schema (all fields optional except validation)
export const updateEventSchema = createEventSchema

export type UpdateEventInput = z.infer<typeof updateEventSchema>
