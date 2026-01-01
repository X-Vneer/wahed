import * as z from "zod/v4"
import { isValidPhoneNumber } from "libphonenumber-js"

// User form schema - matches the frontend form validation
// Error messages are translation keys that should be translated when displaying errors
export const createUserSchema = z
  .object({
    name: z.string().min(1, { error: "employees.errors.fullName.required" }),
    phone: z.string().refine(
      (value) => {
        return isValidPhoneNumber(value || "")
      },
      {
        error: "employees.errors.phoneNumber.invalid",
      }
    ),
    roleName: z
      .string()
      .min(1, { error: "employees.errors.jobTitle.required" }),
    email: z.email({ error: "employees.errors.email.invalid" }),
    password: z
      .string()
      .min(8, { error: "employees.errors.password.minLength" }),
    confirmPassword: z
      .string()
      .min(1, { error: "employees.errors.confirmPassword.required" }),
    allowAllPermissions: z.boolean(),
    permissions: z.array(z.string()),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: "employees.errors.confirmPassword.mismatch",
    path: ["confirmPassword"],
  })

export const updateUserSchema = z
  .object({
    name: z.string().min(1, { error: "employees.errors.fullName.required" }),
    phone: z.string().refine(
      (value) => {
        return isValidPhoneNumber(value || "")
      },
      {
        error: "employees.errors.phoneNumber.invalid",
      }
    ),
    roleName: z
      .string()
      .min(1, { error: "employees.errors.jobTitle.required" }),
    email: z.email({ error: "employees.errors.email.invalid" }),
    password: z
      .string()
      .min(8, { error: "employees.errors.password.minLength" })
      .or(z.literal("")),
    confirmPassword: z
      .string()
      .min(8, { error: "employees.errors.password.minLength" })
      .or(z.literal("")),
    allowAllPermissions: z.boolean(),
    permissions: z.array(z.string()),
  })
  .refine(
    (data) => {
      if (!data.password && !data.confirmPassword) {
        return true
      }
      return data.password === data.confirmPassword
    },
    {
      error: "employees.errors.confirmPassword.mismatch",
      path: ["confirmPassword"],
    }
  )

export type CreateUserInput = z.infer<typeof createUserSchema>
