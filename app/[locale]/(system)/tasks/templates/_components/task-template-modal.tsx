"use client"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Spinner } from "@/components/ui/spinner"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import type { TaskTemplate } from "@/prisma/task-templates"
import type { TaskTemplateSubItemInput } from "@/lib/schemas/task-template"
import { handleFormErrors } from "@/lib/handle-form-errors"
import {
  createTaskTemplateSchema,
  updateTaskTemplateSchema,
} from "@/lib/schemas/task-template"
import { useTaskCategories } from "@/hooks/use-task-category"
import { useTaskStatuses } from "@/hooks/use-task-status"
import apiClient from "@/services"
import { useForm } from "@mantine/form"
import { useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { format } from "date-fns"
import { ar, enUS } from "date-fns/locale"
import { zod4Resolver } from "mantine-form-zod-resolver"
import { useLocale, useTranslations } from "next-intl"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Calendar as CalendarIcon, Plus, Trash2, X } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

const PRIORITY_OPTIONS = [
  { value: "LOW", labelKey: "taskTemplate.form.priorityLow" },
  { value: "MEDIUM", labelKey: "taskTemplate.form.priorityMedium" },
  { value: "HIGH", labelKey: "taskTemplate.form.priorityHigh" },
] as const

type TaskTemplateModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedTemplate: TaskTemplate | null
}

const emptySubItem = (): TaskTemplateSubItemInput => ({
  title: "",
  description: "",
  order: 0,
  startedAt: null,
  estimatedWorkingDays: null,
})

export function TaskTemplateModal({
  open,
  onOpenChange,
  selectedTemplate,
}: TaskTemplateModalProps) {
  const t = useTranslations()
  const locale = useLocale()
  const localeDate = locale === "ar" ? ar : enUS
  const queryClient = useQueryClient()
  const [subItemDatePickerIndex, setSubItemDatePickerIndex] = useState<
    number | null
  >(null)

  const schema = selectedTemplate?.id
    ? updateTaskTemplateSchema
    : createTaskTemplateSchema

  const form = useForm({
    mode: "controlled",
    initialValues: {
      title: "",
      description: "" as string | undefined,
      estimatedWorkingDays: undefined as number | undefined,
      priority: "MEDIUM" as "LOW" | "MEDIUM" | "HIGH",
      defaultStatusId: null as string | null,
      categoryIds: [] as string[],
      subItems: [emptySubItem()] as TaskTemplateSubItemInput[],
      isActive: true,
    },
    validate: zod4Resolver(schema),
  })

  const { data: statusRes } = useTaskStatuses()
  const { data: categoryRes } = useTaskCategories()

  const statuses = statusRes?.data?.data ?? []
  const categories = categoryRes?.data?.data ?? []

  useEffect(() => {
    if (selectedTemplate) {
      form.setValues({
        title: selectedTemplate.title,
        description: selectedTemplate.description ?? undefined,
        estimatedWorkingDays:
          selectedTemplate.estimatedWorkingDays ?? undefined,
        priority: selectedTemplate.priority as "LOW" | "MEDIUM" | "HIGH",
        defaultStatusId: selectedTemplate.defaultStatusId ?? null,
        categoryIds: selectedTemplate.categories?.map((c) => c.id) ?? [],
        subItems:
          (selectedTemplate.subItems?.length ?? 0) > 0
            ? (selectedTemplate.subItems ?? []).map((s) => ({
                title: s.title,
                description: s.description ?? "",
                order: s.order ?? 0,
                startedAt: s.startedAt ? new Date(s.startedAt) : null,
                estimatedWorkingDays: s.estimatedWorkingDays ?? null,
              }))
            : [emptySubItem()],
        isActive: selectedTemplate.isActive ?? true,
      })
    } else {
      form.setValues({
        title: "",
        description: undefined,
        estimatedWorkingDays: undefined,
        priority: "MEDIUM",
        defaultStatusId: null,
        categoryIds: [],
        subItems: [emptySubItem()],
        isActive: true,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTemplate?.id, open])

  const handleSubmit = async (values: typeof form.values) => {
    try {
      const payload = {
        title: values.title,
        description: values.description || undefined,
        estimatedWorkingDays:
          values.estimatedWorkingDays != null
            ? Number(values.estimatedWorkingDays)
            : undefined,
        priority: values.priority,
        defaultStatusId: values.defaultStatusId || null,
        categoryIds: values.categoryIds,
        subItems: values.subItems
          .filter((s) => s.title.trim() !== "")
          .map((s, i) => ({
            title: s.title.trim(),
            description: s.description?.trim() || undefined,
            order: i,
            startedAt: s.startedAt ?? null,
            estimatedWorkingDays:
              s.estimatedWorkingDays != null
                ? Number(s.estimatedWorkingDays)
                : null,
          })),
        isActive: values.isActive,
      }

      if (selectedTemplate) {
        await apiClient.put(
          `/api/tasks/templates/${selectedTemplate.id}`,
          payload
        )
        toast.success(t("taskTemplate.success.updated"))
      } else {
        await apiClient.post("/api/tasks/templates", payload)
        toast.success(t("taskTemplate.success.created"))
      }

      queryClient.invalidateQueries({ queryKey: ["tasks", "templates"] })
      form.reset()
      onOpenChange(false)
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const rootError = handleFormErrors(error, form)
        form.setFieldError(
          "root",
          rootError ?? t("errors.internal_server_error")
        )
        toast.error(rootError ?? t("errors.internal_server_error"))
        return
      }
      toast.error(t("errors.internal_server_error"))
      form.setFieldError(
        "root",
        (error as Error).message ?? t("errors.internal_server_error")
      )
    }
  }

  const addSubItem = () => {
    form.insertListItem("subItems", emptySubItem())
  }

  const removeSubItem = (index: number) => {
    const items = form.values.subItems
    if (items.length <= 1) return
    form.removeListItem("subItems", index)
  }

  const getCategoryName = (id: string) => {
    const c = categories.find((x) => x.id === id)
    return c ? (locale === "ar" ? c.nameAr : c.nameEn) : ""
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex max-h-svh w-full flex-col sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>
            {selectedTemplate
              ? t("taskTemplate.editTitle")
              : t("taskTemplate.createTitle")}
          </SheetTitle>
        </SheetHeader>

        <form
          onSubmit={form.onSubmit(handleSubmit)}
          className="flex flex-1 flex-col overflow-hidden"
        >
          <ScrollArea className="min-h-0 flex-1 overflow-hidden pe-4">
            <div className="space-y-4 py-4 ps-4">
              <FieldGroup>
                <Field data-invalid={!!form.errors.title}>
                  <FieldLabel htmlFor="title">
                    {t("taskTemplate.form.title")}
                  </FieldLabel>
                  <Input
                    id="title"
                    {...form.getInputProps("title")}
                    placeholder={t("taskTemplate.form.titlePlaceholder")}
                    aria-invalid={!!form.errors.title}
                  />
                  {form.errors.title && (
                    <FieldError
                      errors={[{ message: String(form.errors.title) }]}
                    />
                  )}
                </Field>

                <Field data-invalid={!!form.errors.description}>
                  <FieldLabel htmlFor="description">
                    {t("taskTemplate.form.description")}
                  </FieldLabel>
                  <Textarea
                    id="description"
                    {...form.getInputProps("description")}
                    placeholder={t("taskTemplate.form.descriptionPlaceholder")}
                    className="min-h-20"
                    aria-invalid={!!form.errors.description}
                  />
                  {form.errors.description && (
                    <FieldError
                      errors={[{ message: String(form.errors.description) }]}
                    />
                  )}
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field data-invalid={!!form.errors.estimatedWorkingDays}>
                    <FieldLabel htmlFor="estimatedWorkingDays">
                      {t("taskTemplate.form.estimatedWorkingDays")}
                    </FieldLabel>
                    <Input
                      id="estimatedWorkingDays"
                      type="number"
                      min={0}
                      {...form.getInputProps("estimatedWorkingDays")}
                      placeholder={t(
                        "taskTemplate.form.estimatedWorkingDaysPlaceholder"
                      )}
                      aria-invalid={!!form.errors.estimatedWorkingDays}
                    />
                    {form.errors.estimatedWorkingDays && (
                      <FieldError
                        errors={[
                          {
                            message: String(form.errors.estimatedWorkingDays),
                          },
                        ]}
                      />
                    )}
                  </Field>

                  <Field data-invalid={!!form.errors.priority}>
                    <FieldLabel>{t("taskTemplate.form.priority")}</FieldLabel>
                    <Select
                      value={form.values.priority}
                      onValueChange={(value) =>
                        form.setFieldValue(
                          "priority",
                          value as "LOW" | "MEDIUM" | "HIGH"
                        )
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PRIORITY_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {t(opt.labelKey)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.errors.priority && (
                      <FieldError
                        errors={[{ message: String(form.errors.priority) }]}
                      />
                    )}
                  </Field>
                </div>

                <Field data-invalid={!!form.errors.defaultStatusId}>
                  <FieldLabel>
                    {t("taskTemplate.form.defaultStatus")}
                  </FieldLabel>
                  <Select
                    value={form.values.defaultStatusId ?? ""}
                    onValueChange={(value) =>
                      form.setFieldValue(
                        "defaultStatusId",
                        value ? value : null
                      )
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue>
                        {(() => {
                          const id = form.values.defaultStatusId
                          const s = id
                            ? statuses.find((x) => x.id === id)
                            : null
                          return s
                            ? locale === "ar"
                              ? s.nameAr
                              : s.nameEn
                            : t("taskTemplate.form.defaultStatusPlaceholder")
                        })()}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">
                        {t("taskTemplate.form.defaultStatusPlaceholder")}
                      </SelectItem>
                      {statuses.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {locale === "ar" ? s.nameAr : s.nameEn}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.errors.defaultStatusId && (
                    <FieldError
                      errors={[
                        { message: String(form.errors.defaultStatusId) },
                      ]}
                    />
                  )}
                </Field>

                <Field data-invalid={!!form.errors.categoryIds}>
                  <FieldLabel>{t("taskTemplate.form.categories")}</FieldLabel>
                  <Select
                    multiple
                    value={form.values.categoryIds}
                    onValueChange={(value) =>
                      form.setFieldValue("categoryIds", value)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue>
                        {form.values.categoryIds.length > 0
                          ? form.values.categoryIds
                              .map(getCategoryName)
                              .filter(Boolean)
                              .join(", ")
                          : t("taskTemplate.form.categoriesPlaceholder")}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {categories.length === 0 ? (
                        <div className="text-muted-foreground px-2 py-1.5 text-sm">
                          {t("taskTemplate.form.categoriesPlaceholder")}
                        </div>
                      ) : (
                        categories.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {locale === "ar" ? c.nameAr : c.nameEn}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {form.errors.categoryIds && (
                    <FieldError
                      errors={[{ message: String(form.errors.categoryIds) }]}
                    />
                  )}
                </Field>

                <Field>
                  <div className="flex items-center justify-between">
                    <FieldLabel htmlFor="isActive">
                      {t("taskTemplate.form.isActive")}
                    </FieldLabel>
                    <Switch
                      id="isActive"
                      checked={form.values.isActive}
                      onCheckedChange={(checked) =>
                        form.setFieldValue("isActive", checked)
                      }
                    />
                  </div>
                </Field>
              </FieldGroup>

              <Separator />

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <FieldLabel>{t("taskTemplate.form.subItems")}</FieldLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addSubItem}
                  >
                    <Plus className="mr-1 size-4" />
                    {t("common.add")}
                  </Button>
                </div>
                <div className="space-y-3">
                  {form.values.subItems.map((_, index) => (
                    <div
                      key={index}
                      className="bg-muted/30 space-y-2 rounded-lg border p-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-muted-foreground text-xs font-medium">
                          #{index + 1}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => removeSubItem(index)}
                          disabled={form.values.subItems.length <= 1}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                      <Field
                        data-invalid={
                          !!(
                            Array.isArray(form.errors.subItems) &&
                            form.errors.subItems[index] &&
                            "title" in form.errors.subItems[index]
                          )
                        }
                      >
                        <FieldLabel className="text-xs">
                          {t("taskTemplate.form.subItemTitle")}
                        </FieldLabel>
                        <Input
                          {...form.getInputProps(`subItems.${index}.title`)}
                          placeholder={t(
                            "taskTemplate.form.subItemTitlePlaceholder"
                          )}
                        />
                        {Array.isArray(form.errors.subItems) &&
                          form.errors.subItems[index] &&
                          "title" in form.errors.subItems[index] && (
                            <FieldError
                              errors={[
                                {
                                  message: String(
                                    (
                                      form.errors.subItems[index] as {
                                        title?: string
                                      }
                                    ).title
                                  ),
                                },
                              ]}
                            />
                          )}
                      </Field>
                      <Field>
                        <FieldLabel className="text-xs">
                          {t("taskTemplate.form.subItemDescription")}
                        </FieldLabel>
                        <Input
                          {...form.getInputProps(
                            `subItems.${index}.description`
                          )}
                          placeholder={t(
                            "taskTemplate.form.descriptionPlaceholder"
                          )}
                        />
                      </Field>

                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        <Field>
                          <FieldLabel className="text-xs">
                            {t("tasks.form.startedAt")}
                          </FieldLabel>
                          <Popover
                            open={subItemDatePickerIndex === index}
                            onOpenChange={(open) =>
                              setSubItemDatePickerIndex(open ? index : null)
                            }
                          >
                            <PopoverTrigger
                              render={(props) => (
                                <Button
                                  variant="outline"
                                  type="button"
                                  className="h-9 w-full justify-start bg-white text-start font-normal"
                                  {...props}
                                >
                                  <CalendarIcon className="me-2 h-3.5 w-3.5" />
                                  {form.values.subItems[index]?.startedAt ? (
                                    format(
                                      form.values.subItems[index]!
                                        .startedAt as Date,
                                      "PPP",
                                      { locale: localeDate }
                                    )
                                  ) : (
                                    <span className="text-muted-foreground">
                                      {t("tasks.form.startedAtPlaceholder")}
                                    </span>
                                  )}
                                  {form.values.subItems[index]?.startedAt && (
                                    <span
                                      role="button"
                                      tabIndex={0}
                                      aria-label={t("tasks.form.clear")}
                                      className="hover:bg-muted ms-auto inline-flex size-5 items-center justify-center rounded"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        form.setFieldValue(
                                          `subItems.${index}.startedAt`,
                                          null
                                        )
                                      }}
                                      onKeyDown={(e) => {
                                        if (
                                          e.key === "Enter" ||
                                          e.key === " "
                                        ) {
                                          e.preventDefault()
                                          e.stopPropagation()
                                          form.setFieldValue(
                                            `subItems.${index}.startedAt`,
                                            null
                                          )
                                        }
                                      }}
                                    >
                                      <X className="size-3.5" />
                                    </span>
                                  )}
                                </Button>
                              )}
                            />
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={
                                  (form.values.subItems[index]?.startedAt as
                                    | Date
                                    | null) ?? undefined
                                }
                                onSelect={(date) => {
                                  form.setFieldValue(
                                    `subItems.${index}.startedAt`,
                                    date || null
                                  )
                                  setSubItemDatePickerIndex(null)
                                }}
                                locale={localeDate}
                              />
                            </PopoverContent>
                          </Popover>
                        </Field>
                        <Field>
                          <FieldLabel className="text-xs">
                            {t("tasks.form.estimatedWorkingDays")}
                          </FieldLabel>
                          <Input
                            type="number"
                            min={0}
                            {...form.getInputProps(
                              `subItems.${index}.estimatedWorkingDays`
                            )}
                            placeholder={t(
                              "tasks.form.estimatedWorkingDaysPlaceholder"
                            )}
                          />
                        </Field>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {form.errors.root && (
                <div className="text-destructive text-sm font-medium">
                  {form.errors.root}
                </div>
              )}
            </div>
          </ScrollArea>

          <SheetFooter className="mt-4 flex-row border-t pt-4">
            <Button
              className="grow"
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button className="grow" type="submit" disabled={form.submitting}>
              {form.submitting && <Spinner className="mr-2 size-4" />}
              {selectedTemplate
                ? t("taskTemplate.update")
                : t("taskTemplate.create")}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
