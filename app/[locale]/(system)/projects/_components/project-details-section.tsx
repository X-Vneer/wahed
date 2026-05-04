"use client"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useCities } from "@/hooks/use-cities"
import { useProjectCategories } from "@/hooks/use-project-categories"
import { useProjectStatuses } from "@/hooks/use-project-statuses"
import { useRegions } from "@/hooks/use-regions"
import { format } from "date-fns"
import { ar, enUS } from "date-fns/locale"
import { Calendar as CalendarIcon, X } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { useState } from "react"
import { useProjectFormContext } from "./project-form-context"

const dateFnsLocale = (l: string) => (l === "ar" ? ar : enUS)
const dateFormat = "d - MMM - yyyy"

export function ProjectDetailsSection() {
  const t = useTranslations()
  const locale = useLocale()
  const localeDate = dateFnsLocale(locale)
  const form = useProjectFormContext()
  const [startDateOpen, setStartDateOpen] = useState(false)
  const startDateRaw = form.values.startDate as Date | string | undefined
  const startDateValue = startDateRaw ? new Date(startDateRaw) : null

  const { data: categoriesData } = useProjectCategories()
  const { data: regionsData } = useRegions()
  const { data: citiesData } = useCities(form.values.regionId || null)
  const { data: projectStatusesRes } = useProjectStatuses()

  const categories = categoriesData?.data?.data ?? []
  const regions = regionsData?.data?.data ?? []
  const cities = citiesData?.data?.data || []
  const projectStatuses = projectStatusesRes?.data?.data ?? []
  const selectedStatus = projectStatuses.find(
    (s) => s.id === form.values.statusId
  )

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
            step="0.01"
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

        {/* Start Date (optional) */}
        <Field data-invalid={!!form.errors.startDate}>
          <FieldLabel htmlFor="startDate">
            {t("projects.form.startDate")}
          </FieldLabel>
          <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
            <PopoverTrigger
              render={(props) => (
                <Button
                  id="startDate"
                  variant="outline"
                  type="button"
                  className="h-9 w-full justify-start bg-white px-3 font-normal"
                  aria-invalid={!!form.errors.startDate}
                  {...props}
                >
                  <CalendarIcon className="me-2 size-3.5" />
                  {startDateValue ? (
                    format(startDateValue, dateFormat, { locale: localeDate })
                  ) : (
                    <span className="text-muted-foreground">
                      {t("projects.form.startDatePlaceholder")}
                    </span>
                  )}
                  {startDateValue && (
                    <span
                      role="button"
                      tabIndex={0}
                      aria-label={t("common.remove")}
                      className="hover:bg-muted ms-auto inline-flex size-4 items-center justify-center rounded"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        form.setFieldValue("startDate", undefined)
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault()
                          e.stopPropagation()
                          form.setFieldValue("startDate", undefined)
                        }
                      }}
                    >
                      <X className="size-3" />
                    </span>
                  )}
                </Button>
              )}
            />
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={startDateValue ?? undefined}
                onSelect={(d) => {
                  setStartDateOpen(false)
                  form.setFieldValue("startDate", d ?? undefined)
                }}
                locale={localeDate}
              />
            </PopoverContent>
          </Popover>
          {form.errors.startDate && (
            <FieldError
              errors={[{ message: String(form.errors.startDate) }]}
            />
          )}
        </Field>

        {/* status */}
        <Field data-invalid={!!form.errors.statusId}>
          <FieldLabel htmlFor="statusId">
            {t("projects.form.status")}
          </FieldLabel>
          <Select
            value={form.values.statusId || ""}
            onValueChange={(value) => {
              form.setFieldValue("statusId", value || undefined)
            }}
          >
            <SelectTrigger
              id="statusId"
              className="w-full"
              aria-invalid={!!form.errors.statusId}
            >
              <SelectValue>
                {selectedStatus ? (
                  <span className="flex items-center gap-2">
                    <span
                      className="size-2.5 rounded-full"
                      style={{ backgroundColor: selectedStatus.color }}
                    />
                    {selectedStatus.name}
                  </span>
                ) : (
                  t("projects.form.statusPlaceholder")
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">
                {t("projects.form.statusPlaceholder")}
              </SelectItem>
              {projectStatuses.map((status) => (
                <SelectItem key={status.id} value={status.id}>
                  <span className="flex items-center gap-2">
                    <span
                      className="size-2.5 rounded-full"
                      style={{ backgroundColor: status.color }}
                    />
                    {status.name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.errors.statusId && (
            <FieldError errors={[{ message: String(form.errors.statusId) }]} />
          )}
        </Field>
      </div>
    </>
  )
}
