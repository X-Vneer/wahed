"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import type { UseFormReturnType } from "@mantine/form"
import { LogIn } from "lucide-react"
import { useTranslations } from "next-intl"
import type { FormModel } from "./form-model"
import { LogoUploadSlot } from "./logo-upload-slot"

type Props = {
  form: UseFormReturnType<FormModel>
  isLoading: boolean
}

export function LoginSection({ form, isLoading }: Props) {
  const t = useTranslations("systemSettings")

  return (
    <Card className="border-border/70 bg-card/80 backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <LogIn className="text-muted-foreground size-5" />
          {t("login.title")}
        </CardTitle>
        <CardDescription>{t("login.description")}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <LogoUploadSlot
          key={form.key("loginBackgroundUrl")}
          label={t("login.background")}
          hint={t("login.backgroundHint")}
          value={form.values.loginBackgroundUrl}
          onChange={(url) => form.setFieldValue("loginBackgroundUrl", url)}
          error={
            form.errors.loginBackgroundUrl
              ? String(form.errors.loginBackgroundUrl)
              : undefined
          }
          previewClassName="bg-zinc-900"
          removeLabel={t("logos.remove")}
          disabled={isLoading}
        />

        <FieldGroup className="grid gap-5 md:grid-cols-2">
          <Field data-invalid={!!form.errors.loginWelcomeTitleAr}>
            <FieldLabel htmlFor="sys-login-title-ar">
              {t("login.titleAr")}
            </FieldLabel>
            <FieldContent>
              <Input
                id="sys-login-title-ar"
                key={form.key("loginWelcomeTitleAr")}
                {...form.getInputProps("loginWelcomeTitleAr")}
                disabled={isLoading}
                dir="rtl"
                aria-invalid={!!form.errors.loginWelcomeTitleAr}
              />
              {form.errors.loginWelcomeTitleAr ? (
                <FieldError>
                  {String(form.errors.loginWelcomeTitleAr)}
                </FieldError>
              ) : null}
            </FieldContent>
          </Field>

          <Field data-invalid={!!form.errors.loginWelcomeTitleEn}>
            <FieldLabel htmlFor="sys-login-title-en">
              {t("login.titleEn")}
            </FieldLabel>
            <FieldContent>
              <Input
                id="sys-login-title-en"
                key={form.key("loginWelcomeTitleEn")}
                {...form.getInputProps("loginWelcomeTitleEn")}
                disabled={isLoading}
                aria-invalid={!!form.errors.loginWelcomeTitleEn}
              />
              {form.errors.loginWelcomeTitleEn ? (
                <FieldError>
                  {String(form.errors.loginWelcomeTitleEn)}
                </FieldError>
              ) : null}
            </FieldContent>
          </Field>

          <Field data-invalid={!!form.errors.loginSubtitleAr}>
            <FieldLabel htmlFor="sys-login-sub-ar">
              {t("login.subtitleAr")}
            </FieldLabel>
            <FieldContent>
              <Input
                id="sys-login-sub-ar"
                key={form.key("loginSubtitleAr")}
                {...form.getInputProps("loginSubtitleAr")}
                disabled={isLoading}
                dir="rtl"
                aria-invalid={!!form.errors.loginSubtitleAr}
              />
              {form.errors.loginSubtitleAr ? (
                <FieldError>{String(form.errors.loginSubtitleAr)}</FieldError>
              ) : null}
            </FieldContent>
          </Field>

          <Field data-invalid={!!form.errors.loginSubtitleEn}>
            <FieldLabel htmlFor="sys-login-sub-en">
              {t("login.subtitleEn")}
            </FieldLabel>
            <FieldContent>
              <Input
                id="sys-login-sub-en"
                key={form.key("loginSubtitleEn")}
                {...form.getInputProps("loginSubtitleEn")}
                disabled={isLoading}
                aria-invalid={!!form.errors.loginSubtitleEn}
              />
              {form.errors.loginSubtitleEn ? (
                <FieldError>{String(form.errors.loginSubtitleEn)}</FieldError>
              ) : null}
            </FieldContent>
          </Field>
        </FieldGroup>
      </CardContent>
    </Card>
  )
}
