"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Search, Plus, Trash2 } from "lucide-react"
import { useBanners, useDeleteBanner, type Banner } from "@/hooks/use-banners"
import { useDebouncedValue } from "@/hooks/use-debounced"
import { parseAsString, useQueryState } from "nuqs"
import { format } from "date-fns"
import { ar, enUS } from "date-fns/locale"
import { useLocale } from "next-intl"
import { Badge } from "@/components/ui/badge"

export function BannersList() {
  const t = useTranslations()
  const locale = useLocale()
  const [q, setQ] = useState("")
  const debouncedValue = useDebouncedValue(q, 500)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [bannerToDelete, setBannerToDelete] = useState<string | null>(null)

  const { data: banners = [], isLoading } = useBanners({ q: debouncedValue })
  const deleteBanner = useDeleteBanner()

  // Selected banner
  const [selectedBanner, setSelectedBanner] = useQueryState(
    "banner_id",
    parseAsString.withDefault("")
  )

  const handleSelectBanner = (banner: Banner) => {
    setSelectedBanner(banner.id)
  }

  const handleDeleteClick = (bannerId: string) => {
    setBannerToDelete(bannerId)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!bannerToDelete) return
    deleteBanner.mutate(bannerToDelete, {
      onSuccess: () => {
        if (selectedBanner === bannerToDelete) {
          setSelectedBanner(null)
        }
        setDeleteDialogOpen(false)
        setBannerToDelete(null)
      },
      onError: () => {
        setDeleteDialogOpen(false)
      },
    })
  }

  const getBannerStatus = (banner: Banner) => {
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

  return (
    <Card className="w-full sm:w-xs">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{t("banners.banners")}</CardTitle>
          <Button
            onClick={() => {
              setSelectedBanner(null)
            }}
            size="sm"
          >
            <Plus className="size-4" />
            {t("banners.addNew")}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Search */}
        <div className="mb-4">
          <div className="relative">
            <Search className="text-muted-foreground absolute top-1/2 right-3 size-4 -translate-y-1/2" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("banners.search")}
              className="pr-10"
            />
          </div>
        </div>

        {/* Banners List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Spinner className="size-6" />
          </div>
        ) : (
          <div className="space-y-2">
            {banners.map((banner) => {
              const status = getBannerStatus(banner)
              return (
                <div
                  key={banner.id}
                  className={`group flex flex-col gap-2 rounded-lg border p-3 transition-colors ${
                    selectedBanner === banner.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  <button
                    onClick={() => handleSelectBanner(banner)}
                    className="flex-1 text-start"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium">{banner.title}</p>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </div>
                    {banner.description && (
                      <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">
                        {banner.description}
                      </p>
                    )}
                    <div className="text-muted-foreground mt-2 flex flex-col gap-1 text-xs">
                      <span>
                        {t("banners.form.startDate")}:{" "}
                        {format(new Date(banner.startDate), "PPP", {
                          locale: locale === "ar" ? ar : enUS,
                        })}
                      </span>
                      <span>
                        {t("banners.form.endDate")}:{" "}
                        {format(new Date(banner.endDate), "PPP", {
                          locale: locale === "ar" ? ar : enUS,
                        })}
                      </span>
                      <span>
                        {t("banners.form.visibleTo")}:{" "}
                        {banner.visibleToUser
                          ? banner.visibleToUser.name
                          : t("banners.form.public")}
                      </span>
                    </div>
                  </button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteClick(banner.id)
                    }}
                  >
                    <Trash2 className="text-destructive size-4" />
                  </Button>
                </div>
              )
            })}
            {banners.length === 0 && (
              <p className="text-muted-foreground py-8 text-center text-sm">
                {t("banners.no_banners_found")}
              </p>
            )}
          </div>
        )}
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("banners.deleteConfirm.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {bannerToDelete &&
                t("banners.deleteConfirm.description", {
                  title:
                    banners.find((b) => b.id === bannerToDelete)?.title || "",
                })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={deleteBanner.isPending}
              onClick={() => {
                setDeleteDialogOpen(false)
                setBannerToDelete(null)
              }}
            >
              {t("banners.deleteConfirm.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteBanner.isPending}
              className="bg-destructive hover:bg-destructive/90 text-white"
            >
              {deleteBanner.isPending
                ? t("banners.deleteConfirm.deleting")
                : t("banners.deleteConfirm.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}

