import * as z from "zod"

// User form schema - matches the frontend form validation
export const createUserSchema = z
  .object({
    name: z.string().min(1, "Full name is required"),
    phoneCountryCode: z.string(),
    phoneNumber: z.string().min(1, "Phone number is required"),
    jobTitle: z.string().min(1, "Job title is required"),
    email: z.email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Confirm password is required"),
    allowAllPermissions: z.boolean(),
    permissions: z.array(z.string()),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export type CreateUserInput = z.infer<typeof createUserSchema>
