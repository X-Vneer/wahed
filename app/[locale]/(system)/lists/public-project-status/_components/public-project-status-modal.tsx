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
  createPublicProjectStatusSchema,
  updatePublicProjectStatusSchema,
} from "@/lib/schemas/public-project-status"
import type { PublicProjectStatus } from "@/prisma/public-project-statuses"
import apiClient from "@/services"
import { useForm } from "@mantine/form"
import { useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { zod4Resolver } from "mantine-form-zod-resolver"
import { useTranslations } from "next-intl"
import { useEffect } from "react"
import { toast } from "sonner"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedRow: PublicProjectStatus | null
}

export function PublicProjectStatusModal({
  open,
  onOpenChange,
  selectedRow,
}: Props) {
  const t = useTranslations()
  const queryClient = useQueryClient()

  const schema = selectedRow?.id
    ? updatePublicProjectStatusSchema
    : createPublicProjectStatusSchema

  const form = useForm({
    mode: "controlled",
    initialValues: {
      nameAr: selectedRow?.nameAr || "",
      nameEn: selectedRow?.nameEn || "",
      color: selectedRow?.color || "#000000",
    },
    validate: zod4Resolver(schema),
  })

  useEffect(() => {
    if (selectedRow) {
      form.setValues({
        nameAr: selectedRow.nameAr || "",
        nameEn: selectedRow.nameEn || "",
        color: selectedRow.color || "#000000",
      })
    } else {
      form.setValues({
        nameAr: "",
        nameEn: "",
        color: "#000000",
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRow?.id])

  const handleSubmit = async (values: typeof form.values) => {
    try {
      if (selectedRow) {
        await apiClient.put(
          `/api/public-project-status/${selectedRow.id}`,
          values
        )
      } else {
        await apiClient.post("/api/public-project-status", values)
      }

      queryClient.invalidateQueries({ queryKey: ["public-project-status"] })
      queryClient.invalidateQueries({
        queryKey: ["lists", "public-project-statuses"],
      })
      form.reset()
      onOpenChange(false)

      if (selectedRow) {
        toast.success(t("publicProjectStatus.success.updated"))
      } else {
        toast.success(t("publicProjectStatus.success.created"))
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
            {selectedRow
              ? t("publicProjectStatus.editTitle")
              : t("publicProjectStatus.createTitle")}
          </SheetTitle>
          {selectedRow?.isSystem && (
            <p className="text-muted-foreground text-sm">
              {t("publicProjectStatus.systemStatusNote")}
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
                  {t("publicProjectStatus.form.nameAr")}
                </FieldLabel>
                <Input
                  id="nameAr"
                  {...form.getInputProps("nameAr")}
                  placeholder={t("publicProjectStatus.form.nameArPlaceholder")}
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
                  {t("publicProjectStatus.form.nameEn")}
                </FieldLabel>
                <Input
                  id="nameEn"
                  {...form.getInputProps("nameEn")}
                  placeholder={t("publicProjectStatus.form.nameEnPlaceholder")}
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
                  {t("publicProjectStatus.form.color")}
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
                    placeholder={t("publicProjectStatus.form.colorPlaceholder")}
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
              {selectedRow
                ? t("publicProjectStatus.update")
                : t("publicProjectStatus.create")}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
