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
  FieldDescription,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useProjectCategories } from "@/hooks/use-project-categories"
import { usePublicProjectBadges } from "@/hooks/use-public-project-badges"
import { usePublicProjectFeatures } from "@/hooks/use-public-project-features"
import { cn } from "@/lib/utils"
import { useTranslations } from "next-intl"
import { usePublicProjectFormContext } from "../public-project-form-context"

export function PublicProjectFormStepPublish() {
  const form = usePublicProjectFormContext()
  const t = useTranslations()

  const { data: categoriesRes } = useProjectCategories()
  const categories = categoriesRes?.data?.data ?? []
  const { data: badges = [], isLoading: badgesLoading } =
    usePublicProjectBadges()
  const { data: features = [], isLoading: featuresLoading } =
    usePublicProjectFeatures()

  return (
    <div className="space-y-8">
      <FieldSet className="gap-6">
        <FieldLegend>
          {t("websiteCms.projects.publicProjectForm.sections.taxonomy")}
        </FieldLegend>
        <Field>
          <FieldLabel htmlFor="pp-categories">
            {t("websiteCms.projects.publicProjectForm.fields.categories")}
          </FieldLabel>
          <Select
            multiple
            value={form.values.categoryIds}
            onValueChange={(value) => form.setFieldValue("categoryIds", value)}
          >
            <SelectTrigger id="pp-categories" className="w-full">
              <SelectValue>
                {form.values.categoryIds.length > 0
                  ? form.values.categoryIds
                      .map((id) => categories.find((c) => c.id === id)?.name)
                      .filter(Boolean)
                      .join(", ")
                  : t(
                      "websiteCms.projects.publicProjectForm.placeholders.categories"
                    )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {categories.length === 0 ? (
                <div className="text-muted-foreground px-2 py-2 text-sm">
                  {t("websiteCms.projects.publicProjectForm.ui.noCategories")}
                </div>
              ) : (
                categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </Field>

        <Field>
          <FieldLabel htmlFor="pp-badges">
            {t("websiteCms.projects.publicProjectForm.fields.badges")}
          </FieldLabel>
          <FieldDescription>
            {t("websiteCms.projects.publicProjectForm.ui.badgesHint")}
          </FieldDescription>
          <Select
            multiple
            value={form.values.badgeIds}
            onValueChange={(value) => form.setFieldValue("badgeIds", value)}
            disabled={badgesLoading || badges.length === 0}
          >
            <SelectTrigger
              id="pp-badges"
              className={cn("w-full", badges.length === 0 && "opacity-70")}
            >
              <SelectValue>
                {badgesLoading
                  ? t("common.loading")
                  : form.values.badgeIds.length > 0
                    ? form.values.badgeIds
                        .map((id) => badges.find((b) => b.id === id)?.nameEn)
                        .filter(Boolean)
                        .join(", ")
                    : t(
                        "websiteCms.projects.publicProjectForm.placeholders.badges"
                      )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {badges.length === 0 ? (
                <div className="text-muted-foreground px-2 py-2 text-sm">
                  {t("websiteCms.projects.publicProjectForm.ui.noBadges")}
                </div>
              ) : (
                badges.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.nameEn} / {b.nameAr}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </Field>

        <Field>
          <FieldLabel htmlFor="pp-features">
            {t("websiteCms.projects.publicProjectForm.fields.features")}
          </FieldLabel>
          <FieldDescription>
            {t("websiteCms.projects.publicProjectForm.ui.featuresHint")}
          </FieldDescription>
          <Select
            multiple
            value={form.values.featureIds}
            onValueChange={(value) => form.setFieldValue("featureIds", value)}
            disabled={featuresLoading || features.length === 0}
          >
            <SelectTrigger
              id="pp-features"
              className={cn("w-full", features.length === 0 && "opacity-70")}
            >
              <SelectValue>
                {featuresLoading
                  ? t("common.loading")
                  : form.values.featureIds.length > 0
                    ? form.values.featureIds
                        .map(
                          (id) => features.find((f) => f.id === id)?.labelEn
                        )
                        .filter(Boolean)
                        .join(", ")
                    : t(
                        "websiteCms.projects.publicProjectForm.placeholders.features"
                      )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {features.length === 0 ? (
                <div className="text-muted-foreground px-2 py-2 text-sm">
                  {t("websiteCms.projects.publicProjectForm.ui.noFeatures")}
                </div>
              ) : (
                features.map((f) => (
                  <SelectItem key={f.id} value={f.id}>
                    {f.labelEn} — {f.icon}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </Field>
      </FieldSet>

      <FieldSet className="gap-6">
        <FieldLegend>
          {t("websiteCms.projects.publicProjectForm.sections.pricing")}
        </FieldLegend>
        <div className="grid gap-4 md:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="pp-start-price">
              {t(
                "websiteCms.projects.publicProjectForm.fields.startingPrice"
              )}
            </FieldLabel>
            <Input
              id="pp-start-price"
              type="number"
              step="0.01"
              min={0}
              key={form.key("startingPrice")}
              {...form.getInputProps("startingPrice")}
              placeholder={t(
                "websiteCms.projects.publicProjectForm.placeholders.price"
              )}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="pp-end-price">
              {t("websiteCms.projects.publicProjectForm.fields.endingPrice")}
            </FieldLabel>
            <Input
              id="pp-end-price"
              type="number"
              step="0.01"
              min={0}
              key={form.key("endingPrice")}
              {...form.getInputProps("endingPrice")}
              placeholder={t(
                "websiteCms.projects.publicProjectForm.placeholders.price"
              )}
            />
          </Field>
        </div>
      </FieldSet>

      <Card className="shadow-none ring-0">
        <CardHeader>
          <CardTitle className="text-base">
            {t("websiteCms.projects.publicProjectForm.actions.submitSection")}
          </CardTitle>
          <CardDescription>
            {t("websiteCms.projects.publicProjectForm.actions.submitHint")}
          </CardDescription>
        </CardHeader>
        {form.errors.root ? (
          <CardContent className="pt-0">
            <p className="text-destructive text-sm">{form.errors.root}</p>
          </CardContent>
        ) : null}
      </Card>
    </div>
  )
}
