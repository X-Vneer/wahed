/* eslint-disable @next/next/no-img-element */
"use client"

import { Button } from "@/components/ui/button"
import { FieldError } from "@/components/ui/field"
import Uploader from "@/components/uploader"
import { X } from "lucide-react"
import { toast } from "sonner"

type LogoUploadSlotProps = {
  label: string
  hint: string
  value: string
  onChange: (url: string) => void
  error?: string
  previewClassName: string
  removeLabel: string
  disabled: boolean
}

export function LogoUploadSlot({
  label,
  hint,
  value,
  onChange,
  error,
  previewClassName,
  removeLabel,
  disabled,
}: LogoUploadSlotProps) {
  return (
    <div
      className="border-border/60 bg-muted/15 flex flex-col gap-2 rounded-xl border p-3"
      data-invalid={!!error}
    >
      <div className="space-y-0.5">
        <p className="text-xs leading-tight font-medium">{label}</p>
        <p className="text-muted-foreground text-[11px] leading-snug">{hint}</p>
      </div>
      {error ? <FieldError>{error}</FieldError> : null}
      {value ? (
        <div
          className={`border-border/40 relative flex h-24 w-full items-center justify-center overflow-hidden rounded-lg border ${previewClassName}`}
        >
          <img
            src={value}
            alt=""
            className="max-h-17 max-w-[92%] object-contain"
          />
          <Button
            size="icon"
            type="button"
            variant="destructive"
            className="absolute top-1.5 right-1.5 size-7"
            onClick={() => onChange("")}
            aria-label={removeLabel}
            disabled={disabled}
          >
            <X className="size-3.5" />
          </Button>
        </div>
      ) : (
        <div className="border-border/60 bg-background/40 rounded-lg border border-dashed p-2">
          <Uploader
            endpoint="websiteImageUploader"
            disabled={disabled}
            onClientUploadComplete={(res) => {
              if (res?.[0]?.ufsUrl) {
                onChange(res[0].ufsUrl)
              }
            }}
            onUploadError={(err) => {
              toast.error(err.message)
            }}
          />
        </div>
      )}
    </div>
  )
}
