"use client"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { useProjectFormContext } from "./project-form-context"
import { useTranslations } from "next-intl"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { useParams } from "next/navigation"

export function SubmitButton() {
  const { id } = useParams()
  const t = useTranslations()
  const form = useProjectFormContext()

  return (
    <Card className="ring-none shadow-none ring-0">
      <CardContent>
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            className={"px-8"}
            nativeButton={false}
            disabled={form.submitting}
            render={
              <Link href={id ? `/projects/${id}` : "/projects"}>
                {t("common.cancel")}
              </Link>
            }
          />

          <Button type="submit" className={"px-8"} disabled={form.submitting}>
            {form.submitting ? (
              <>
                <Spinner className="me-2" />
              </>
            ) : null}
            {id ? t("common.update") : t("projects.form.submit")}
          </Button>
        </div>
        {form.errors.root && (
          <div className="text-sm text-red-500">{form.errors.root}</div>
        )}
      </CardContent>
    </Card>
  )
}
