"use client"

import apiClient from "@/services"
import { useQuery } from "@tanstack/react-query"
import { useCallback, useEffect, useRef, useState } from "react"

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

type UseCheckSlugOptions = {
  /** Project id to exclude from the uniqueness check (for edit mode). */
  excludeId?: string
  /** Debounce delay in ms. @default 500 */
  delay?: number
}

export function useCheckSlug({
  excludeId,
  delay = 500,
}: UseCheckSlugOptions = {}) {
  // The slug we actually want to check — only updated after the debounce fires.
  // Using a ref + state split so that calling `setSlug` does NOT re-render the
  // caller (which would remount uncontrolled inputs and steal focus).
  const latestRef = useRef("")
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null)
  const [slugToCheck, setSlugToCheck] = useState("")

  const setSlug = useCallback(
    (value: string) => {
      latestRef.current = value
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        setSlugToCheck(value)
      }, delay)
    },
    [delay]
  )

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const isValid = slugToCheck.length >= 3 && slugRegex.test(slugToCheck)

  const { data, isFetching } = useQuery<{ available: boolean }>({
    queryKey: ["slug-check", slugToCheck, excludeId],
    queryFn: async () => {
      const params = new URLSearchParams({ slug: slugToCheck })
      if (excludeId) params.set("excludeId", excludeId)
      const res = await apiClient.get(
        "/api/website/public-projects/check-slug",
        { params }
      )
      return res.data
    },
    enabled: isValid,
    staleTime: 60_000,
  })

  // Only show status when the debounce has settled (latest input === checked slug)
  const settled = isValid && latestRef.current === slugToCheck
  const isChecking = settled && isFetching
  const isTaken = settled && !isFetching && data?.available === false
  const isAvailable = settled && !isFetching && data?.available === true

  return { setSlug, isChecking, isTaken, isAvailable }
}
