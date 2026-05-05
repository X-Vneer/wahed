"use client"

import { PhoneInput } from "@/components/phone-input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
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
import { Spinner } from "@/components/ui/spinner"
import Uploader from "@/components/uploader"
import { Gender } from "@/lib/generated/prisma/enums"
import { handleFormErrors } from "@/utils/handle-form-errors"
import { updateUserSettingsSchema } from "@/schemas/user"
import type { User } from "@/prisma/users/select"
import apiClient from "@/services"
import { useForm } from "@mantine/form"
import { useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { format } from "date-fns"
import { ar, enUS } from "date-fns/locale"
import { Calendar as CalendarIcon, Trash2 } from "lucide-react"
import { zod4Resolver } from "mantine-form-zod-resolver"
import { useLocale, useTranslations } from "next-intl"
import { useState } from "react"
import type { Value as PhoneValue } from "react-phone-number-input"
import { toast } from "sonner"

type SettingsFormProps = {
  user: User
}

export function SettingsForm({ user }: SettingsFormProps) {
  const t = useTranslations()
  const locale = useLocale()
  const [datePickerOpen, setDatePickerOpen] = useState(false)
  const queryClient = useQueryClient()

  const form = useForm({
    mode: "controlled",
    initialValues: {
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth) : null,
      gender: user.gender,
      nationality: user.nationality || "",
      address: user.address || "",
      city: user.city || "",
      country: user.country || "",
      image: user.image || "",
    },
    validate: zod4Resolver(updateUserSettingsSchema),
  })

  const handleSubmit = async (values: typeof form.values) => {
    try {
      await apiClient.put("/api/user/me", values)
      queryClient.invalidateQueries({ queryKey: ["user", "me"] })
      toast.success(t("settings.success.profile_updated"))
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
      <div className="bg-card overflow-hidden rounded-2xl border shadow-xs">
        <header className="border-b px-6 py-5 sm:px-8">
          <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.18em] uppercase">
            {t("settings.sections.profile.eyebrow")}
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight">
            {t("settings.sections.profile.title")}
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            {t("settings.sections.profile.description")}
          </p>
        </header>

        <div className="grid gap-8 px-6 py-6 sm:px-8 sm:py-8 lg:grid-cols-[200px_1fr]">
          <div className="flex flex-col items-center gap-3 lg:items-start">
            <span className="text-muted-foreground text-xs font-medium">
              {t("settings.sections.profile.photoLabel")}
            </span>
            {!form.values.image ? (
              <div className="w-full max-w-[180px]">
                <Uploader
                  variant="circular"
                  endpoint="userImageUploader"
                  onClientUploadComplete={(res) => {
                    if (res && res.length > 0) {
                      form.setFieldValue("image", res[0].ufsUrl)
                    }
                  }}
                  onUploadError={(err: Error) => {
                    toast.error(err.message || t("errors.upload_failed"))
                  }}
                />
              </div>
            ) : (
              <div className="relative">
                <div
                  aria-hidden
                  className="from-primary/30 via-accent/20 absolute -inset-2 rounded-full bg-gradient-to-br to-transparent blur-md"
                />
                <Avatar className="ring-background relative size-36 shadow-md ring-4">
                  <AvatarImage src={form.values.image} alt={user.name} />
                  <AvatarFallback className="text-lg">
                    {user.name?.[0]?.toUpperCase() ?? "?"}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="icon"
                  variant="destructive"
                  type="button"
                  className="absolute right-0 bottom-1 size-8 rounded-full shadow-md"
                  onClick={() => form.setFieldValue("image", "")}
                  aria-label={t("settings.sections.profile.removePhoto")}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            )}
            <p className="text-muted-foreground max-w-[200px] text-center text-xs leading-relaxed lg:text-start">
              {t("settings.sections.profile.photoHint")}
            </p>
          </div>

          <FieldGroup className="gap-5">
            <Field data-invalid={!!form.errors.name}>
              <FieldLabel htmlFor="name">
                {t("employees.form.fullName")}
              </FieldLabel>
              <Input
                id="name"
                {...form.getInputProps("name")}
                placeholder={t("employees.form.fullNamePlaceholder")}
                aria-invalid={!!form.errors.name}
              />
              {form.errors.name && (
                <FieldError errors={[{ message: String(form.errors.name) }]} />
              )}
            </Field>

            <div className="grid gap-5 md:grid-cols-2">
              <Field data-invalid={!!form.errors.email}>
                <FieldLabel htmlFor="email">
                  {t("employees.form.email")}
                </FieldLabel>
                <Input
                  id="email"
                  type="email"
                  {...form.getInputProps("email")}
                  placeholder={t("employees.form.emailPlaceholder")}
                  aria-invalid={!!form.errors.email}
                />
                {form.errors.email && (
                  <FieldError
                    errors={[{ message: String(form.errors.email) }]}
                  />
                )}
              </Field>
              <Field data-invalid={!!form.errors.phone}>
                <FieldLabel htmlFor="phone">
                  {t("employees.form.phoneNumber")}
                </FieldLabel>
                <PhoneInput
                  id="phone"
                  name="phone"
                  value={(form.values.phone as PhoneValue) || undefined}
                  onChange={(value) => form.setFieldValue("phone", value || "")}
                  onBlur={() => form.validateField("phone")}
                  placeholder={t("employees.form.phonePlaceholder")}
                  defaultCountry="SA"
                  aria-invalid={!!form.errors.phone}
                />
                {form.errors.phone && (
                  <FieldError
                    errors={[{ message: String(form.errors.phone) }]}
                  />
                )}
              </Field>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <Field data-invalid={!!form.errors.dateOfBirth}>
                <FieldLabel htmlFor="dateOfBirth">
                  {t("employees.form.dateOfBirth")}
                </FieldLabel>
                <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                  <PopoverTrigger
                    render={(props) => (
                      <Button
                        variant="outline"
                        className="w-full justify-start bg-white text-start font-normal"
                        type="button"
                        {...props}
                      >
                        <CalendarIcon className="me-2 h-4 w-4" />
                        {form.values.dateOfBirth ? (
                          format(form.values.dateOfBirth, "PPP", {
                            locale: locale === "ar" ? ar : enUS,
                          })
                        ) : (
                          <span>{t("employees.form.selectDate")}</span>
                        )}
                      </Button>
                    )}
                  />
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={form.values.dateOfBirth || undefined}
                      onSelect={(date) => {
                        form.setFieldValue("dateOfBirth", date || null)
                        setDatePickerOpen(false)
                      }}
                      locale={locale === "ar" ? ar : enUS}
                    />
                  </PopoverContent>
                </Popover>
                {form.errors.dateOfBirth && (
                  <FieldError
                    errors={[{ message: String(form.errors.dateOfBirth) }]}
                  />
                )}
              </Field>

              <Field data-invalid={!!form.errors.gender}>
                <FieldLabel htmlFor="gender">
                  {t("employees.form.gender")}
                </FieldLabel>
                <Select
                  value={form.values.gender}
                  onValueChange={(value) =>
                    form.setFieldValue("gender", value as Gender)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue>
                      {form.values.gender
                        ? form.values.gender === Gender.MALE
                          ? t("employees.form.male")
                          : t("employees.form.female")
                        : t("employees.form.selectGender")}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={Gender.MALE}>
                      {t("employees.form.male")}
                    </SelectItem>
                    <SelectItem value={Gender.FEMALE}>
                      {t("employees.form.female")}
                    </SelectItem>
                  </SelectContent>
                </Select>
                {form.errors.gender && (
                  <FieldError
                    errors={[{ message: String(form.errors.gender) }]}
                  />
                )}
              </Field>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              <Field data-invalid={!!form.errors.nationality}>
                <FieldLabel htmlFor="nationality">
                  {t("employees.form.nationality")}
                </FieldLabel>
                <Input
                  id="nationality"
                  {...form.getInputProps("nationality")}
                  placeholder={t("employees.form.nationalityPlaceholder")}
                  aria-invalid={!!form.errors.nationality}
                />
                {form.errors.nationality && (
                  <FieldError
                    errors={[{ message: String(form.errors.nationality) }]}
                  />
                )}
              </Field>
              <Field data-invalid={!!form.errors.country}>
                <FieldLabel htmlFor="country">
                  {t("employees.form.country")}
                </FieldLabel>
                <Input
                  id="country"
                  {...form.getInputProps("country")}
                  placeholder={t("employees.form.countryPlaceholder")}
                  aria-invalid={!!form.errors.country}
                />
                {form.errors.country && (
                  <FieldError
                    errors={[{ message: String(form.errors.country) }]}
                  />
                )}
              </Field>
              <Field data-invalid={!!form.errors.city}>
                <FieldLabel htmlFor="city">
                  {t("employees.form.city")}
                </FieldLabel>
                <Input
                  id="city"
                  {...form.getInputProps("city")}
                  placeholder={t("employees.form.cityPlaceholder")}
                  aria-invalid={!!form.errors.city}
                />
                {form.errors.city && (
                  <FieldError
                    errors={[{ message: String(form.errors.city) }]}
                  />
                )}
              </Field>
            </div>

            <Field data-invalid={!!form.errors.address}>
              <FieldLabel htmlFor="address">
                {t("employees.form.address")}
              </FieldLabel>
              <Input
                id="address"
                {...form.getInputProps("address")}
                placeholder={t("employees.form.addressPlaceholder")}
                aria-invalid={!!form.errors.address}
              />
              {form.errors.address && (
                <FieldError
                  errors={[{ message: String(form.errors.address) }]}
                />
              )}
            </Field>

            {form.errors.root && (
              <div className="text-destructive text-sm font-medium">
                {form.errors.root}
              </div>
            )}
          </FieldGroup>
        </div>

        <footer className="bg-muted/30 flex items-center justify-end gap-3 border-t px-6 py-4 sm:px-8">
          <p className="text-muted-foreground me-auto hidden text-xs sm:block">
            {t("settings.sections.profile.footerHint")}
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => form.reset()}
            disabled={form.submitting || !form.isDirty()}
          >
            {t("settings.discard")}
          </Button>
          <Button type="submit" disabled={form.submitting} className="min-w-32">
            {form.submitting && <Spinner className="me-2 size-4" />}
            {t("settings.update")}
          </Button>
        </footer>
      </div>
    </form>
  )
}
