"use client"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { useProjectFormContext } from "./project-form-context"
import { useTranslations, useLocale } from "next-intl"
import {
  Calendar as CalendarIcon,
  Hash,
  FileText,
  Clock,
  Radio,
  CheckSquare,
  X,
  Plus,
} from "lucide-react"
import { useState } from "react"
import { format } from "date-fns"
import { ar, enUS } from "date-fns/locale"
import { isNotEmpty, useForm } from "@mantine/form"

// Simple ID generator
const randomId = () =>
  `field-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

type FieldType =
  | "date"
  | "number"
  | "text"
  | "textarea"
  | "time"
  | "singleChoice"
  | "multipleChoice"
  | "uploadImage"
  | "uploadFile"

// Schema-compatible field type (matches the form schema)
type SchemaFieldType =
  | "date"
  | "number"
  | "text"
  | "textarea"
  | "time"
  | "singleChoice"
  | "multipleChoice"

// Form schema compatible field type (matches ProjectFormValues)
type FormAdditionalField = {
  id: string
  type: SchemaFieldType
  label: string
  value?: string | number | string[] | File | null
  options?: string[]
  min?: number
  max?: number
  minDate?: Date
  maxDate?: Date
  placeholder?: string
  required?: boolean
}

const FIELD_TYPES: {
  type: FieldType
  translationKey: string
  icon: React.ElementType
}[] = [
  { type: "date", translationKey: "dateField", icon: CalendarIcon },
  { type: "number", translationKey: "numberField", icon: Hash },
  {
    type: "textarea",
    translationKey: "largeTextField",
    icon: FileText,
  },
  {
    type: "multipleChoice",
    translationKey: "multipleChoice",
    icon: CheckSquare,
  },
  {
    type: "text",
    translationKey: "simpleTextField",
    icon: FileText,
  },
  { type: "time", translationKey: "timeField", icon: Clock },
  {
    type: "singleChoice",
    translationKey: "singleChoice",
    icon: Radio,
  },
]

type AddFieldModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  fieldType: FieldType | null
  onAdd: (field: FormAdditionalField) => void
}

function AddFieldModal({
  open,
  onOpenChange,
  fieldType,
  onAdd,
}: AddFieldModalProps) {
  const t = useTranslations()
  const locale = useLocale()

  const modalForm = useForm({
    mode: "controlled",
    validate: {
      label: isNotEmpty(
        t("projects.form.additionalFields.errors.labelRequired")
      ),
    },
    initialValues: {
      label: "",
      required: false,
      placeholder: "",
      // Number fields
      min: "",
      max: "",
      // Date fields
      minDate: undefined as Date | undefined,
      maxDate: undefined as Date | undefined,
      // Text fields
      minLength: "",
      maxLength: "",
      // Choice fields
      options: [] as string[],
      newOption: "",
    },
  })

  const handleAddOption = () => {
    const option = modalForm.values.newOption.trim()
    if (option && !modalForm.values.options.includes(option)) {
      modalForm.setFieldValue("options", [...modalForm.values.options, option])
      modalForm.setFieldValue("newOption", "")
    }
  }

  const handleRemoveOption = (index: number) => {
    modalForm.setFieldValue(
      "options",
      modalForm.values.options.filter((_, i) => i !== index)
    )
  }

  const handleSubmit = () => {
    if (!fieldType) return

    // Create FormAdditionalField directly
    const newField: FormAdditionalField = {
      id: randomId(),
      type: fieldType as SchemaFieldType,
      label: modalForm.values.label,
      // Set initial value to undefined for required fields, or appropriate default for optional fields
      value: modalForm.values.required
        ? undefined
        : fieldType === "number"
          ? 0
          : fieldType === "multipleChoice"
            ? []
            : "",
      options:
        fieldType === "singleChoice" || fieldType === "multipleChoice"
          ? modalForm.values.options
          : undefined,
      placeholder: modalForm.values.placeholder || undefined,
      required: modalForm.values.required,
    }

    // Add metadata properties directly to the field
    if (fieldType === "number") {
      if (modalForm.values.min) newField.min = Number(modalForm.values.min)
      if (modalForm.values.max) newField.max = Number(modalForm.values.max)
    } else if (fieldType === "date") {
      if (modalForm.values.minDate) newField.minDate = modalForm.values.minDate
      if (modalForm.values.maxDate) newField.maxDate = modalForm.values.maxDate
    } else if (fieldType === "text" || fieldType === "textarea") {
      // Note: minLength/maxLength are not in the schema, so we skip them
      // They could be added to the schema if needed
    }

    onAdd(newField)
    modalForm.reset()
    onOpenChange(false)
  }

  if (!fieldType) return null

  const fieldTypeLabel = t(
    `projects.form.additionalFields.fieldTypes.${FIELD_TYPES.find((ft) => ft.type === fieldType)?.translationKey || ""}`
  )

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>
            {t("projects.form.additionalFields.addField")} - {fieldTypeLabel}
          </SheetTitle>
        </SheetHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            handleSubmit()
          }}
          className="flex h-full flex-col"
        >
          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            <FieldGroup>
              <Field data-invalid={modalForm.errors.label}>
                <FieldLabel>
                  {t("projects.form.additionalFields.fieldLabel")} *
                </FieldLabel>
                <Input
                  {...modalForm.getInputProps("label")}
                  placeholder={t(
                    "projects.form.additionalFields.labelPlaceholder"
                  )}
                />
                {modalForm.errors.label && (
                  <FieldError
                    errors={[{ message: String(modalForm.errors.label) }]}
                  />
                )}
              </Field>

              <Field>
                <FieldLabel>
                  {t("projects.form.additionalFields.placeholder")}
                </FieldLabel>
                <Input
                  {...modalForm.getInputProps("placeholder")}
                  placeholder={t(
                    "projects.form.additionalFields.placeholderPlaceholder"
                  )}
                />
              </Field>

              {/* Number fields metadata */}
              {fieldType === "number" && (
                <>
                  <Field>
                    <FieldLabel>
                      {t("projects.form.additionalFields.metadata.min")}
                    </FieldLabel>
                    <Input
                      type="number"
                      {...modalForm.getInputProps("min")}
                      placeholder={t(
                        "projects.form.additionalFields.metadata.minPlaceholder"
                      )}
                    />
                  </Field>
                  <Field>
                    <FieldLabel>
                      {t("projects.form.additionalFields.metadata.max")}
                    </FieldLabel>
                    <Input
                      type="number"
                      {...modalForm.getInputProps("max")}
                      placeholder={t(
                        "projects.form.additionalFields.metadata.maxPlaceholder"
                      )}
                    />
                  </Field>
                </>
              )}

              {/* Date fields metadata */}
              {fieldType === "date" && (
                <>
                  <Field>
                    <FieldLabel>
                      {t("projects.form.additionalFields.metadata.minDate")}
                    </FieldLabel>
                    <Popover>
                      <PopoverTrigger
                        render={(props) => (
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                            {...props}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {modalForm.values.minDate ? (
                              format(modalForm.values.minDate, "PPP", {
                                locale: locale === "ar" ? ar : enUS,
                              })
                            ) : (
                              <span>
                                {t("projects.form.additionalFields.selectDate")}
                              </span>
                            )}
                          </Button>
                        )}
                      />
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={modalForm.values.minDate}
                          onSelect={(date) => {
                            modalForm.setFieldValue("minDate", date)
                          }}
                          locale={locale === "ar" ? ar : enUS}
                        />
                      </PopoverContent>
                    </Popover>
                  </Field>
                  <Field>
                    <FieldLabel>
                      {t("projects.form.additionalFields.metadata.maxDate")}
                    </FieldLabel>
                    <Popover>
                      <PopoverTrigger
                        render={(props) => (
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                            {...props}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {modalForm.values.maxDate ? (
                              format(modalForm.values.maxDate, "PPP", {
                                locale: locale === "ar" ? ar : enUS,
                              })
                            ) : (
                              <span>
                                {t("projects.form.additionalFields.selectDate")}
                              </span>
                            )}
                          </Button>
                        )}
                      />
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={modalForm.values.maxDate}
                          onSelect={(date) => {
                            modalForm.setFieldValue("maxDate", date)
                          }}
                          disabled={(date) => {
                            if (
                              modalForm.values.minDate &&
                              date < modalForm.values.minDate
                            )
                              return true
                            return false
                          }}
                          locale={locale === "ar" ? ar : enUS}
                        />
                      </PopoverContent>
                    </Popover>
                  </Field>
                </>
              )}

              {/* Text/Textarea fields metadata */}
              {(fieldType === "text" || fieldType === "textarea") && (
                <>
                  <Field>
                    <FieldLabel>
                      {t("projects.form.additionalFields.metadata.minLength")}
                    </FieldLabel>
                    <Input
                      type="number"
                      {...modalForm.getInputProps("minLength")}
                      placeholder={t(
                        "projects.form.additionalFields.metadata.minLengthPlaceholder"
                      )}
                    />
                  </Field>
                  <Field>
                    <FieldLabel>
                      {t("projects.form.additionalFields.metadata.maxLength")}
                    </FieldLabel>
                    <Input
                      type="number"
                      {...modalForm.getInputProps("maxLength")}
                      placeholder={t(
                        "projects.form.additionalFields.metadata.maxLengthPlaceholder"
                      )}
                    />
                  </Field>
                </>
              )}

              {/* Choice fields options */}
              {(fieldType === "singleChoice" ||
                fieldType === "multipleChoice") && (
                <Field>
                  <FieldLabel>
                    {t("projects.form.additionalFields.metadata.options")}
                  </FieldLabel>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        {...modalForm.getInputProps("newOption")}
                        placeholder={t(
                          "projects.form.additionalFields.metadata.addOption"
                        )}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            handleAddOption()
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={handleAddOption}
                      >
                        <Plus className="size-4" />
                      </Button>
                    </div>
                    {modalForm.values.options.length > 0 && (
                      <div className="space-y-1">
                        {modalForm.values.options.map((option, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between rounded-md border p-2"
                          >
                            <span>{option}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => handleRemoveOption(index)}
                            >
                              <X className="size-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </Field>
              )}

              <Field>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={modalForm.values.required}
                    onChange={(e) =>
                      modalForm.setFieldValue("required", e.target.checked)
                    }
                    className="rounded border-gray-300"
                  />
                  <FieldLabel>
                    {t("projects.form.additionalFields.metadata.required")}
                  </FieldLabel>
                </div>
              </Field>
            </FieldGroup>
          </div>

          <SheetFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={!!modalForm.errors.label}>
              {t("projects.form.additionalFields.add")}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}

export function AdditionalFieldsSection() {
  const t = useTranslations()
  const form = useProjectFormContext()
  const locale = useLocale()
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedFieldType, setSelectedFieldType] = useState<FieldType | null>(
    null
  )

  // Get additional fields from form values
  const additionalFields = (form.values.additionalFields ||
    []) as FormAdditionalField[]

  const handleFieldTypeClick = (type: FieldType) => {
    setSelectedFieldType(type)
    setModalOpen(true)
  }

  const handleAddField = (newField: FormAdditionalField) => {
    // Use Mantine's insertListItem to add the field
    form.insertListItem("additionalFields", newField)
  }

  const removeField = (index: number) => {
    // Use Mantine's removeListItem to remove the field
    form.removeListItem("additionalFields", index)
  }

  const renderFieldInput = (field: FormAdditionalField, fieldIndex: number) => {
    const valuePath = `additionalFields.${fieldIndex}.value`
    const fieldKey = form.key(valuePath)
    const placeholder =
      field.placeholder || t("projects.form.additionalFields.valuePlaceholder")

    switch (field.type) {
      case "date": {
        const dateValue =
          typeof field.value === "string" && field.value
            ? new Date(field.value)
            : field.value instanceof Date
              ? field.value
              : undefined

        return (
          <Popover key={fieldKey}>
            <PopoverTrigger
              render={(props) => (
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                  {...props}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateValue ? (
                    format(dateValue, "PPP", {
                      locale: locale === "ar" ? ar : enUS,
                    })
                  ) : (
                    <span>
                      {field.placeholder ||
                        t("projects.form.additionalFields.selectDate")}
                    </span>
                  )}
                </Button>
              )}
            />
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dateValue}
                onSelect={(date) => {
                  form.setFieldValue(
                    valuePath,
                    date ? date.toISOString() : null
                  )
                }}
                disabled={(date) => {
                  if (field.minDate && date < field.minDate) return true
                  if (field.maxDate && date > field.maxDate) return true
                  return false
                }}
                locale={locale === "ar" ? ar : enUS}
              />
            </PopoverContent>
          </Popover>
        )
      }
      case "time": {
        return (
          <Input
            key={fieldKey}
            type="time"
            placeholder={placeholder}
            {...form.getInputProps(valuePath)}
          />
        )
      }
      case "number":
        return (
          <Input
            key={fieldKey}
            type="number"
            placeholder={placeholder}
            {...form.getInputProps(valuePath)}
            min={field.min}
            max={field.max}
          />
        )
      case "textarea":
        return (
          <Textarea
            key={fieldKey}
            placeholder={placeholder}
            {...form.getInputProps(valuePath)}
            className="min-h-24"
          />
        )
      case "text":
        return (
          <Input
            key={fieldKey}
            type="text"
            placeholder={placeholder}
            {...form.getInputProps(valuePath)}
          />
        )
      case "singleChoice": {
        const options = field.options || []
        const selectedValue = typeof field.value === "string" ? field.value : ""
        const fieldId = `single-choice-${field.id}`

        if (options.length === 0) {
          return (
            <div key={fieldKey} className="text-muted-foreground text-sm">
              {t("projects.form.additionalFields.noOptions")}
            </div>
          )
        }

        return (
          <div key={fieldKey} className="space-y-2">
            {options.map((option, index) => {
              const optionId = `${fieldId}-${index}`
              return (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="radio"
                    id={optionId}
                    name={fieldId}
                    value={option}
                    checked={selectedValue === option}
                    onChange={(e) => {
                      form.setFieldValue(valuePath, e.target.value)
                    }}
                    className="text-primary focus:ring-primary h-4 w-4 border-gray-300"
                  />
                  <label
                    htmlFor={optionId}
                    className="cursor-pointer text-sm font-normal"
                  >
                    {option}
                  </label>
                </div>
              )
            })}
          </div>
        )
      }
      case "multipleChoice": {
        const options = field.options || []
        const selectedValues = Array.isArray(field.value)
          ? field.value
          : typeof field.value === "string"
            ? [field.value]
            : []

        if (options.length === 0) {
          return (
            <div key={fieldKey} className="text-muted-foreground text-sm">
              {t("projects.form.additionalFields.noOptions")}
            </div>
          )
        }

        return (
          <div key={fieldKey} className="space-y-2">
            {options.map((option, index) => {
              const isChecked = selectedValues.includes(option)
              return (
                <div key={index} className="flex items-center gap-2">
                  <Checkbox
                    checked={isChecked}
                    onCheckedChange={(checked) => {
                      const newValues = checked
                        ? [...selectedValues, option]
                        : selectedValues.filter((v) => v !== option)
                      form.setFieldValue(valuePath, newValues)
                    }}
                  />
                  <label className="cursor-pointer text-sm font-normal">
                    {option}
                  </label>
                </div>
              )
            })}
          </div>
        )
      }
      default:
        return null
    }
  }

  return (
    <div className="space-y-4">
      <FieldLegend>{t("projects.form.additionalFields.title")}</FieldLegend>

      {/* Existing Fields */}
      {additionalFields.length > 0 && (
        <div className="flex flex-col gap-4">
          {additionalFields.map((field, index) => (
            <div
              key={form.key(`additionalFields.${index}`)}
              className="flex items-end gap-2"
            >
              <div className="flex-1 space-y-3">
                <Field
                  data-invalid={
                    !!form.errors[`additionalFields.${index}.value`]
                  }
                >
                  <FieldLabel>
                    {field.label}
                    {field.required && (
                      <span className="text-destructive ml-1">*</span>
                    )}
                  </FieldLabel>
                  {renderFieldInput(field, index)}
                  {form.errors[`additionalFields.${index}.value`] && (
                    <FieldError
                      errors={[
                        {
                          message: String(
                            form.errors[`additionalFields.${index}.value`]
                          ),
                        },
                      ]}
                    />
                  )}
                </Field>
              </div>
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={() => removeField(index)}
                className="size-10 shrink-0"
              >
                <X className="size-4" />
                <span className="sr-only">
                  {t("projects.form.additionalFields.delete")}
                </span>
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Field Type Selection */}
      <div className="flex flex-wrap gap-4">
        {FIELD_TYPES.map((fieldType) => {
          const Icon = fieldType.icon
          return (
            <Button
              key={fieldType.type}
              type="button"
              variant="ghost"
              onClick={() => handleFieldTypeClick(fieldType.type)}
              className="justify-start"
            >
              <Icon className="text-primary size-5" />
              {t(
                `projects.form.additionalFields.fieldTypes.${fieldType.translationKey}`
              )}
            </Button>
          )
        })}
      </div>

      <AddFieldModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        fieldType={selectedFieldType}
        onAdd={handleAddField}
      />
    </div>
  )
}
