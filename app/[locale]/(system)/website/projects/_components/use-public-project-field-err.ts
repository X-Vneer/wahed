"use client"

import { usePublicProjectFormContext } from "./public-project-form-context"
import type { PublicProjectFormValues } from "./public-project-form-context"

export function usePublicProjectFieldErr() {
  const form = usePublicProjectFormContext()

  return (key: keyof PublicProjectFormValues) => {
    const e = form.errors[key]
    if (!e) return null
    const s = String(e)
    const known = [
      "titleArRequired",
      "titleEnRequired",
      "slugRequired",
      "slugMinLength",
      "slugInvalid",
      "shortDescriptionArRequired",
      "shortDescriptionEnRequired",
      "descriptionArRequired",
      "descriptionEnRequired",
      "cityIdRequired",
      "regionIdRequired",
      "imagesMinFive",
    ] as const
    const isKnownErr = (x: string): x is (typeof known)[number] =>
      (known as readonly string[]).includes(x)
    const message = isKnownErr(s)
      ? `websiteCms.projects.publicProjectForm.errors.${s}`
      : s
    return [{ message }]
  }
}
