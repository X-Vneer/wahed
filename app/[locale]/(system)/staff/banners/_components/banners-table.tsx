"use client"

import { BaseTable, type TableQueryResponse } from "@/components/table/table"
import { Button } from "@/components/ui/button"
import type { BannerInclude } from "@/prisma/banners"
import apiClient from "@/services"
import { Plus } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { useActionsColumn } from "./actions-column"
import { BannerDialog } from "./banner-dialog"
import { useBannerColumns } from "./columns"

export function BannersTable() {
    const t = useTranslations()
    const [dialogOpen, setDialogOpen] = useState(false)
    const [selectedBanner, setSelectedBanner] = useState<BannerInclude | null>(null)

    const handleEditClick = (banner: BannerInclude) => {
        setSelectedBanner(banner)
        setDialogOpen(true)
    }

    const handleCreateClick = () => {
        setSelectedBanner(null)
        setDialogOpen(true)
    }

    const handleDialogClose = () => {
        setDialogOpen(false)
        setSelectedBanner(null)
    }

    const queryFn = async (
        searchParams: URLSearchParams
    ): Promise<TableQueryResponse<BannerInclude>> => {
        const search = searchParams.get("q") || ""
        const page = parseInt(searchParams.get("page") || "1", 10)
        const perPage = parseInt(searchParams.get("per_page") || "15", 10)

        const response = await apiClient.get("/api/banners", {
            params: {
                q: search || undefined,
                page,
                per_page: perPage,
            },
        })

        // Transform the response to match TableQueryResponse format
        // Since the API returns an array, we need to handle pagination on the client
        // or update the API to return paginated response
        const data = response.data as BannerInclude[]
        const startIndex = (page - 1) * perPage
        const endIndex = startIndex + perPage
        const paginatedData = data.slice(startIndex, endIndex)

        return {
            data: paginatedData,
            from: startIndex + 1,
            to: Math.min(endIndex, data.length),
            total: data.length,
            per_page: perPage,
            current_page: page,
            last_page: Math.ceil(data.length / perPage),
        }
    }

    const columns = useBannerColumns()
    const actionsColumn = useActionsColumn({
        onEdit: handleEditClick,
    })

    const allColumns = [...columns, actionsColumn]

    return (
        <>
            <BaseTable<BannerInclude>
                columns={allColumns}
                queryKey={["banners"]}
                queryFn={queryFn}
                emptyMessage={t("banners.no_banners_found")}
            >
                <Button onClick={handleCreateClick}>
                    <Plus className="mr-2 size-4" />
                    {t("banners.add")}
                </Button>
            </BaseTable>

            <BannerDialog
                open={dialogOpen}
                onOpenChange={handleDialogClose}
                selectedBanner={selectedBanner}
            />
        </>
    )
}

