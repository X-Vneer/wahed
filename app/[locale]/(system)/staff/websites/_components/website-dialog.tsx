"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { WebsiteFormContent } from "./website-form"
import type { WebsiteWithLocale } from "@/hooks/use-websites"
import { useTranslations } from "next-intl"

type WebsiteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedWebsite: WebsiteWithLocale | null
}

export function WebsiteDialog({
  open,
  onOpenChange,
  selectedWebsite,
}: WebsiteDialogProps) {
  const t = useTranslations()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90svh] flex-col gap-0 p-0 sm:max-h-[min(640px,80vh)] sm:max-w-xl [&>button:last-child]:hidden">
        <ScrollArea className="flex max-h-full flex-col overflow-hidden">
          <div className="p-6">
            <DialogHeader className="mb-2">
              <DialogTitle>
                {selectedWebsite
                  ? t("websites.editTitle")
                  : t("websites.createTitle")}
              </DialogTitle>
              <DialogDescription className="sr-only">
                {selectedWebsite
                  ? t("websites.editTitle")
                  : t("websites.createTitle")}
              </DialogDescription>
            </DialogHeader>
            <WebsiteFormContent
              selectedWebsite={selectedWebsite}
              onSuccess={() => onOpenChange(false)}
            />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
