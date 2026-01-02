import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useQueryState } from "nuqs"
import { useTranslations } from "next-intl"

export default function StatusFilter({
  statuses,
  statusFilterKey,
}: {
  statuses?: { value: string; label: string }[]
  statusFilterKey?: string
}) {
  const t = useTranslations()

  const [status, setStatus] = useQueryState(
    statusFilterKey ? statusFilterKey : "status",
    {
      defaultValue: "all",
    }
  )

  if (!statuses || !statuses.length) return null

  const selectedStatus = statuses.find((opt) => opt.value === status)

  return (
    <div className="flex items-end gap-2">
      <div>
        <Select
          value={status}
          onValueChange={(value) => {
            setStatus(value)
          }}
        >
          <SelectTrigger className="h-10 min-w-[180px] bg-white">
            <SelectValue>
              {status === "all"
                ? t("table-status-filter.all")
                : selectedStatus?.label ||
                  t("table-status-filter.statusPlaceholder")}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("table-status-filter.all")}</SelectItem>
            {statuses.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
