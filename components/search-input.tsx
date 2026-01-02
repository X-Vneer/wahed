import { useDebouncedCallback } from "@/hooks/use-debounced-callback"
import { cn } from "@/lib/utils"
import { parseAsString, useQueryState } from "nuqs"
import React, { useState } from "react"
import { useTranslations } from "next-intl"
import { Input } from "./ui/input"

export type SearchInputProps = React.InputHTMLAttributes<HTMLInputElement>

const SearchInput = ({ className, ...props }: SearchInputProps) => {
  const t = useTranslations()
  const [q, setQ] = useQueryState("query", parseAsString.withDefault(""))
  const [value, setValue] = useState(q)

  const search = useDebouncedCallback(setQ, 500)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value)
    search(e.target.value)
  }

  return (
    <Input
      placeholder={t("search-input.placeholder")}
      {...props}
      value={value}
      onChange={handleChange}
      className={cn("h-9 w-full max-w-[250px] bg-white", className)}
    />
  )
}

export default SearchInput
