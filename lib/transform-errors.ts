import * as z from "zod"

/**
 * Simple error object where keys represent paths to inputs and values are error messages.
 * Example: { "username": "Invalid input...", "favoriteNumbers[1]": "Invalid input..." }
 */
export type SimpleZodError = Record<string, string>

/**
 * Converts a Zod path array to a string key.
 * Example: ["favoriteNumbers", 1] -> "favoriteNumbers[1]"
 * Example: ["username"] -> "username"
 */
function pathToKey(path: readonly (string | number | symbol)[]): string {
  if (path.length === 0) {
    return ""
  }

  const [first, ...rest] = path
  let key = String(first)

  for (const segment of rest) {
    if (typeof segment === "number") {
      key += `[${segment}]`
    } else if (typeof segment === "string") {
      key += `.${segment}`
    } else {
      // Handle symbols by converting to string
      key += `.${String(segment)}`
    }
  }

  return key
}

/**
 * Transforms a Zod error into a simple key-value object.
 * Keys represent the path to the input, values are the error messages.
 *
 * @param error - The Zod error to transform
 * @returns A simple object mapping paths to error messages
 *
 * @example
 * ```ts
 * const result = schema.safeParse(data)
 * if (!result.success) {
 *   const errors = transformZodError(result.error)
 *   // { "username": "Invalid input: expected string, received number" }
 * }
 * ```
 *
 * @example
 * ```ts
 * const result = schema.safeParse({
 *   username: 1234,
 *   favoriteNumbers: [1234, "4567"]
 * })
 * if (!result.success) {
 *   const errors = transformZodError(result.error)
 *   // {
 *   //   "username": "Invalid input: expected string, received number",
 *   //   "favoriteNumbers[1]": "Invalid input: expected number, received string"
 *   // }
 * }
 * ```
 */
export function transformZodError(error: z.ZodError): SimpleZodError {
  const errors: SimpleZodError = {}

  for (const issue of error.issues) {
    const key = pathToKey(issue.path)
    // If multiple errors exist for the same path, join them with a separator
    if (key in errors) {
      errors[key] += `, ${issue.message}`
    } else {
      errors[key] = issue.message
    }
  }

  return errors
}
