import type { PublicProjectPrefillResponse } from "@/lib/types/public-project-prefill"
import apiClient from "@/services"
import { useQuery } from "@tanstack/react-query"

export function usePublicProjectPrefill(
  projectId: string | null | undefined,
  enabled: boolean
) {
  const id = projectId?.trim() ?? ""
  return useQuery({
    queryKey: ["website", "public-project-prefill", id],
    queryFn: async () => {
      const res = await apiClient.get<PublicProjectPrefillResponse>(
        `/api/website/public-projects/prefill/${id}`
      )
      return res.data
    },
    enabled: Boolean(enabled && id.length > 0),
    staleTime: 60_000,
    retry: false,
  })
}

export type { PublicProjectPrefillResponse }
