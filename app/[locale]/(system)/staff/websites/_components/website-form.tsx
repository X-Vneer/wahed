/* eslint-disable @next/next/no-img-element */
"use client"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Spinner } from "@/components/ui/spinner"
import { handleFormErrors } from "@/lib/handle-form-errors"
import { createWebsiteSchema, updateWebsiteSchema } from "@/lib/schemas/website"
import { useForm } from "@mantine/form"
import { zod4Resolver } from "mantine-form-zod-resolver"
import { useTranslations } from "next-intl"
import { useEffect, useMemo } from "react"
import { toast } from "sonner"
import axios from "axios"
import { X } from "lucide-react"
import Uploader from "@/components/uploader"
import {
  useCreateWebsite,
  useUpdateWebsite,
  type WebsiteWithLocale,
} from "@/hooks/use-websites"
import { useRouter } from "@/lib/i18n/navigation"
import { Checkbox } from "@/components/ui/checkbox"

type WebsiteFormContentProps = {
  selectedWebsite: WebsiteWithLocale | null
  onSuccess?: () => void
}

export function WebsiteFormContent({
  selectedWebsite,
  onSuccess,
}: WebsiteFormContentProps) {
  const t = useTranslations()
  const createWebsite = useCreateWebsite()
  const updateWebsite = useUpdateWebsite()

  const schema = useMemo(
    () => (selectedWebsite?.id ? updateWebsiteSchema : createWebsiteSchema),
    [selectedWebsite?.id]
  )

  const form = useForm({
    mode: "controlled",
    initialValues: {
      nameAr: "",
      nameEn: "",
      descriptionAr: "",
      descriptionEn: "",
      url: "",
      image: "",
      isActive: true,
    },
    validate: zod4Resolver(schema),
  })

  // Update form when website is selected
  useEffect(() => {
    if (selectedWebsite) {
      form.setValues({
        nameAr: selectedWebsite.nameAr || "",
        nameEn: selectedWebsite.nameEn || "",

        url: selectedWebsite.url || "",
        image: selectedWebsite.image || "",
        isActive: selectedWebsite.isActive ?? true,
      })
    } else {
      form.reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedWebsite?.id])

  const router = useRouter()
  const handleSuccess = () => {
    if (onSuccess) {
      onSuccess()
    } else {
      router.push(`/staff/websites`)
    }
  }

  const handleSubmit = async (values: typeof form.values) => {
    try {
      if (selectedWebsite) {
        // Update existing website
        await updateWebsite.mutateAsync({
          id: selectedWebsite.id,
          data: {
            nameAr: values.nameAr,
            nameEn: values.nameEn,
            descriptionAr: values.descriptionAr || null,
            descriptionEn: values.descriptionEn || null,
            url: values.url,
            image: values.image || null,
            isActive: values.isActive,
          },
        })
      } else {
        // Create new website
        await createWebsite.mutateAsync({
          nameAr: values.nameAr,
          nameEn: values.nameEn,
          descriptionAr: values.descriptionAr || null,
          descriptionEn: values.descriptionEn || null,
          url: values.url,
          image: values.image || null,
          isActive: values.isActive,
        })
        form.reset()
      }

      // Success - reset form / close dialog
      handleSuccess()
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
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <FieldGroup>
        {/* Image Upload */}
        <Field data-invalid={!!form.errors.image}>
          <FieldLabel>{t("websites.form.image")}</FieldLabel>
          {!form.values.image ? (
            <div className="relative">
              <Uploader
                endpoint="bannerImageUploader"
                onClientUploadComplete={(res) => {
                  if (res && res.length > 0) {
                    form.setFieldValue("image", res[0].ufsUrl)
                  }
                }}
                onUploadError={(error: Error) => {
                  toast.error(error.message || t("errors.upload_failed"))
                }}
              />
            </div>
          ) : (
            <div className="relative inline-block">
              <div className="relative h-[230px] w-full overflow-hidden rounded-lg border p-1">
                <img
                  src={form.values.image}
                  alt="Website"
                  className="h-full w-full object-contain"
                />
                <Button
                  size="icon"
                  className="absolute top-2 right-2"
                  variant="destructive"
                  type="button"
                  onClick={() => form.setFieldValue("image", "")}
                >
                  <X className="size-4" />
                </Button>
              </div>
            </div>
          )}
          {form.errors.image && (
            <FieldError errors={[{ message: String(form.errors.image) }]} />
          )}
        </Field>

        {/* Name Arabic */}
        <Field data-invalid={!!form.errors.nameAr}>
          <FieldLabel htmlFor="nameAr">{t("websites.form.nameAr")}</FieldLabel>
          <Input
            id="nameAr"
            {...form.getInputProps("nameAr")}
            placeholder={t("websites.form.nameArPlaceholder")}
            aria-invalid={!!form.errors.nameAr}
          />
          {form.errors.nameAr && (
            <FieldError errors={[{ message: String(form.errors.nameAr) }]} />
          )}
        </Field>

        {/* Name English */}
        <Field data-invalid={!!form.errors.nameEn}>
          <FieldLabel htmlFor="nameEn">{t("websites.form.nameEn")}</FieldLabel>
          <Input
            id="nameEn"
            {...form.getInputProps("nameEn")}
            placeholder={t("websites.form.nameEnPlaceholder")}
            aria-invalid={!!form.errors.nameEn}
          />
          {form.errors.nameEn && (
            <FieldError errors={[{ message: String(form.errors.nameEn) }]} />
          )}
        </Field>

        {/* Description Arabic */}
        <Field data-invalid={!!form.errors.descriptionAr}>
          <FieldLabel htmlFor="descriptionAr">
            {t("websites.form.descriptionAr")}
          </FieldLabel>
          <Textarea
            id="descriptionAr"
            {...form.getInputProps("descriptionAr")}
            placeholder={t("websites.form.descriptionArPlaceholder")}
            aria-invalid={!!form.errors.descriptionAr}
            rows={4}
          />
          {form.errors.descriptionAr && (
            <FieldError
              errors={[{ message: String(form.errors.descriptionAr) }]}
            />
          )}
        </Field>

        {/* Description English */}
        <Field data-invalid={!!form.errors.descriptionEn}>
          <FieldLabel htmlFor="descriptionEn">
            {t("websites.form.descriptionEn")}
          </FieldLabel>
          <Textarea
            id="descriptionEn"
            {...form.getInputProps("descriptionEn")}
            placeholder={t("websites.form.descriptionEnPlaceholder")}
            aria-invalid={!!form.errors.descriptionEn}
            rows={4}
          />
          {form.errors.descriptionEn && (
            <FieldError
              errors={[{ message: String(form.errors.descriptionEn) }]}
            />
          )}
        </Field>

        {/* URL */}
        <Field data-invalid={!!form.errors.url}>
          <FieldLabel htmlFor="url">{t("websites.form.url")}</FieldLabel>
          <Input
            id="url"
            {...form.getInputProps("url")}
            placeholder={t("websites.form.urlPlaceholder")}
            aria-invalid={!!form.errors.url}
            type="url"
          />
          {form.errors.url && (
            <FieldError errors={[{ message: String(form.errors.url) }]} />
          )}
        </Field>

        {/* Is Active */}
        <Field>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isActive"
              checked={form.values.isActive}
              onCheckedChange={(checked) =>
                form.setFieldValue("isActive", checked === true)
              }
            />
            <FieldLabel
              htmlFor="isActive"
              className="mb-0! cursor-pointer font-normal"
            >
              {t("websites.form.isActive")}
            </FieldLabel>
          </div>
        </Field>
      </FieldGroup>

      {/* Server Error Message */}
      {form.errors.root && (
        <div className="text-destructive mt-4 text-sm font-medium">
          {form.errors.root}
        </div>
      )}

      {/* Submit Button */}
      <div className="mt-6">
        <Button
          type="submit"
          className="w-fit px-10"
          disabled={createWebsite.isPending || updateWebsite.isPending}
        >
          {(createWebsite.isPending || updateWebsite.isPending) && (
            <Spinner className="mr-2 size-4" />
          )}
          {selectedWebsite ? t("websites.update") : t("websites.add")}
        </Button>
      </div>
    </form>
  )
}
