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

// Recurrence rule schema
export const recurrenceRuleSchema = z.object({
  frequency: z.enum(["WEEKLY", "DAILY", "MONTHLY", "YEARLY"]),
  interval: z.number().int().positive().default(1), // Every N weeks/days/months
  daysOfWeek: z.array(z.number().int().min(0).max(6)).optional(), // 0 = Sunday, 6 = Saturday (for WEEKLY)
  endDate: z.coerce.date().optional(), // When recurrence ends
})

export type RecurrenceRule = z.infer<typeof recurrenceRuleSchema>

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
    // Recurrence fields
    isRecurring: z.boolean().optional().default(false),
    recurrenceRule: recurrenceRuleSchema.optional(),
    recurrenceEndDate: z.coerce.date().optional(),
  })
  .refine((data) => data.end > data.start, {
    path: ["end"],
    message: "events.errors.end_before_start",
  })
  .refine(
    (data) => {
      // If isRecurring is true, recurrenceRule must be provided
      if (data.isRecurring && !data.recurrenceRule) {
        return false
      }
      return true
    },
    {
      path: ["recurrenceRule"],
      message: "events.errors.recurrence_rule_required",
    }
  )
  .refine(
    (data) => {
      // If recurrenceRule has endDate, it should be after start date
      if (
        data.recurrenceRule?.endDate &&
        data.recurrenceRule.endDate < data.start
      ) {
        return false
      }
      if (data.recurrenceEndDate && data.recurrenceEndDate < data.start) {
        return false
      }
      return true
    },
    {
      path: ["recurrenceEndDate"],
      message: "events.errors.recurrence_end_before_start",
    }
  )

export type CreateEventInput = z.infer<typeof createEventSchema>

// Update schema (all fields optional except validation)
export const updateEventSchema = createEventSchema

export type UpdateEventInput = z.infer<typeof updateEventSchema>
