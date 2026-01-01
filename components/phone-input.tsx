"use client"

import * as React from "react"
import type { Country, Value as PhoneValue } from "react-phone-number-input"
import PhoneInput from "react-phone-number-input"
import "react-phone-number-input/style.css"
import ar from "react-phone-number-input/locale/ar"
import en from "react-phone-number-input/locale/en"

import { Input } from "./ui/input"
import { useLocale } from "next-intl"

interface PhoneInputProps {
  value?: PhoneValue
  onChange?: (value: PhoneValue | undefined) => void
  onBlur?: () => void
  placeholder?: string
  className?: string
  disabled?: boolean
  defaultCountry?: Country
  id?: string
  name?: string
  "aria-invalid"?: boolean
  ref?: React.Ref<HTMLInputElement>
}

function PhoneInputComponent({
  value,
  onChange,
  onBlur,
  placeholder,
  className,
  disabled,
  defaultCountry = "SA",
  id,
  name,
  "aria-invalid": ariaInvalid,
  ref,
  ...props
}: PhoneInputProps) {
  const locale = useLocale()
  const isArabic = locale === "ar"
  return (
    <div dir="ltr">
      <PhoneInput
        international
        labels={isArabic ? ar : en}
        defaultCountry={defaultCountry}
        value={value}
        onChange={onChange || (() => {})}
        onBlur={onBlur}
        disabled={disabled}
        inputComponent={Input}
        phoneInputProps={{
          ref: ref,
          className: className,
          "aria-invalid": ariaInvalid,
          name: name,
          id: id,
        }}
        placeholder={placeholder}
        {...props}
      />
    </div>
  )
}

export { PhoneInputComponent as PhoneInput }
