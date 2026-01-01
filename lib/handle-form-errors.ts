import type { AxiosError } from "axios"
import type { UseFormReturnType } from "@mantine/form"
import { ErrorResponse } from "@/@types/error"

/**
 * Handles server errors by mapping field-specific errors to form fields
 * and returning the main error message for root error display.
 *
 * @param error - The axios error from the server
 * @param form - The Mantine form instance
 * @returns The main error message (if any) to be displayed as root error
 *
 * @example
 * ```ts
 * try {
 *   await axios.post("/api/users", values)
 * } catch (error) {
 *   if (axios.isAxiosError(error)) {
 *     const rootError = handleFormErrors(error, form)
 *     setServerError(rootError)
 *   }
 * }
 * ```
 */
export function handleFormErrors<T extends Record<string, unknown>>(
  error: AxiosError<ErrorResponse>,
  form: UseFormReturnType<T>
): string | null {
  const responseData = error.response?.data

  if (!responseData) {
    return null
  }

  // Map field-specific errors to form fields
  if (responseData.details && typeof responseData.details === "object") {
    // Build errors object for all fields
    const fieldErrors: Partial<Record<keyof T, string>> = {}

    Object.entries(responseData.details).forEach(
      ([fieldName, errorMessage]) => {
        if (fieldName && errorMessage) {
          fieldErrors[fieldName as keyof T] = String(errorMessage)
        }
      }
    )

    // Set all field errors at once (this will overwrite existing errors)
    if (Object.keys(fieldErrors).length > 0) {
      // Use setFieldError for each field to ensure proper typing
      Object.entries(fieldErrors).forEach(([fieldName, errorMessage]) => {
        form.setFieldError(fieldName, errorMessage)
      })
    }
  }

  // Return the main error message for root error display
  return responseData.error || null
}
