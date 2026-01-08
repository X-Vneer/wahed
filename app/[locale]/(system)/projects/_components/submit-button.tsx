"use client"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { useProjectFormContext } from "./project-form-context"
import { useTranslations } from "next-intl"
import { Card, CardContent } from "@/components/ui/card"

export function SubmitButton() {
  const t = useTranslations()
  const form = useProjectFormContext()

  return (
    <Card className="ring-none shadow-none ring-0">
      <CardContent>
        <div className="flex justify-end">
          <Button type="submit" disabled={form.submitting}>
            {form.submitting ? (
              <>
                <Spinner className="mr-2" />
                {t("projects.form.submitting")}
              </>
            ) : (
              t("projects.form.submit")
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
