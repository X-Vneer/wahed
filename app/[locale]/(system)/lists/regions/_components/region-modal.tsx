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
import { createRegionSchema, updateRegionSchema } from "@/lib/schemas/regions"
import type { Region } from "@/prisma/regions"
import { useForm } from "@mantine/form"
import { useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { zod4Resolver } from "mantine-form-zod-resolver"
import { useTranslations } from "next-intl"
import { useEffect } from "react"
import { toast } from "sonner"

type RegionModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedRegion: Region | null
}

export function RegionModal({
  open,
  onOpenChange,
  selectedRegion,
}: RegionModalProps) {
  const t = useTranslations()
  const queryClient = useQueryClient()

  const schema = selectedRegion?.id ? updateRegionSchema : createRegionSchema

  const form = useForm({
    mode: "controlled",
    initialValues: {
      nameAr: selectedRegion?.nameAr || "",
      nameEn: selectedRegion?.nameEn || "",
    },
    validate: zod4Resolver(schema),
  })

  useEffect(() => {
    if (selectedRegion) {
      form.setValues({
        nameAr: selectedRegion.nameAr || "",
        nameEn: selectedRegion.nameEn || "",
      })
    } else {
      form.setValues({
        nameAr: "",
        nameEn: "",
      })
    }
  }, [selectedRegion?.id])

  const handleSubmit = async (values: typeof form.values) => {
    try {
      if (selectedRegion) {
        await axios.put(`/api/regions/${selectedRegion.id}`, values, {
          withCredentials: true,
        })
      } else {
        await axios.post("/api/regions", values, {
          withCredentials: true,
        })
      }

      await queryClient.invalidateQueries({ queryKey: ["regions"] })
      form.reset()
      onOpenChange(false)

      if (selectedRegion) {
        toast.success(t("regions.success.updated"))
      } else {
        toast.success(t("regions.success.created"))
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
            {selectedRegion ? t("regions.editTitle") : t("regions.createTitle")}
          </SheetTitle>
        </SheetHeader>

        <form
          onSubmit={form.onSubmit(handleSubmit)}
          className="flex h-full flex-col"
        >
          <div className="flex-1 overflow-y-auto p-4">
            <FieldGroup>
              <Field data-invalid={!!form.errors.nameAr}>
                <FieldLabel htmlFor="nameAr">
                  {t("regions.form.nameAr")}
                </FieldLabel>
                <Input
                  id="nameAr"
                  {...form.getInputProps("nameAr")}
                  placeholder={t("regions.form.nameArPlaceholder")}
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
                  {t("regions.form.nameEn")}
                </FieldLabel>
                <Input
                  id="nameEn"
                  {...form.getInputProps("nameEn")}
                  placeholder={t("regions.form.nameEnPlaceholder")}
                  aria-invalid={!!form.errors.nameEn}
                />
                {form.errors.nameEn && (
                  <FieldError
                    errors={[{ message: String(form.errors.nameEn) }]}
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
              {selectedRegion ? t("regions.update") : t("regions.create")}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
