"use client"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { SubTasks } from "@/lib/generated/prisma/client"
import { handleFormErrors } from "@/lib/handle-form-errors"
import { createSubTaskSchema } from "@/lib/schemas/task"
import apiClient from "@/services"
import { useForm } from "@mantine/form"
import { useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { format } from "date-fns"
import { ar, enUS } from "date-fns/locale"
import { Calendar as CalendarIcon, X } from "lucide-react"
import { zod4Resolver } from "mantine-form-zod-resolver"
import { useLocale, useTranslations } from "next-intl"
import { useEffect, useState } from "react"
import { toast } from "sonner"

type SubtaskFormValues = {
  title: string
  description: string
  startedAt: Date | null
  estimatedWorkingDays: number | undefined
}

type SubtaskDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  taskId: string
  editingSubtask: SubTasks | null
}

export function SubtaskDialog({
  open,
  onOpenChange,
  taskId,
  editingSubtask,
}: SubtaskDialogProps) {
  const t = useTranslations()
  const locale = useLocale()
  const localeDate = locale === "ar" ? ar : enUS
  const queryClient = useQueryClient()
  const [datePickerOpen, setDatePickerOpen] = useState(false)
  const form = useForm<SubtaskFormValues>({
    mode: "controlled",
    initialValues: {
      title: "",
      description: "",
      startedAt: null,
      estimatedWorkingDays: undefined,
    },
    validate: zod4Resolver(createSubTaskSchema),
  })

  const isEdit = editingSubtask != null

  useEffect(() => {
    if (!open) return
    if (editingSubtask) {
      form.setValues({
        title: editingSubtask.title,
        description: editingSubtask.description ?? "",
        startedAt: editingSubtask.startedAt
          ? new Date(editingSubtask.startedAt)
          : null,
        estimatedWorkingDays: editingSubtask.estimatedWorkingDays ?? undefined,
      })
    } else {
      form.setValues({
        title: "",
        description: "",
        startedAt: null,
        estimatedWorkingDays: undefined,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editingSubtask?.id])

  const closeDialog = () => {
    onOpenChange(false)
    form.reset()
  }

  const handleSave = async (values: SubtaskFormValues) => {
    const title = values.title.trim()
    const description = values.description?.trim() || null
    const startedAt = values.startedAt ?? null
    const estimatedWorkingDays =
      values.estimatedWorkingDays != null
        ? Number(values.estimatedWorkingDays)
        : null
    try {
      if (isEdit && editingSubtask) {
        await apiClient.patch(
          `/api/tasks/${taskId}/subtasks/${editingSubtask.id}`,
          { title, description, startedAt, estimatedWorkingDays }
        )
        toast.success(t("tasks.success.updated"))
      } else {
        await apiClient.post(`/api/tasks/${taskId}/subtasks`, {
          title,
          description: description ?? undefined,
          startedAt,
          estimatedWorkingDays,
        })
        toast.success(t("tasks.success.updated"))
      }
      queryClient.invalidateQueries({ queryKey: ["task", taskId] })
      closeDialog()
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

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        onOpenChange(open)
        if (!open) form.reset()
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit
              ? t("taskPage.editSubTaskDialogTitle")
              : t("taskPage.addSubTaskDialogTitle")}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={form.onSubmit(handleSave)} className="grid gap-4 py-2">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="subtask-title">
                {t("taskPage.subTaskTitlePlaceholder")}
              </FieldLabel>
              <Input
                id="subtask-title"
                placeholder={t("taskPage.subTaskTitlePlaceholder")}
                {...form.getInputProps("title")}
              />
              {form.errors.title && (
                <FieldError
                  errors={[{ message: t(String(form.errors.title)) }]}
                />
              )}
            </Field>
            <Field>
              <FieldLabel htmlFor="subtask-description">
                {t("taskPage.subTaskDescriptionLabel")}
              </FieldLabel>
              <Textarea
                id="subtask-description"
                placeholder={t("taskPage.subTaskDescriptionPlaceholder")}
                rows={3}
                className="resize-none"
                {...form.getInputProps("description")}
              />
              {form.errors.description && (
                <FieldError
                  errors={[{ message: t(String(form.errors.description)) }]}
                />
              )}
            </Field>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="subtask-startedAt">
                  {t("tasks.form.startedAt")}
                </FieldLabel>
                <Popover
                  open={datePickerOpen}
                  onOpenChange={setDatePickerOpen}
                >
                  <PopoverTrigger
                    render={(props) => (
                      <Button
                        variant="outline"
                        type="button"
                        id="subtask-startedAt"
                        className="w-full justify-start bg-white text-start font-normal"
                        {...props}
                      >
                        <CalendarIcon className="me-2 h-4 w-4" />
                        {form.values.startedAt ? (
                          format(form.values.startedAt, "PPP", {
                            locale: localeDate,
                          })
                        ) : (
                          <span className="text-muted-foreground">
                            {t("tasks.form.startedAtPlaceholder")}
                          </span>
                        )}
                        {form.values.startedAt && (
                          <span
                            role="button"
                            tabIndex={0}
                            aria-label={t("tasks.form.clear")}
                            className="hover:bg-muted ms-auto inline-flex size-5 items-center justify-center rounded"
                            onClick={(e) => {
                              e.stopPropagation()
                              form.setFieldValue("startedAt", null)
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault()
                                e.stopPropagation()
                                form.setFieldValue("startedAt", null)
                              }
                            }}
                          >
                            <X className="size-3.5" />
                          </span>
                        )}
                      </Button>
                    )}
                  />
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={form.values.startedAt || undefined}
                      onSelect={(date) => {
                        form.setFieldValue("startedAt", date || null)
                        setDatePickerOpen(false)
                      }}
                      locale={localeDate}
                    />
                  </PopoverContent>
                </Popover>
              </Field>
              <Field>
                <FieldLabel htmlFor="subtask-estimatedWorkingDays">
                  {t("tasks.form.estimatedWorkingDays")}
                </FieldLabel>
                <Input
                  id="subtask-estimatedWorkingDays"
                  type="number"
                  min={0}
                  {...form.getInputProps("estimatedWorkingDays")}
                  placeholder={t("tasks.form.estimatedWorkingDaysPlaceholder")}
                />
              </Field>
            </div>
          </FieldGroup>
          <DialogFooter className="gap-2 sm:gap-0">
            <div className="flex min-w-28 flex-1 justify-end gap-2">
              <Button type="button" variant="outline" onClick={closeDialog}>
                {t("common.cancel")}
              </Button>
              <Button
                type="submit"
                disabled={form.submitting}
                className="bg-primary hover:bg-primary/90 min-w-28"
              >
                {form.submitting && <Spinner className="mr-2 size-4" />}
                {isEdit ? t("common.update") : t("common.save")}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
