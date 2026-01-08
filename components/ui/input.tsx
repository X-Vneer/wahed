import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({
  className,
  type,
  defaultValue,
  value,
  onChange,
  ...props
}: React.ComponentProps<"input">) {
  // Convert uncontrolled to controlled to prevent Base UI warnings
  // Base UI's FieldControl doesn't allow defaultValue to change after initialization
  // So we always use controlled mode by converting defaultValue to value
  const [internalValue, setInternalValue] = React.useState(
    () => defaultValue ?? value ?? ""
  )

  // Use controlled value if provided, otherwise use internal state
  const controlledValue = value !== undefined ? value : internalValue

  // Handle changes - update internal state if uncontrolled, or call external onChange
  const handleChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (value === undefined) {
        // Uncontrolled mode - update internal state
        setInternalValue(e.target.value)
      }
      // Call external onChange if provided
      onChange?.(e)
    },
    [value, onChange]
  )

  // Sync internal value when defaultValue changes (for form resets)
  // This ensures the input stays in sync with form state
  React.useEffect(() => {
    if (value === undefined && defaultValue !== undefined) {
      setInternalValue(String(defaultValue))
    }
  }, [defaultValue, value])

  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "dark:bg-input/30 border-input focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 disabled:bg-input/50 dark:disabled:bg-input/80 file:text-foreground placeholder:text-muted-foreground h-10 w-full min-w-0 rounded-lg border bg-transparent px-2.5 py-1 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-[3px] md:text-sm",
        className
      )}
      value={controlledValue}
      onChange={handleChange}
      {...props}
    />
  )
}

export { Input }
