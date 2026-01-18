"use client"

import { PhoneInput } from "@/components/phone-input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { handleFormErrors } from "@/lib/handle-form-errors"
import { updateUserSettingsSchema } from "@/lib/schemas/user"
import type { User } from "@/prisma/users/select"
import apiClient from "@/services"
import { useForm } from "@mantine/form"
import { useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { format } from "date-fns"
import { ar, enUS } from "date-fns/locale"
import { Calendar as CalendarIcon, Edit } from "lucide-react"
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
        dateOfBirth: user.dateOfBirth
          ? new Date(user.dateOfBirth)
          : null,
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

      // Success - refresh user data
      queryClient.invalidateQueries({ queryKey: ["user", "me"] })
      
      // Show success toast
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
    <Card className="flex-1  ">
      <CardHeader>
        <CardTitle>{t("settings.profile")}</CardTitle>
      </CardHeader>
      <CardContent className="lg:px-8">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <FieldGroup>
            <div className="mb-2 max-w-sm w-fit">
              {/* Image Upload */}
              <Field data-invalid={!!form.errors.image}>
                {!form.values.image ? (
                  <div className="relative">
                    <Uploader
                    variant="circular"
                      endpoint="userImageUploader"
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
                    <div className="relative h-[200px] w-[200px]">
                      <Avatar className="h-full w-full rounded-lg">
                        <AvatarImage
                          src={form.values.image }
                          alt="User"
                        />
                        <AvatarFallback >
                          
                        </AvatarFallback>
                      </Avatar>
                      <Button
                        size="icon"
                        className="absolute top-1/2 right-1/2 translate-x-1/2 -translate-y-1/2"
                        variant="destructive"
                        type="button"
                        onClick={() => form.setFieldValue("image", "")}
                      >
                        <Edit className="size-4" />
                      </Button>
                    </div>
                  </div>
                )}
                {form.errors.image && (
                  <FieldError
                    errors={[{ message: String(form.errors.image) }]}
                  />
                )}
              </Field>
            </div>
            <div className="">
              {/* Full Name */}
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
                  <FieldError
                    errors={[{ message: String(form.errors.name) }]}
                  />
                )}
              </Field>

              
            </div>

            <div className="grid-cols-2 gap-4 md:grid">
              {/* Email */}
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
              {/* Phone Number */}
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

            <div className="grid-cols-2 gap-4 md:grid">
              {/* Date of Birth */}
              <Field data-invalid={!!form.errors.dateOfBirth}>
                <FieldLabel htmlFor="dateOfBirth">
                  {t("employees.form.dateOfBirth")}
                </FieldLabel>
                <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                  <PopoverTrigger
                    render={(props) => (
                      <Button
                        variant="outline"
                        className="w-full justify-start bg-white text-left font-normal"
                        type="button"
                        {...props}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
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

              {/* Gender */}
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

            <div className="grid-cols-2 gap-4 md:grid">
              {/* Nationality */}
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

              {/* City */}
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

            {/* Country */}
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

            {/* Address */}
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
              disabled={form.submitting}
            >
              {form.submitting && <Spinner className="mr-2 size-4" />}
              {t("settings.update")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

