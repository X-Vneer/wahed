"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useRegions } from "@/hooks/use-regions"
import { parseAsString, useQueryState } from "nuqs"
import { useTranslations } from "next-intl"
import type { Region } from "@/prisma/regions"

export function RegionFilter() {
  const t = useTranslations()
  const { data: regionsData } = useRegions()
  const regions = regionsData?.data?.data || []

  const [regionId, setRegionId] = useQueryState(
    "region_id",
    parseAsString.withDefault("")
  )

  return (
    <div className="flex items-end gap-2">
      <div>
        <Select
          value={regionId || "all"}
          onValueChange={(value) => {
            setRegionId(value === "all" ? null : value)
          }}
        >
          <SelectTrigger className="h-10 min-w-[180px] bg-white">
            <SelectValue>
              {regionId === "" || regionId === "all"
                ? t("cities.filter.allRegions")
                : regions.find((r: Region) => r.id === regionId)?.name ||
                  t("cities.filter.regionPlaceholder")}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("cities.filter.allRegions")}</SelectItem>
            {regions.map((region: Region) => (
              <SelectItem key={region.id} value={region.id}>
                {region.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
