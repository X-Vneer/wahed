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
            <DialogContent className="flex max-h-[90vh] max-w-2xl flex-col gap-0 p-0">
                <DialogHeader className="px-6 pt-6">
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
                <ScrollArea className="flex-1 px-6 pb-6">
                    <BannerFormContent
                        selectedBanner={selectedBanner}
                        onSuccess={() => onOpenChange(false)}
                    />
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}

