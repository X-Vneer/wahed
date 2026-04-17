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
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import type { UseFormReturnType } from "@mantine/form"
import { Mail, Phone } from "lucide-react"
import { useTranslations } from "next-intl"
import type { FormModel } from "./form-model"
import { FacebookIcon, InstagramIcon, XIcon, YoutubeIcon } from "./social-icons"

type Props = {
  form: UseFormReturnType<FormModel>
  isLoading: boolean
}

export function SocialMediaSection({ form, isLoading }: Props) {
  const t = useTranslations("websiteCms.settings")

  return (
    <Card className="border-border/70 bg-card/80 backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <FacebookIcon className="text-muted-foreground size-5" />
          {t("social.title")}
        </CardTitle>
        <CardDescription>{t("social.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <FieldGroup className="flex flex-col gap-5">
          <div className="grid gap-5 md:grid-cols-2">
            <Field data-invalid={!!form.errors.publicContactEmail}>
              <FieldLabel htmlFor="ws-email">
                <span className="flex items-center gap-1.5">
                  <Mail className="size-4" />
                  {t("social.email")}
                </span>
              </FieldLabel>
              <FieldContent>
                <Input
                  id="ws-email"
                  type="email"
                  dir="ltr"
                  key={form.key("publicContactEmail")}
                  {...form.getInputProps("publicContactEmail")}
                  disabled={isLoading}
                  aria-invalid={!!form.errors.publicContactEmail}
                />
                {form.errors.publicContactEmail ? (
                  <FieldError>
                    {String(form.errors.publicContactEmail)}
                  </FieldError>
                ) : null}
              </FieldContent>
            </Field>
            <Field data-invalid={!!form.errors.publicPhone}>
              <FieldLabel htmlFor="ws-phone">
                <span className="flex items-center gap-1.5">
                  <Phone className="size-4" />
                  {t("social.phone")}
                </span>
              </FieldLabel>
              <FieldContent>
                <Input
                  id="ws-phone"
                  dir="ltr"
                  key={form.key("publicPhone")}
                  {...form.getInputProps("publicPhone")}
                  disabled={isLoading}
                  aria-invalid={!!form.errors.publicPhone}
                />
                {form.errors.publicPhone ? (
                  <FieldError>{String(form.errors.publicPhone)}</FieldError>
                ) : null}
              </FieldContent>
            </Field>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <Field data-invalid={!!form.errors.facebookUrl}>
              <FieldLabel htmlFor="ws-facebook">
                <span className="flex items-center gap-1.5">
                  <FacebookIcon className="size-4" />
                  {t("social.facebook")}
                </span>
              </FieldLabel>
              <FieldContent>
                <Input
                  id="ws-facebook"
                  dir="ltr"
                  key={form.key("facebookUrl")}
                  {...form.getInputProps("facebookUrl")}
                  placeholder="https://facebook.com/yourpage"
                  disabled={isLoading}
                  aria-invalid={!!form.errors.facebookUrl}
                />
                {form.errors.facebookUrl ? (
                  <FieldError>{String(form.errors.facebookUrl)}</FieldError>
                ) : null}
              </FieldContent>
            </Field>
            <Field data-invalid={!!form.errors.instagramUrl}>
              <FieldLabel htmlFor="ws-instagram">
                <span className="flex items-center gap-1.5">
                  <InstagramIcon className="size-4" />
                  {t("social.instagram")}
                </span>
              </FieldLabel>
              <FieldContent>
                <Input
                  id="ws-instagram"
                  dir="ltr"
                  key={form.key("instagramUrl")}
                  {...form.getInputProps("instagramUrl")}
                  placeholder="https://instagram.com/yourpage"
                  disabled={isLoading}
                  aria-invalid={!!form.errors.instagramUrl}
                />
                {form.errors.instagramUrl ? (
                  <FieldError>{String(form.errors.instagramUrl)}</FieldError>
                ) : null}
              </FieldContent>
            </Field>
            <Field data-invalid={!!form.errors.youtubeUrl}>
              <FieldLabel htmlFor="ws-youtube">
                <span className="flex items-center gap-1.5">
                  <YoutubeIcon className="size-4" />
                  {t("social.youtube")}
                </span>
              </FieldLabel>
              <FieldContent>
                <Input
                  id="ws-youtube"
                  dir="ltr"
                  key={form.key("youtubeUrl")}
                  {...form.getInputProps("youtubeUrl")}
                  placeholder="https://youtube.com/@yourchannel"
                  disabled={isLoading}
                  aria-invalid={!!form.errors.youtubeUrl}
                />
                {form.errors.youtubeUrl ? (
                  <FieldError>{String(form.errors.youtubeUrl)}</FieldError>
                ) : null}
              </FieldContent>
            </Field>
            <Field data-invalid={!!form.errors.xUrl}>
              <FieldLabel htmlFor="ws-x">
                <span className="flex items-center gap-1.5">
                  <XIcon className="size-4" />
                  {t("social.x")}
                </span>
              </FieldLabel>
              <FieldContent>
                <Input
                  id="ws-x"
                  dir="ltr"
                  key={form.key("xUrl")}
                  {...form.getInputProps("xUrl")}
                  placeholder="https://x.com/yourhandle"
                  disabled={isLoading}
                  aria-invalid={!!form.errors.xUrl}
                />
                {form.errors.xUrl ? (
                  <FieldError>{String(form.errors.xUrl)}</FieldError>
                ) : null}
              </FieldContent>
            </Field>
          </div>
        </FieldGroup>
      </CardContent>
    </Card>
  )
}
