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
import { useTranslations } from "next-intl"
import { useEffect, useMemo } from "react"
import type { Value as PhoneValue } from "react-phone-number-input"
import { PermissionsSelector } from "./permissions-selector"
import { parseAsString, useQueryState } from "nuqs"
import { toast } from "sonner"

type UserFormProps = {
  selectedUser: User | null
}

export function UserForm({ selectedUser }: UserFormProps) {
  const t = useTranslations()

  //   selected user
  const [_, setSelectedUserId] = useQueryState(
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
        await axios.put(`/api/users/${selectedUser.id}`, values, {
          withCredentials: true,
        })
      } else {
        // Create new user
        await axios.post("/api/users", values, {
          withCredentials: true,
        })
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
            <div className="grid grid-cols-2 gap-4">
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

            <div className="grid grid-cols-2 gap-4">
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

            <div className="grid grid-cols-2 gap-4">
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
