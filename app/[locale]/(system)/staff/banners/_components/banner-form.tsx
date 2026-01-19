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
import { createBannerSchema, updateBannerSchema } from "@/lib/schemas/banner"
import { useForm } from "@mantine/form"
import { zod4Resolver } from "mantine-form-zod-resolver"
import { useTranslations, useLocale } from "next-intl"
import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import axios from "axios"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar as CalendarIcon, X } from "lucide-react"
import { format } from "date-fns"
import { ar, enUS } from "date-fns/locale"
import Uploader from "@/components/uploader"
import { useCreateBanner, useUpdateBanner } from "@/hooks/use-banners"
import { useUsers } from "@/hooks/use-users"
import { BannerInclude } from "@/prisma/banners"
import UserAvatar from "@/components/user-avatar"
import { useRouter } from "@/lib/i18n/navigation"

type BannerFormContentProps = {
  selectedBanner: BannerInclude | null
}

export function BannerFormContent({ selectedBanner }: BannerFormContentProps) {
  const t = useTranslations()
  const locale = useLocale()
  const [startDatePickerOpen, setStartDatePickerOpen] = useState(false)
  const [endDatePickerOpen, setEndDatePickerOpen] = useState(false)

  const { data: users = [] } = useUsers()
  const createBanner = useCreateBanner()
  const updateBanner = useUpdateBanner()

  const schema = useMemo(
    () => (selectedBanner?.id ? updateBannerSchema : createBannerSchema),
    [selectedBanner?.id]
  )

  const form = useForm({
    mode: "controlled",
    initialValues: {
      titleAr: "",
      titleEn: "",
      descriptionAr: "",
      descriptionEn: "",
      content: "",
      image: "",
      startDate: null as Date | null,
      endDate: null as Date | null,
      users: [] as string[],
      isActive: true,
    },
    validate: zod4Resolver(schema),
  })

  // Update form when banner is selected
  useEffect(() => {
    if (selectedBanner) {
      form.setValues({
        titleAr: selectedBanner.titleAr || "",
        titleEn: selectedBanner.titleEn || "",
        descriptionAr: selectedBanner.descriptionAr || "",
        descriptionEn: selectedBanner.descriptionEn || "",
        content: selectedBanner.content || "",
        image: selectedBanner.image,
        startDate: selectedBanner.startDate
          ? new Date(selectedBanner.startDate)
          : null,
        endDate: selectedBanner.endDate
          ? new Date(selectedBanner.endDate)
          : null,
        users: selectedBanner.users?.map((user) => user.id) || [],
        isActive: selectedBanner.isActive ?? true,
      })
    } else {
      form.reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBanner?.id])

  const router = useRouter()
  const handleSuccess = () => {
    router.push(`/staff/banners`)
  }

  const handleSubmit = async (values: typeof form.values) => {
    try {
      if (selectedBanner) {
        // Update existing banner
        await updateBanner.mutateAsync({
          id: selectedBanner.id,
          data: {
            titleAr: values.titleAr,
            titleEn: values.titleEn,
            descriptionAr: values.descriptionAr || null,
            descriptionEn: values.descriptionEn || null,
            content: values.content || null,
            image: values.image,
            startDate: values.startDate || undefined,
            endDate: values.endDate || undefined,
            users: values.users.length > 0 ? values.users : null,
            isActive: values.isActive,
          },
        })
      } else {
        // Create new banner
        if (!values.startDate || !values.endDate) {
          form.setFieldError(
            "startDate",
            t("banners.errors.startDate.required")
          )
          form.setFieldError("endDate", t("banners.errors.endDate.required"))
          return
        }
        await createBanner.mutateAsync({
          titleAr: values.titleAr,
          titleEn: values.titleEn,
          descriptionAr: values.descriptionAr || null,
          descriptionEn: values.descriptionEn || null,
          content: values.content || null,
          image: values.image,
          startDate: values.startDate,
          endDate: values.endDate,
          users: values.users.length > 0 ? values.users : null,
          isActive: values.isActive,
        })
        form.reset()
      }

      // Success - reset form
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
          <FieldLabel>{t("banners.form.image")}</FieldLabel>
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
                  alt="Banner"
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

        {/* Title Arabic */}
        <Field data-invalid={!!form.errors.titleAr}>
          <FieldLabel htmlFor="titleAr">{t("banners.form.titleAr")}</FieldLabel>
          <Input
            id="titleAr"
            {...form.getInputProps("titleAr")}
            placeholder={t("banners.form.titleArPlaceholder")}
            aria-invalid={!!form.errors.titleAr}
          />
          {form.errors.titleAr && (
            <FieldError errors={[{ message: String(form.errors.titleAr) }]} />
          )}
        </Field>

        {/* Title English */}
        <Field data-invalid={!!form.errors.titleEn}>
          <FieldLabel htmlFor="titleEn">{t("banners.form.titleEn")}</FieldLabel>
          <Input
            id="titleEn"
            {...form.getInputProps("titleEn")}
            placeholder={t("banners.form.titleEnPlaceholder")}
            aria-invalid={!!form.errors.titleEn}
          />
          {form.errors.titleEn && (
            <FieldError errors={[{ message: String(form.errors.titleEn) }]} />
          )}
        </Field>

        {/* Description Arabic */}
        <Field data-invalid={!!form.errors.descriptionAr}>
          <FieldLabel htmlFor="descriptionAr">
            {t("banners.form.descriptionAr")}
          </FieldLabel>
          <Textarea
            id="descriptionAr"
            {...form.getInputProps("descriptionAr")}
            placeholder={t("banners.form.descriptionArPlaceholder")}
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
            {t("banners.form.descriptionEn")}
          </FieldLabel>
          <Textarea
            id="descriptionEn"
            {...form.getInputProps("descriptionEn")}
            placeholder={t("banners.form.descriptionEnPlaceholder")}
            aria-invalid={!!form.errors.descriptionEn}
            rows={4}
          />
          {form.errors.descriptionEn && (
            <FieldError
              errors={[{ message: String(form.errors.descriptionEn) }]}
            />
          )}
        </Field>

        {/* Content as file upload */}
        <Field data-invalid={!!form.errors.content}>
          <FieldLabel htmlFor="content">{t("banners.form.content")}</FieldLabel>
          {!form.values.content ? (
            <div className="relative">
              <Uploader
                endpoint="projectAttachmentsUploader"
                onClientUploadComplete={(res) => {
                  if (res && res.length > 0) {
                    // Store the uploaded file URL in the content field
                    // so it can be sent to the backend.
                    form.setFieldValue("content", res[0].ufsUrl)
                  }
                }}
                onUploadError={(error: Error) => {
                  toast.error(error.message || t("errors.upload_failed"))
                }}
              />
            </div>
          ) : (
            <div className="flex items-center justify-between rounded-lg border px-3 py-2">
              <a
                href={form.values.content}
                target="_blank"
                rel="noreferrer"
                className="text-primary truncate text-sm underline"
              >
                {form.values.content}
              </a>
              <Button
                size="icon"
                variant="ghost"
                type="button"
                onClick={() => form.setFieldValue("content", "")}
              >
                <X className="size-4" />
              </Button>
            </div>
          )}
          {form.errors.content && (
            <FieldError errors={[{ message: String(form.errors.content) }]} />
          )}
        </Field>

        <div className="grid-cols-2 gap-4 md:grid">
          {/* Start Date */}
          <Field data-invalid={!!form.errors.startDate}>
            <FieldLabel htmlFor="startDate">
              {t("banners.form.startDate")}
            </FieldLabel>
            <Popover
              open={startDatePickerOpen}
              onOpenChange={setStartDatePickerOpen}
            >
              <PopoverTrigger
                render={(props) => (
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-white text-left font-normal"
                    type="button"
                    {...props}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.values.startDate ? (
                      format(form.values.startDate, "PPP", {
                        locale: locale === "ar" ? ar : enUS,
                      })
                    ) : (
                      <span>{t("banners.form.selectStartDate")}</span>
                    )}
                  </Button>
                )}
              />
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={form.values.startDate || undefined}
                  onSelect={(date) => {
                    form.setFieldValue("startDate", date || null)
                    setStartDatePickerOpen(false)
                  }}
                  locale={locale === "ar" ? ar : enUS}
                />
              </PopoverContent>
            </Popover>
            {form.errors.startDate && (
              <FieldError
                errors={[{ message: String(form.errors.startDate) }]}
              />
            )}
          </Field>

          {/* End Date */}
          <Field data-invalid={!!form.errors.endDate}>
            <FieldLabel htmlFor="endDate">
              {t("banners.form.endDate")}
            </FieldLabel>
            <Popover
              open={endDatePickerOpen}
              onOpenChange={setEndDatePickerOpen}
            >
              <PopoverTrigger
                render={(props) => (
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-white text-left font-normal"
                    type="button"
                    {...props}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.values.endDate ? (
                      format(form.values.endDate, "PPP", {
                        locale: locale === "ar" ? ar : enUS,
                      })
                    ) : (
                      <span>{t("banners.form.selectEndDate")}</span>
                    )}
                  </Button>
                )}
              />
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={form.values.endDate || undefined}
                  onSelect={(date) => {
                    form.setFieldValue("endDate", date || null)
                    setEndDatePickerOpen(false)
                  }}
                  locale={locale === "ar" ? ar : enUS}
                  disabled={(date) => {
                    if (form.values.startDate) {
                      return date < form.values.startDate
                    }
                    return false
                  }}
                />
              </PopoverContent>
            </Popover>
            {form.errors.endDate && (
              <FieldError errors={[{ message: String(form.errors.endDate) }]} />
            )}
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor="users">{t("banners.form.visibleTo")}</FieldLabel>
          <Select
            multiple
            value={form.values.users}
            onValueChange={(value) => {
              form.setFieldValue("users", value || [])
            }}
          >
            <SelectTrigger className="w-full" id="users">
              <SelectValue>
                {form.values.users.length > 0 ? (
                  <span className="flex gap-2 p-1">
                    {users
                      .filter((user) => form.values.users.includes(user.id))
                      .map((user) => (
                        <UserAvatar key={user.id} {...user} />
                      ))}
                  </span>
                ) : (
                  <span>{t("banners.form.public")}</span>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  <UserAvatar {...user} />
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
              {t("banners.form.isActive")}
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
          disabled={createBanner.isPending || updateBanner.isPending}
        >
          {(createBanner.isPending || updateBanner.isPending) && (
            <Spinner className="mr-2 size-4" />
          )}
          {selectedBanner ? t("banners.update") : t("banners.add")}
        </Button>
      </div>
    </form>
  )
}

// Keep the old BannerForm for backward compatibility if needed
type BannerFormProps = {
  selectedBanner: BannerInclude | null
}

export function BannerForm({ selectedBanner }: BannerFormProps) {
  return (
    <div className="flex-1">
      <BannerFormContent selectedBanner={selectedBanner} />
    </div>
  )
}
