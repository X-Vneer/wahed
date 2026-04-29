"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { parseAsString, useQueryState } from "nuqs"
import { useTranslations } from "next-intl"

export function ReadFilter() {
  const t = useTranslations()

  const [isRead, setIsRead] = useQueryState(
    "is_read",
    parseAsString.withDefault("")
  )

  return (
    <div className="flex items-end gap-2">
      <div>
        <Select
          value={isRead || "all"}
          onValueChange={(value) => {
            setIsRead(value === "all" ? null : value)
          }}
        >
          <SelectTrigger className="h-10 bg-white lg:min-w-25">
            <SelectValue>
              {isRead === "" || isRead === "all"
                ? t("contacts.filter.all")
                : isRead === "true"
                  ? t("contacts.filter.read")
                  : t("contacts.filter.unread")}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("contacts.filter.all")}</SelectItem>
            <SelectItem value="false">{t("contacts.filter.unread")}</SelectItem>
            <SelectItem value="true">{t("contacts.filter.read")}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
