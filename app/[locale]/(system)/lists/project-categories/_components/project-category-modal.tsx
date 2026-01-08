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
  createProjectCategorySchema,
  updateProjectCategorySchema,
} from "@/lib/schemas/project-categories"
import type { ProjectCategory } from "@/prisma/project-categories"
import apiClient from "@/services"
import { useForm } from "@mantine/form"
import { useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { zod4Resolver } from "mantine-form-zod-resolver"
import { useTranslations } from "next-intl"
import { useEffect } from "react"
import { toast } from "sonner"

type ProjectCategoryModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedCategory: ProjectCategory | null
}

export function ProjectCategoryModal({
  open,
  onOpenChange,
  selectedCategory,
}: ProjectCategoryModalProps) {
  const t = useTranslations()
  const queryClient = useQueryClient()

  const schema = selectedCategory?.id
    ? updateProjectCategorySchema
    : createProjectCategorySchema

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
    }
  }, [selectedCategory?.id])

  const handleSubmit = async (values: typeof form.values) => {
    try {
      if (selectedCategory) {
        // Update existing project category
        await apiClient.put(
          `/api/project-categories/${selectedCategory.id}`,
          values
        )
      } else {
        // Create new project category
        await apiClient.post("/api/project-categories", values)
      }

      // Success - refresh project categories list and reset form
      queryClient.invalidateQueries({ queryKey: ["project-categories"] })
      form.reset()
      onOpenChange(false)

      // Show success toast
      if (selectedCategory) {
        toast.success(t("projectCategories.success.updated"))
      } else {
        toast.success(t("projectCategories.success.created"))
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
              ? t("projectCategories.editTitle")
              : t("projectCategories.createTitle")}
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
                  {t("projectCategories.form.nameAr")}
                </FieldLabel>
                <Input
                  id="nameAr"
                  {...form.getInputProps("nameAr")}
                  placeholder={t("projectCategories.form.nameArPlaceholder")}
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
                  {t("projectCategories.form.nameEn")}
                </FieldLabel>
                <Input
                  id="nameEn"
                  {...form.getInputProps("nameEn")}
                  placeholder={t("projectCategories.form.nameEnPlaceholder")}
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
                    {t("projectCategories.form.isActive")}
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
                ? t("projectCategories.update")
                : t("projectCategories.create")}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
