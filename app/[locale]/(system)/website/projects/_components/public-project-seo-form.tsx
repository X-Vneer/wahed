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
import { handleFormErrors } from "@/utils/handle-form-errors"
import {
  type WebsitePageSeoValues,
  websitePageSeoSchema,
} from "@/schemas/website-page-seo"
import apiClient from "@/services"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Search, X } from "lucide-react"
import { useForm } from "@mantine/form"
import { zod4Resolver } from "mantine-form-zod-resolver"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import axios from "axios"

type FormModel = WebsitePageSeoValues & { root?: string }

type SeoResponse = {
  page: WebsitePageSeoValues
  fallback: WebsitePageSeoValues
}

const emptyValues: WebsitePageSeoValues = {
  metaTitleAr: "",
  metaTitleEn: "",
  metaDescriptionAr: "",
  metaDescriptionEn: "",
  canonicalUrl: "",
  ogImageUrl: "",
  twitterHandle: "",
  keywordsAr: "",
  keywordsEn: "",
  robotsAllowIndex: true,
}

type Props = {
  projectId: string
}

export function PublicProjectSeoForm({ projectId }: Props) {
  const t = useTranslations("websiteCms.pageSeo")
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery<SeoResponse, Error>({
    queryKey: ["website", "public-project-seo", projectId],
    queryFn: async () => {
      const response = await apiClient.get<SeoResponse>(
        `/api/website/public-projects/${projectId}/seo`
      )
      return response.data
    },
    enabled: Boolean(projectId),
  })

  const form = useForm<FormModel>({
    mode: "controlled",
    initialValues: data?.page ?? emptyValues,
    validate: zod4Resolver(websitePageSeoSchema),
  })

  const handleSubmit = async (values: WebsitePageSeoValues) => {
    form.clearFieldError("root")
    try {
      await apiClient.put(
        `/api/website/public-projects/${projectId}/seo`,
        values
      )
      await queryClient.invalidateQueries({
        queryKey: ["website", "public-project-seo", projectId],
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

  const fallback = data?.fallback ?? emptyValues
  const prefix = `project-${projectId}`

  return (
    <Card className="border-border/70 bg-card/80 backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Search className="text-muted-foreground size-5" />
          {t("title")}
        </CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={form.onSubmit(handleSubmit)}
          className="flex flex-col gap-5"
        >
          <FieldGroup className="grid gap-5 md:grid-cols-2">
            <Field data-invalid={!!form.errors.metaTitleAr}>
              <FieldLabel htmlFor={`${prefix}-meta-title-ar`}>
                {t("fields.metaTitleAr")}
              </FieldLabel>
              <FieldDescription>{t("requiredHint")}</FieldDescription>
              <FieldContent>
                <Input
                  id={`${prefix}-meta-title-ar`}
                  key={form.key("metaTitleAr")}
                  {...form.getInputProps("metaTitleAr")}
                  placeholder={fallback.metaTitleAr}
                  dir="rtl"
                  disabled={isLoading}
                  aria-invalid={!!form.errors.metaTitleAr}
                />
                {form.errors.metaTitleAr ? (
                  <FieldError>{String(form.errors.metaTitleAr)}</FieldError>
                ) : null}
              </FieldContent>
            </Field>
            <Field data-invalid={!!form.errors.metaTitleEn}>
              <FieldLabel htmlFor={`${prefix}-meta-title-en`}>
                {t("fields.metaTitleEn")}
              </FieldLabel>
              <FieldDescription>{t("requiredHint")}</FieldDescription>
              <FieldContent>
                <Input
                  id={`${prefix}-meta-title-en`}
                  key={form.key("metaTitleEn")}
                  {...form.getInputProps("metaTitleEn")}
                  placeholder={fallback.metaTitleEn}
                  disabled={isLoading}
                  aria-invalid={!!form.errors.metaTitleEn}
                />
                {form.errors.metaTitleEn ? (
                  <FieldError>{String(form.errors.metaTitleEn)}</FieldError>
                ) : null}
              </FieldContent>
            </Field>
            <Field
              className="md:col-span-2"
              data-invalid={!!form.errors.metaDescriptionAr}
            >
              <FieldLabel htmlFor={`${prefix}-meta-description-ar`}>
                {t("fields.metaDescriptionAr")}
              </FieldLabel>
              <FieldDescription>{t("requiredHint")}</FieldDescription>
              <FieldContent>
                <Textarea
                  id={`${prefix}-meta-description-ar`}
                  key={form.key("metaDescriptionAr")}
                  {...form.getInputProps("metaDescriptionAr")}
                  placeholder={fallback.metaDescriptionAr}
                  rows={3}
                  dir="rtl"
                  disabled={isLoading}
                  aria-invalid={!!form.errors.metaDescriptionAr}
                />
                {form.errors.metaDescriptionAr ? (
                  <FieldError>
                    {String(form.errors.metaDescriptionAr)}
                  </FieldError>
                ) : null}
              </FieldContent>
            </Field>
            <Field
              className="md:col-span-2"
              data-invalid={!!form.errors.metaDescriptionEn}
            >
              <FieldLabel htmlFor={`${prefix}-meta-description-en`}>
                {t("fields.metaDescriptionEn")}
              </FieldLabel>
              <FieldDescription>{t("requiredHint")}</FieldDescription>
              <FieldContent>
                <Textarea
                  id={`${prefix}-meta-description-en`}
                  key={form.key("metaDescriptionEn")}
                  {...form.getInputProps("metaDescriptionEn")}
                  placeholder={fallback.metaDescriptionEn}
                  rows={3}
                  disabled={isLoading}
                  aria-invalid={!!form.errors.metaDescriptionEn}
                />
                {form.errors.metaDescriptionEn ? (
                  <FieldError>
                    {String(form.errors.metaDescriptionEn)}
                  </FieldError>
                ) : null}
              </FieldContent>
            </Field>
            <Field data-invalid={!!form.errors.canonicalUrl}>
              <FieldLabel htmlFor={`${prefix}-canonical-url`}>
                {t("fields.canonicalUrl")}
              </FieldLabel>
              <FieldDescription>{t("optionalHint")}</FieldDescription>
              <FieldContent>
                <Input
                  id={`${prefix}-canonical-url`}
                  type="url"
                  key={form.key("canonicalUrl")}
                  {...form.getInputProps("canonicalUrl")}
                  placeholder={fallback.canonicalUrl}
                  disabled={isLoading}
                  aria-invalid={!!form.errors.canonicalUrl}
                />
                {form.errors.canonicalUrl ? (
                  <FieldError>{String(form.errors.canonicalUrl)}</FieldError>
                ) : null}
              </FieldContent>
            </Field>
            <Field data-invalid={!!form.errors.ogImageUrl}>
              <FieldLabel>{t("fields.ogImageUrl")}</FieldLabel>
              <FieldDescription>{t("optionalHint")}</FieldDescription>
              {form.errors.ogImageUrl ? (
                <FieldContent>
                  <FieldError>{String(form.errors.ogImageUrl)}</FieldError>
                </FieldContent>
              ) : null}
              {!form.values.ogImageUrl ? (
                <div className="bg-muted/40 mt-2 rounded-xl border border-dashed p-4">
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
                <div className="bg-muted/30 mt-2 flex max-w-md flex-col gap-3 rounded-xl border p-3">
                  <div className="bg-background relative aspect-[1200/630] w-full overflow-hidden rounded-lg border">
                    <img
                      src={form.values.ogImageUrl}
                      alt=""
                      className="size-full object-contain"
                    />
                    <Button
                      size="icon"
                      type="button"
                      variant="destructive"
                      className="absolute top-1.5 right-1.5 size-7"
                      onClick={() => form.setFieldValue("ogImageUrl", "")}
                      aria-label={t("removeOgImage")}
                      disabled={isLoading}
                    >
                      <X className="size-3.5" />
                    </Button>
                  </div>
                </div>
              )}
            </Field>
            <Field data-invalid={!!form.errors.twitterHandle}>
              <FieldLabel htmlFor={`${prefix}-twitter-handle`}>
                {t("fields.twitterHandle")}
              </FieldLabel>
              <FieldDescription>{t("optionalHint")}</FieldDescription>
              <FieldContent>
                <Input
                  id={`${prefix}-twitter-handle`}
                  key={form.key("twitterHandle")}
                  {...form.getInputProps("twitterHandle")}
                  placeholder={fallback.twitterHandle}
                  disabled={isLoading}
                  aria-invalid={!!form.errors.twitterHandle}
                />
                {form.errors.twitterHandle ? (
                  <FieldError>{String(form.errors.twitterHandle)}</FieldError>
                ) : null}
              </FieldContent>
            </Field>
            <Field data-invalid={!!form.errors.keywordsAr}>
              <FieldLabel htmlFor={`${prefix}-keywords-ar`}>
                {t("fields.keywordsAr")}
              </FieldLabel>
              <FieldDescription>{t("optionalHint")}</FieldDescription>
              <FieldContent>
                <Input
                  id={`${prefix}-keywords-ar`}
                  key={form.key("keywordsAr")}
                  {...form.getInputProps("keywordsAr")}
                  placeholder={fallback.keywordsAr}
                  dir="rtl"
                  disabled={isLoading}
                  aria-invalid={!!form.errors.keywordsAr}
                />
                {form.errors.keywordsAr ? (
                  <FieldError>{String(form.errors.keywordsAr)}</FieldError>
                ) : null}
              </FieldContent>
            </Field>
            <Field data-invalid={!!form.errors.keywordsEn}>
              <FieldLabel htmlFor={`${prefix}-keywords-en`}>
                {t("fields.keywordsEn")}
              </FieldLabel>
              <FieldDescription>{t("optionalHint")}</FieldDescription>
              <FieldContent>
                <Input
                  id={`${prefix}-keywords-en`}
                  key={form.key("keywordsEn")}
                  {...form.getInputProps("keywordsEn")}
                  placeholder={fallback.keywordsEn}
                  disabled={isLoading}
                  aria-invalid={!!form.errors.keywordsEn}
                />
                {form.errors.keywordsEn ? (
                  <FieldError>{String(form.errors.keywordsEn)}</FieldError>
                ) : null}
              </FieldContent>
            </Field>
          </FieldGroup>

          <Field orientation="horizontal" className="items-center gap-3">
            <Switch
              id={`${prefix}-robots-index`}
              checked={form.values.robotsAllowIndex}
              onCheckedChange={(checked) =>
                form.setFieldValue("robotsAllowIndex", checked)
              }
              disabled={isLoading}
            />
            <div className="flex flex-col gap-1">
              <FieldLabel htmlFor={`${prefix}-robots-index`}>
                {t("fields.robotsAllowIndex")}
              </FieldLabel>
              <FieldDescription>{t("robotsHint")}</FieldDescription>
            </div>
          </Field>

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
            {form.submitting ? <Spinner className="size-4" /> : t("save")}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
