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
import { createUserSchema, updateUserSchema } from "@/lib/schemas/user"
import type { User } from "@/prisma/users/select"
import { useForm } from "@tanstack/react-form"
import { useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { useTranslations } from "next-intl"
import { parseAsString, useQueryState } from "nuqs"
import { useEffect, useState } from "react"
import type { Value as PhoneValue } from "react-phone-number-input"
import { PermissionsSelector } from "./permissions-selector"

type UserFormProps = {
  selectedUser: User | null
}

export function UserForm({ selectedUser }: UserFormProps) {
  const t = useTranslations()

  const queryClient = useQueryClient()
  const [serverError, setServerError] = useState<string | null>(null)
  //   selected user
  const [, setSelectedUserId] = useQueryState(
    "user_id",
    parseAsString.withDefault("")
  )

  const form = useForm({
    defaultValues: {
      name: "",
      phone: "",
      roleName: "",
      email: "",
      password: "",
      confirmPassword: "",
      allowAllPermissions: false,
      permissions: [] as string[],
    },
    validators: {
      onSubmit: selectedUser?.id ? updateUserSchema : createUserSchema,
    },
    onSubmit: async ({ value }) => {
      setServerError(null)

      try {
        if (selectedUser) {
          // Update existing user
          await axios.put(`/api/users/${selectedUser.id}`, value, {
            withCredentials: true,
          })
        } else {
          // Create new user
          await axios.post("/api/users", value, {
            withCredentials: true,
          })
        }

        // Success - refresh users list and reset form
        queryClient.invalidateQueries({ queryKey: ["users"] })
        form.reset()

        setSelectedUserId(null)
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.data?.error) {
          setServerError(error.response.data.error)
          return
        }
      }
      setServerError(t("errors.internal_server_error"))
    },
  })

  // Update form when user is selected
  useEffect(() => {
    if (selectedUser) {
      form.setFieldValue("name", selectedUser.name)
      form.setFieldValue("email", selectedUser.email)
      form.setFieldValue("phone", selectedUser.phone || "")
      form.setFieldValue("roleName", selectedUser.roleName || "")
      form.setFieldValue("password", "")
      form.setFieldValue("confirmPassword", "")
      form.setFieldValue("permissions", selectedUser.permissions)
    } else {
      form.reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUser?.id])

  return (
    <Card className="flex-1">
      <CardHeader>
        <CardTitle>{t("employees.userDetails")}</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={async (e) => {
            e.preventDefault()
            e.stopPropagation()
            await form.handleSubmit()
          }}
        >
          <FieldGroup>
            <div className="grid grid-cols-2 gap-4">
              {/* Full Name */}
              <form.Field name="name">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>
                        {t("employees.form.fullName")}
                      </FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder={t("employees.form.fullNamePlaceholder")}
                        aria-invalid={isInvalid}
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  )
                }}
              </form.Field>

              {/* Phone Number */}
              <form.Field name="phone">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>
                        {t("employees.form.phoneNumber")}
                      </FieldLabel>
                      <PhoneInput
                        id={field.name}
                        name={field.name}
                        value={(field.state.value as PhoneValue) || undefined}
                        onChange={(value) => field.handleChange(value || "")}
                        onBlur={field.handleBlur}
                        placeholder={t("employees.form.phonePlaceholder")}
                        defaultCountry="SA"
                        aria-invalid={isInvalid}
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  )
                }}
              </form.Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Email */}
              <form.Field name="email">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>
                        {t("employees.form.email")}
                      </FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="email"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder={t("employees.form.emailPlaceholder")}
                        aria-invalid={isInvalid}
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  )
                }}
              </form.Field>

              {/* Job Title */}

              <form.Field name="roleName">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>
                        {t("employees.form.jobTitle")}
                      </FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder={t("employees.form.jobTitlePlaceholder")}
                        aria-invalid={isInvalid}
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  )
                }}
              </form.Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Password */}
              <form.Field name="password">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>
                        {t("employees.form.password")}
                      </FieldLabel>
                      <Input
                        type="password"
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="••••••••"
                        aria-invalid={isInvalid}
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  )
                }}
              </form.Field>

              {/* Confirm Password */}
              <form.Field name="confirmPassword">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>
                        {t("employees.form.confirmPassword")}
                      </FieldLabel>
                      <Input
                        type="password"
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="••••••••"
                        aria-invalid={isInvalid}
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  )
                }}
              </form.Field>
            </div>

            {/* Permissions Section */}
            <form.Field name="permissions">
              {(field) => (
                <form.Field name="allowAllPermissions">
                  {(allowAllField) => (
                    <PermissionsSelector
                      permissions={field.state.value}
                      allowAllPermissions={allowAllField.state.value}
                      onPermissionsChange={(newPermissions) => {
                        field.handleChange(newPermissions)
                      }}
                      onAllowAllChange={(checked) => {
                        allowAllField.handleChange(checked)
                      }}
                    />
                  )}
                </form.Field>
              )}
            </form.Field>
          </FieldGroup>

          {/* Server Error Message */}
          {serverError && (
            <div className="text-destructive mt-4 text-sm font-medium">
              {serverError}
            </div>
          )}

          {/* Submit Button */}
          <div className="mt-6">
            <Button
              type="submit"
              className="w-fit px-10"
              disabled={form.state.isSubmitting}
            >
              {form.state.isSubmitting && <Spinner className="mr-2 size-4" />}
              {selectedUser ? t("employees.update") : t("employees.add")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
