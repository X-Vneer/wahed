"use client"

import { PhoneInput } from "@/components/phone-input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { handleFormErrors } from "@/lib/handle-form-errors"
import { createUserSchema, updateUserSchema } from "@/lib/schemas/user"
import type { User } from "@/prisma/users/select"
import { useForm } from "@mantine/form"
import { useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { zod4Resolver } from "mantine-form-zod-resolver"
import { useTranslations, useLocale } from "next-intl"
import { useEffect, useMemo, useState } from "react"
import type { Value as PhoneValue } from "react-phone-number-input"
import { PermissionsSelector } from "./permissions-selector"
import { parseAsString, useQueryState } from "nuqs"
import { toast } from "sonner"
import apiClient from "@/services"
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
import { Calendar as CalendarIcon, Edit, X } from "lucide-react"
import { format } from "date-fns"
import { ar, enUS } from "date-fns/locale"
import { Gender } from "@/lib/generated/prisma/enums"
import Uploader from "@/components/uploader"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

type UserFormProps = {
  selectedUser: User | null
}

export function UserForm({ selectedUser }: UserFormProps) {
  const t = useTranslations()
  const locale = useLocale()
  const [datePickerOpen, setDatePickerOpen] = useState(false)

  //   selected user
  const [, setSelectedUserId] = useQueryState(
    "user_id",
    parseAsString.withDefault("")
  )
  const queryClient = useQueryClient()

  const schema = useMemo(
    () => (selectedUser?.id ? updateUserSchema : createUserSchema),
    [selectedUser?.id]
  )

  const form = useForm({
    mode: "controlled",
    initialValues: {
      name: "",
      phone: "",
      roleName: "",
      email: "",
      password: "",
      confirmPassword: "",
      allowAllPermissions: false,
      permissions: [] as string[],
      dateOfBirth: null as Date | null,
      gender: "MALE" as Gender | undefined,
      nationality: "",
      address: "",
      city: "",
      country: "",
      image: "",
      isActive: true,
    },
    validate: zod4Resolver(schema),
  })

  // Update form when user is selected
  useEffect(() => {
    if (selectedUser) {
      form.setValues({
        name: selectedUser.name,
        email: selectedUser.email,
        phone: selectedUser.phone || "",
        roleName: selectedUser.roleName || "",
        password: "",
        confirmPassword: "",
        permissions: selectedUser.permissions,
        allowAllPermissions: false,
        dateOfBirth: selectedUser.dateOfBirth
          ? new Date(selectedUser.dateOfBirth)
          : null,
        gender: selectedUser.gender,
        nationality: selectedUser.nationality || "",
        address: selectedUser.address || "",
        city: selectedUser.city || "",
        country: selectedUser.country || "",
        image: selectedUser.image || "",
        isActive: selectedUser.isActive ?? true,
      })
    } else {
      form.reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUser?.id])

  const handleSubmit = async (values: typeof form.values) => {
    try {
      if (selectedUser) {
        // Update existing user
        await apiClient.put(`/api/users/${selectedUser.id}`, values)
      } else {
        // Create new user
        await apiClient.post("/api/users", values)
      }

      // Success - refresh users list and reset form
      queryClient.invalidateQueries({ queryKey: ["users"] })
      form.reset()
      setSelectedUserId(null)

      // Show success toast
      if (selectedUser) {
        toast.success(t("employees.success.user_updated"))
      } else {
        toast.success(t("employees.success.user_created"))
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
    <Card className="flex-1">
      <CardHeader>
        <CardTitle>{t("employees.userDetails")}</CardTitle>
      </CardHeader>
      <CardContent>
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
            <div className="grid-cols-2 gap-4 md:grid">
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

              {/* Job Title */}
              <Field data-invalid={!!form.errors.roleName}>
                <FieldLabel htmlFor="roleName">
                  {t("employees.form.jobTitle")}
                </FieldLabel>
                <Input
                  id="roleName"
                  {...form.getInputProps("roleName")}
                  placeholder={t("employees.form.jobTitlePlaceholder")}
                  aria-invalid={!!form.errors.roleName}
                />
                {form.errors.roleName && (
                  <FieldError
                    errors={[{ message: String(form.errors.roleName) }]}
                  />
                )}
              </Field>
            </div>

            <div className="grid-cols-2 gap-4 md:grid">
              {/* Password */}
              <Field data-invalid={!!form.errors.password}>
                <FieldLabel htmlFor="password">
                  {t("employees.form.password")}
                </FieldLabel>
                <Input
                  type="password"
                  id="password"
                  {...form.getInputProps("password")}
                  placeholder="••••••••"
                  aria-invalid={!!form.errors.password}
                />
                {form.errors.password && (
                  <FieldError
                    errors={[{ message: String(form.errors.password) }]}
                  />
                )}
              </Field>

              {/* Confirm Password */}
              <Field data-invalid={!!form.errors.confirmPassword}>
                <FieldLabel htmlFor="confirmPassword">
                  {t("employees.form.confirmPassword")}
                </FieldLabel>
                <Input
                  type="password"
                  id="confirmPassword"
                  {...form.getInputProps("confirmPassword")}
                  placeholder="••••••••"
                  aria-invalid={!!form.errors.confirmPassword}
                />
                {form.errors.confirmPassword && (
                  <FieldError
                    errors={[{ message: String(form.errors.confirmPassword) }]}
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
                  {t("employees.form.isActive")}
                </FieldLabel>
              </div>
            </Field>

            {/* Permissions Section */}
            <PermissionsSelector
              permissions={form.values.permissions}
              allowAllPermissions={form.values.allowAllPermissions}
              onPermissionsChange={(newPermissions) => {
                form.setFieldValue("permissions", newPermissions)
              }}
              onAllowAllChange={(checked) => {
                form.setFieldValue("allowAllPermissions", checked)
              }}
            />
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
              {selectedUser ? t("employees.update") : t("employees.add")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
