"use client"

import { UploadDropzone } from "@/lib/uploadthing"
import { CloudUpload } from "lucide-react"
import { useTranslations } from "next-intl"
import { ComponentProps } from "react"
import { cn } from "@/lib/utils"

type UploaderProps = ComponentProps<typeof UploadDropzone> & {
  variant?: "default" | "circular"
}

export default function Uploader({ variant = "default", ...props }: UploaderProps) {
  const t = useTranslations()
  const isCircular = variant === "circular"
  
  return (
    <UploadDropzone
      config={{
        mode: "auto",
      }}
      appearance={{
        button: isCircular ? "hidden" : " bg-primary! text-white ",
        container: cn(
          "bg-[#FFF5F2] border border-primary border-dashed p-4 w-full",
          isCircular
            ? "rounded-full! w-[200px] aspect-square  flex flex-col items-center justify-center p-2!"
            : "rounded-lg py-10"
        ),
        label: isCircular ? "text-xs text-foreground text-normal " : "text-sm text-foreground text-normal mb-2",
        uploadIcon: "text-primary",

      }}
      content={{
        label:  t("upload.label"),
        uploadIcon: <CloudUpload className="text-primary" />,
      }}
      onClientUploadComplete={(res) => {
        console.log("Files: ", res)
      }}
      onUploadError={(error: Error) => {
        console.log("Error: ", error)
      }}
      {...props}
    />
  )
}
