"use client"

import { Button } from "@/components/ui/button"
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
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { SubTasks } from "@/lib/generated/prisma/client"
import { handleFormErrors } from "@/lib/handle-form-errors"
import { createSubTaskSchema } from "@/lib/schemas/task"
import apiClient from "@/services"
import { useForm } from "@mantine/form"
import { useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { zod4Resolver } from "mantine-form-zod-resolver"
import { useTranslations } from "next-intl"
import { useEffect } from "react"
import { toast } from "sonner"

type SubtaskFormValues = { title: string; description: string }

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
  const queryClient = useQueryClient()
  const form = useForm<SubtaskFormValues>({
    mode: "controlled",
    initialValues: { title: "", description: "" },
    validate: zod4Resolver(createSubTaskSchema),
  })

  const isEdit = editingSubtask != null

  useEffect(() => {
    if (!open) return
    if (editingSubtask) {
      form.setValues({
        title: editingSubtask.title,
        description: editingSubtask.description ?? "",
      })
    } else {
      form.setValues({ title: "", description: "" })
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
    try {
      if (isEdit && editingSubtask) {
        await apiClient.patch(
          `/api/tasks/${taskId}/subtasks/${editingSubtask.id}`,
          { title, description }
        )
        toast.success(t("tasks.success.updated"))
      } else {
        await apiClient.post(`/api/tasks/${taskId}/subtasks`, {
          title,
          description: description ?? undefined,
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
