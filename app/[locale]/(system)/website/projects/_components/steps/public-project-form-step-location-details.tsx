"use client"

import {
  Field,
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
import { useCities } from "@/hooks/use-cities"
import { useRegions } from "@/hooks/use-regions"
import { useTranslations } from "next-intl"
import {
  PROJECT_STATUSES,
  STATUS_LABEL_KEYS,
} from "../public-project-form-constants"
import {
  usePublicProjectFormContext,
  type PublicProjectFormValues,
} from "../public-project-form-context"
import { usePublicProjectFieldErr } from "../use-public-project-field-err"

export function PublicProjectFormStepLocationDetails() {
  const form = usePublicProjectFormContext()
  const t = useTranslations()
  const fieldErr = usePublicProjectFieldErr()

  const { data: regionsRes } = useRegions()
  const regions = regionsRes?.data?.data ?? []
  const { data: citiesRes } = useCities(form.getValues().regionId || null)
  const cities = citiesRes?.data?.data ?? []

  return (
    <div className="space-y-8">
      <FieldSet className="gap-6">
        <FieldLegend>
          {t("websiteCms.projects.publicProjectForm.sections.location")}
        </FieldLegend>
        <div className="grid gap-4 md:grid-cols-2">
          <Field data-invalid={!!form.errors.regionId}>
            <FieldLabel htmlFor="pp-region">
              {t("websiteCms.projects.publicProjectForm.fields.region")}
            </FieldLabel>
            <Select
              value={form.getValues().regionId || ""}
              onValueChange={(value) => {
                form.setFieldValue("regionId", value || "")
                form.setFieldValue("cityId", "")
              }}
            >
              <SelectTrigger
                id="pp-region"
                aria-invalid={!!form.errors.regionId}
              >
                <SelectValue>
                  {form.getValues().regionId
                    ? regions.find((r) => r.id === form.getValues().regionId)
                        ?.name ||
                      t(
                        "websiteCms.projects.publicProjectForm.placeholders.region"
                      )
                    : t(
                        "websiteCms.projects.publicProjectForm.placeholders.region"
                      )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">
                  {t(
                    "websiteCms.projects.publicProjectForm.placeholders.region"
                  )}
                </SelectItem>
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
            <FieldLabel htmlFor="pp-city">
              {t("websiteCms.projects.publicProjectForm.fields.city")}
            </FieldLabel>
            <Select
              value={form.getValues().cityId || ""}
              onValueChange={(value) =>
                form.setFieldValue("cityId", value || "")
              }
              disabled={!form.getValues().regionId}
            >
              <SelectTrigger id="pp-city" aria-invalid={!!form.errors.cityId}>
                <SelectValue>
                  {form.getValues().cityId
                    ? cities.find((c) => c.id === form.getValues().cityId)?.name ||
                      t(
                        "websiteCms.projects.publicProjectForm.placeholders.city"
                      )
                    : t(
                        "websiteCms.projects.publicProjectForm.placeholders.city"
                      )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {cities.length === 0 ? (
                  <div className="text-muted-foreground px-2 py-2 text-sm">
                    {form.getValues().regionId
                      ? t("projects.form.noCitiesAvailable")
                      : t("projects.form.selectRegionFirst")}
                  </div>
                ) : (
                  <>
                    <SelectItem value="">
                      {t(
                        "websiteCms.projects.publicProjectForm.placeholders.city"
                      )}
                    </SelectItem>
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
              {t("websiteCms.projects.publicProjectForm.fields.locationAr")}
            </FieldLabel>
            <Input
              id="pp-loc-ar"
              key={form.key("locationAr")}
              {...form.getInputProps("locationAr")}
              placeholder={t(
                "websiteCms.projects.publicProjectForm.placeholders.location"
              )}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="pp-loc-en">
              {t("websiteCms.projects.publicProjectForm.fields.locationEn")}
            </FieldLabel>
            <Input
              id="pp-loc-en"
              key={form.key("locationEn")}
              {...form.getInputProps("locationEn")}
              placeholder={t(
                "websiteCms.projects.publicProjectForm.placeholders.location"
              )}
            />
          </Field>
        </div>
        <Field>
          <FieldLabel htmlFor="pp-maps">
            {t("websiteCms.projects.publicProjectForm.fields.googleMaps")}
          </FieldLabel>
          <Input
            id="pp-maps"
            type="url"
            key={form.key("googleMapsAddress")}
            {...form.getInputProps("googleMapsAddress")}
            placeholder={t("projects.form.googleMapsAddressPlaceholder")}
          />
        </Field>
      </FieldSet>

      <FieldSet className="gap-6">
        <FieldLegend>
          {t("websiteCms.projects.publicProjectForm.sections.details")}
        </FieldLegend>
        <div className="grid gap-4 md:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="pp-area">
              {t("websiteCms.projects.publicProjectForm.fields.area")}
            </FieldLabel>
            <Input
              id="pp-area"
              type="number"
              step="0.01"
              min={0}
              key={form.key("area")}
              {...form.getInputProps("area")}
              placeholder={t("projects.form.areaPlaceholder")}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="pp-deed">
              {t("websiteCms.projects.publicProjectForm.fields.deedNumber")}
            </FieldLabel>
            <Input
              id="pp-deed"
              key={form.key("deedNumber")}
              {...form.getInputProps("deedNumber")}
              placeholder={t("projects.form.deedNumberPlaceholder")}
            />
          </Field>
        </div>
        <Field>
          <FieldLabel htmlFor="pp-status">
            {t("websiteCms.projects.publicProjectForm.fields.status")}
          </FieldLabel>
          <Select
            value={form.getValues().status || ""}
            onValueChange={(value) =>
              form.setFieldValue(
                "status",
                (value || "") as PublicProjectFormValues["status"]
              )
            }
          >
            <SelectTrigger id="pp-status">
              <SelectValue>
                {form.getValues().status
                  ? t(STATUS_LABEL_KEYS[form.getValues().status as keyof typeof STATUS_LABEL_KEYS])
                  : t(
                      "websiteCms.projects.publicProjectForm.placeholders.status"
                    )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">
                {t(
                  "websiteCms.projects.publicProjectForm.placeholders.status"
                )}
              </SelectItem>
              {PROJECT_STATUSES.map((st) => (
                <SelectItem key={st} value={st}>
                  {t(STATUS_LABEL_KEYS[st])}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </FieldSet>
    </div>
  )
}
