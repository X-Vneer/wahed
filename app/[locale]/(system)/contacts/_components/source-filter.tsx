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

export function SourceFilter() {
  const t = useTranslations()

  const [source, setSource] = useQueryState(
    "source",
    parseAsString.withDefault("")
  )

  return (
    <div className="flex items-end gap-2">
      <div>
        <Select
          value={source || "all"}
          onValueChange={(value) => {
            setSource(value === "all" ? null : value)
          }}
        >
          <SelectTrigger className="h-10 bg-white lg:min-w-45">
            <SelectValue>
              {source === "" || source === "all"
                ? t("contacts.sourceFilter.all")
                : source === "general"
                  ? t("contacts.sourceFilter.general")
                  : t("contacts.sourceFilter.project")}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              {t("contacts.sourceFilter.all")}
            </SelectItem>
            <SelectItem value="general">
              {t("contacts.sourceFilter.general")}
            </SelectItem>
            <SelectItem value="project">
              {t("contacts.sourceFilter.project")}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
