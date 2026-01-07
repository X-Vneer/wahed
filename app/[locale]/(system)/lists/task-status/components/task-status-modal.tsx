"use client"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Spinner } from "@/components/ui/spinner"
import { handleFormErrors } from "@/lib/handle-form-errors"
import {
  createTaskStatusSchema,
  updateTaskStatusSchema,
} from "@/lib/schemas/task-status"
import type { TaskStatus } from "@/prisma/task-statuses"
import { useForm } from "@mantine/form"
import { useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { zod4Resolver } from "mantine-form-zod-resolver"
import { useTranslations } from "next-intl"
import { useEffect } from "react"
import { toast } from "sonner"

type TaskStatusModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedTaskStatus: TaskStatus | null
}

export function TaskStatusModal({
  open,
  onOpenChange,
  selectedTaskStatus,
}: TaskStatusModalProps) {
  const t = useTranslations()
  const queryClient = useQueryClient()

  const schema = selectedTaskStatus?.id
    ? updateTaskStatusSchema
    : createTaskStatusSchema

  const form = useForm({
    mode: "controlled",
    initialValues: {
      nameAr: selectedTaskStatus?.nameAr || "",
      nameEn: selectedTaskStatus?.nameEn || "",
      color: selectedTaskStatus?.color || "#000000",
    },
    validate: zod4Resolver(schema),
  })

  useEffect(() => {
    if (selectedTaskStatus) {
      form.setValues({
        nameAr: selectedTaskStatus.nameAr || "",
        nameEn: selectedTaskStatus.nameEn || "",
        color: selectedTaskStatus.color || "#000000",
      })
    } else {
      form.setValues({
        nameAr: "",
        nameEn: "",
        color: "#000000",
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTaskStatus?.id])

  const handleSubmit = async (values: typeof form.values) => {
    try {
      if (selectedTaskStatus) {
        // Update existing task status
        await axios.put(`/api/task-status/${selectedTaskStatus.id}`, values, {
          withCredentials: true,
        })
      } else {
        // Create new task status
        await axios.post("/api/task-status", values, {
          withCredentials: true,
        })
      }

      // Success - refresh task statuses list and reset form
      queryClient.invalidateQueries({ queryKey: ["task-status"] })
      form.reset()
      onOpenChange(false)

      // Show success toast
      if (selectedTaskStatus) {
        toast.success(t("taskStatus.success.updated"))
      } else {
        toast.success(t("taskStatus.success.created"))
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const rootError = handleFormErrors(error, form)
        form.setFieldError(
          "root",
          rootError || t("errors.internal_server_error")
        )
        toast.error(rootError || t("errors.internal_server_error"))
        return
      }
      toast.error(t("errors.internal_server_error"))
      form.setFieldError(
        "root",
        (error as Error).message || t("errors.internal_server_error")
      )
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>
            {selectedTaskStatus
              ? t("taskStatus.editTitle")
              : t("taskStatus.createTitle")}
          </SheetTitle>
        </SheetHeader>

        <form
          onSubmit={form.onSubmit(handleSubmit)}
          className="flex h-full flex-col"
        >
          <div className="flex-1 overflow-y-auto p-4">
            <FieldGroup>
              {/* Name in Arabic */}
              <Field data-invalid={!!form.errors.nameAr}>
                <FieldLabel htmlFor="nameAr">
                  {t("taskStatus.form.nameAr")}
                </FieldLabel>
                <Input
                  id="nameAr"
                  {...form.getInputProps("nameAr")}
                  placeholder={t("taskStatus.form.nameArPlaceholder")}
                  aria-invalid={!!form.errors.nameAr}
                />
                {form.errors.nameAr && (
                  <FieldError
                    errors={[{ message: String(form.errors.nameAr) }]}
                  />
                )}
              </Field>

              {/* Name in English */}
              <Field data-invalid={!!form.errors.nameEn}>
                <FieldLabel htmlFor="nameEn">
                  {t("taskStatus.form.nameEn")}
                </FieldLabel>
                <Input
                  id="nameEn"
                  {...form.getInputProps("nameEn")}
                  placeholder={t("taskStatus.form.nameEnPlaceholder")}
                  aria-invalid={!!form.errors.nameEn}
                />
                {form.errors.nameEn && (
                  <FieldError
                    errors={[{ message: String(form.errors.nameEn) }]}
                  />
                )}
              </Field>

              {/* Color */}
              <Field data-invalid={!!form.errors.color}>
                <FieldLabel htmlFor="color">
                  {t("taskStatus.form.color")}
                </FieldLabel>
                <div className="flex items-center gap-2">
                  <Input
                    id="color"
                    type="color"
                    {...form.getInputProps("color")}
                    className="h-12 w-20 cursor-pointer"
                    aria-invalid={!!form.errors.color}
                  />
                  <Input
                    type="text"
                    value={form.values.color}
                    onChange={(e) =>
                      form.setFieldValue("color", e.target.value)
                    }
                    placeholder={t("taskStatus.form.colorPlaceholder")}
                    className="flex-1"
                    aria-invalid={!!form.errors.color}
                  />
                </div>
                {form.errors.color && (
                  <FieldError
                    errors={[{ message: String(form.errors.color) }]}
                  />
                )}
              </Field>
            </FieldGroup>

            {/* Server Error Message */}
            {form.errors.root && (
              <div className="text-destructive mt-4 text-sm font-medium">
                {form.errors.root}
              </div>
            )}
          </div>

          {/* Footer with Submit Button */}
          <SheetFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={form.submitting}>
              {form.submitting && <Spinner className="mr-2 size-4" />}
              {selectedTaskStatus
                ? t("taskStatus.update")
                : t("taskStatus.create")}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
