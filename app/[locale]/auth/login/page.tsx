"use client"

import { gridBg, loginBg, logo, noise } from "@/assets"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { useForm } from "@tanstack/react-form"
import { useTranslations } from "next-intl"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useState } from "react"
import * as z from "zod"
import { loginAction } from "./actions"

export default function LoginPage() {
  const t = useTranslations("auth.login")
  const tErrors = useTranslations("auth.login.errors")
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)

  const formSchema = z.object({
    email: z.email(tErrors("email.invalid")),
    password: z.string().min(8, tErrors("password.minLength")),
  })

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      setServerError(null)
      const result = await loginAction(value.email, value.password)
      if (result.success) {
        router.refresh()
        router.push("/")
      } else {
        setServerError(result.error)
      }
    },
  })

  return (
    <div className="relative flex min-h-screen items-center justify-center">
      <Image
        src={loginBg}
        className="absolute h-full w-full object-cover"
        alt="bg"
      />
      <Image
        src={noise}
        className="absolute h-full w-full object-cover opacity-10"
        alt="Noise"
      />
      <Image
        src={gridBg}
        className="absolute h-full w-full object-cover"
        alt="grid"
      />

      <div
        style={{
          background:
            "radial-gradient(40.38% 50% at 50% 50%, #18181B 0%, rgba(24, 24, 27, 0.2) 100%)",
        }}
        className="absolute inset-0 opacity-35"
      ></div>
      <div
        style={{
          background:
            "linear-gradient(116.56deg, rgba(255, 255, 255, 0) 24.66%, rgba(255, 94, 39, 0.2) 138.88%)",
        }}
        className="absolute inset-0 opacity-30"
      ></div>
      {/* Login Card */}
      <Card className="relative z-1 mx-4 w-full max-w-md rounded-2xl bg-white shadow-2xl">
        <CardHeader className="flex flex-col items-center gap-6">
          {/* Logo */}
          <Image src={logo} className="mx-auto w-32" alt="Wahd Logo" />

          {/* Welcome Message */}
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-bold">{t("title")}</h1>

            <p className="text-muted-foreground text-sm">{t("subtitle")}</p>
          </div>
        </CardHeader>

        <CardContent className="px-6 pb-3">
          <form
            id="login-form"
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              form.handleSubmit()
            }}
          >
            <FieldGroup>
              {/* Email Field */}
              <form.Field name="email">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>{t("email")}</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="email"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder={t("emailPlaceholder")}
                        className="bg-white"
                        aria-invalid={isInvalid}
                        autoComplete="email"
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  )
                }}
              </form.Field>

              {/* Password Field */}
              <form.Field name="password">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>
                        {t("password")}
                      </FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="password"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="••••••••"
                        className="bg-white"
                        aria-invalid={isInvalid}
                        autoComplete="current-password"
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  )
                }}
              </form.Field>
            </FieldGroup>

            {/* Server Error Message */}
            {serverError && (
              <div className="text-destructive mt-4 text-sm font-medium">
                {tErrors(serverError)}
              </div>
            )}

            {/* Login Button */}
            <div className="mt-6">
              <Button
                type="submit"
                form="login-form"
                className="w-full py-6 text-base font-medium"
                disabled={form.state.isSubmitting}
              >
                {form.state.isSubmitting ? <Spinner /> : null}

                {t("button")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
