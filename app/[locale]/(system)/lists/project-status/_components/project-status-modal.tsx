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
  createProjectStatusSchema,
  updateProjectStatusSchema,
} from "@/lib/schemas/project-status"
import type { ProjectStatus } from "@/prisma/project-statuses"
import apiClient from "@/services"
import { useForm } from "@mantine/form"
import { useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { zod4Resolver } from "mantine-form-zod-resolver"
import { useTranslations } from "next-intl"
import { useEffect } from "react"
import { toast } from "sonner"

type ProjectStatusModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedProjectStatus: ProjectStatus | null
}

export function ProjectStatusModal({
  open,
  onOpenChange,
  selectedProjectStatus,
}: ProjectStatusModalProps) {
  const t = useTranslations()
  const queryClient = useQueryClient()

  const schema = selectedProjectStatus?.id
    ? updateProjectStatusSchema
    : createProjectStatusSchema

  const form = useForm({
    mode: "controlled",
    initialValues: {
      nameAr: selectedProjectStatus?.nameAr || "",
      nameEn: selectedProjectStatus?.nameEn || "",
      color: selectedProjectStatus?.color || "#000000",
    },
    validate: zod4Resolver(schema),
  })

  useEffect(() => {
    if (selectedProjectStatus) {
      form.setValues({
        nameAr: selectedProjectStatus.nameAr || "",
        nameEn: selectedProjectStatus.nameEn || "",
        color: selectedProjectStatus.color || "#000000",
      })
    } else {
      form.setValues({
        nameAr: "",
        nameEn: "",
        color: "#000000",
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProjectStatus?.id])

  const handleSubmit = async (values: typeof form.values) => {
    try {
      if (selectedProjectStatus) {
        await apiClient.put(
          `/api/project-status/${selectedProjectStatus.id}`,
          values
        )
      } else {
        await apiClient.post("/api/project-status", values)
      }

      queryClient.invalidateQueries({ queryKey: ["project-status"] })
      queryClient.invalidateQueries({ queryKey: ["project-statuses"] })
      form.reset()
      onOpenChange(false)

      if (selectedProjectStatus) {
        toast.success(t("projectStatus.success.updated"))
      } else {
        toast.success(t("projectStatus.success.created"))
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
            {selectedProjectStatus
              ? t("projectStatus.editTitle")
              : t("projectStatus.createTitle")}
          </SheetTitle>
          {selectedProjectStatus?.isSystem && (
            <p className="text-muted-foreground text-sm">
              {t("projectStatus.systemStatusNote")}
            </p>
          )}
        </SheetHeader>

        <form
          onSubmit={form.onSubmit(handleSubmit)}
          className="flex h-full flex-col"
        >
          <div className="flex-1 overflow-y-auto p-4">
            <FieldGroup>
              <Field data-invalid={!!form.errors.nameAr}>
                <FieldLabel htmlFor="nameAr">
                  {t("projectStatus.form.nameAr")}
                </FieldLabel>
                <Input
                  id="nameAr"
                  {...form.getInputProps("nameAr")}
                  placeholder={t("projectStatus.form.nameArPlaceholder")}
                  aria-invalid={!!form.errors.nameAr}
                />
                {form.errors.nameAr && (
                  <FieldError
                    errors={[{ message: String(form.errors.nameAr) }]}
                  />
                )}
              </Field>

              <Field data-invalid={!!form.errors.nameEn}>
                <FieldLabel htmlFor="nameEn">
                  {t("projectStatus.form.nameEn")}
                </FieldLabel>
                <Input
                  id="nameEn"
                  {...form.getInputProps("nameEn")}
                  placeholder={t("projectStatus.form.nameEnPlaceholder")}
                  aria-invalid={!!form.errors.nameEn}
                />
                {form.errors.nameEn && (
                  <FieldError
                    errors={[{ message: String(form.errors.nameEn) }]}
                  />
                )}
              </Field>

              <Field data-invalid={!!form.errors.color}>
                <FieldLabel htmlFor="color">
                  {t("projectStatus.form.color")}
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
                    placeholder={t("projectStatus.form.colorPlaceholder")}
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

            {form.errors.root && (
              <div className="text-destructive mt-4 text-sm font-medium">
                {form.errors.root}
              </div>
            )}
          </div>

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
              {selectedProjectStatus
                ? t("projectStatus.update")
                : t("projectStatus.create")}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
