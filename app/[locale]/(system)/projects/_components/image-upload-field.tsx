/* eslint-disable @next/next/no-img-element */
"use client"

import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import Uploader from "@/components/uploader"
import { X } from "lucide-react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { useProjectFormContext } from "./project-form-context"

export function ImageUploadField() {
  const t = useTranslations()
  const form = useProjectFormContext()
  const imageUrl = form.values.image || ""

  const handleImageUpload = (url: string) => {
    form.setFieldValue("image", url)
  }

  const handleImageRemove = () => {
    form.setFieldValue("image", "")
  }

  return (
    <Field>
      <FieldLabel aria-invalid={!!form.errors.image}>
        {t("projects.form.imageUpload")}
      </FieldLabel>
      {!imageUrl ? (
        <div className="relative">
          <Uploader
            endpoint="projectImageUploader"
            onClientUploadComplete={(res) => {
              console.log("🚀 ~ ImageUploadField ~ res:", res)
              handleImageUpload(res[0].ufsUrl)
            }}
            onUploadError={(error: Error) => {
              toast.error(error.message || "Upload failed")
            }}
          />
        </div>
      ) : (
        <div className="relative inline-block">
          <div className="relative h-[230px] w-full overflow-hidden rounded-lg border p-1">
            <img
              src={imageUrl}
              alt="Project"
              className="h-full w-full object-contain"
            />
            <Button
              size={"icon"}
              className="absolute top-2 right-2"
              variant={"destructive"}
              onClick={handleImageRemove}
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>
      )}
      {form.errors.image && (
        <FieldError errors={[{ message: String(form.errors.image) }]} />
      )}
    </Field>
  )
}
