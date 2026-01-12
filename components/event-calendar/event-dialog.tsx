"use client"

import { useForm } from "@mantine/form"
import { RiCalendarLine, RiDeleteBinLine } from "@remixicon/react"
import { format, isBefore } from "date-fns"
import { ar, enUS } from "date-fns/locale"
import { zod4Resolver } from "mantine-form-zod-resolver"
import { useLocale, useTranslations } from "next-intl"
import { useEffect, useMemo, useState } from "react"
import * as z from "zod/v4"

import type { CalendarEvent, EventColor } from "@/components/event-calendar"
import {
  DefaultEndHour,
  DefaultStartHour,
  EndHour,
  StartHour,
} from "@/components/event-calendar/constants"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useUsers } from "@/hooks/use-users"
import { cn } from "@/lib/utils"
import { ScrollArea } from "../ui/scroll-area"
import UserAvatar from "../user-avatar"
import { extractOriginalEventId } from "@/lib/recurrence"
import { useEvent } from "@/hooks/use-events"

// Form schema for the event dialog
const eventFormSchema = z
  .object({
    title: z.string().optional(),
    description: z.string().optional(),
    startDate: z.date(),
    endDate: z.date(),
    startTime: z.string(),
    endTime: z.string(),
    allDay: z.boolean().default(false),
    location: z.string().optional(),
    color: z
      .enum(["sky", "amber", "violet", "rose", "emerald", "orange"])
      .default("sky"),
    attendeeIds: z.array(z.string()).default([]),
    // Recurrence fields
    isRecurring: z.boolean().default(false),
    recurrenceFrequency: z
      .enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"])
      .optional(),
    recurrenceInterval: z.number().int().positive().default(1),
    recurrenceDaysOfWeek: z.array(z.number()).optional(),
    recurrenceEndType: z.enum(["never", "onDate"]).default("never"),
    recurrenceEndDate: z.date().optional(),
  })
  .refine(
    (data) => {
      if (data.allDay) return true
      const [startHours = 0] = data.startTime.split(":").map(Number)
      const [endHours = 0] = data.endTime.split(":").map(Number)
      return (
        startHours >= StartHour &&
        startHours <= EndHour &&
        endHours >= StartHour &&
        endHours <= EndHour
      )
    },
    {
      error: "calendar.eventDialog.errors.timeRange",
      path: ["startTime"],
    }
  )
  .refine(
    (data) => {
      const start = new Date(data.startDate)
      const end = new Date(data.endDate)

      if (!data.allDay) {
        const [startHours = 0, startMinutes = 0] = data.startTime
          .split(":")
          .map(Number)
        const [endHours = 0, endMinutes = 0] = data.endTime
          .split(":")
          .map(Number)
        start.setHours(startHours, startMinutes, 0)
        end.setHours(endHours, endMinutes, 0)
      } else {
        start.setHours(0, 0, 0, 0)
        end.setHours(23, 59, 59, 999)
      }

      return !isBefore(end, start)
    },
    {
      error: "calendar.eventDialog.errors.endBeforeStart",
      path: ["endDate"],
    }
  )

interface EventDialogProps {
  event: CalendarEvent | null
  isOpen: boolean
  onClose: () => void
  onSave: (event: CalendarEvent) => void
  onDelete: (eventId: string) => void
}

export function EventDialog({
  event,
  isOpen,
  onClose,
  onSave,
  onDelete,
}: EventDialogProps) {
  const t = useTranslations("calendar.eventDialog")
  const tCalendar = useTranslations("calendar")
  const tCommon = useTranslations("common")
  const locale = useLocale()
  const dateFnsLocale = locale === "ar" ? ar : enUS
  const [startDateOpen, setStartDateOpen] = useState(false)
  const [endDateOpen, setEndDateOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const { data: users = [] } = useUsers()

  // Check if this is an expanded recurring event and fetch the original event
  const originalEventId = event?.id ? extractOriginalEventId(event.id) : null
  const isExpandedEvent = event?.id && originalEventId !== event.id
  const { data: originalEvent, isLoading: isLoadingOriginalEvent } = useEvent(
    isExpandedEvent ? originalEventId : null
  )

  // Use original event if this is an expanded recurring event, otherwise use the passed event
  const eventToUse =
    isExpandedEvent && originalEvent
      ? {
          ...originalEvent,
          // Keep the instance-specific start/end times from the expanded event
          start: event.start,
          end: event.end,
          // Use the original event ID for operations
          id: originalEvent.id,
        }
      : event

  const formatTimeForInput = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, "0")
    const minutes = Math.floor(date.getMinutes() / 15) * 15
    return `${hours}:${minutes.toString().padStart(2, "0")}`
  }

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      title: "",
      description: "",
      startDate: new Date(),
      endDate: new Date(),
      startTime: `${DefaultStartHour}:00`,
      endTime: `${DefaultEndHour}:00`,
      allDay: false,
      location: "",
      color: "sky" as EventColor,
      attendeeIds: [] as string[],
      // Recurrence fields
      isRecurring: false,
      recurrenceFrequency: "WEEKLY" as
        | "WEEKLY"
        | "DAILY"
        | "MONTHLY"
        | "YEARLY",
      recurrenceInterval: 1,
      recurrenceDaysOfWeek: [] as number[],
      recurrenceEndType: "never" as "never" | "onDate",
      recurrenceEndDate: undefined as Date | undefined,
    },

    validate: zod4Resolver(eventFormSchema),
  })

  useEffect(() => {
    // Wait for original event to load if it's an expanded recurring event
    if (isExpandedEvent && isLoadingOriginalEvent) {
      return
    }

    if (eventToUse) {
      console.log("🚀 ~ EventDialog ~ event:", eventToUse)
      const start = new Date(eventToUse.start)
      const end = new Date(eventToUse.end)

      // Extract recurrence data if available
      const recurrenceRule =
        (eventToUse as unknown as { recurrenceRule?: unknown })
          ?.recurrenceRule || null
      const isRecurring =
        (eventToUse as unknown as { isRecurring?: boolean })?.isRecurring ||
        false
      const recurrenceEndDate =
        (eventToUse as unknown as { recurrenceEndDate?: Date | null })
          ?.recurrenceEndDate || null

      const rule =
        typeof recurrenceRule === "object" && recurrenceRule !== null
          ? (recurrenceRule as {
              frequency?: string
              interval?: number
              daysOfWeek?: number[]
              endDate?: Date
            })
          : null

      form.setValues({
        title: eventToUse.title || "",
        description: eventToUse.description || "",
        startDate: start,
        endDate: end,
        startTime: formatTimeForInput(start),
        endTime: formatTimeForInput(end),
        allDay: eventToUse.allDay || false,
        location: eventToUse.location || "",
        color: (eventToUse.color as EventColor) || "sky",
        attendeeIds: eventToUse.attendees?.map((attendee) => attendee.id) || [],
        // Recurrence fields
        isRecurring: isRecurring,
        recurrenceFrequency: (rule?.frequency as "WEEKLY") || "WEEKLY",
        recurrenceInterval: rule?.interval || 1,
        recurrenceDaysOfWeek: rule?.daysOfWeek || [start.getDay()],
        recurrenceEndType: (recurrenceEndDate
          ? "onDate"
          : "never") as unknown as "never" | "onDate",
        recurrenceEndDate: recurrenceEndDate
          ? new Date(recurrenceEndDate)
          : undefined,
      })
    } else {
      form.reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventToUse?.id, isExpandedEvent, isLoadingOriginalEvent])

  // Memoize time options so they're only calculated once
  const timeOptions = useMemo(() => {
    const options = []
    for (let hour = StartHour; hour <= EndHour; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const formattedHour = hour.toString().padStart(2, "0")
        const formattedMinute = minute.toString().padStart(2, "0")
        const value = `${formattedHour}:${formattedMinute}`
        // Use a fixed date to avoid unnecessary date object creations
        const date = new Date(2000, 0, 1, hour, minute)
        const label = format(date, "h:mm a", { locale: dateFnsLocale })
        options.push({ value, label })
      }
    }
    return options
  }, [dateFnsLocale]) // Empty dependency array ensures this only runs once

  const handleSave = form.onSubmit((values) => {
    const start = new Date(values.startDate)
    const end = new Date(values.endDate)

    if (!values.allDay) {
      const [startHours = 0, startMinutes = 0] = values.startTime
        .split(":")
        .map(Number)
      const [endHours = 0, endMinutes = 0] = values.endTime
        .split(":")
        .map(Number)

      start.setHours(startHours, startMinutes, 0)
      end.setHours(endHours, endMinutes, 0)
    } else {
      start.setHours(0, 0, 0, 0)
      end.setHours(23, 59, 59, 999)
    }

    // Use generic title if empty
    const eventTitle = values.title.trim() ? values.title : t("noTitle")

    // Use original event ID for operations (in case this is an expanded recurring event)
    const eventIdToUse = eventToUse?.id || event?.id || ""

    // Build recurrence rule if recurring
    const recurrenceRule = values.isRecurring
      ? {
          frequency: values.recurrenceFrequency || "WEEKLY",
          interval: values.recurrenceInterval || 1,
          daysOfWeek:
            values.recurrenceFrequency === "WEEKLY"
              ? values.recurrenceDaysOfWeek || [start.getDay()]
              : undefined,
          endDate:
            (values.recurrenceEndType as string) === "onDate" &&
            values.recurrenceEndDate
              ? values.recurrenceEndDate
              : undefined,
        }
      : undefined

    onSave({
      id: eventIdToUse,
      title: eventTitle,
      description: values.description,
      start,
      end,
      allDay: values.allDay,
      location: values.location,
      color: values.color,
      attendees:
        users.filter((user) => values.attendeeIds.includes(user.id)) || [],
      // Recurrence fields
      isRecurring: values.isRecurring,
      recurrenceRule: recurrenceRule as
        | {
            frequency: "WEEKLY" | "DAILY" | "MONTHLY" | "YEARLY"
            interval: number
            daysOfWeek?: number[]
            endDate?: Date
          }
        | undefined,
      recurrenceEndDate:
        (values.recurrenceEndType as string) === "onDate" &&
        values.recurrenceEndDate
          ? values.recurrenceEndDate
          : undefined,
    } as CalendarEvent & {
      isRecurring?: boolean
      recurrenceRule?: {
        frequency: "WEEKLY" | "DAILY" | "MONTHLY" | "YEARLY"
        interval: number
        daysOfWeek?: number[]
        endDate?: Date
      }
      recurrenceEndDate?: Date
    })
  })

  const handleDelete = () => {
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    const eventIdToDelete = eventToUse?.id || event?.id
    if (eventIdToDelete) {
      // Extract original ID if this is an expanded recurring event
      const originalId = extractOriginalEventId(eventIdToDelete)
      onDelete(originalId)
      setDeleteDialogOpen(false)
    }
  }

  // Updated color options to match types.ts - memoized to avoid recreation on every render
  const colorOptions = useMemo<
    Array<{
      value: EventColor
      label: string
      bgClass: string
      borderClass: string
    }>
  >(
    () => [
      {
        value: "sky",
        label: t("colors.sky"),
        bgClass: "bg-sky-400 data-[state=checked]:bg-sky-400",
        borderClass: "border-sky-400 data-[state=checked]:border-sky-400",
      },
      {
        value: "amber",
        label: t("colors.amber"),
        bgClass: "bg-amber-400 data-[state=checked]:bg-amber-400",
        borderClass: "border-amber-400 data-[state=checked]:border-amber-400",
      },
      {
        value: "violet",
        label: t("colors.violet"),
        bgClass: "bg-violet-400 data-[state=checked]:bg-violet-400",
        borderClass: "border-violet-400 data-[state=checked]:border-violet-400",
      },
      {
        value: "rose",
        label: t("colors.rose"),
        bgClass: "bg-rose-400 data-[state=checked]:bg-rose-400",
        borderClass: "border-rose-400 data-[state=checked]:border-rose-400",
      },
      {
        value: "emerald",
        label: t("colors.emerald"),
        bgClass: "bg-emerald-400 data-[state=checked]:bg-emerald-400",
        borderClass:
          "border-emerald-400 data-[state=checked]:border-emerald-400",
      },
      {
        value: "orange",
        label: t("colors.orange"),
        bgClass: "bg-orange-400 data-[state=checked]:bg-orange-400",
        borderClass: "border-orange-400 data-[state=checked]:border-orange-400",
      },
    ],
    [t]
  )

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="flex max-h-[90svh] flex-col gap-0 p-0 sm:max-h-[min(640px,80vh)] sm:max-w-md [&>button:last-child]:hidden">
          <ScrollArea className="flex max-h-full flex-col overflow-hidden">
            <div className="p-6">
              <DialogHeader>
                <DialogTitle>
                  {event?.id ? t("editTitle") : t("createTitle")}
                </DialogTitle>
                <DialogDescription className="sr-only">
                  {event?.id ? t("editDescription") : t("createDescription")}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSave}>
                <FieldGroup>
                  <div className="grid gap-4 py-4">
                    <Field data-invalid={!!form.errors.title}>
                      <FieldLabel htmlFor="title">{t("title")}</FieldLabel>
                      <Input id="title" {...form.getInputProps("title")} />
                      {form.errors.title && (
                        <FieldError
                          errors={[{ message: String(form.errors.title) }]}
                        />
                      )}
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="description">
                        {t("description")}
                      </FieldLabel>
                      <Textarea
                        id="description"
                        {...form.getInputProps("description")}
                        rows={3}
                      />
                    </Field>

                    <Field
                      data-invalid={
                        !!form.errors.startDate || !!form.errors.startTime
                      }
                    >
                      <FieldLabel htmlFor="start-date">
                        {t("startDate")}
                      </FieldLabel>
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <Popover
                            open={startDateOpen}
                            onOpenChange={setStartDateOpen}
                          >
                            <PopoverTrigger
                              render={
                                <Button
                                  id="start-date"
                                  type="button"
                                  variant={"outline"}
                                  className={cn(
                                    "group bg-background hover:bg-background border-input w-full justify-between px-3 font-normal outline-offset-0 outline-none focus-visible:outline-[3px]",
                                    !form.values.startDate &&
                                      "text-muted-foreground"
                                  )}
                                >
                                  <span
                                    className={cn(
                                      "truncate",
                                      !form.values.startDate &&
                                        "text-muted-foreground"
                                    )}
                                  >
                                    {form.values.startDate
                                      ? format(form.values.startDate, "PPP", {
                                          locale: dateFnsLocale,
                                        })
                                      : t("pickDate")}
                                  </span>
                                  <RiCalendarLine
                                    size={16}
                                    className="text-muted-foreground/80 shrink-0"
                                    aria-hidden="true"
                                  />
                                </Button>
                              }
                            ></PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-2"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={form.values.startDate}
                                defaultMonth={form.values.startDate}
                                onSelect={(date) => {
                                  if (date) {
                                    form.setFieldValue("startDate", date)
                                    // If end date is before the new start date, update it to match the start date
                                    if (isBefore(form.values.endDate, date)) {
                                      form.setFieldValue("endDate", date)
                                    }
                                    form.clearFieldError("startDate")
                                    form.clearFieldError("endDate")
                                    setStartDateOpen(false)
                                  }
                                }}
                              />
                            </PopoverContent>
                          </Popover>
                        </div>

                        {!form.values.allDay && (
                          <div className="min-w-28">
                            <Select
                              value={form.values.startTime}
                              onValueChange={(value) => {
                                form.setFieldValue("startTime", value || "")
                                form.clearFieldError("startTime")
                              }}
                            >
                              <SelectTrigger id="start-time">
                                <SelectValue>
                                  {" "}
                                  {form.values.startTime || t("selectTime")}
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                {timeOptions.map((option) => (
                                  <SelectItem
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>
                      {(form.errors.startDate || form.errors.startTime) && (
                        <FieldError
                          errors={
                            [
                              form.errors.startDate
                                ? { message: String(form.errors.startDate) }
                                : undefined,
                              form.errors.startTime
                                ? { message: String(form.errors.startTime) }
                                : undefined,
                            ].filter(Boolean) as { message?: string }[]
                          }
                        />
                      )}
                    </Field>

                    <Field data-invalid={!!form.errors.endDate}>
                      <FieldLabel htmlFor="end-date">{t("endDate")}</FieldLabel>
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <Popover
                            open={endDateOpen}
                            onOpenChange={setEndDateOpen}
                          >
                            <PopoverTrigger
                              render={
                                <Button
                                  id="end-date"
                                  type="button"
                                  variant={"outline"}
                                  className={cn(
                                    "group bg-background hover:bg-background border-input w-full justify-between px-3 font-normal outline-offset-0 outline-none focus-visible:outline-[3px]",
                                    !form.values.endDate &&
                                      "text-muted-foreground"
                                  )}
                                >
                                  <span
                                    className={cn(
                                      "truncate",
                                      !form.values.endDate &&
                                        "text-muted-foreground"
                                    )}
                                  >
                                    {form.values.endDate
                                      ? format(form.values.endDate, "PPP", {
                                          locale: dateFnsLocale,
                                        })
                                      : t("pickDate")}
                                  </span>
                                  <RiCalendarLine
                                    size={16}
                                    className="text-muted-foreground/80 shrink-0"
                                    aria-hidden="true"
                                  />
                                </Button>
                              }
                            ></PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-2"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={form.values.endDate}
                                defaultMonth={form.values.endDate}
                                disabled={{ before: form.values.startDate }}
                                onSelect={(date) => {
                                  if (date) {
                                    form.setFieldValue("endDate", date)
                                    form.clearFieldError("endDate")
                                    setEndDateOpen(false)
                                  }
                                }}
                              />
                            </PopoverContent>
                          </Popover>
                        </div>

                        {!form.values.allDay && (
                          <div className="min-w-28">
                            <Select
                              value={form.values.endTime}
                              onValueChange={(value) => {
                                form.setFieldValue("endTime", value || "")
                                form.clearFieldError("endTime")
                              }}
                            >
                              <SelectTrigger id="end-time">
                                <SelectValue>
                                  {" "}
                                  {form.values.endTime || t("selectTime")}
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                {timeOptions.map((option) => (
                                  <SelectItem
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>
                      {form.errors.endDate && (
                        <FieldError
                          errors={[{ message: String(form.errors.endDate) }]}
                        />
                      )}
                    </Field>

                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="all-day"
                        checked={form.values.allDay}
                        onCheckedChange={(checked) => {
                          form.setFieldValue("allDay", checked === true)
                        }}
                      />
                      <Label htmlFor="all-day">{tCalendar("allDay")}</Label>
                    </div>

                    <Field>
                      <FieldLabel htmlFor="location">
                        {t("location")}
                      </FieldLabel>
                      <Input
                        id="location"
                        {...form.getInputProps("location")}
                      />
                    </Field>

                    {/* Recurrence Section */}
                    <div className="space-y-4 rounded-md border p-4">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="is-recurring"
                          checked={form.values.isRecurring}
                          onCheckedChange={(checked) => {
                            form.setFieldValue("isRecurring", checked === true)
                            if (!checked) {
                              // Reset recurrence fields when disabled
                              form.setFieldValue(
                                "recurrenceFrequency",
                                "WEEKLY"
                              )
                              form.setFieldValue("recurrenceInterval", 1)
                              form.setFieldValue("recurrenceDaysOfWeek", [
                                form.values.startDate.getDay(),
                              ])
                              form.setFieldValue("recurrenceEndType", "never")
                              form.setFieldValue("recurrenceEndDate", undefined)
                            }
                          }}
                        />
                        <Label htmlFor="is-recurring">
                          {t("recurrence.enable")}
                        </Label>
                      </div>

                      {form.values.isRecurring && (
                        <div className="space-y-4 pl-6">
                          <div className="flex gap-4">
                            <Field className="flex-1">
                              <FieldLabel>
                                {t("recurrence.frequency.label")}
                              </FieldLabel>
                              <Select
                                value={form.values.recurrenceFrequency}
                                onValueChange={(value) => {
                                  form.setFieldValue(
                                    "recurrenceFrequency",
                                    value as unknown as
                                      | "WEEKLY"
                                      | "DAILY"
                                      | "MONTHLY"
                                      | "YEARLY"
                                  )
                                  // Reset days of week when frequency changes
                                  if (value !== "WEEKLY") {
                                    form.setFieldValue(
                                      "recurrenceDaysOfWeek",
                                      []
                                    )
                                  } else {
                                    form.setFieldValue("recurrenceDaysOfWeek", [
                                      form.values.startDate.getDay(),
                                    ])
                                  }
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="DAILY">
                                    {t("recurrence.frequency.daily")}
                                  </SelectItem>
                                  <SelectItem value="WEEKLY">
                                    {t("recurrence.frequency.weekly")}
                                  </SelectItem>
                                  <SelectItem value="MONTHLY">
                                    {t("recurrence.frequency.monthly")}
                                  </SelectItem>
                                  <SelectItem value="YEARLY">
                                    {t("recurrence.frequency.yearly")}
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </Field>

                            <Field className="w-24">
                              <FieldLabel>
                                {t("recurrence.interval")}
                              </FieldLabel>
                              <Input
                                type="number"
                                min="1"
                                value={form.values.recurrenceInterval}
                                onChange={(e) => {
                                  const value = parseInt(e.target.value, 10)
                                  if (!isNaN(value) && value > 0) {
                                    form.setFieldValue(
                                      "recurrenceInterval",
                                      value
                                    )
                                  }
                                }}
                              />
                            </Field>
                          </div>

                          {form.values.recurrenceFrequency === "WEEKLY" && (
                            <Field>
                              <FieldLabel>
                                {t("recurrence.daysOfWeek.label")}
                              </FieldLabel>
                              <div className="flex flex-wrap gap-2">
                                {[
                                  {
                                    value: 0,
                                    label: t("recurrence.daysOfWeek.sunday"),
                                  },
                                  {
                                    value: 1,
                                    label: t("recurrence.daysOfWeek.monday"),
                                  },
                                  {
                                    value: 2,
                                    label: t("recurrence.daysOfWeek.tuesday"),
                                  },
                                  {
                                    value: 3,
                                    label: t("recurrence.daysOfWeek.wednesday"),
                                  },
                                  {
                                    value: 4,
                                    label: t("recurrence.daysOfWeek.thursday"),
                                  },
                                  {
                                    value: 5,
                                    label: t("recurrence.daysOfWeek.friday"),
                                  },
                                  {
                                    value: 6,
                                    label: t("recurrence.daysOfWeek.saturday"),
                                  },
                                ].map((day) => (
                                  <div
                                    key={day.value}
                                    className="flex items-center gap-2"
                                  >
                                    <Checkbox
                                      id={`day-${day.value}`}
                                      checked={form.values.recurrenceDaysOfWeek?.includes(
                                        day.value
                                      )}
                                      onCheckedChange={(checked) => {
                                        const currentDays =
                                          form.values.recurrenceDaysOfWeek || []
                                        if (checked) {
                                          form.setFieldValue(
                                            "recurrenceDaysOfWeek",
                                            [...currentDays, day.value]
                                          )
                                        } else {
                                          form.setFieldValue(
                                            "recurrenceDaysOfWeek",
                                            currentDays.filter(
                                              (d) => d !== day.value
                                            )
                                          )
                                        }
                                      }}
                                    />
                                    <Label
                                      htmlFor={`day-${day.value}`}
                                      className="cursor-pointer text-sm font-normal"
                                    >
                                      {day.label}
                                    </Label>
                                  </div>
                                ))}
                              </div>
                            </Field>
                          )}

                          <Field>
                            <FieldLabel>
                              {t("recurrence.endDate.label")}
                            </FieldLabel>
                            <RadioGroup
                              value={form.values.recurrenceEndType}
                              onValueChange={(value) => {
                                const endType = value as "never" | "onDate"
                                form.setFieldValue(
                                  "recurrenceEndType",
                                  endType as unknown as "never" | "onDate"
                                )
                                if (value === "never") {
                                  form.setFieldValue(
                                    "recurrenceEndDate",
                                    undefined
                                  )
                                }
                              }}
                            >
                              <div className="flex items-center gap-2">
                                <RadioGroupItem
                                  value="never"
                                  id="recurrence-end-never"
                                />
                                <Label
                                  htmlFor="recurrence-end-never"
                                  className="cursor-pointer"
                                >
                                  {t("recurrence.endDate.never")}
                                </Label>
                              </div>
                              <div className="flex items-center gap-2">
                                <RadioGroupItem
                                  value="onDate"
                                  id="recurrence-end-date"
                                />
                                <Label
                                  htmlFor="recurrence-end-date"
                                  className="cursor-pointer"
                                >
                                  {t("recurrence.endDate.onDate")}
                                </Label>
                              </div>
                            </RadioGroup>
                            {form.values.recurrenceEndType === "onDate" && (
                              <Popover>
                                <PopoverTrigger
                                  render={
                                    <Button
                                      type="button"
                                      variant="outline"
                                      className="mt-2 w-full justify-start text-left font-normal"
                                    >
                                      {form.values.recurrenceEndDate ? (
                                        format(
                                          form.values.recurrenceEndDate,
                                          "PPP",
                                          {
                                            locale: dateFnsLocale,
                                          }
                                        )
                                      ) : (
                                        <span>{t("pickDate")}</span>
                                      )}
                                    </Button>
                                  }
                                />
                                <PopoverContent
                                  className="w-auto p-0"
                                  align="start"
                                >
                                  <Calendar
                                    mode="single"
                                    selected={form.values.recurrenceEndDate}
                                    onSelect={(date) => {
                                      if (date) {
                                        form.setFieldValue(
                                          "recurrenceEndDate",
                                          date
                                        )
                                      }
                                    }}
                                    disabled={{ before: form.values.startDate }}
                                  />
                                </PopoverContent>
                              </Popover>
                            )}
                          </Field>
                        </div>
                      )}
                    </div>

                    <Field>
                      <FieldLabel htmlFor="attendees">
                        {t("attendees")}
                      </FieldLabel>
                      <Select
                        multiple
                        value={form.values.attendeeIds}
                        onValueChange={(value) => {
                          form.setFieldValue("attendeeIds", value || [])
                        }}
                      >
                        <SelectTrigger className="w-full" id="attendees">
                          <SelectValue>
                            {" "}
                            {form.values.attendeeIds.length > 0 ? (
                              <span className="flex gap-1">
                                {users
                                  .filter((user) =>
                                    form.values.attendeeIds.includes(user.id)
                                  )
                                  .map((user) => (
                                    <UserAvatar key={user.id} {...user} />
                                  ))}
                              </span>
                            ) : (
                              t("attendeesPlaceholder")
                            )}{" "}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {users.map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              <UserAvatar {...user} />
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>

                    <fieldset className="space-y-4">
                      <legend className="text-foreground text-sm leading-none font-medium">
                        {t("etiquette")}
                      </legend>
                      <RadioGroup
                        className="flex gap-1.5"
                        defaultValue={colorOptions[0]?.value}
                        value={form.values.color}
                        onValueChange={(value) => {
                          form.setFieldValue("color", value as EventColor)
                        }}
                      >
                        {colorOptions.map((colorOption) => (
                          <RadioGroupItem
                            key={colorOption.value}
                            id={`color-${colorOption.value}`}
                            value={colorOption.value}
                            aria-label={colorOption.label}
                            className={cn(
                              "size-6 shadow-none",
                              colorOption.bgClass,
                              colorOption.borderClass
                            )}
                          />
                        ))}
                      </RadioGroup>
                    </fieldset>
                  </div>
                </FieldGroup>
                <DialogFooter className="flex-row sm:justify-between">
                  {event?.id && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={handleDelete}
                      aria-label="Delete event"
                    >
                      <RiDeleteBinLine size={16} aria-hidden="true" />
                    </Button>
                  )}
                  <div className="flex flex-1 justify-end gap-2">
                    <Button type="button" variant="outline" onClick={onClose}>
                      {tCommon("cancel")}
                    </Button>
                    <Button type="submit">{tCommon("save")}</Button>
                  </div>
                </DialogFooter>
              </form>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteConfirm.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteConfirm.description", {
                title: eventToUse?.title || event?.title || t("noTitle"),
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("deleteConfirm.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              {t("deleteConfirm.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
