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
import { Switch } from "@/components/ui/switch"
import { handleFormErrors } from "@/lib/handle-form-errors"
import {
  createTaskCategorySchema,
  updateTaskCategorySchema,
} from "@/lib/schemas/task-category"
import type { TaskCategory } from "@/prisma/task-categories"
import apiClient from "@/services"
import { useForm } from "@mantine/form"
import { useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { zod4Resolver } from "mantine-form-zod-resolver"
import { useTranslations } from "next-intl"
import { useEffect } from "react"
import { toast } from "sonner"

type TaskCategoryModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedCategory: TaskCategory | null
}

export function TaskCategoryModal({
  open,
  onOpenChange,
  selectedCategory,
}: TaskCategoryModalProps) {
  const t = useTranslations()
  const queryClient = useQueryClient()

  const schema = selectedCategory?.id
    ? updateTaskCategorySchema
    : createTaskCategorySchema

  const form = useForm({
    mode: "controlled",
    initialValues: {
      nameAr: selectedCategory?.nameAr || "",
      nameEn: selectedCategory?.nameEn || "",
      isActive: selectedCategory?.isActive ?? true,
    },
    validate: zod4Resolver(schema),
  })

  useEffect(() => {
    if (selectedCategory) {
      form.setValues({
        nameAr: selectedCategory.nameAr || "",
        nameEn: selectedCategory.nameEn || "",
        isActive: selectedCategory.isActive ?? false,
      })
    } else {
      form.setValues({
        nameAr: "",
        nameEn: "",
        isActive: true,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory?.id])

  const handleSubmit = async (values: typeof form.values) => {
    try {
      if (selectedCategory) {
        // Update existing task category
        await apiClient.put(`/api/task-category/${selectedCategory.id}`, values)
      } else {
        // Create new task category
        await apiClient.post("/api/task-category", values)
      }

      // Success - refresh task categories list and reset form
      queryClient.invalidateQueries({ queryKey: ["task-category"] })
      form.reset()
      onOpenChange(false)

      // Show success toast
      if (selectedCategory) {
        toast.success(t("taskCategory.success.updated"))
      } else {
        toast.success(t("taskCategory.success.created"))
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
            {selectedCategory
              ? t("taskCategory.editTitle")
              : t("taskCategory.createTitle")}
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
                  {t("taskCategory.form.nameAr")}
                </FieldLabel>
                <Input
                  id="nameAr"
                  {...form.getInputProps("nameAr")}
                  placeholder={t("taskCategory.form.nameArPlaceholder")}
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
                  {t("taskCategory.form.nameEn")}
                </FieldLabel>
                <Input
                  id="nameEn"
                  {...form.getInputProps("nameEn")}
                  placeholder={t("taskCategory.form.nameEnPlaceholder")}
                  aria-invalid={!!form.errors.nameEn}
                />
                {form.errors.nameEn && (
                  <FieldError
                    errors={[{ message: String(form.errors.nameEn) }]}
                  />
                )}
              </Field>

              {/* Active State */}
              <Field>
                <div className="flex items-center justify-between">
                  <FieldLabel htmlFor="isActive">
                    {t("taskCategory.form.isActive")}
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
              {selectedCategory
                ? t("taskCategory.update")
                : t("taskCategory.create")}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
