import { LOCALES } from "@/config"

export async function getReqLocale(req: Request): Promise<"ar" | "en"> {
  const localeHeader = req.headers.get("Accept-Language")
  if (localeHeader && LOCALES.includes(localeHeader)) {
    return localeHeader as "ar" | "en"
  }

  return LOCALES[0] as "ar" | "en"
}
