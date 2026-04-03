/* eslint-disable @next/next/no-img-element */
"use client"

import { Button } from "@/components/ui/button"
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
import { Spinner } from "@/components/ui/spinner"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import Uploader from "@/components/uploader"
import { handleFormErrors } from "@/lib/handle-form-errors"
import {
  type WebsiteSiteSettingsFormValues,
  websiteSiteSettingsFormSchema,
} from "@/lib/schemas/website-site-settings"
import type { WebsiteSiteSettingsAdminDto } from "@/lib/website-site-settings/service"
import { useForm } from "@mantine/form"
import axios from "axios"
import { ImageIcon, Megaphone, Palette, Search, X } from "lucide-react"
import { zod4Resolver } from "mantine-form-zod-resolver"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

type FormModel = WebsiteSiteSettingsFormValues & { root?: string }

function valuesFromSettings(
  s: WebsiteSiteSettingsAdminDto
): WebsiteSiteSettingsFormValues {
  return {
    primaryColor: s.primaryColor ?? "",
    accentColor: s.accentColor ?? "",
    blackColor: s.blackColor ?? "",
    secondaryTextColor: s.secondaryTextColor ?? "",
    fontAr: s.fontAr ?? "Inter",
    fontEn: s.fontEn ?? "Inter",

    logoForDarkBgUrl: s.logoForDarkBgUrl ?? "",
    logoForLightBgUrl: s.logoForLightBgUrl ?? "",
    defaultMetaTitleAr: s.defaultMetaTitleAr ?? "",
    defaultMetaTitleEn: s.defaultMetaTitleEn ?? "",
    defaultMetaDescriptionAr: s.defaultMetaDescriptionAr ?? "",
    defaultMetaDescriptionEn: s.defaultMetaDescriptionEn ?? "",
    ogImageUrl: s.ogImageUrl ?? "",
    siteUrl: s.siteUrl ?? "",
    twitterSite: s.twitterSite ?? "",
    robotsAllowIndex: s.robotsAllowIndex,
    keywordsAr: s.keywordsAr ?? "",
    keywordsEn: s.keywordsEn ?? "",
    publicContactEmail: s.publicContactEmail ?? "",
    publicPhone: s.publicPhone ?? "",
    faviconUrl: s.faviconUrl ?? "",
    googleAnalyticsMeasurementId: s.googleAnalyticsMeasurementId ?? "",
  }
}

const emptyValues: WebsiteSiteSettingsFormValues = {
  primaryColor: "",
  accentColor: "",
  blackColor: "",
  secondaryTextColor: "",
  fontAr: "Inter",
  fontEn: "Inter",
  logoForDarkBgUrl: "",
  logoForLightBgUrl: "",
  defaultMetaTitleAr: "",
  defaultMetaTitleEn: "",
  defaultMetaDescriptionAr: "",
  defaultMetaDescriptionEn: "",
  ogImageUrl: "",
  siteUrl: "",
  twitterSite: "",
  robotsAllowIndex: true,
  keywordsAr: "",
  keywordsEn: "",
  publicContactEmail: "",
  publicPhone: "",
  faviconUrl: "",
  googleAnalyticsMeasurementId: "",
}

type Props = {
  settings: WebsiteSiteSettingsAdminDto | null
  isLoading: boolean
  onSave: (values: WebsiteSiteSettingsFormValues) => Promise<void>
}

type LogoUploadSlotProps = {
  label: string
  hint: string
  value: string
  onChange: (url: string) => void
  error?: string
  previewClassName: string
  removeLabel: string
  disabled: boolean
}

function LogoUploadSlot({
  label,
  hint,
  value,
  onChange,
  error,
  previewClassName,
  removeLabel,
  disabled,
}: LogoUploadSlotProps) {
  return (
    <div
      className="border-border/60 bg-muted/15 flex flex-col gap-2 rounded-xl border p-3"
      data-invalid={!!error}
    >
      <div className="space-y-0.5">
        <p className="text-xs leading-tight font-medium">{label}</p>
        <p className="text-muted-foreground text-[11px] leading-snug">{hint}</p>
      </div>
      {error ? <FieldError>{error}</FieldError> : null}
      {value ? (
        <div
          className={`border-border/40 relative flex h-24 w-full items-center justify-center overflow-hidden rounded-lg border ${previewClassName}`}
        >
          <img
            src={value}
            alt=""
            className="max-h-17 max-w-[92%] object-contain"
          />
          <Button
            size="icon"
            type="button"
            variant="destructive"
            className="absolute top-1.5 right-1.5 size-7"
            onClick={() => onChange("")}
            aria-label={removeLabel}
            disabled={disabled}
          >
            <X className="size-3.5" />
          </Button>
        </div>
      ) : (
        <div className="border-border/60 bg-background/40 rounded-lg border border-dashed p-2">
          <Uploader
            endpoint="websiteImageUploader"
            disabled={disabled}
            onClientUploadComplete={(res) => {
              if (res?.[0]?.ufsUrl) {
                onChange(res[0].ufsUrl)
              }
            }}
            onUploadError={(err) => {
              toast.error(err.message)
            }}
          />
        </div>
      )}
    </div>
  )
}

export function WebsiteSettingsForm({ settings, isLoading, onSave }: Props) {
  const t = useTranslations("websiteCms.settings")

  const form = useForm<FormModel>({
    mode: "controlled",
    initialValues: settings ? valuesFromSettings(settings) : emptyValues,
    validate: zod4Resolver(websiteSiteSettingsFormSchema),
  })

  const handleSubmit = async (values: WebsiteSiteSettingsFormValues) => {
    form.clearFieldError("root")
    try {
      await onSave({
        ...values,
        publicContactEmail: values.publicContactEmail.trim(),
        publicPhone: values.publicPhone.trim(),
        googleAnalyticsMeasurementId:
          values.googleAnalyticsMeasurementId.trim(),
      })
      toast.success(t("toast.saved"))
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = handleFormErrors(error, form) ?? t("toast.saveFailed")
        toast.error(message)
        return
      }
      toast.error(t("toast.saveFailed"))
    }
  }

  return (
    <form
      onSubmit={form.onSubmit(handleSubmit)}
      className="flex flex-col gap-4"
    >
      <Card className="border-border/70 bg-card/80 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Palette className="text-muted-foreground size-5" />
            {t("theme.title")}
          </CardTitle>
          <CardDescription>{t("theme.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup className="grid gap-5 md:grid-cols-2">
            <Field data-invalid={!!form.errors.primaryColor}>
              <FieldLabel htmlFor="ws-primary">
                {t("theme.primaryColor")}
              </FieldLabel>
              <FieldContent>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <Input
                    dir="ltr"
                    id="ws-primary"
                    key={form.key("primaryColor")}
                    {...form.getInputProps("primaryColor")}
                    placeholder="#0f172a"
                    disabled={isLoading}
                    className="font-mono"
                    aria-invalid={!!form.errors.primaryColor}
                  />
                  {form.values.primaryColor ? (
                    <span
                      className="border-input size-10 shrink-0 rounded-md border shadow-inner"
                      style={{ backgroundColor: form.values.primaryColor }}
                      aria-hidden
                    />
                  ) : null}
                </div>
                {form.errors.primaryColor ? (
                  <FieldError>{String(form.errors.primaryColor)}</FieldError>
                ) : null}
              </FieldContent>
            </Field>
            <Field data-invalid={!!form.errors.accentColor}>
              <FieldLabel htmlFor="ws-accent">
                {t("theme.accentColor")}
              </FieldLabel>
              <FieldContent>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <Input
                    dir="ltr"
                    id="ws-accent"
                    key={form.key("accentColor")}
                    {...form.getInputProps("accentColor")}
                    placeholder="#2563eb"
                    disabled={isLoading}
                    className="font-mono"
                    aria-invalid={!!form.errors.accentColor}
                  />
                  {form.values.accentColor ? (
                    <span
                      className="border-input size-10 shrink-0 rounded-md border shadow-inner"
                      style={{ backgroundColor: form.values.accentColor }}
                      aria-hidden
                    />
                  ) : null}
                </div>
                {form.errors.accentColor ? (
                  <FieldError>{String(form.errors.accentColor)}</FieldError>
                ) : null}
              </FieldContent>
            </Field>
            <Field data-invalid={!!form.errors.blackColor}>
              <FieldLabel htmlFor="ws-black">
                {t("theme.blackColor")}
              </FieldLabel>
              <FieldContent>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <Input
                    dir="ltr"
                    id="ws-black"
                    key={form.key("blackColor")}
                    {...form.getInputProps("blackColor")}
                    placeholder="#000000"
                    disabled={isLoading}
                    className="font-mono"
                    aria-invalid={!!form.errors.blackColor}
                  />
                  {form.values.blackColor ? (
                    <span
                      className="border-input size-10 shrink-0 rounded-md border shadow-inner"
                      style={{ backgroundColor: form.values.blackColor }}
                      aria-hidden
                    />
                  ) : null}
                </div>
                {form.errors.blackColor ? (
                  <FieldError>{String(form.errors.blackColor)}</FieldError>
                ) : null}
              </FieldContent>
            </Field>
            <Field data-invalid={!!form.errors.secondaryTextColor}>
              <FieldLabel htmlFor="ws-secondary-text">
                {t("theme.secondaryTextColor")}
              </FieldLabel>
              <FieldContent>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <Input
                    dir="ltr"
                    id="ws-secondary-text"
                    key={form.key("secondaryTextColor")}
                    {...form.getInputProps("secondaryTextColor")}
                    placeholder="#64748b"
                    disabled={isLoading}
                    className="font-mono"
                    aria-invalid={!!form.errors.secondaryTextColor}
                  />
                  {form.values.secondaryTextColor ? (
                    <span
                      className="border-input size-10 shrink-0 rounded-md border shadow-inner"
                      style={{
                        backgroundColor: form.values.secondaryTextColor,
                      }}
                      aria-hidden
                    />
                  ) : null}
                </div>
                {form.errors.secondaryTextColor ? (
                  <FieldError>
                    {String(form.errors.secondaryTextColor)}
                  </FieldError>
                ) : null}
              </FieldContent>
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      {/* <Card className="border-border/70 bg-card/80 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Type className="text-muted-foreground size-5" />
            {t("fonts.title")}
          </CardTitle>
          <CardDescription>{t("fonts.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup className="grid gap-5 md:grid-cols-2">
            <Field data-invalid={!!form.errors.fontAr}>
              <FieldLabel htmlFor="ws-font-ar">{t("fonts.fontAr")}</FieldLabel>
              <FieldDescription>{t("fonts.hint")}</FieldDescription>
              <FieldContent>
                <Input
                  id="ws-font-ar"
                  dir="ltr"
                  list="website-font-ar-presets"
                  key={form.key("fontAr")}
                  {...form.getInputProps("fontAr")}
                  placeholder="Inter"
                  disabled={isLoading}
                  aria-invalid={!!form.errors.fontAr}
                />
                <datalist id="website-font-ar-presets">
                  {FONT_STACKS.map((name) => (
                    <option key={name} value={name} />
                  ))}
                  {form.values.fontAr &&
                  !(FONT_STACKS as readonly string[]).includes(
                    form.values.fontAr
                  ) ? (
                    <option value={form.values.fontAr} />
                  ) : null}
                </datalist>
                {form.errors.fontAr ? (
                  <FieldError>{String(form.errors.fontAr)}</FieldError>
                ) : null}
              </FieldContent>
            </Field>
            <Field data-invalid={!!form.errors.fontEn}>
              <FieldLabel htmlFor="ws-font-en">{t("fonts.fontEn")}</FieldLabel>
              <FieldContent>
                <Input
                  id="ws-font-en"
                  dir="ltr"
                  list="website-font-en-presets"
                  key={form.key("fontEn")}
                  {...form.getInputProps("fontEn")}
                  placeholder="Inter"
                  disabled={isLoading}
                  aria-invalid={!!form.errors.fontEn}
                />
                <datalist id="website-font-en-presets">
                  {FONT_STACKS.map((name) => (
                    <option key={name} value={name} />
                  ))}
                  {form.values.fontEn &&
                  !(FONT_STACKS as readonly string[]).includes(
                    form.values.fontEn
                  ) ? (
                    <option value={form.values.fontEn} />
                  ) : null}
                </datalist>
                {form.errors.fontEn ? (
                  <FieldError>{String(form.errors.fontEn)}</FieldError>
                ) : null}
              </FieldContent>
            </Field>
          </FieldGroup>
        </CardContent>
      </Card> */}

      <Card className="border-border/60 bg-card/80 backdrop-blur">
        <CardHeader className="space-y-1 pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <ImageIcon className="text-muted-foreground size-4" />
            {t("logos.title")}
          </CardTitle>
          <CardDescription className="text-xs">
            {t("logos.description")}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid gap-3 sm:grid-cols-2">
            <LogoUploadSlot
              key={form.key("logoForDarkBgUrl")}
              label={t("logos.forDarkBg")}
              hint={t("logos.forDarkBgHint")}
              value={form.values.logoForDarkBgUrl}
              onChange={(url) => form.setFieldValue("logoForDarkBgUrl", url)}
              error={
                form.errors.logoForDarkBgUrl
                  ? String(form.errors.logoForDarkBgUrl)
                  : undefined
              }
              previewClassName="bg-zinc-900"
              removeLabel={t("logos.remove")}
              disabled={isLoading}
            />
            <LogoUploadSlot
              key={form.key("logoForLightBgUrl")}
              label={t("logos.forLightBg")}
              hint={t("logos.forLightBgHint")}
              value={form.values.logoForLightBgUrl}
              onChange={(url) => form.setFieldValue("logoForLightBgUrl", url)}
              error={
                form.errors.logoForLightBgUrl
                  ? String(form.errors.logoForLightBgUrl)
                  : undefined
              }
              previewClassName="bg-background"
              removeLabel={t("logos.remove")}
              disabled={isLoading}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/70 bg-card/80 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Search className="text-muted-foreground size-5" />
            {t("seo.title")}
          </CardTitle>
          <CardDescription>{t("seo.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup className="flex flex-col gap-5">
            <div className="grid gap-5 md:grid-cols-2">
              <Field data-invalid={!!form.errors.defaultMetaTitleAr}>
                <FieldLabel htmlFor="ws-meta-title-ar">
                  {t("seo.metaTitleAr")}
                </FieldLabel>
                <FieldContent>
                  <Input
                    id="ws-meta-title-ar"
                    key={form.key("defaultMetaTitleAr")}
                    {...form.getInputProps("defaultMetaTitleAr")}
                    disabled={isLoading}
                    dir="rtl"
                    aria-invalid={!!form.errors.defaultMetaTitleAr}
                  />
                  {form.errors.defaultMetaTitleAr ? (
                    <FieldError>
                      {String(form.errors.defaultMetaTitleAr)}
                    </FieldError>
                  ) : null}
                </FieldContent>
              </Field>
              <Field data-invalid={!!form.errors.defaultMetaTitleEn}>
                <FieldLabel htmlFor="ws-meta-title-en">
                  {t("seo.metaTitleEn")}
                </FieldLabel>
                <FieldContent>
                  <Input
                    id="ws-meta-title-en"
                    key={form.key("defaultMetaTitleEn")}
                    {...form.getInputProps("defaultMetaTitleEn")}
                    disabled={isLoading}
                    aria-invalid={!!form.errors.defaultMetaTitleEn}
                  />
                  {form.errors.defaultMetaTitleEn ? (
                    <FieldError>
                      {String(form.errors.defaultMetaTitleEn)}
                    </FieldError>
                  ) : null}
                </FieldContent>
              </Field>
              <Field
                className="md:col-span-2"
                data-invalid={!!form.errors.defaultMetaDescriptionAr}
              >
                <FieldLabel htmlFor="ws-meta-desc-ar">
                  {t("seo.metaDescriptionAr")}
                </FieldLabel>
                <FieldContent>
                  <Textarea
                    id="ws-meta-desc-ar"
                    key={form.key("defaultMetaDescriptionAr")}
                    {...form.getInputProps("defaultMetaDescriptionAr")}
                    disabled={isLoading}
                    rows={3}
                    dir="rtl"
                    aria-invalid={!!form.errors.defaultMetaDescriptionAr}
                  />
                  {form.errors.defaultMetaDescriptionAr ? (
                    <FieldError>
                      {String(form.errors.defaultMetaDescriptionAr)}
                    </FieldError>
                  ) : null}
                </FieldContent>
              </Field>
              <Field
                className="md:col-span-2"
                data-invalid={!!form.errors.defaultMetaDescriptionEn}
              >
                <FieldLabel htmlFor="ws-meta-desc-en">
                  {t("seo.metaDescriptionEn")}
                </FieldLabel>
                <FieldContent>
                  <Textarea
                    id="ws-meta-desc-en"
                    key={form.key("defaultMetaDescriptionEn")}
                    {...form.getInputProps("defaultMetaDescriptionEn")}
                    disabled={isLoading}
                    rows={3}
                    aria-invalid={!!form.errors.defaultMetaDescriptionEn}
                  />
                  {form.errors.defaultMetaDescriptionEn ? (
                    <FieldError>
                      {String(form.errors.defaultMetaDescriptionEn)}
                    </FieldError>
                  ) : null}
                </FieldContent>
              </Field>
            </div>
            <Field data-invalid={!!form.errors.siteUrl}>
              <FieldLabel htmlFor="ws-site-url">{t("seo.siteUrl")}</FieldLabel>
              <FieldDescription>{t("seo.siteUrlHint")}</FieldDescription>
              <FieldContent>
                <Input
                  id="ws-site-url"
                  key={form.key("siteUrl")}
                  className="max-w-2xl font-mono text-sm"
                  {...form.getInputProps("siteUrl")}
                  placeholder="https://example.com"
                  disabled={isLoading}
                  aria-invalid={!!form.errors.siteUrl}
                />
                {form.errors.siteUrl ? (
                  <FieldError>{String(form.errors.siteUrl)}</FieldError>
                ) : null}
              </FieldContent>
            </Field>
            <Field data-invalid={!!form.errors.faviconUrl}>
              <FieldLabel>{t("seo.favicon")}</FieldLabel>
              <FieldDescription>{t("seo.faviconHint")}</FieldDescription>
              {form.errors.faviconUrl ? (
                <FieldContent>
                  <FieldError>{String(form.errors.faviconUrl)}</FieldError>
                </FieldContent>
              ) : null}
              {!form.values.faviconUrl ? (
                <div className="bg-muted/40 mt-3 max-w-xs rounded-xl border border-dashed p-4">
                  <Uploader
                    endpoint="websiteImageUploader"
                    disabled={isLoading}
                    onClientUploadComplete={(res) => {
                      if (res?.[0]?.ufsUrl) {
                        form.setFieldValue("faviconUrl", res[0].ufsUrl)
                      }
                    }}
                    onUploadError={(err) => {
                      toast.error(err.message)
                    }}
                  />
                </div>
              ) : (
                <div className="bg-muted/30 mt-3 flex max-w-xs flex-col gap-3 rounded-xl border p-3">
                  <div className="bg-background relative flex size-20 items-center justify-center overflow-hidden rounded-lg border">
                    <img
                      src={form.values.faviconUrl}
                      alt=""
                      className="size-12 object-contain"
                    />
                    <Button
                      size="icon"
                      type="button"
                      variant="destructive"
                      className="absolute -top-2 -right-2 size-7"
                      onClick={() => form.setFieldValue("faviconUrl", "")}
                      aria-label={t("seo.removeFavicon")}
                      disabled={isLoading}
                    >
                      <X className="size-3.5" />
                    </Button>
                  </div>
                </div>
              )}
            </Field>
            <Field data-invalid={!!form.errors.ogImageUrl}>
              <FieldLabel>{t("seo.ogImageUrl")}</FieldLabel>
              <FieldDescription>{t("seo.ogImageHint")}</FieldDescription>
              {form.errors.ogImageUrl ? (
                <FieldContent>
                  <FieldError>{String(form.errors.ogImageUrl)}</FieldError>
                </FieldContent>
              ) : null}
              {!form.values.ogImageUrl ? (
                <div className="bg-muted/40 mt-3 max-w-md rounded-xl border border-dashed p-4">
                  <Uploader
                    endpoint="websiteImageUploader"
                    disabled={isLoading}
                    onClientUploadComplete={(res) => {
                      if (res?.[0]?.ufsUrl) {
                        form.setFieldValue("ogImageUrl", res[0].ufsUrl)
                      }
                    }}
                    onUploadError={(err) => {
                      toast.error(err.message)
                    }}
                  />
                </div>
              ) : (
                <div className="bg-muted/30 mt-3 flex max-w-md flex-col gap-3 rounded-xl border p-3">
                  <div className="bg-background relative aspect-1200/630 w-full overflow-hidden rounded-lg border">
                    <img
                      src={form.values.ogImageUrl}
                      alt=""
                      className="size-full object-contain"
                    />
                    <Button
                      size="icon"
                      type="button"
                      variant="destructive"
                      className="absolute -top-2 -right-2 size-7"
                      onClick={() => form.setFieldValue("ogImageUrl", "")}
                      aria-label={t("seo.removeOgImage")}
                      disabled={isLoading}
                    >
                      <X className="size-3.5" />
                    </Button>
                  </div>
                </div>
              )}
            </Field>
            <Field data-invalid={!!form.errors.twitterSite}>
              <FieldLabel htmlFor="ws-tw">{t("seo.twitterSite")}</FieldLabel>
              <FieldDescription>{t("seo.twitterSiteHint")}</FieldDescription>
              <FieldContent>
                <Input
                  id="ws-tw"
                  key={form.key("twitterSite")}
                  className="max-w-md"
                  {...form.getInputProps("twitterSite")}
                  placeholder="@yourbrand"
                  disabled={isLoading}
                  aria-invalid={!!form.errors.twitterSite}
                />
                {form.errors.twitterSite ? (
                  <FieldError>{String(form.errors.twitterSite)}</FieldError>
                ) : null}
              </FieldContent>
            </Field>
            <div className="grid gap-5 md:grid-cols-2">
              <Field data-invalid={!!form.errors.keywordsAr}>
                <FieldLabel htmlFor="ws-kw-ar">
                  {t("seo.keywordsAr")}
                </FieldLabel>
                <FieldContent>
                  <Input
                    id="ws-kw-ar"
                    key={form.key("keywordsAr")}
                    {...form.getInputProps("keywordsAr")}
                    disabled={isLoading}
                    dir="rtl"
                    aria-invalid={!!form.errors.keywordsAr}
                  />
                  {form.errors.keywordsAr ? (
                    <FieldError>{String(form.errors.keywordsAr)}</FieldError>
                  ) : null}
                </FieldContent>
              </Field>
              <Field data-invalid={!!form.errors.keywordsEn}>
                <FieldLabel htmlFor="ws-kw-en">
                  {t("seo.keywordsEn")}
                </FieldLabel>
                <FieldContent>
                  <Input
                    id="ws-kw-en"
                    key={form.key("keywordsEn")}
                    {...form.getInputProps("keywordsEn")}
                    disabled={isLoading}
                    aria-invalid={!!form.errors.keywordsEn}
                  />
                  {form.errors.keywordsEn ? (
                    <FieldError>{String(form.errors.keywordsEn)}</FieldError>
                  ) : null}
                </FieldContent>
              </Field>
            </div>
            <Field orientation="horizontal" className="items-center gap-3">
              <Switch
                id="ws-robots"
                checked={form.values.robotsAllowIndex}
                onCheckedChange={(c) =>
                  form.setFieldValue("robotsAllowIndex", c)
                }
                disabled={isLoading}
              />
              <div className="flex flex-col gap-0.5">
                <FieldLabel htmlFor="ws-robots" className="cursor-pointer">
                  {t("seo.robotsAllowIndex")}
                </FieldLabel>
                <FieldDescription>{t("seo.robotsHint")}</FieldDescription>
              </div>
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      <Card className="border-border/70 bg-card/80 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Megaphone className="text-muted-foreground size-5" />
            {t("contact.title")}
          </CardTitle>
          <CardDescription>{t("contact.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup className="flex flex-col gap-5">
            <div className="grid gap-5 md:grid-cols-2">
              <Field data-invalid={!!form.errors.publicContactEmail}>
                <FieldLabel htmlFor="ws-email">{t("contact.email")}</FieldLabel>
                <FieldContent>
                  <Input
                    id="ws-email"
                    type="email"
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
                <FieldLabel htmlFor="ws-phone">{t("contact.phone")}</FieldLabel>
                <FieldContent>
                  <Input
                    id="ws-phone"
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
            <Field data-invalid={!!form.errors.googleAnalyticsMeasurementId}>
              <FieldLabel htmlFor="ws-ga">{t("contact.gaId")}</FieldLabel>
              <FieldDescription>{t("contact.gaHint")}</FieldDescription>
              <FieldContent>
                <Input
                  id="ws-ga"
                  key={form.key("googleAnalyticsMeasurementId")}
                  className="max-w-md font-mono text-sm"
                  {...form.getInputProps("googleAnalyticsMeasurementId")}
                  placeholder="G-XXXXXXXXXX"
                  disabled={isLoading}
                  aria-invalid={!!form.errors.googleAnalyticsMeasurementId}
                />
                {form.errors.googleAnalyticsMeasurementId ? (
                  <FieldError>
                    {String(form.errors.googleAnalyticsMeasurementId)}
                  </FieldError>
                ) : null}
              </FieldContent>
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      {form.errors.root ? (
        <Field data-invalid>
          <FieldError>{String(form.errors.root)}</FieldError>
        </Field>
      ) : null}

      <Button
        type="submit"
        size="lg"
        className="w-full sm:w-auto"
        disabled={isLoading || form.submitting}
      >
        {form.submitting ? <Spinner className="size-4" /> : t("saveAll")}
      </Button>
    </form>
  )
}
