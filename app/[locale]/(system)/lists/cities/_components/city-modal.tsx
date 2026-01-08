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
import { handleFormErrors } from "@/lib/handle-form-errors"
import { createCitySchema, updateCitySchema } from "@/lib/schemas/cities"
import type { City } from "@/prisma/cities"
import type { Region } from "@/prisma/regions"
import { useRegions } from "@/hooks/use-regions"
import { useForm } from "@mantine/form"
import { useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { zod4Resolver } from "mantine-form-zod-resolver"
import { useTranslations } from "next-intl"
import { useEffect } from "react"
import { toast } from "sonner"
import apiClient from "@/services"

type CityModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedCity: City | null
}

export function CityModal({
  open,
  onOpenChange,
  selectedCity,
}: CityModalProps) {
  const t = useTranslations()
  const queryClient = useQueryClient()
  const { data: regionsData } = useRegions()
  const regions = regionsData?.data?.data || []

  const schema = selectedCity?.id ? updateCitySchema : createCitySchema

  const form = useForm({
    mode: "controlled",
    initialValues: {
      nameAr: selectedCity?.nameAr || "",
      nameEn: selectedCity?.nameEn || "",
      regionId: selectedCity?.regionId || "",
    },
    validate: zod4Resolver(schema),
  })

  useEffect(() => {
    if (selectedCity) {
      form.setValues({
        nameAr: selectedCity.nameAr || "",
        nameEn: selectedCity.nameEn || "",
        regionId: selectedCity.regionId || "",
      })
    } else {
      form.setValues({
        nameAr: "",
        nameEn: "",
        regionId: "",
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCity?.id])

  const handleSubmit = async (values: typeof form.values) => {
    try {
      if (selectedCity) {
        await apiClient.put(`/api/cities/${selectedCity.id}`, values)
      } else {
        await apiClient.post("/api/cities", values)
      }

      await queryClient.invalidateQueries({ queryKey: ["cities"] })
      form.reset()
      onOpenChange(false)

      if (selectedCity) {
        toast.success(t("cities.success.updated"))
      } else {
        toast.success(t("cities.success.created"))
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
            {selectedCity ? t("cities.editTitle") : t("cities.createTitle")}
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
                  {t("cities.form.nameAr")}
                </FieldLabel>
                <Input
                  id="nameAr"
                  {...form.getInputProps("nameAr")}
                  placeholder={t("cities.form.nameArPlaceholder")}
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
                  {t("cities.form.nameEn")}
                </FieldLabel>
                <Input
                  id="nameEn"
                  {...form.getInputProps("nameEn")}
                  placeholder={t("cities.form.nameEnPlaceholder")}
                  aria-invalid={!!form.errors.nameEn}
                />
                {form.errors.nameEn && (
                  <FieldError
                    errors={[{ message: String(form.errors.nameEn) }]}
                  />
                )}
              </Field>

              <Field data-invalid={!!form.errors.regionId}>
                <FieldLabel htmlFor="regionId">
                  {t("cities.form.region")}
                </FieldLabel>
                <Select
                  value={form.values.regionId || undefined}
                  onValueChange={(value) => {
                    form.setFieldValue("regionId", value || "")
                  }}
                >
                  <SelectTrigger
                    id="regionId"
                    className="w-full"
                    aria-invalid={!!form.errors.regionId}
                  >
                    <SelectValue>
                      {form.values.regionId
                        ? regions.find(
                            (r: Region) => r.id === form.values.regionId
                          )?.name || t("cities.form.regionPlaceholder")
                        : t("cities.form.regionPlaceholder")}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {regions.map((region: Region) => (
                      <SelectItem key={region.id} value={region.id}>
                        {region.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.errors.regionId && (
                  <FieldError
                    errors={[{ message: String(form.errors.regionId) }]}
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
              {selectedCity ? t("cities.update") : t("cities.create")}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
