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
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import Uploader from "@/components/uploader"
import type { UseFormReturnType } from "@mantine/form"
import { Search, X } from "lucide-react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import type { FormModel } from "./form-model"

type Props = {
  form: UseFormReturnType<FormModel>
  isLoading: boolean
}

export function SeoSection({ form, isLoading }: Props) {
  const t = useTranslations("websiteCms.settings")

  return (
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
              <FieldLabel htmlFor="ws-kw-ar">{t("seo.keywordsAr")}</FieldLabel>
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
              <FieldLabel htmlFor="ws-kw-en">{t("seo.keywordsEn")}</FieldLabel>
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
              onCheckedChange={(c) => form.setFieldValue("robotsAllowIndex", c)}
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
  )
}
