import { createFormContext } from "@mantine/form"
import type { ProjectFormValues } from "@/lib/schemas/project"

// Create form context for project form
// This allows child components to access the form without prop drilling
export const [ProjectFormProvider, useProjectFormContext, useProjectForm] =
  createFormContext<ProjectFormValues>()
