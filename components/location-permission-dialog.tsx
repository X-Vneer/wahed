"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

type LocationPermissionDialogProps = {
  open: boolean
  onAllow: (doNotShowAgain: boolean) => void
  onDecline: (doNotShowAgain: boolean) => void
}

export function LocationPermissionDialog({
  open,
  onAllow,
  onDecline,
}: LocationPermissionDialogProps) {
  const t = useTranslations("locationPrompt")
  const [doNotShowAgain, setDoNotShowAgain] = useState(false)

  const handleAllow = () => {
    onAllow(doNotShowAgain)
  }

  const handleDecline = () => {
    onDecline(doNotShowAgain)
  }

  return (
    <Dialog open={open}>
      <DialogContent showCloseButton={false} className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-2">
          <Checkbox
            id="location-do-not-show"
            checked={doNotShowAgain}
            onCheckedChange={(checked) =>
              setDoNotShowAgain(checked === true)}
            aria-label={t("doNotShowAgain")}
          />
          <Label
            htmlFor="location-do-not-show"
            className="text-sm font-normal cursor-pointer text-muted-foreground"
          >
            {t("doNotShowAgain")}
          </Label>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleDecline}>
            {t("decline")}
          </Button>
          <Button onClick={handleAllow}>{t("allow")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
