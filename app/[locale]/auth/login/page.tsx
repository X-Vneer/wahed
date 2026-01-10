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
import { handleFormErrors } from "@/lib/handle-form-errors"
import { useForm } from "@mantine/form"
import axios from "axios"
import { zod4Resolver } from "mantine-form-zod-resolver"
import { useTranslations } from "next-intl"
import Image from "next/image"
import { useRouter } from "next/navigation"
import * as z from "zod/v4"
import { loginAction } from "./actions"

export default function LoginPage() {
  const t = useTranslations("auth.login")

  const router = useRouter()

  const formSchema = z.object({
    email: z.email("auth.login.errors.email.invalid"),
    password: z.string().min(8, "auth.login.errors.password.minLength"),
  })

  const form = useForm({
    mode: "controlled",
    initialValues: {
      email: "",
      password: "",
    },
    validate: zod4Resolver(formSchema),
  })

  const handleSubmit = async (values: typeof form.values) => {
    try {
      const result = await loginAction(values.email, values.password)
      if (result.success) {
        router.refresh()
        router.push("/")
      } else {
        form.setFieldError("root", result.error)
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        handleFormErrors(error, form)
      } else {
        form.setFieldError("root", "An unknown error occurred")
      }
    }
  }

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
          <form id="login-form" onSubmit={form.onSubmit(handleSubmit)}>
            <FieldGroup>
              {/* Email Field */}
              <Field data-invalid={!!form.errors.email}>
                <FieldLabel htmlFor="email">{t("email")}</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  {...form.getInputProps("email")}
                  placeholder={t("emailPlaceholder")}
                  className="bg-white"
                  aria-invalid={!!form.errors.email}
                  autoComplete="email"
                />
                {form.errors.email && (
                  <FieldError
                    errors={[{ message: String(form.errors.email) }]}
                  />
                )}
              </Field>

              {/* Password Field */}
              <Field data-invalid={!!form.errors.password}>
                <FieldLabel htmlFor="password">{t("password")}</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  {...form.getInputProps("password")}
                  placeholder="••••••••"
                  className="bg-white"
                  aria-invalid={!!form.errors.password}
                  autoComplete="current-password"
                />
                {form.errors.password && (
                  <FieldError
                    errors={[{ message: String(form.errors.password) }]}
                  />
                )}
              </Field>
            </FieldGroup>

            {/* Server Error Message */}
            {form.errors.root && (
              <FieldError errors={[{ message: String(form.errors.root) }]} />
            )}

            {/* Login Button */}
            <div className="mt-6">
              <Button
                type="submit"
                form="login-form"
                className="w-full py-6 text-base font-medium"
                disabled={form.submitting}
              >
                {form.submitting ? <Spinner /> : null}

                {t("button")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
