"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { BannerFormContent } from "./banner-form"
import type { BannerInclude } from "@/prisma/banners"
import { useTranslations } from "next-intl"

type BannerDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedBanner: BannerInclude | null
}

export function BannerDialog({
  open,
  onOpenChange,
  selectedBanner,
}: BannerDialogProps) {
  const t = useTranslations()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90svh] flex-col gap-0 p-0 sm:max-h-[min(640px,80vh)] sm:max-w-xl [&>button:last-child]:hidden">
        <ScrollArea className="flex max-h-full flex-col overflow-hidden">
          <div className="p-6">
            <DialogHeader className="mb-2">
              <DialogTitle>
                {selectedBanner
                  ? t("banners.editTitle")
                  : t("banners.createTitle")}
              </DialogTitle>
              <DialogDescription className="sr-only">
                {selectedBanner
                  ? t("banners.editDescription")
                  : t("banners.createDescription")}
              </DialogDescription>
            </DialogHeader>
            <BannerFormContent selectedBanner={selectedBanner} />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
