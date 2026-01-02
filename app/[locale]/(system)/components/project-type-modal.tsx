"use client"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { Switch } from "@/components/ui/switch"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet"
import { handleFormErrors } from "@/lib/handle-form-errors"
import {
  createProjectTypeSchema,
  updateProjectTypeSchema,
} from "@/lib/schemas/project-categories"
import { useForm } from "@mantine/form"
import { useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { zod4Resolver } from "mantine-form-zod-resolver"
import { useTranslations } from "next-intl"
import { useEffect, useMemo } from "react"
import { toast } from "sonner"

type ProjectType = {
  id: string
  nameAr: string
  nameEn: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

type ProjectTypeModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedProjectType: ProjectType | null
}

export function ProjectTypeModal({
  open,
  onOpenChange,
  selectedProjectType,
}: ProjectTypeModalProps) {
  const t = useTranslations()
  const queryClient = useQueryClient()

  const schema = useMemo(
    () =>
      selectedProjectType?.id
        ? updateProjectTypeSchema
        : createProjectTypeSchema,
    [selectedProjectType?.id]
  )

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      nameAr: "",
      nameEn: "",
      isActive: true,
    },
    validate: zod4Resolver(schema),
  })

  // Update form when project type is selected
  useEffect(() => {
    if (selectedProjectType) {
      form.setValues({
        nameAr: selectedProjectType.nameAr,
        nameEn: selectedProjectType.nameEn,
        isActive: selectedProjectType.isActive,
      })
    } else {
      form.reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProjectType?.id])

  const handleSubmit = async (values: typeof form.values) => {
    try {
      if (selectedProjectType) {
        // Update existing project type
        await axios.put(
          `/api/project-types/${selectedProjectType.id}`,
          values,
          {
            withCredentials: true,
          }
        )
      } else {
        // Create new project type
        await axios.post("/api/project-types", values, {
          withCredentials: true,
        })
      }

      // Success - refresh project types list and reset form
      queryClient.invalidateQueries({ queryKey: ["project-types"] })
      form.reset()
      onOpenChange(false)

      // Show success toast
      if (selectedProjectType) {
        toast.success(t("projectTypes.success.updated"))
      } else {
        toast.success(t("projectTypes.success.created"))
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
            {selectedProjectType
              ? t("projectTypes.editTitle")
              : t("projectTypes.createTitle")}
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
                  {t("projectTypes.form.nameAr")}
                </FieldLabel>
                <Input
                  id="nameAr"
                  {...form.getInputProps("nameAr")}
                  placeholder={t("projectTypes.form.nameArPlaceholder")}
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
                  {t("projectTypes.form.nameEn")}
                </FieldLabel>
                <Input
                  id="nameEn"
                  {...form.getInputProps("nameEn")}
                  placeholder={t("projectTypes.form.nameEnPlaceholder")}
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
                    {t("projectTypes.form.isActive")}
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

              {/* Display dates if editing */}
              {selectedProjectType && (
                <>
                  <Field>
                    <FieldLabel>{t("projectTypes.form.createdAt")}</FieldLabel>
                    <Input
                      value={new Date(
                        selectedProjectType.createdAt
                      ).toLocaleString()}
                      disabled
                      className="bg-muted"
                    />
                  </Field>
                  <Field>
                    <FieldLabel>{t("projectTypes.form.updatedAt")}</FieldLabel>
                    <Input
                      value={new Date(
                        selectedProjectType.updatedAt
                      ).toLocaleString()}
                      disabled
                      className="bg-muted"
                    />
                  </Field>
                </>
              )}
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
              {selectedProjectType
                ? t("projectTypes.update")
                : t("projectTypes.create")}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
