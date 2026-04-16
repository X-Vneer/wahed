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
import Uploader from "@/components/uploader"
import { useProjectCategories } from "@/hooks/use-project-categories"
import { ImageUp, Plus, Trash2, X } from "lucide-react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import type {
  PublicProjectFormBadge,
  PublicProjectFormFeature,
} from "../public-project-form-context"
import { usePublicProjectFormContext } from "../public-project-form-context"

export function PublicProjectFormStepPublish() {
  const form = usePublicProjectFormContext()
  const t = useTranslations()

  const { data: categoriesRes } = useProjectCategories()
  const categories = categoriesRes?.data?.data ?? []

  const addBadge = () => {
    form.insertListItem("badges", {
      nameAr: "",
      nameEn: "",
      color: "#6366f1",
    } satisfies PublicProjectFormBadge)
  }

  const removeBadge = (index: number) => {
    form.removeListItem("badges", index)
  }

  const addFeature = () => {
    form.insertListItem("features", {
      labelAr: "",
      labelEn: "",
      valueAr: "",
      valueEn: "",
      icon: "",
    } satisfies PublicProjectFormFeature)
  }

  const removeFeature = (index: number) => {
    form.removeListItem("features", index)
  }

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
            value={form.getValues().categoryIds}
            onValueChange={(value) => form.setFieldValue("categoryIds", value)}
          >
            <SelectTrigger id="pp-categories" className="w-full">
              <SelectValue>
                {form.getValues().categoryIds.length > 0
                  ? form.getValues().categoryIds
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
      </FieldSet>

      {/* Badges */}
      <FieldSet className="gap-6">
        <div className="flex items-center justify-between">
          <div>
            <FieldLegend>
              {t("websiteCms.projects.publicProjectForm.fields.badges")}
            </FieldLegend>
            <FieldDescription className="mt-1">
              {t("websiteCms.projects.publicProjectForm.ui.badgesHint")}
            </FieldDescription>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={addBadge}>
            <Plus className="mr-1.5 size-4" />
            {t("common.add")}
          </Button>
        </div>

        {form.getValues().badges.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            {t("websiteCms.projects.publicProjectForm.ui.noBadgesAdded")}
          </p>
        ) : (
          <div className="space-y-4">
            {form.getValues().badges.map((_badge, index) => (
              <Card key={index} className="shadow-none">
                <CardContent className="space-y-4 pt-4">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-muted-foreground text-sm font-medium">
                      {t(
                        "websiteCms.projects.publicProjectForm.fields.badges"
                      )}{" "}
                      #{index + 1}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive size-8"
                      onClick={() => removeBadge(index)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field>
                      <FieldLabel htmlFor={`pp-badge-${index}-nameAr`}>
                        {t(
                          "websiteCms.projects.publicProjectForm.fields.badgeNameAr"
                        )}
                      </FieldLabel>
                      <Input
                        id={`pp-badge-${index}-nameAr`}
                        key={form.key(`badges.${index}.nameAr`)}
                        {...form.getInputProps(`badges.${index}.nameAr`)}
                        dir="rtl"
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor={`pp-badge-${index}-nameEn`}>
                        {t(
                          "websiteCms.projects.publicProjectForm.fields.badgeNameEn"
                        )}
                      </FieldLabel>
                      <Input
                        id={`pp-badge-${index}-nameEn`}
                        key={form.key(`badges.${index}.nameEn`)}
                        {...form.getInputProps(`badges.${index}.nameEn`)}
                      />
                    </Field>
                  </div>
                  <Field>
                    <FieldLabel htmlFor={`pp-badge-${index}-color`}>
                      {t(
                        "websiteCms.projects.publicProjectForm.fields.badgeColor"
                      )}
                    </FieldLabel>
                    <div className="flex items-center gap-3">
                      <Input
                        id={`pp-badge-${index}-color`}
                        type="color"
                        className="h-10 w-16 cursor-pointer p-1"
                        key={form.key(`badges.${index}.color`)}
                        {...form.getInputProps(`badges.${index}.color`)}
                      />
                      <Input
                        key={form.key(`badges.${index}.color`) + "-text"}
                        {...form.getInputProps(`badges.${index}.color`)}
                        className="flex-1"
                        placeholder="#6366f1"
                      />
                    </div>
                  </Field>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </FieldSet>

      {/* Features */}
      <FieldSet className="gap-6">
        <div className="flex items-center justify-between">
          <div>
            <FieldLegend>
              {t("websiteCms.projects.publicProjectForm.fields.features")}
            </FieldLegend>
            <FieldDescription className="mt-1">
              {t("websiteCms.projects.publicProjectForm.ui.featuresHint")}
            </FieldDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addFeature}
          >
            <Plus className="mr-1.5 size-4" />
            {t("common.add")}
          </Button>
        </div>

        {form.getValues().features.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            {t("websiteCms.projects.publicProjectForm.ui.noFeaturesAdded")}
          </p>
        ) : (
          <div className="space-y-4">
            {form.getValues().features.map((_feature, index) => (
              <Card key={index} className="shadow-none">
                <CardContent className="space-y-4 pt-4">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-muted-foreground text-sm font-medium">
                      {t(
                        "websiteCms.projects.publicProjectForm.fields.features"
                      )}{" "}
                      #{index + 1}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive size-8"
                      onClick={() => removeFeature(index)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field>
                      <FieldLabel htmlFor={`pp-feature-${index}-labelAr`}>
                        {t(
                          "websiteCms.projects.publicProjectForm.fields.featureLabelAr"
                        )}
                      </FieldLabel>
                      <Input
                        id={`pp-feature-${index}-labelAr`}
                        key={form.key(`features.${index}.labelAr`)}
                        {...form.getInputProps(`features.${index}.labelAr`)}
                        dir="rtl"
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor={`pp-feature-${index}-labelEn`}>
                        {t(
                          "websiteCms.projects.publicProjectForm.fields.featureLabelEn"
                        )}
                      </FieldLabel>
                      <Input
                        id={`pp-feature-${index}-labelEn`}
                        key={form.key(`features.${index}.labelEn`)}
                        {...form.getInputProps(`features.${index}.labelEn`)}
                      />
                    </Field>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field>
                      <FieldLabel htmlFor={`pp-feature-${index}-valueAr`}>
                        {t(
                          "websiteCms.projects.publicProjectForm.fields.featureValueAr"
                        )}
                      </FieldLabel>
                      <Input
                        id={`pp-feature-${index}-valueAr`}
                        key={form.key(`features.${index}.valueAr`)}
                        {...form.getInputProps(`features.${index}.valueAr`)}
                        dir="rtl"
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor={`pp-feature-${index}-valueEn`}>
                        {t(
                          "websiteCms.projects.publicProjectForm.fields.featureValueEn"
                        )}
                      </FieldLabel>
                      <Input
                        id={`pp-feature-${index}-valueEn`}
                        key={form.key(`features.${index}.valueEn`)}
                        {...form.getInputProps(`features.${index}.valueEn`)}
                      />
                    </Field>
                  </div>
                  <Field>
                    <FieldLabel id={`pp-feature-${index}-icon-label`}>
                      {t(
                        "websiteCms.projects.publicProjectForm.fields.featureIcon"
                      )}
                    </FieldLabel>
                    <FieldDescription>
                      {t(
                        "websiteCms.projects.publicProjectForm.ui.featureIconHint"
                      )}
                    </FieldDescription>
                    {!form.getValues().features[index]?.icon ? (
                      <div className="mt-2 flex items-center gap-3">
                        <div className="bg-primary/10 flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-dashed border-primary/30">
                          <ImageUp className="text-primary size-6" />
                        </div>
                        <Uploader
                          variant="button"
                          endpoint="websiteImageUploader"
                          onClientUploadComplete={(res) => {
                            if (res?.length) {
                              form.setFieldValue(
                                `features.${index}.icon`,
                                res[0].ufsUrl
                              )
                            }
                          }}
                          onUploadError={(err: Error) => {
                            toast.error(
                              err.message ||
                                t("errors.internal_server_error")
                            )
                          }}
                        />
                      </div>
                    ) : (
                      <div className="mt-2 flex items-center gap-3">
                        <div className="bg-primary/5 relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-primary/20">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={form.getValues().features[index].icon}
                            alt=""
                            className="h-full w-full object-contain p-1"
                          />
                        </div>
                        <Uploader
                          variant="button"
                          endpoint="websiteImageUploader"
                          onClientUploadComplete={(res) => {
                            if (res?.length) {
                              form.setFieldValue(
                                `features.${index}.icon`,
                                res[0].ufsUrl
                              )
                            }
                          }}
                          onUploadError={(err: Error) => {
                            toast.error(
                              err.message ||
                                t("errors.internal_server_error")
                            )
                          }}
                        />
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="text-destructive hover:text-destructive size-8"
                          onClick={() =>
                            form.setFieldValue(
                              `features.${index}.icon`,
                              ""
                            )
                          }
                          aria-label={t(
                            "websiteCms.projects.publicProjectForm.ui.removeFeatureIcon"
                          )}
                        >
                          <X className="size-4" />
                        </Button>
                      </div>
                    )}
                  </Field>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
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
