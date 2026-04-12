"use client"

import { PublicProjectForm } from "./public-project-form"

type CreatePublicProjectFormProps = {
  linkedProjectId?: string | null
}

export function CreatePublicProjectForm({
  linkedProjectId,
}: CreatePublicProjectFormProps) {
  return (
    <PublicProjectForm mode="create" linkedProjectId={linkedProjectId} />
  )
}
