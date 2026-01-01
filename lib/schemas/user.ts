import * as z from "zod"

// User form schema - matches the frontend form validation
// Error messages are translation keys that should be translated when displaying errors
export const createUserSchema = z
  .object({
    name: z.string().min(1, "employees.errors.fullName.required"),
    phone: z.string(),
    roleName: z.string().min(1, "employees.errors.jobTitle.required"),
    email: z.email("employees.errors.email.invalid"),
    password: z.string().min(8, "employees.errors.password.minLength"),
    role: z.enum(["ADMIN", "STAFF"], {
      error: "employees.errors.role.invalid",
    }),
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

export type CreateUserInput = z.infer<typeof createUserSchema>
