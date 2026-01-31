"use client"

import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useCities } from "@/hooks/use-cities"
import { useProjectCategories } from "@/hooks/use-project-categories"
import { useRegions } from "@/hooks/use-regions"
import { useTranslations } from "next-intl"
import { useProjectFormContext } from "./project-form-context"

export function ProjectDetailsSection() {
  const t = useTranslations()
  const form = useProjectFormContext()

  const { data: categoriesData } = useProjectCategories()
  const { data: regionsData } = useRegions()
  const { data: citiesData } = useCities(form.values.regionId || null)

  const categories = categoriesData?.data?.data ?? []
  const regions = regionsData?.data?.data ?? []
  const cities = citiesData?.data?.data || []

  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Region */}
        <Field data-invalid={!!form.errors.regionId}>
          <FieldLabel htmlFor="regionId">
            {t("projects.form.region")}
          </FieldLabel>
          <Select
            value={form.values.regionId || ""}
            onValueChange={(value) => {
              form.setFieldValue("regionId", value || "")
              // Clear city selection when region changes
              form.setFieldValue("cityId", "")
            }}
          >
            <SelectTrigger
              id="regionId"
              className="w-full"
              aria-invalid={!!form.errors.regionId}
            >
              <SelectValue>
                {form.values.regionId
                  ? regions.find((region) => region.id === form.values.regionId)
                      ?.name || t("projects.form.regionPlaceholder")
                  : t("projects.form.regionPlaceholder")}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">
                {t("projects.form.regionPlaceholder")}
              </SelectItem>
              {regions.map((region) => (
                <SelectItem key={region.id} value={region.id}>
                  {region.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.errors.regionId && (
            <FieldError errors={[{ message: String(form.errors.regionId) }]} />
          )}
        </Field>

        {/* Location (City) */}
        <Field data-invalid={!!form.errors.cityId}>
          <FieldLabel htmlFor="cityId">
            {t("projects.form.location")}
          </FieldLabel>
          <Select
            value={form.values.cityId || ""}
            onValueChange={(value) => {
              form.setFieldValue("cityId", value || "")
            }}
            disabled={!form.values.regionId}
          >
            <SelectTrigger
              id="cityId"
              className="w-full"
              aria-invalid={!!form.errors.cityId}
            >
              <SelectValue>
                {form.values.cityId
                  ? cities.find((city) => city.id === form.values.cityId)
                      ?.name || t("projects.form.cityPlaceholder")
                  : t("projects.form.cityPlaceholder")}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {cities.length === 0 ? (
                <div className="text-muted-foreground px-2 py-1.5 text-sm">
                  {form.values.regionId
                    ? t("projects.form.noCitiesAvailable")
                    : t("projects.form.selectRegionFirst")}
                </div>
              ) : (
                <>
                  <SelectItem value="">
                    {t("projects.form.cityPlaceholder")}
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
          {form.errors.cityId && (
            <FieldError errors={[{ message: String(form.errors.cityId) }]} />
          )}
        </Field>

        {/* Area */}
        <Field data-invalid={!!form.errors.area}>
          <FieldLabel htmlFor="area">{t("projects.form.area")}</FieldLabel>
          <Input
            id="area"
            type="number"
            step="1"
            min={0}
            key={form.key("area")}
            {...form.getInputProps("area")}
            placeholder={t("projects.form.areaPlaceholder")}
            aria-invalid={!!form.errors.area}
          />
          {form.errors.area && (
            <FieldError errors={[{ message: String(form.errors.area) }]} />
          )}
        </Field>

        {/* Number of Floors */}
        <Field data-invalid={!!form.errors.numberOfFloors}>
          <FieldLabel htmlFor="numberOfFloors">
            {t("projects.form.numberOfFloors")}
          </FieldLabel>
          <Input
            id="numberOfFloors"
            type="number"
            min={0}
            key={form.key("numberOfFloors")}
            {...form.getInputProps("numberOfFloors")}
            placeholder={t("projects.form.numberOfFloorsPlaceholder")}
            aria-invalid={!!form.errors.numberOfFloors}
          />
          {form.errors.numberOfFloors && (
            <FieldError
              errors={[{ message: String(form.errors.numberOfFloors) }]}
            />
          )}
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Deed Number */}
        <Field data-invalid={!!form.errors.deedNumber}>
          <FieldLabel htmlFor="deedNumber">
            {t("projects.form.deedNumber")}
          </FieldLabel>
          <Input
            id="deedNumber"
            key={form.key("deedNumber")}
            {...form.getInputProps("deedNumber")}
            placeholder={t("projects.form.deedNumberPlaceholder")}
            aria-invalid={!!form.errors.deedNumber}
          />
          {form.errors.deedNumber && (
            <FieldError
              errors={[{ message: String(form.errors.deedNumber) }]}
            />
          )}
        </Field>

        {/* Project Classification (Categories) */}
        <Field data-invalid={!!form.errors.categoryIds}>
          <FieldLabel htmlFor="categoryIds">
            {t("projects.form.projectClassification")}
          </FieldLabel>
          <Select
            multiple={true}
            value={form.values.categoryIds}
            onValueChange={(value) => {
              form.setFieldValue("categoryIds", value)
            }}
          >
            <SelectTrigger
              id="categoryIds"
              className="w-full"
              aria-invalid={!!form.errors.categoryIds}
            >
              <SelectValue>
                {form.values.categoryIds.length > 0
                  ? form.values.categoryIds
                      .map((id) => categories.find((c) => c.id === id)?.name)
                      .join(", ")
                  : t("projects.form.projectClassificationPlaceholder")}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {categories.length === 0 ? (
                <div className="text-muted-foreground px-2 py-1.5 text-sm">
                  {t("projects.form.projectClassificationPlaceholder")}
                </div>
              ) : (
                [
                  {
                    id: "",
                    name: t("projects.form.projectClassificationPlaceholder"),
                  },
                  ...categories,
                ].map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          {form.errors.categoryIds && (
            <FieldError
              errors={[{ message: String(form.errors.categoryIds) }]}
            />
          )}
        </Field>

        {/* Work Duration */}
        <Field data-invalid={!!form.errors.workDuration}>
          <FieldLabel htmlFor="workDuration">
            {t("projects.form.workDuration")}
          </FieldLabel>
          <Input
            id="workDuration"
            key={form.key("workDuration")}
            {...form.getInputProps("workDuration")}
            placeholder={t("projects.form.workDurationPlaceholder")}
            aria-invalid={!!form.errors.workDuration}
          />
          {form.errors.workDuration && (
            <FieldError
              errors={[{ message: String(form.errors.workDuration) }]}
            />
          )}
        </Field>
      </div>
    </>
  )
}
