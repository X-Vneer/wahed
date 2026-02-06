"use client"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useTranslations } from "next-intl"
import { Eye, Pen } from "lucide-react"
import { parseAsBoolean, parseAsString, useQueryStates } from "nuqs"
import { useTaskStatuses } from "@/hooks/use-task-status"
import { Input } from "@/components/ui/input"
import { useDebouncedCallback } from "@/hooks/use-debounced-callback"
import { useState } from "react"

export const DONE_VALUES = ["all", "done", "not_done"] as const
export type DoneFilter = (typeof DONE_VALUES)[number]

export function TaskFilters() {
  const t = useTranslations()

  const [filters, set] = useQueryStates({
    query: parseAsString.withDefault(""),
    status: parseAsString.withDefault("all"),
    done: parseAsString.withDefault("all"),
    editMode: parseAsBoolean.withDefault(false),
  })

  const { query, status, done, editMode } = filters

  const { data: statusRes } = useTaskStatuses()
  const statuses = statusRes?.data?.data ?? []

  const debouncedSetQuery = useDebouncedCallback(
    (value: string) => set({ query: value }),
    500
  )
  const [queryValue, setQueryValue] = useState(query)
  const handleChangeQuery = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSetQuery(e.target.value ?? "")
    setQueryValue(e.target.value ?? "")
  }

  return (
    <div className="bg-muted/50 flex w-full items-center justify-between gap-3 rounded-lg py-3 max-md:flex-col">
      <Input
        className="max-w-sm bg-white"
        value={queryValue}
        onChange={handleChangeQuery}
        placeholder={t("tasks.filterQueryPlaceholder")}
      />
      <div className="flex items-center gap-3">
        <span className="text-muted-foreground hidden text-sm font-medium md:block">
          {t("tasks.filters")}:
        </span>
        <Select
          value={status}
          onValueChange={(v) => set({ status: v ?? "all" })}
        >
          <SelectTrigger className="h-10 min-w-[140px] bg-white">
            <SelectValue placeholder={t("tasks.filterStatus")}>
              {status === "all"
                ? t("tasks.filterStatusAll")
                : (statuses.find((s) => s.id === status)?.name ??
                  t("tasks.filterStatusAll"))}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("tasks.filterStatusAll")}</SelectItem>
            {statuses.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={done}
          onValueChange={(v) => set({ done: v as DoneFilter })}
        >
          <SelectTrigger className="h-10 min-w-[120px] bg-white">
            <SelectValue placeholder={t("tasks.filterDone")}>
              {done === "all"
                ? t("tasks.filterDoneAll")
                : done === "done"
                  ? t("tasks.filterDoneDone")
                  : t("tasks.filterDoneNotDone")}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("tasks.filterDoneAll")}</SelectItem>
            <SelectItem value="done">{t("tasks.filterDoneDone")}</SelectItem>
            <SelectItem value="not_done">
              {t("tasks.filterDoneNotDone")}
            </SelectItem>
          </SelectContent>
        </Select>
        <Button
          type="button"
          variant={editMode ? "default" : "secondary"}
          size="lg"
          className={"h-10"}
          onClick={() => set({ editMode: !editMode })}
          aria-pressed={editMode}
        >
          {editMode ? <Pen className="size-4" /> : <Eye className="size-4" />}
          {editMode ? t("tasks.editMode") : t("tasks.viewMode")}
        </Button>
      </div>
    </div>
  )
}
