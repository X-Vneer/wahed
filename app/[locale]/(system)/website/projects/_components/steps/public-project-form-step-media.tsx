"use client"

import {
  FormFileUpload,
  type UploadedFileAttachment,
} from "@/components/form-file-upload"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
import Uploader from "@/components/uploader"
import { useTranslations } from "next-intl"
import { ExternalLink, X } from "lucide-react"
import { toast } from "sonner"
import { usePublicProjectFormContext } from "../public-project-form-context"
import { usePublicProjectFieldErr } from "../use-public-project-field-err"

export function PublicProjectFormStepMedia() {
  const form = usePublicProjectFormContext()
  const t = useTranslations()
  const fieldErr = usePublicProjectFieldErr()

  const toggleLinkedFile = (fileUrl: string, checked: boolean) => {
    const next = new Set(form.values.selectedLinkedFileUrls)
    if (checked) next.add(fileUrl)
    else next.delete(fileUrl)
    form.setFieldValue("selectedLinkedFileUrls", [...next])
  }

  return (
    <div className="space-y-8">
      <FieldSet className="gap-6">
        <FieldLegend>
          {t("websiteCms.projects.publicProjectForm.sections.gallery")}
        </FieldLegend>
        <Field data-invalid={!!form.errors.images}>
          <FieldLabel>
            {t("websiteCms.projects.publicProjectForm.fields.images")}
          </FieldLabel>
          <FieldDescription>
            {t("websiteCms.projects.publicProjectForm.ui.galleryHint")}
          </FieldDescription>
          <div className="bg-muted/40 mt-2 rounded-xl border border-dashed p-4">
            <Uploader
              endpoint="websiteMultiImageUploader"
              onClientUploadComplete={(res) => {
                if (res?.length) {
                  const urls = res.map((f) => f.ufsUrl)
                  form.setFieldValue("images", [
                    ...form.values.images,
                    ...urls,
                  ])
                }
              }}
              onUploadError={(err: Error) => {
                toast.error(err.message || t("errors.internal_server_error"))
              }}
            />
          </div>
          {form.errors.images ? (
            <FieldError errors={fieldErr("images")!} />
          ) : null}
        </Field>
        {form.values.images.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {form.values.images.map((url, index) => (
              <div
                key={`${url}-${index}`}
                className="bg-muted/20 relative rounded-lg border p-2"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt=""
                  className="h-32 w-full rounded-md object-cover"
                />
                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  className="absolute end-3 top-3 h-8 w-8"
                  onClick={() =>
                    form.setFieldValue(
                      "images",
                      form.values.images.filter((_, i) => i !== index)
                    )
                  }
                  aria-label={t(
                    "websiteCms.projects.publicProjectForm.ui.removeImage"
                  )}
                >
                  <X className="size-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">
            {t("websiteCms.projects.publicProjectForm.ui.noImages")}
          </p>
        )}
      </FieldSet>

      <FieldSet className="gap-6">
        <FieldLegend>
          {t("websiteCms.projects.publicProjectForm.sections.attachments")}
        </FieldLegend>

        {form.values.linkedAttachmentCandidates.length > 0 ? (
          <Field>
            <FieldLabel>
              {t(
                "websiteCms.projects.publicProjectForm.ui.linkedProjectFilesSection"
              )}
            </FieldLabel>
            <FieldDescription>
              {t(
                "websiteCms.projects.publicProjectForm.ui.linkedProjectFilesHint"
              )}
            </FieldDescription>
            <ul className="mt-3 space-y-2 rounded-lg border p-3">
              {form.values.linkedAttachmentCandidates.map((file, index) => {
                const checked = form.values.selectedLinkedFileUrls.includes(
                  file.fileUrl
                )
                const label = file.fileName || file.fileUrl
                return (
                  <li
                    key={`${file.fileUrl}-${index}`}
                    className="flex flex-wrap items-center gap-3 rounded-md border border-transparent px-2 py-2 hover:bg-muted/30"
                  >
                    <Checkbox
                      id={`linked-file-${index}`}
                      checked={checked}
                      onCheckedChange={(c) =>
                        toggleLinkedFile(file.fileUrl, Boolean(c))
                      }
                    />
                    <label
                      htmlFor={`linked-file-${index}`}
                      className="flex min-w-0 flex-1 cursor-pointer text-sm font-medium"
                    >
                      <span className="truncate">{label}</span>
                    </label>
                    <a
                      href={file.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary inline-flex shrink-0 items-center gap-1 text-sm underline-offset-4 hover:underline"
                    >
                      <ExternalLink className="size-3.5" aria-hidden />
                      {t(
                        "websiteCms.projects.publicProjectForm.ui.openLinkedFile"
                      )}
                    </a>
                  </li>
                )
              })}
            </ul>
          </Field>
        ) : null}

        <Field>
          <FieldLabel>
            {t("websiteCms.projects.publicProjectForm.fields.attachments")}
          </FieldLabel>
          <FieldDescription>
            {form.values.linkedAttachmentCandidates.length > 0
              ? t(
                  "websiteCms.projects.publicProjectForm.ui.attachmentsUploadMoreHint"
                )
              : t("websiteCms.projects.publicProjectForm.ui.attachmentsHint")}
          </FieldDescription>
          <Card className="ring-none mt-2 shadow-none ring-0">
            <CardContent className="pt-6">
              <FormFileUpload
                endpoint="projectAttachmentsUploader"
                value={form.values.attachments.map((a) => ({
                  fileUrl: a.fileUrl,
                  fileName: a.fileName ?? a.fileUrl,
                  fileType: a.fileType ?? undefined,
                  fileSize: a.fileSize ?? undefined,
                }))}
                onChange={(files: UploadedFileAttachment[]) =>
                  form.setFieldValue("attachments", files)
                }
              />
            </CardContent>
          </Card>
        </Field>
      </FieldSet>
    </div>
  )
}
