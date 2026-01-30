/* eslint-disable @next/next/no-img-element */
"use client"

import type { ColumnDef } from "@tanstack/react-table"
import type { WebsiteWithLocale } from "@/hooks/use-websites"
import { useTranslations, useLocale } from "next-intl"
import { format } from "date-fns"
import { ar, enUS } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { useUpdateWebsite } from "@/hooks/use-websites"
import { ExternalLink } from "lucide-react"

export const useWebsiteColumns = () => {
  const t = useTranslations()
  const locale = useLocale()
  const updateWebsiteMutation = useUpdateWebsite()

  const columns: ColumnDef<WebsiteWithLocale>[] = [
    {
      accessorKey: "image",
      header: t("websites.table.image"),
      cell: ({ row }) => {
        const image = row.original.image
        return image ? (
          <img
            src={image}
            alt="Website"
            className="h-12 w-20 rounded object-cover"
          />
        ) : (
          <span className="text-muted-foreground text-sm">-</span>
        )
      },
    },
    {
      accessorKey: "nameAr",
      header: t("websites.table.nameAr"),
      cell: ({ row }) => row.original.nameAr || "-",
    },
    {
      accessorKey: "nameEn",
      header: t("websites.table.nameEn"),
      cell: ({ row }) => row.original.nameEn || "-",
    },
    {
      accessorKey: "url",
      header: t("websites.table.url"),
      cell: ({ row }) => {
        const url = row.original.url
        return url ? (
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="text-primary flex items-center gap-1 text-sm underline hover:opacity-80"
          >
            {url}
            <ExternalLink className="size-3" />
          </a>
        ) : (
          <span className="text-muted-foreground text-sm">-</span>
        )
      },
    },
    {
      accessorKey: "createdAt",
      header: t("websites.table.createdAt"),
      cell: ({ row }) => {
        const date = row.getValue("createdAt") as Date
        return format(date, "PPP", {
          locale: locale === "ar" ? ar : enUS,
        })
      },
    },
    {
      id: "activity",
      header: t("websites.table.activity"),
      cell: ({ row }) => {
        const website = row.original

        return (
          <Switch
            checked={website.isActive}
            disabled={updateWebsiteMutation.isPending}
            onCheckedChange={(checked) => {
              updateWebsiteMutation.mutate({
                id: website.id,
                data: { isActive: checked },
              })
            }}
            aria-label={t("websites.table.activity")}
          />
        )
      },
    },
    {
      accessorKey: "status",
      header: t("websites.table.status"),
      cell: ({ row }) => {
        const website = row.original
        const status = website.isActive
          ? { label: t("websites.status.active"), variant: "default" as const }
          : {
              label: t("websites.status.inactive"),
              variant: "secondary" as const,
            }
        return <Badge variant={status.variant}>{status.label}</Badge>
      },
    },
  ]

  return columns
}
