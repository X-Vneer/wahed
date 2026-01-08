"use client"

import { UploadDropzone } from "@/lib/uploadthing"
import { CloudUpload } from "lucide-react"
import { useTranslations } from "next-intl"
import { ComponentProps } from "react"

export default function Uploader(props: ComponentProps<typeof UploadDropzone>) {
  const t = useTranslations()
  return (
    <UploadDropzone
      config={{
        mode: "auto",
      }}
      appearance={{
        button: " bg-primary! text-white",
        container:
          "bg-[#FFF5F2] py-10 border border-primary border-dashed rounded-lg p-4 w-full",
        label: "text-sm text-foreground text-normal mb-2",
        uploadIcon: "text-primary",
      }}
      content={{
        label: t("upload.label"),
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
