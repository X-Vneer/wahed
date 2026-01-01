"use client"

import * as React from "react"
import PhoneInput from "react-phone-number-input"
import type { Country, Value as PhoneValue } from "react-phone-number-input"
import "react-phone-number-input/style.css"

import { cn } from "@/lib/utils"

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
}

const PhoneInputComponent = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  (
    {
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
      ...props
    },
    ref
  ) => {
    return (
      <div dir="ltr">
        <PhoneInput
          international
          defaultCountry={defaultCountry}
          value={value}
          onChange={onChange || (() => {})}
          onBlur={onBlur}
          disabled={disabled}
          placeholder={placeholder}
          className={cn("phone-input-wrapper", className)}
          numberInputProps={{
            id,
            name,
            "aria-invalid": ariaInvalid,
            ref,
            className: cn(
              "dark:bg-input/30 border-input focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 disabled:bg-input/50 dark:disabled:bg-input/80 h-10 rounded-lg border bg-transparent px-2.5 py-1 text-base transition-colors focus-visible:ring-[3px] aria-invalid:ring-[3px] md:text-sm placeholder:text-muted-foreground w-full min-w-0 outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
              className
            ),
          }}
          countrySelectProps={{
            className: cn(
              "dark:bg-input/30 border-input focus-visible:border-ring focus-visible:ring-ring/50 disabled:bg-input/50 dark:disabled:bg-input/80 h-10 rounded-l-lg border-r-0 border bg-transparent px-2.5 inline-block py-1 text-base transition-colors focus-visible:ring-[3px] md:text-sm outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
            ),
          }}
          {...props}
        />
      </div>
    )
  }
)

PhoneInputComponent.displayName = "PhoneInput"

export { PhoneInputComponent as PhoneInput }
