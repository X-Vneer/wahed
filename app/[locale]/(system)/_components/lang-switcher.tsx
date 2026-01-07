"use client"

import { useLocale } from "next-intl"
import { usePathname } from "@/lib/i18n/navigation"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { arFlag, enFlag } from "@/assets"
import Image from "next/image"
const languages = [
  { value: "ar", label: "العربية", flag: arFlag },
  { value: "en", label: "English", flag: enFlag },
] as const

export function LangSwitcher() {
  const locale = useLocale()
  const pathname = usePathname()

  const handleLocaleChange = (newLocale: string | null) => {
    if (!newLocale || newLocale === locale) return
    // Construct the new path with the new locale
    const newPath = `/${newLocale}${pathname === "/" ? "" : pathname}`
    window.location.href = newPath
  }

  const currentLanguage = languages.find((lang) => lang.value === locale)

  return (
    <Select value={locale} onValueChange={handleLocaleChange}>
      <SelectTrigger className="w-fit min-w-[70px]">
        <SelectValue>
          {currentLanguage && (
            <div className="size-5 overflow-hidden rounded-full">
              <Image
                src={currentLanguage.flag}
                alt={currentLanguage.label}
                className="h-full w-full object-cover"
              />
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {languages.map((lang) => (
          <SelectItem key={lang.value} value={lang.value}>
            <span className="flex items-center gap-2 p-2">
              <div className="size-5 overflow-hidden rounded-full">
                <Image
                  src={lang.flag}
                  alt={lang.label}
                  className="h-full w-full object-cover"
                />
              </div>
              <span>{lang.label}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
