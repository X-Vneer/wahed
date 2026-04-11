"use client"

import { useTranslations } from "next-intl"
import { usePublicProjectFormContext } from "./public-project-form-context"
import type { PublicProjectFormValues } from "./public-project-form-context"

export function usePublicProjectFieldErr() {
  const form = usePublicProjectFormContext()
  const t = useTranslations()

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
    ] as const
    const isKnownErr = (x: string): x is (typeof known)[number] =>
      (known as readonly string[]).includes(x)
    const message = isKnownErr(s)
      ? t(`websiteCms.projects.publicProjectForm.errors.${s}`)
      : s
    return [{ message }]
  }
}
