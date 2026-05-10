"use client"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { useCheckSlug } from "@/hooks/use-check-slug"
import apiClient from "@/services"
import { useQuery } from "@tanstack/react-query"
import { CheckCircle2, Loader2, XCircle } from "lucide-react"
import { useTranslations } from "next-intl"
import { useRef } from "react"
import { generateSlug } from "../public-project-form-constants"
import { usePublicProjectFormContext } from "../public-project-form-context"
import { usePublicProjectFieldErr } from "../use-public-project-field-err"

type PublicProjectFormStepBasicsProps = {
  manualPrefillLoading: boolean
  onLoadFromInternalProject: () => void
  /** Pass the current project id in edit mode so its own slug is not flagged as taken. */
  excludeProjectId?: string
}

const MAX_FEATURED = 2

export function PublicProjectFormStepBasics({
  manualPrefillLoading,
  onLoadFromInternalProject,
  excludeProjectId,
}: PublicProjectFormStepBasicsProps) {
  const form = usePublicProjectFormContext()
  const t = useTranslations()
  const fieldErr = usePublicProjectFieldErr()

  const { data: projectsData } = useQuery<{
    projects: { isFeatured: boolean }[]
  }>({
    queryKey: ["website", "public-projects"],
    queryFn: async () => {
      const res = await apiClient.get("/api/website/public-projects")
      return res.data
    },
  })

  const featuredCount =
    projectsData?.projects.filter((p) => p.isFeatured).length ?? 0
  const featuredLimitReached =
    featuredCount >= MAX_FEATURED && !form.getValues().isFeatured

  const slugRef = useRef<HTMLInputElement>(null)

  const {
    setSlug: notifySlugChanged,
    isChecking: slugCheckLoading,
    isTaken: showSlugTaken,
    isAvailable: showSlugAvailable,
  } = useCheckSlug({ excludeId: excludeProjectId })

  return (
    <div className="space-y-8">
      <FieldSet className="gap-6">
        <FieldLegend>
          {t("websiteCms.projects.publicProjectForm.sections.core")}
        </FieldLegend>
        <div className="grid gap-4 md:grid-cols-2">
          <Field data-invalid={!!form.errors.titleAr}>
            <FieldLabel htmlFor="pp-title-ar">
              {t("websiteCms.projects.publicProjectForm.fields.titleAr")}
            </FieldLabel>
            <Input
              id="pp-title-ar"
              key={form.key("titleAr")}
              {...form.getInputProps("titleAr")}
              placeholder={t(
                "websiteCms.projects.publicProjectForm.placeholders.titleAr"
              )}
              aria-invalid={!!form.errors.titleAr}
            />
            {form.errors.titleAr ? (
              <FieldError errors={fieldErr("titleAr")!} />
            ) : null}
          </Field>
          <Field data-invalid={!!form.errors.titleEn}>
            <FieldLabel htmlFor="pp-title-en">
              {t("websiteCms.projects.publicProjectForm.fields.titleEn")}
            </FieldLabel>
            <Input
              id="pp-title-en"
              key={form.key("titleEn")}
              {...form.getInputProps("titleEn")}
              placeholder={t(
                "websiteCms.projects.publicProjectForm.placeholders.titleEn"
              )}
              aria-invalid={!!form.errors.titleEn}
            />
            {form.errors.titleEn ? (
              <FieldError errors={fieldErr("titleEn")!} />
            ) : null}
          </Field>
        </div>

        <Field data-invalid={!!form.errors.slug || showSlugTaken}>
          <FieldLabel htmlFor="pp-slug">
            {t("websiteCms.projects.publicProjectForm.fields.slug")}
          </FieldLabel>
          <FieldDescription>
            {t("websiteCms.projects.publicProjectForm.ui.slugHint")}
          </FieldDescription>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Input
              ref={slugRef}
              id="pp-slug"
              defaultValue={form.getValues().slug}
              onChange={(e) => {
                const raw = e.currentTarget.value
                const sanitized = raw
                  .toLowerCase()
                  .replace(/\s+/g, "-")
                  .replace(/[^a-z0-9-]/g, "")
                if (sanitized !== raw) {
                  e.currentTarget.value = sanitized
                }
                notifySlugChanged(sanitized)
              }}
              onBlur={(e) => {
                form.setFieldValue("slug", e.currentTarget.value)
              }}
              placeholder={t(
                "websiteCms.projects.publicProjectForm.placeholders.slug"
              )}
              className="sm:flex-1"
              dir="ltr"
              aria-invalid={!!form.errors.slug || showSlugTaken}
            />
            <Button
              type="button"
              variant="outline"
              className="shrink-0"
              onClick={() => {
                const next = generateSlug(form.getValues().titleEn)
                if (next) {
                  form.setFieldValue("slug", next)
                  if (slugRef.current) slugRef.current.value = next
                  notifySlugChanged(next)
                }
              }}
            >
              {t("websiteCms.projects.publicProjectForm.actions.generateSlug")}
            </Button>
          </div>
          {slugCheckLoading ? (
            <p className="text-muted-foreground flex items-center gap-1.5 text-sm">
              <Loader2 className="size-3.5 animate-spin" />
              {t("websiteCms.projects.publicProjectForm.ui.slugChecking")}
            </p>
          ) : showSlugTaken ? (
            <p className="text-destructive flex items-center gap-1.5 text-sm">
              <XCircle className="size-3.5" />
              {t("websiteCms.projects.publicProjectForm.errors.slugTaken")}
            </p>
          ) : showSlugAvailable ? (
            <p className="flex items-center gap-1.5 text-sm text-green-600">
              <CheckCircle2 className="size-3.5" />
              {t("websiteCms.projects.publicProjectForm.ui.slugAvailable")}
            </p>
          ) : null}
          {form.errors.slug ? <FieldError errors={fieldErr("slug")!} /> : null}
        </Field>

        <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
          <div>
            <p className="text-sm font-medium">
              {t("websiteCms.projects.publicProjectForm.fields.isActive")}
            </p>
            <p className="text-muted-foreground text-sm">
              {t("websiteCms.projects.publicProjectForm.ui.isActiveHint")}
            </p>
          </div>
          <Switch
            checked={form.getValues().isActive}
            onCheckedChange={(c) => form.setFieldValue("isActive", Boolean(c))}
          />
        </div>

        <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
          <div>
            <p className="text-sm font-medium">
              {t("websiteCms.projects.publicProjectForm.fields.isFeatured")}
            </p>
            <p className="text-muted-foreground text-sm">
              {featuredLimitReached
                ? t(
                    "websiteCms.projects.publicProjectForm.ui.isFeaturedLimitReached"
                  )
                : t("websiteCms.projects.publicProjectForm.ui.isFeaturedHint")}
            </p>
          </div>
          <Switch
            checked={form.getValues().isFeatured}
            disabled={featuredLimitReached}
            onCheckedChange={(c) =>
              form.setFieldValue("isFeatured", Boolean(c))
            }
          />
        </div>

        <Field data-invalid={!!form.errors.projectId}>
          <FieldLabel htmlFor="pp-project-id">
            {t("websiteCms.projects.publicProjectForm.fields.linkedProjectId")}
          </FieldLabel>
          <FieldDescription>
            {t("websiteCms.projects.publicProjectForm.ui.linkedProjectHint")}
          </FieldDescription>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
            <Input
              id="pp-project-id"
              key={form.key("projectId")}
              {...form.getInputProps("projectId")}
              placeholder={t(
                "websiteCms.projects.publicProjectForm.placeholders.linkedProjectId"
              )}
              className="sm:flex-1"
              aria-invalid={!!form.errors.projectId}
            />
            <Button
              type="button"
              variant="secondary"
              className="shrink-0"
              disabled={manualPrefillLoading || form.submitting}
              onClick={() => void onLoadFromInternalProject()}
            >
              {manualPrefillLoading
                ? t("common.loading")
                : t(
                    "websiteCms.projects.publicProjectForm.actions.loadFromProject"
                  )}
            </Button>
          </div>
          {form.errors.projectId ? (
            <FieldError errors={[{ message: String(form.errors.projectId) }]} />
          ) : null}
        </Field>
      </FieldSet>

      <FieldSet className="gap-6">
        <FieldLegend>
          {t("websiteCms.projects.publicProjectForm.sections.descriptions")}
        </FieldLegend>
        <div className="grid gap-4 md:grid-cols-2">
          <Field data-invalid={!!form.errors.eyebrowAr}>
            <FieldLabel htmlFor="pp-eyebrow-ar">
              {t("websiteCms.projects.publicProjectForm.fields.eyebrowAr")}
            </FieldLabel>
            <Input
              id="pp-eyebrow-ar"
              key={form.key("eyebrowAr")}
              {...form.getInputProps("eyebrowAr")}
              placeholder={t(
                "websiteCms.projects.publicProjectForm.placeholders.eyebrowAr"
              )}
              aria-invalid={!!form.errors.eyebrowAr}
            />
            {form.errors.eyebrowAr ? (
              <FieldError errors={fieldErr("eyebrowAr")!} />
            ) : null}
          </Field>
          <Field data-invalid={!!form.errors.eyebrowEn}>
            <FieldLabel htmlFor="pp-eyebrow-en">
              {t("websiteCms.projects.publicProjectForm.fields.eyebrowEn")}
            </FieldLabel>
            <Input
              id="pp-eyebrow-en"
              key={form.key("eyebrowEn")}
              {...form.getInputProps("eyebrowEn")}
              placeholder={t(
                "websiteCms.projects.publicProjectForm.placeholders.eyebrowEn"
              )}
              aria-invalid={!!form.errors.eyebrowEn}
            />
            {form.errors.eyebrowEn ? (
              <FieldError errors={fieldErr("eyebrowEn")!} />
            ) : null}
          </Field>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Field data-invalid={!!form.errors.shortDescriptionAr}>
            <FieldLabel htmlFor="pp-short-ar">
              {t(
                "websiteCms.projects.publicProjectForm.fields.shortDescriptionAr"
              )}
            </FieldLabel>
            <Textarea
              id="pp-short-ar"
              key={form.key("shortDescriptionAr")}
              {...form.getInputProps("shortDescriptionAr")}
              placeholder={t(
                "websiteCms.projects.publicProjectForm.placeholders.shortDescription"
              )}
              className="min-h-20"
              aria-invalid={!!form.errors.shortDescriptionAr}
            />
            {form.errors.shortDescriptionAr ? (
              <FieldError errors={fieldErr("shortDescriptionAr")!} />
            ) : null}
          </Field>
          <Field data-invalid={!!form.errors.shortDescriptionEn}>
            <FieldLabel htmlFor="pp-short-en">
              {t(
                "websiteCms.projects.publicProjectForm.fields.shortDescriptionEn"
              )}
            </FieldLabel>
            <Textarea
              id="pp-short-en"
              key={form.key("shortDescriptionEn")}
              {...form.getInputProps("shortDescriptionEn")}
              placeholder={t(
                "websiteCms.projects.publicProjectForm.placeholders.shortDescription"
              )}
              className="min-h-20"
              aria-invalid={!!form.errors.shortDescriptionEn}
            />
            {form.errors.shortDescriptionEn ? (
              <FieldError errors={fieldErr("shortDescriptionEn")!} />
            ) : null}
          </Field>
        </div>
        <Field data-invalid={!!form.errors.descriptionAr}>
          <FieldLabel htmlFor="pp-desc-ar">
            {t("websiteCms.projects.publicProjectForm.fields.descriptionAr")}
          </FieldLabel>
          <Textarea
            id="pp-desc-ar"
            key={form.key("descriptionAr")}
            {...form.getInputProps("descriptionAr")}
            placeholder={t(
              "websiteCms.projects.publicProjectForm.placeholders.description"
            )}
            className="min-h-28"
            aria-invalid={!!form.errors.descriptionAr}
          />
          {form.errors.descriptionAr ? (
            <FieldError errors={fieldErr("descriptionAr")!} />
          ) : null}
        </Field>
        <Field data-invalid={!!form.errors.descriptionEn}>
          <FieldLabel htmlFor="pp-desc-en">
            {t("websiteCms.projects.publicProjectForm.fields.descriptionEn")}
          </FieldLabel>
          <Textarea
            id="pp-desc-en"
            key={form.key("descriptionEn")}
            {...form.getInputProps("descriptionEn")}
            placeholder={t(
              "websiteCms.projects.publicProjectForm.placeholders.description"
            )}
            className="min-h-28"
            aria-invalid={!!form.errors.descriptionEn}
          />
          {form.errors.descriptionEn ? (
            <FieldError errors={fieldErr("descriptionEn")!} />
          ) : null}
        </Field>
      </FieldSet>
    </div>
  )
}
