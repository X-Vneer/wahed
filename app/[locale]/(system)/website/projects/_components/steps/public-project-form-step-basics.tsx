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
import apiClient from "@/services"
import { useQuery } from "@tanstack/react-query"
import { useTranslations } from "next-intl"
import { slugFromEnglishTitle } from "../public-project-form-constants"
import { usePublicProjectFormContext } from "../public-project-form-context"
import { usePublicProjectFieldErr } from "../use-public-project-field-err"

type PublicProjectFormStepBasicsProps = {
  manualPrefillLoading: boolean
  onLoadFromInternalProject: () => void
}

const MAX_FEATURED = 2

export function PublicProjectFormStepBasics({
  manualPrefillLoading,
  onLoadFromInternalProject,
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
    featuredCount >= MAX_FEATURED && !form.values.isFeatured

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

        <Field data-invalid={!!form.errors.slug}>
          <FieldLabel htmlFor="pp-slug">
            {t("websiteCms.projects.publicProjectForm.fields.slug")}
          </FieldLabel>
          <FieldDescription>
            {t("websiteCms.projects.publicProjectForm.ui.slugHint")}
          </FieldDescription>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Input
              id="pp-slug"
              key={form.key("slug")}
              {...form.getInputProps("slug")}
              placeholder={t(
                "websiteCms.projects.publicProjectForm.placeholders.slug"
              )}
              className="sm:flex-1"
              aria-invalid={!!form.errors.slug}
            />
            <Button
              type="button"
              variant="outline"
              className="shrink-0"
              onClick={() => {
                const next = slugFromEnglishTitle(form.values.titleEn)
                if (next) form.setFieldValue("slug", next)
              }}
            >
              {t(
                "websiteCms.projects.publicProjectForm.actions.generateSlug"
              )}
            </Button>
          </div>
          {form.errors.slug ? (
            <FieldError errors={fieldErr("slug")!} />
          ) : null}
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
            checked={form.values.isActive}
            onCheckedChange={(c) =>
              form.setFieldValue("isActive", Boolean(c))
            }
          />
        </div>

        <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
          <div>
            <p className="text-sm font-medium">
              {t("websiteCms.projects.publicProjectForm.fields.isFeatured")}
            </p>
            <p className="text-muted-foreground text-sm">
              {featuredLimitReached
                ? t("websiteCms.projects.publicProjectForm.ui.isFeaturedLimitReached")
                : t("websiteCms.projects.publicProjectForm.ui.isFeaturedHint")}
            </p>
          </div>
          <Switch
            checked={form.values.isFeatured}
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
            <FieldError
              errors={[{ message: String(form.errors.projectId) }]}
            />
          ) : null}
        </Field>
      </FieldSet>

      <FieldSet className="gap-6">
        <FieldLegend>
          {t("websiteCms.projects.publicProjectForm.sections.descriptions")}
        </FieldLegend>
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
