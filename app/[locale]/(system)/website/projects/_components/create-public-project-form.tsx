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
  FieldError,
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
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  FormFileUpload,
  type UploadedFileAttachment,
} from "@/components/form-file-upload"
import Uploader from "@/components/uploader"
import { useCities } from "@/hooks/use-cities"
import { useProjectCategories } from "@/hooks/use-project-categories"
import { usePublicProjectBadges } from "@/hooks/use-public-project-badges"
import { usePublicProjectFeatures } from "@/hooks/use-public-project-features"
import { usePublicProjectPrefill } from "@/hooks/use-public-project-prefill"
import { useRegions } from "@/hooks/use-regions"
import type { PublicProjectPrefillResponse } from "@/lib/types/public-project-prefill"
import { handleFormErrors } from "@/lib/handle-form-errors"
import { Link, useRouter } from "@/lib/i18n/navigation"
import { publicProjectFormSchema } from "@/lib/schemas/public-project"
import { cn } from "@/lib/utils"
import apiClient from "@/services"
import { useForm } from "@mantine/form"
import { useQueryClient } from "@tanstack/react-query"
import { zod4Resolver } from "mantine-form-zod-resolver"
import axios from "axios"
import { X } from "lucide-react"
import { useTranslations } from "next-intl"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"

const PROJECT_STATUSES = [
  "PLANNING",
  "IN_PROGRESS",
  "ON_HOLD",
  "COMPLETED",
  "CANCELLED",
] as const

const STATUS_LABEL_KEYS: Record<
  (typeof PROJECT_STATUSES)[number],
  | "projects.status.planning"
  | "projects.status.inProgress"
  | "projects.status.onHold"
  | "projects.status.completed"
  | "projects.status.cancelled"
> = {
  PLANNING: "projects.status.planning",
  IN_PROGRESS: "projects.status.inProgress",
  ON_HOLD: "projects.status.onHold",
  COMPLETED: "projects.status.completed",
  CANCELLED: "projects.status.cancelled",
}

function slugFromEnglishTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96)
}

type CreatePublicProjectFormProps = {
  linkedProjectId?: string | null
}

export function CreatePublicProjectForm({
  linkedProjectId,
}: CreatePublicProjectFormProps) {
  const t = useTranslations("websiteCms.projects.publicProjectForm")
  const tErr = useTranslations("websiteCms.projects.publicProjectForm.errors")
  const tCommon = useTranslations()
  const router = useRouter()
  const queryClient = useQueryClient()

  const { data: categoriesRes } = useProjectCategories()
  const { data: regionsRes } = useRegions()
  const { data: badges = [], isLoading: badgesLoading } =
    usePublicProjectBadges()
  const { data: features = [], isLoading: featuresLoading } =
    usePublicProjectFeatures()

  const categories = categoriesRes?.data?.data ?? []
  const regions = regionsRes?.data?.data ?? []

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      regionId: "",
      titleAr: "",
      titleEn: "",
      slug: "",
      descriptionAr: "",
      descriptionEn: "",
      shortDescriptionAr: "",
      shortDescriptionEn: "",
      images: [] as string[],
      isActive: true,
      projectId: linkedProjectId ?? "",
      locationAr: "",
      locationEn: "",
      area: "" as string | number,
      numberOfFloors: "" as string | number,
      deedNumber: "",
      workDuration: "" as string | number,
      googleMapsAddress: "",
      status: "" as "" | (typeof PROJECT_STATUSES)[number],
      cityId: "",
      categoryIds: [] as string[],
      badgeIds: [] as string[],
      featureIds: [] as string[],
      startingPrice: "" as string | number,
      endingPrice: "" as string | number,
      attachments: [] as UploadedFileAttachment[],
    },
    validate: zod4Resolver(publicProjectFormSchema),
  })

  const { data: citiesRes } = useCities(form.values.regionId || null)
  const cities = citiesRes?.data?.data ?? []

  const { data: linkedPrefill } = usePublicProjectPrefill(
    linkedProjectId,
    Boolean(linkedProjectId)
  )
  const appliedPrefillFor = useRef<string | null>(null)
  const [manualPrefillLoading, setManualPrefillLoading] = useState(false)

  const mergePrefillIntoForm = (p: PublicProjectPrefillResponse) => {
    form.setValues((prev) => ({
      ...prev,
      titleAr: p.titleAr,
      titleEn: p.titleEn,
      descriptionAr: p.descriptionAr ?? "",
      descriptionEn: p.descriptionEn ?? "",
      shortDescriptionAr: p.shortDescriptionAr ?? "",
      shortDescriptionEn: p.shortDescriptionEn ?? "",
      cityId: p.cityId,
      regionId: p.regionId,
      area: p.area ?? "",
      numberOfFloors: p.numberOfFloors ?? "",
      deedNumber: p.deedNumber ?? "",
      workDuration: p.workDuration ?? "",
      googleMapsAddress: p.googleMapsAddress ?? "",
      status: p.status,
      categoryIds: [...p.categoryIds],
      images: p.images.length > 0 ? p.images : prev.images,
      attachments:
        p.attachments.length > 0
          ? p.attachments.map((a) => ({
              fileUrl: a.fileUrl,
              fileName: a.fileName ?? a.fileUrl,
              fileType: a.fileType ?? undefined,
              fileSize: a.fileSize ?? undefined,
            }))
          : prev.attachments,
      projectId: prev.projectId.trim() ? prev.projectId : p.projectId,
      slug: prev.slug.trim() ? prev.slug : p.suggestedSlug,
    }))
  }

  useEffect(() => {
    form.setFieldValue("projectId", linkedProjectId ?? "")
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync linked internal project id only
  }, [linkedProjectId])

  useEffect(() => {
    if (!linkedProjectId) {
      appliedPrefillFor.current = null
      return
    }
    if (!linkedPrefill) return
    if (appliedPrefillFor.current === linkedProjectId) return
    appliedPrefillFor.current = linkedProjectId
    mergePrefillIntoForm(linkedPrefill)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- apply server prefill once per linked id
  }, [linkedProjectId, linkedPrefill])

  const handleLoadFromInternalProject = async () => {
    const id = form.values.projectId.trim()
    if (!id) {
      toast.error(t("errors.prefillNeedProjectId"))
      return
    }
    setManualPrefillLoading(true)
    try {
      const res = await apiClient.get<PublicProjectPrefillResponse>(
        `/api/website/public-projects/prefill/${id}`
      )
      mergePrefillIntoForm(res.data)
      appliedPrefillFor.current = id
      toast.success(t("success.prefillLoaded"))
    } catch {
      toast.error(t("errors.prefillFailed"))
    } finally {
      setManualPrefillLoading(false)
    }
  }

  const fieldErr = (key: keyof typeof form.values) => {
    const e = form.errors[key]
    if (!e) return null
    const s = String(e)
    const known = [
      "titleArRequired",
      "titleEnRequired",
      "slugRequired",
      "slugInvalid",
      "cityIdRequired",
      "regionIdRequired",
    ] as const
    const isKnownErr = (x: string): x is (typeof known)[number] =>
      (known as readonly string[]).includes(x)
    const message = isKnownErr(s) ? tErr(s) : s
    return [{ message }]
  }

  const handleSubmit = async (values: typeof form.values) => {
    try {
      const { regionId, ...payload } = values
      void regionId
      const body = {
        ...payload,
        status: values.status || undefined,
        projectId: values.projectId?.trim() || undefined,
      }
      await apiClient.post("/api/website/public-projects", body)
      queryClient.invalidateQueries({
        queryKey: ["website-content", "projects"],
      })
      queryClient.invalidateQueries({ queryKey: ["public-projects"] })
      toast.success(t("success.created"))
      router.push("/website/projects")
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const root = handleFormErrors(error, form)
        toast.error(root || tCommon("errors.internal_server_error"))
        return
      }
      toast.error(tCommon("errors.internal_server_error"))
    }
  }

  return (
    <form onSubmit={form.onSubmit(handleSubmit)} className="space-y-8">
      <FieldSet className="gap-6">
        <FieldLegend>{t("sections.core")}</FieldLegend>
        <div className="grid gap-4 md:grid-cols-2">
          <Field data-invalid={!!form.errors.titleAr}>
            <FieldLabel htmlFor="pp-title-ar">{t("fields.titleAr")}</FieldLabel>
            <Input
              id="pp-title-ar"
              key={form.key("titleAr")}
              {...form.getInputProps("titleAr")}
              placeholder={t("placeholders.titleAr")}
              aria-invalid={!!form.errors.titleAr}
            />
            {form.errors.titleAr ? (
              <FieldError errors={fieldErr("titleAr")!} />
            ) : null}
          </Field>
          <Field data-invalid={!!form.errors.titleEn}>
            <FieldLabel htmlFor="pp-title-en">{t("fields.titleEn")}</FieldLabel>
            <Input
              id="pp-title-en"
              key={form.key("titleEn")}
              {...form.getInputProps("titleEn")}
              placeholder={t("placeholders.titleEn")}
              aria-invalid={!!form.errors.titleEn}
            />
            {form.errors.titleEn ? (
              <FieldError errors={fieldErr("titleEn")!} />
            ) : null}
          </Field>
        </div>

        <Field data-invalid={!!form.errors.slug}>
          <FieldLabel htmlFor="pp-slug">{t("fields.slug")}</FieldLabel>
          <FieldDescription>{t("ui.slugHint")}</FieldDescription>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Input
              id="pp-slug"
              key={form.key("slug")}
              {...form.getInputProps("slug")}
              placeholder={t("placeholders.slug")}
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
              {t("actions.generateSlug")}
            </Button>
          </div>
          {form.errors.slug ? (
            <FieldError errors={fieldErr("slug")!} />
          ) : null}
        </Field>

        <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
          <div>
            <p className="text-sm font-medium">{t("fields.isActive")}</p>
            <p className="text-muted-foreground text-sm">
              {t("ui.isActiveHint")}
            </p>
          </div>
          <Switch
            checked={form.values.isActive}
            onCheckedChange={(c) => form.setFieldValue("isActive", Boolean(c))}
          />
        </div>

        <Field data-invalid={!!form.errors.projectId}>
          <FieldLabel htmlFor="pp-project-id">
            {t("fields.linkedProjectId")}
          </FieldLabel>
          <FieldDescription>{t("ui.linkedProjectHint")}</FieldDescription>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
            <Input
              id="pp-project-id"
              key={form.key("projectId")}
              {...form.getInputProps("projectId")}
              placeholder={t("placeholders.linkedProjectId")}
              className="sm:flex-1"
              aria-invalid={!!form.errors.projectId}
            />
            <Button
              type="button"
              variant="secondary"
              className="shrink-0"
              disabled={manualPrefillLoading || form.submitting}
              onClick={() => void handleLoadFromInternalProject()}
            >
              {manualPrefillLoading
                ? tCommon("common.loading")
                : t("actions.loadFromProject")}
            </Button>
          </div>
          {form.errors.projectId ? (
            <FieldError
              errors={[{ message: String(form.errors.projectId) }]}
            />
          ) : null}
        </Field>
      </FieldSet>

      <Separator />

      <FieldSet className="gap-6">
        <FieldLegend>{t("sections.descriptions")}</FieldLegend>
        <div className="grid gap-4 md:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="pp-short-ar">
              {t("fields.shortDescriptionAr")}
            </FieldLabel>
            <Textarea
              id="pp-short-ar"
              key={form.key("shortDescriptionAr")}
              {...form.getInputProps("shortDescriptionAr")}
              placeholder={t("placeholders.shortDescription")}
              className="min-h-20"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="pp-short-en">
              {t("fields.shortDescriptionEn")}
            </FieldLabel>
            <Textarea
              id="pp-short-en"
              key={form.key("shortDescriptionEn")}
              {...form.getInputProps("shortDescriptionEn")}
              placeholder={t("placeholders.shortDescription")}
              className="min-h-20"
            />
          </Field>
        </div>
        <Field>
          <FieldLabel htmlFor="pp-desc-ar">
            {t("fields.descriptionAr")}
          </FieldLabel>
          <Textarea
            id="pp-desc-ar"
            key={form.key("descriptionAr")}
            {...form.getInputProps("descriptionAr")}
            placeholder={t("placeholders.description")}
            className="min-h-28"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="pp-desc-en">
            {t("fields.descriptionEn")}
          </FieldLabel>
          <Textarea
            id="pp-desc-en"
            key={form.key("descriptionEn")}
            {...form.getInputProps("descriptionEn")}
            placeholder={t("placeholders.description")}
            className="min-h-28"
          />
        </Field>
      </FieldSet>

      <Separator />

      <FieldSet className="gap-6">
        <FieldLegend>{t("sections.gallery")}</FieldLegend>
        <Field>
          <FieldLabel>{t("fields.images")}</FieldLabel>
          <FieldDescription>{t("ui.galleryHint")}</FieldDescription>
          <div className="bg-muted/40 mt-2 rounded-xl border border-dashed p-4">
            <Uploader
              endpoint="websiteMultiImageUploader"
              onClientUploadComplete={(res) => {
                if (res?.length) {
                  const urls = res.map((f) => f.ufsUrl)
                  form.setFieldValue("images", [
                    ...form.values.images,
                    ...urls,
                  ])
                }
              }}
              onUploadError={(err: Error) => {
                toast.error(err.message || tCommon("errors.internal_server_error"))
              }}
            />
          </div>
        </Field>
        {form.values.images.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {form.values.images.map((url, index) => (
              <div
                key={`${url}-${index}`}
                className="bg-muted/20 relative rounded-lg border p-2"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt=""
                  className="h-32 w-full rounded-md object-cover"
                />
                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  className="absolute top-3 end-3 h-8 w-8"
                  onClick={() =>
                    form.setFieldValue(
                      "images",
                      form.values.images.filter((_, i) => i !== index)
                    )
                  }
                  aria-label={t("ui.removeImage")}
                >
                  <X className="size-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">{t("ui.noImages")}</p>
        )}
      </FieldSet>

      <Separator />

      <FieldSet className="gap-6">
        <FieldLegend>{t("sections.attachments")}</FieldLegend>
        <Field>
          <FieldLabel>{t("fields.attachments")}</FieldLabel>
          <FieldDescription>{t("ui.attachmentsHint")}</FieldDescription>
          <Card className="ring-none mt-2 shadow-none ring-0">
            <CardContent className="pt-6">
              <FormFileUpload
                endpoint="projectAttachmentsUploader"
                value={form.values.attachments.map((a) => ({
                  fileUrl: a.fileUrl,
                  fileName: a.fileName ?? a.fileUrl,
                  fileType: a.fileType ?? undefined,
                  fileSize: a.fileSize ?? undefined,
                }))}
                onChange={(files) => form.setFieldValue("attachments", files)}
              />
            </CardContent>
          </Card>
        </Field>
      </FieldSet>

      <Separator />

      <FieldSet className="gap-6">
        <FieldLegend>{t("sections.location")}</FieldLegend>
        <div className="grid gap-4 md:grid-cols-2">
          <Field data-invalid={!!form.errors.regionId}>
            <FieldLabel htmlFor="pp-region">{t("fields.region")}</FieldLabel>
            <Select
              value={form.values.regionId || ""}
              onValueChange={(value) => {
                form.setFieldValue("regionId", value || "")
                form.setFieldValue("cityId", "")
              }}
            >
              <SelectTrigger id="pp-region" aria-invalid={!!form.errors.regionId}>
                <SelectValue>
                  {form.values.regionId
                    ? regions.find((r) => r.id === form.values.regionId)
                        ?.name || t("placeholders.region")
                    : t("placeholders.region")}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">{t("placeholders.region")}</SelectItem>
                {regions.map((region) => (
                  <SelectItem key={region.id} value={region.id}>
                    {region.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.errors.regionId ? (
              <FieldError errors={fieldErr("regionId")!} />
            ) : null}
          </Field>

          <Field data-invalid={!!form.errors.cityId}>
            <FieldLabel htmlFor="pp-city">{t("fields.city")}</FieldLabel>
            <Select
              value={form.values.cityId || ""}
              onValueChange={(value) =>
                form.setFieldValue("cityId", value || "")
              }
              disabled={!form.values.regionId}
            >
              <SelectTrigger id="pp-city" aria-invalid={!!form.errors.cityId}>
                <SelectValue>
                  {form.values.cityId
                    ? cities.find((c) => c.id === form.values.cityId)?.name ||
                      t("placeholders.city")
                    : t("placeholders.city")}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {cities.length === 0 ? (
                  <div className="text-muted-foreground px-2 py-2 text-sm">
                    {form.values.regionId
                      ? tCommon("projects.form.noCitiesAvailable")
                      : tCommon("projects.form.selectRegionFirst")}
                  </div>
                ) : (
                  <>
                    <SelectItem value="">{t("placeholders.city")}</SelectItem>
                    {cities.map((city) => (
                      <SelectItem key={city.id} value={city.id}>
                        {city.name}
                      </SelectItem>
                    ))}
                  </>
                )}
              </SelectContent>
            </Select>
            {form.errors.cityId ? (
              <FieldError errors={fieldErr("cityId")!} />
            ) : null}
          </Field>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="pp-loc-ar">
              {t("fields.locationAr")}
            </FieldLabel>
            <Input
              id="pp-loc-ar"
              key={form.key("locationAr")}
              {...form.getInputProps("locationAr")}
              placeholder={t("placeholders.location")}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="pp-loc-en">
              {t("fields.locationEn")}
            </FieldLabel>
            <Input
              id="pp-loc-en"
              key={form.key("locationEn")}
              {...form.getInputProps("locationEn")}
              placeholder={t("placeholders.location")}
            />
          </Field>
        </div>
        <Field>
          <FieldLabel htmlFor="pp-maps">{t("fields.googleMaps")}</FieldLabel>
          <Input
            id="pp-maps"
            type="url"
            key={form.key("googleMapsAddress")}
            {...form.getInputProps("googleMapsAddress")}
            placeholder={tCommon("projects.form.googleMapsAddressPlaceholder")}
          />
        </Field>
      </FieldSet>

      <Separator />

      <FieldSet className="gap-6">
        <FieldLegend>{t("sections.details")}</FieldLegend>
        <div className="grid gap-4 md:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="pp-area">{t("fields.area")}</FieldLabel>
            <Input
              id="pp-area"
              type="number"
              step="0.01"
              min={0}
              key={form.key("area")}
              {...form.getInputProps("area")}
              placeholder={tCommon("projects.form.areaPlaceholder")}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="pp-floors">{t("fields.numberOfFloors")}</FieldLabel>
            <Input
              id="pp-floors"
              type="number"
              min={0}
              key={form.key("numberOfFloors")}
              {...form.getInputProps("numberOfFloors")}
              placeholder={tCommon("projects.form.numberOfFloorsPlaceholder")}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="pp-deed">{t("fields.deedNumber")}</FieldLabel>
            <Input
              id="pp-deed"
              key={form.key("deedNumber")}
              {...form.getInputProps("deedNumber")}
              placeholder={tCommon("projects.form.deedNumberPlaceholder")}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="pp-duration">
              {t("fields.workDuration")}
            </FieldLabel>
            <Input
              id="pp-duration"
              type="number"
              min={0}
              key={form.key("workDuration")}
              {...form.getInputProps("workDuration")}
              placeholder={tCommon("projects.form.workDurationPlaceholder")}
            />
          </Field>
        </div>
        <Field>
          <FieldLabel htmlFor="pp-status">{t("fields.status")}</FieldLabel>
          <Select
            value={form.values.status || ""}
            onValueChange={(value) =>
              form.setFieldValue(
                "status",
                (value || "") as typeof form.values.status
              )
            }
          >
            <SelectTrigger id="pp-status">
              <SelectValue>
                {form.values.status
                  ? tCommon(STATUS_LABEL_KEYS[form.values.status])
                  : t("placeholders.status")}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">{t("placeholders.status")}</SelectItem>
              {PROJECT_STATUSES.map((st) => (
                <SelectItem key={st} value={st}>
                  {tCommon(STATUS_LABEL_KEYS[st])}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </FieldSet>

      <Separator />

      <FieldSet className="gap-6">
        <FieldLegend>{t("sections.taxonomy")}</FieldLegend>
        <Field>
          <FieldLabel htmlFor="pp-categories">{t("fields.categories")}</FieldLabel>
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
                  : t("placeholders.categories")}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {categories.length === 0 ? (
                <div className="text-muted-foreground px-2 py-2 text-sm">
                  {t("ui.noCategories")}
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
          <FieldLabel htmlFor="pp-badges">{t("fields.badges")}</FieldLabel>
          <FieldDescription>{t("ui.badgesHint")}</FieldDescription>
          <Select
            multiple
            value={form.values.badgeIds}
            onValueChange={(value) => form.setFieldValue("badgeIds", value)}
            disabled={badgesLoading || badges.length === 0}
          >
            <SelectTrigger
              id="pp-badges"
              className={cn(
                "w-full",
                badges.length === 0 && "opacity-70"
              )}
            >
              <SelectValue>
                {badgesLoading
                  ? tCommon("common.loading")
                  : form.values.badgeIds.length > 0
                    ? form.values.badgeIds
                        .map((id) => badges.find((b) => b.id === id)?.nameEn)
                        .filter(Boolean)
                        .join(", ")
                    : t("placeholders.badges")}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {badges.length === 0 ? (
                <div className="text-muted-foreground px-2 py-2 text-sm">
                  {t("ui.noBadges")}
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
          <FieldLabel htmlFor="pp-features">{t("fields.features")}</FieldLabel>
          <FieldDescription>{t("ui.featuresHint")}</FieldDescription>
          <Select
            multiple
            value={form.values.featureIds}
            onValueChange={(value) => form.setFieldValue("featureIds", value)}
            disabled={featuresLoading || features.length === 0}
          >
            <SelectTrigger
              id="pp-features"
              className={cn(
                "w-full",
                features.length === 0 && "opacity-70"
              )}
            >
              <SelectValue>
                {featuresLoading
                  ? tCommon("common.loading")
                  : form.values.featureIds.length > 0
                    ? form.values.featureIds
                        .map((id) => features.find((f) => f.id === id)?.labelEn)
                        .filter(Boolean)
                        .join(", ")
                    : t("placeholders.features")}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {features.length === 0 ? (
                <div className="text-muted-foreground px-2 py-2 text-sm">
                  {t("ui.noFeatures")}
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

      <Separator />

      <FieldSet className="gap-6">
        <FieldLegend>{t("sections.pricing")}</FieldLegend>
        <div className="grid gap-4 md:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="pp-start-price">
              {t("fields.startingPrice")}
            </FieldLabel>
            <Input
              id="pp-start-price"
              type="number"
              step="0.01"
              min={0}
              key={form.key("startingPrice")}
              {...form.getInputProps("startingPrice")}
              placeholder={t("placeholders.price")}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="pp-end-price">
              {t("fields.endingPrice")}
            </FieldLabel>
            <Input
              id="pp-end-price"
              type="number"
              step="0.01"
              min={0}
              key={form.key("endingPrice")}
              {...form.getInputProps("endingPrice")}
              placeholder={t("placeholders.price")}
            />
          </Field>
        </div>
      </FieldSet>

      <Card className="shadow-none ring-0">
        <CardHeader>
          <CardTitle className="text-base">{t("actions.submitSection")}</CardTitle>
          <CardDescription>{t("actions.submitHint")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            disabled={form.submitting}
            nativeButton={false}
            render={<Link href="/website/projects" />}
          >
            {tCommon("common.cancel")}
          </Button>
          <Button type="submit" disabled={form.submitting}>
            {form.submitting ? t("actions.saving") : t("actions.save")}
          </Button>
        </CardContent>
        {form.errors.root ? (
          <CardContent className="pt-0">
            <p className="text-destructive text-sm">{form.errors.root}</p>
          </CardContent>
        ) : null}
      </Card>
    </form>
  )
}
