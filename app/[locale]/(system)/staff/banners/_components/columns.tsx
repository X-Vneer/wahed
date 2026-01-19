/* eslint-disable @next/next/no-img-element */
"use client"

import type { ColumnDef } from "@tanstack/react-table"
import type { BannerInclude } from "@/prisma/banners"
import { useTranslations, useLocale } from "next-intl"
import { format } from "date-fns"
import { ar, enUS } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import UserAvatar from "@/components/user-avatar"

export const useBannerColumns = () => {
    const t = useTranslations()
    const locale = useLocale()

    const getBannerStatus = (banner: BannerInclude) => {
        const now = new Date()
        const startDate = new Date(banner.startDate)
        const endDate = new Date(banner.endDate)

        if (!banner.isActive) {
            return { label: t("banners.status.inactive"), variant: "secondary" as const }
        }
        if (now < startDate) {
            return { label: t("banners.status.scheduled"), variant: "default" as const }
        }
        if (now >= startDate && now <= endDate) {
            return { label: t("banners.status.active"), variant: "default" as const }
        }
        return { label: t("banners.status.expired"), variant: "destructive" as const }
    }

    const columns: ColumnDef<BannerInclude>[] = [
        {
            accessorKey: "image",
            header: t("banners.table.image"),
            cell: ({ row }) => {
                const image = row.original.image
                return image ? (
                    <img
                        src={image}
                        alt="Banner"
                        className="h-12 w-20 rounded object-cover"
                    />
                ) : (
                    <span className="text-muted-foreground text-sm">-</span>
                )
            },
        },
        {
            accessorKey: "titleAr",
            header: t("banners.table.titleAr"),
            cell: ({ row }) => row.original.titleAr || "-",
        },
        {
            accessorKey: "titleEn",
            header: t("banners.table.titleEn"),
            cell: ({ row }) => row.original.titleEn || "-",
        },
        {
            accessorKey: "startDate",
            header: t("banners.table.startDate"),
            cell: ({ row }) => {
                const date = row.getValue("startDate") as Date
                return format(date, "PPP", {
                    locale: locale === "ar" ? ar : enUS,
                })
            },
        },
        {
            accessorKey: "endDate",
            header: t("banners.table.endDate"),
            cell: ({ row }) => {
                const date = row.getValue("endDate") as Date
                return format(date, "PPP", {
                    locale: locale === "ar" ? ar : enUS,
                })
            },
        },
        {
            accessorKey: "users",
            header: t("banners.table.visibleTo"),
            cell: ({ row }) => {
                const users = row.original.users
                if (!users || users.length === 0) {
                    return (
                        <span className="text-muted-foreground text-sm">
                            {t("banners.form.public")}
                        </span>
                    )
                }
                return (
                    <div className="flex gap-1">
                        {users.map((user) => (
                            <UserAvatar key={user.id} {...user} />
                        ))}
                    </div>
                )
            },
        },
        {
            accessorKey: "status",
            header: t("banners.table.status"),
            cell: ({ row }) => {
                const status = getBannerStatus(row.original)
                return <Badge variant={status.variant}>{status.label}</Badge>
            },
        },
    ]

    return columns
}

