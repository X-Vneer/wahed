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
import { FileText, ImageIcon, Megaphone, Palette, Search, X } from "lucide-react"

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  )
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  )
}

function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  )
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932zM17.61 20.644h2.039L6.486 3.24H4.298z" />
    </svg>
  )
}
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
    facebookUrl: s.facebookUrl ?? "",
    instagramUrl: s.instagramUrl ?? "",
    youtubeUrl: s.youtubeUrl ?? "",
    xUrl: s.xUrl ?? "",
    footerDescriptionAr: s.footerDescriptionAr ?? "",
    footerDescriptionEn: s.footerDescriptionEn ?? "",
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
  facebookUrl: "",
  instagramUrl: "",
  youtubeUrl: "",
  xUrl: "",
  footerDescriptionAr: "",
  footerDescriptionEn: "",
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

      <Card className="border-border/70 bg-card/80 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FacebookIcon className="text-muted-foreground size-5" />
            {t("social.title")}
          </CardTitle>
          <CardDescription>{t("social.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup className="grid gap-5 md:grid-cols-2">
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
          </FieldGroup>
        </CardContent>
      </Card>

      <Card className="border-border/70 bg-card/80 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="text-muted-foreground size-5" />
            {t("footer.title")}
          </CardTitle>
          <CardDescription>{t("footer.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup className="grid gap-5 md:grid-cols-2">
            <Field data-invalid={!!form.errors.footerDescriptionAr}>
              <FieldLabel htmlFor="ws-footer-ar">
                {t("footer.descriptionAr")}
              </FieldLabel>
              <FieldContent>
                <Textarea
                  id="ws-footer-ar"
                  key={form.key("footerDescriptionAr")}
                  {...form.getInputProps("footerDescriptionAr")}
                  disabled={isLoading}
                  rows={3}
                  dir="rtl"
                  aria-invalid={!!form.errors.footerDescriptionAr}
                />
                {form.errors.footerDescriptionAr ? (
                  <FieldError>
                    {String(form.errors.footerDescriptionAr)}
                  </FieldError>
                ) : null}
              </FieldContent>
            </Field>
            <Field data-invalid={!!form.errors.footerDescriptionEn}>
              <FieldLabel htmlFor="ws-footer-en">
                {t("footer.descriptionEn")}
              </FieldLabel>
              <FieldContent>
                <Textarea
                  id="ws-footer-en"
                  key={form.key("footerDescriptionEn")}
                  {...form.getInputProps("footerDescriptionEn")}
                  disabled={isLoading}
                  rows={3}
                  aria-invalid={!!form.errors.footerDescriptionEn}
                />
                {form.errors.footerDescriptionEn ? (
                  <FieldError>
                    {String(form.errors.footerDescriptionEn)}
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
