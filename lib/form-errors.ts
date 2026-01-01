import type { ErrorResponse } from "@/@types/error"

/**
 * Minimal type for form instance that has the setFieldMeta method we need
 * Uses a flexible updater type to be compatible with TanStack Form's Updater type
 */
type FormWithSetFieldMeta<TFormData> = {
  setFieldMeta: <TField extends keyof TFormData>(
    name: TField,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    updater: any
  ) => void
}

/**
 * Handles form errors from API responses.
 * Sets field-specific errors and returns a general error message if present.
 *
 * @param error - The error object (typically from axios)
 * @param form - The TanStack Form instance
 * @returns The general error message, or null if no general error
 *
 * @example
 * ```ts
 * try {
 *   await axios.post("/api/users", value)
 * } catch (error) {
 *   const generalError = handleFormError(error, form)
 *   if (generalError) {
 *     setServerError(generalError)
 *   }
 * }
 * ```
 */
export function handleFormError<TFormData>(
  error: unknown,
  form: FormWithSetFieldMeta<TFormData>
): string | null {
  // Check if it's an axios error with a response
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    error.response &&
    typeof error.response === "object" &&
    "data" in error.response
  ) {
    const responseData = error.response.data as ErrorResponse

    // Handle field-specific errors
    if (responseData.details) {
      for (const [fieldName, errorMessage] of Object.entries(
        responseData.details
      )) {
        form.setFieldMeta(
          fieldName as keyof TFormData,
          (meta: { errors?: Array<{ message: string }> }) => ({
            ...meta,
            errors: [...(meta.errors || []), { message: errorMessage }],
          })
        )
      }
    }

    // Return general error message if present
    return responseData.error || null
  }

  // Handle non-axios errors or errors without response
  if (error instanceof Error) {
    return error.message
  }

  return "An unexpected error occurred"
}
