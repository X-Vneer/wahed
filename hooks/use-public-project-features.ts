import apiClient from "@/services"
import { useQuery } from "@tanstack/react-query"

export type PublicProjectFeatureListItem = {
  id: string
  labelAr: string
  labelEn: string
  valueAr: string | null
  valueEn: string | null
  icon: string
}

export function usePublicProjectFeatures() {
  return useQuery({
    queryKey: ["website", "public-project-features"],
    queryFn: async () => {
      const res = await apiClient.get<{ data: PublicProjectFeatureListItem[] }>(
        "/api/website/public-projects/features"
      )
      return res.data.data
    },
    staleTime: 60_000,
    retry: 1,
  })
}
