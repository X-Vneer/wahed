"use client"

import { FormFileUpload } from "@/components/form-file-upload"
import { Card, CardContent } from "@/components/ui/card"
import { Field, FieldLabel } from "@/components/ui/field"
import { useTranslations } from "next-intl"
import { useProjectFormContext } from "./project-form-context"

export function AttachmentsUploadField() {
  const t = useTranslations()
  const form = useProjectFormContext()
  const attachments = form.values.attachments || []

  return (
    <Card className="ring-none shadow-none ring-0">
      <CardContent>
        <Field>
          <FieldLabel className="mb-4 w-full text-lg font-bold">
            {t("projects.form.attachments.title")}
          </FieldLabel>
          <FormFileUpload
            endpoint="projectAttachmentsUploader"
            value={attachments.map((a) => ({
              fileUrl: a.fileUrl,
              fileName: a.fileName ?? a.fileUrl,
              fileType: a.fileType ?? undefined,
              fileSize: a.fileSize ?? undefined,
            }))}
            onChange={(files) => form.setFieldValue("attachments", files)}
          />
        </Field>
      </CardContent>
    </Card>
  )
}
