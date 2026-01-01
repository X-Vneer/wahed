import * as z from "zod"
import { isValidPhoneNumber } from "libphonenumber-js"

// User form schema - matches the frontend form validation
// Error messages are translation keys that should be translated when displaying errors
export const createUserSchema = z
  .object({
    name: z.string().min(1, "employees.errors.fullName.required"),
    phone: z.string().refine(
      (value) => {
        return isValidPhoneNumber(value || "")
      },
      {
        message: "employees.errors.phoneNumber.invalid",
      }
    ),
    roleName: z.string().min(1, "employees.errors.jobTitle.required"),
    email: z.email("employees.errors.email.invalid"),
    password: z.string().min(8, "employees.errors.password.minLength"),
    confirmPassword: z
      .string()
      .min(1, "employees.errors.confirmPassword.required"),
    allowAllPermissions: z.boolean(),
    permissions: z.array(z.string()),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "employees.errors.confirmPassword.mismatch",
    path: ["confirmPassword"],
  })

export const updateUserSchema = z
  .object({
    name: z.string().min(1, "employees.errors.fullName.required"),
    phone: z.string().refine(
      (value) => {
        return isValidPhoneNumber(value || "")
      },
      {
        message: "employees.errors.phoneNumber.invalid",
      }
    ),
    roleName: z.string().min(1, "employees.errors.jobTitle.required"),
    email: z.email("employees.errors.email.invalid"),
    password: z
      .string()
      .min(8, "employees.errors.password.minLength")
      .or(z.literal("")),
    confirmPassword: z
      .string()
      .min(8, "employees.errors.password.minLength")
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
      message: "employees.errors.confirmPassword.mismatch",
      path: ["confirmPassword"],
    }
  )

export type CreateUserInput = z.infer<typeof createUserSchema>
