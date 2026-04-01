"use client"

import axios from "axios"
import { useLocale } from "next-intl"
import { useCallback, useEffect, useState } from "react"

type Locale = "ar" | "en"

export function useWebsiteContent<TContent extends Record<string, unknown>>(
  slug: string
) {
  const locale = useLocale() as Locale
  const [content, setContent] = useState<TContent | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const load = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await axios.get(
        `/api/website/content/${slug}?locale=${locale}`
      )
      setContent(response.data.content as TContent)
    } finally {
      setIsLoading(false)
    }
  }, [locale, slug])

  useEffect(() => {
    void load()
  }, [load])

  const save = useCallback(
    async (nextContent: TContent) => {
      await axios.put(`/api/website/content/${slug}`, {
        locale,
        content: nextContent,
      })
      setContent(nextContent)
    },
    [locale, slug]
  )

  return {
    content,
    isLoading,
    save,
    locale,
    reload: load,
  }
}
