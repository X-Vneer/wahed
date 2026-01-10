"use client"
import { Button } from "@/components/ui/button"
import { Link } from "@/lib/i18n/navigation"
import { useTranslations } from "next-intl"
import { useParams } from "next/navigation"
import { PencilIcon } from "lucide-react"

export function EditProjectLink() {
  const { id } = useParams()
  const t = useTranslations()
  return (
    <Button
      nativeButton={false}
      render={
        <Link href={`/projects/${id}/edit`}>
          {" "}
          <PencilIcon className="size-4" /> {t("common.edit")}
        </Link>
      }
    />
  )
}
