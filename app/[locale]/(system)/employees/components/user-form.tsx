"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { useForm } from "@tanstack/react-form"
import * as z from "zod"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Eye, EyeOff } from "lucide-react"
import Image from "next/image"
import { arFlag } from "@/assets"
import type { User } from "@/hooks/use-users"
import type { PermissionKey } from "@/lib/generated/prisma/enums"

type UserFormProps = {
  selectedUser: User | null
  permissions: Array<{ id: string; key: PermissionKey; name: string }>
  onSubmit: (data: {
    name: string
    email: string
    password: string
    permissions: PermissionKey[]
  }) => Promise<{ success: boolean; error?: string }>
  onSuccess?: () => void
}

export function UserForm({
  selectedUser,
  permissions,
  onSubmit,
  onSuccess,
}: UserFormProps) {
  const t = useTranslations("employees")
  const tForm = useTranslations("employees.form")
  const tErrors = useTranslations("employees.errors")

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const formSchema = z
    .object({
      name: z.string().min(1, tErrors("fullName.required")),
      phoneCountryCode: z.string(),
      phoneNumber: z.string().min(1, tErrors("phoneNumber.required")),
      jobTitle: z.string().min(1, tErrors("jobTitle.required")),
      email: z.email(tErrors("email.invalid")),
      password: z.string().min(8, tErrors("password.minLength")),
      confirmPassword: z.string().min(1, tErrors("confirmPassword.required")),
      allowAllPermissions: z.boolean(),
      permissions: z.array(z.string()),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: tErrors("confirmPassword.mismatch"),
      path: ["confirmPassword"],
    })

  const form = useForm({
    defaultValues: {
      name: "",
      phoneCountryCode: "+966",
      phoneNumber: "",
      jobTitle: "",
      email: "",
      password: "",
      confirmPassword: "",
      allowAllPermissions: false,
      permissions: [] as string[],
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      setServerError(null)

      const permissionKeys = value.allowAllPermissions
        ? permissions.map((p) => p.key)
        : (value.permissions as PermissionKey[])

      const result = await onSubmit({
        name: value.name,
        email: value.email,
        password: value.password,
        permissions: permissionKeys,
      })

      if (result.success) {
        form.reset()
        onSuccess?.()
      } else {
        setServerError(result.error || "create_failed")
      }
    },
  })

  // Update form when user is selected
  useEffect(() => {
    if (selectedUser) {
      form.setFieldValue("name", selectedUser.name)
      form.setFieldValue("email", selectedUser.email)
      form.setFieldValue("password", "")
      form.setFieldValue("confirmPassword", "")
      form.setFieldValue(
        "permissions",
        selectedUser.permissions.map((p) => p.key)
      )
      form.setFieldValue(
        "allowAllPermissions",
        selectedUser.permissions.length === permissions.length
      )
    } else {
      form.reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUser, permissions.length])

  const handleAllowAllPermissionsChange = (checked: boolean) => {
    form.setFieldValue("allowAllPermissions", checked)
    if (checked) {
      form.setFieldValue(
        "permissions",
        permissions.map((p) => p.key)
      )
    } else {
      form.setFieldValue("permissions", [])
    }
  }

  const handlePermissionToggle = (permissionKey: string) => {
    const currentPermissions = form.state.values.permissions
    const isSelected = currentPermissions.includes(permissionKey)

    if (isSelected) {
      form.setFieldValue(
        "permissions",
        currentPermissions.filter((p) => p !== permissionKey)
      )
    } else {
      form.setFieldValue("permissions", [...currentPermissions, permissionKey])
    }

    // Update allowAllPermissions based on current selection
    const newPermissions = isSelected
      ? currentPermissions.filter((p) => p !== permissionKey)
      : [...currentPermissions, permissionKey]

    form.setFieldValue(
      "allowAllPermissions",
      newPermissions.length === permissions.length
    )
  }

  return (
    <Card className="flex-1">
      <CardHeader>
        <CardTitle>{t("userDetails")}</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
        >
          <FieldGroup>
            {/* Full Name */}
            <form.Field name="name">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>
                      {tForm("fullName")}
                    </FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder={tForm("fullNamePlaceholder")}
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
            <form.Field name="phoneNumber">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                const countryCode = form.state.values.phoneCountryCode
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel>{tForm("phoneNumber")}</FieldLabel>
                    <div className="flex gap-2">
                      <Select
                        value={countryCode || "+966"}
                        onValueChange={(value) => {
                          if (value) {
                            form.setFieldValue("phoneCountryCode", value)
                          }
                        }}
                      >
                        <SelectTrigger className="w-32">
                          <div className="flex items-center gap-2">
                            <Image
                              src={arFlag}
                              alt="SA"
                              width={16}
                              height={12}
                              className="rounded"
                            />
                            <SelectValue />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="+966">+966</SelectItem>
                          <SelectItem value="+1">+1</SelectItem>
                          <SelectItem value="+44">+44</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder={tForm("phonePlaceholder")}
                        className="flex-1"
                        aria-invalid={isInvalid}
                      />
                    </div>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )
              }}
            </form.Field>

            {/* Job Title */}
            <form.Field name="jobTitle">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>
                      {tForm("jobTitle")}
                    </FieldLabel>
                    <Select
                      value={field.state.value || undefined}
                      onValueChange={(value) => {
                        if (value) {
                          field.handleChange(value)
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue>
                          {field.state.value || tForm("jobTitlePlaceholder")}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="developer">Developer</SelectItem>
                        <SelectItem value="designer">Designer</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                      </SelectContent>
                    </Select>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )
              }}
            </form.Field>

            {/* Email */}
            <form.Field name="email">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>
                      {tForm("email")}
                    </FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="email"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder={tForm("emailPlaceholder")}
                      aria-invalid={isInvalid}
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )
              }}
            </form.Field>

            {/* Password */}
            <form.Field name="password">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>
                      {tForm("password")}
                    </FieldLabel>
                    <div className="relative">
                      <Input
                        id={field.name}
                        name={field.name}
                        type={showPassword ? "text" : "password"}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="••••••••"
                        aria-invalid={isInvalid}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2"
                      >
                        {showPassword ? (
                          <EyeOff className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </button>
                    </div>
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
                      {tForm("confirmPassword")}
                    </FieldLabel>
                    <div className="relative">
                      <Input
                        id={field.name}
                        name={field.name}
                        type={showConfirmPassword ? "text" : "password"}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="••••••••"
                        aria-invalid={isInvalid}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </button>
                    </div>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )
              }}
            </form.Field>

            {/* Permissions Section */}
            <div className="space-y-4">
              <form.Field name="allowAllPermissions">
                {(field) => (
                  <Field orientation="horizontal">
                    <FieldLabel htmlFor={field.name}>
                      {tForm("allowAllPermissions")}
                    </FieldLabel>
                    <Switch
                      id={field.name}
                      checked={field.state.value}
                      onCheckedChange={handleAllowAllPermissionsChange}
                    />
                  </Field>
                )}
              </form.Field>

              <div>
                <p className="mb-3 text-sm font-medium">
                  {tForm("permissions")}
                </p>
                <div className="space-y-3">
                  {permissions.map((permission) => {
                    const isSelected = form.state.values.permissions.includes(
                      permission.key
                    )
                    const isDisabled = form.state.values.allowAllPermissions

                    return (
                      <Field
                        key={permission.id}
                        orientation="horizontal"
                        className={isDisabled ? "opacity-50" : ""}
                      >
                        <FieldLabel
                          htmlFor={`permission-${permission.id}`}
                          className="flex-1"
                        >
                          {permission.name}
                        </FieldLabel>
                        <Switch
                          id={`permission-${permission.id}`}
                          checked={isSelected || isDisabled}
                          disabled={isDisabled}
                          onCheckedChange={() =>
                            handlePermissionToggle(permission.key)
                          }
                        />
                      </Field>
                    )
                  })}
                </div>
              </div>
            </div>
          </FieldGroup>

          {/* Server Error */}
          {serverError && (
            <div className="text-destructive mt-4 text-sm font-medium">
              {tErrors(serverError)}
            </div>
          )}

          {/* Submit Button */}
          <div className="mt-6">
            <Button
              type="submit"
              className="w-full"
              disabled={form.state.isSubmitting}
            >
              {form.state.isSubmitting && <Spinner className="size-4" />}
              {selectedUser ? t("update") : t("add")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
