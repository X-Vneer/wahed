import apiClient from "@/services"
import { useQuery } from "@tanstack/react-query"

export type PublicProjectBadgeListItem = {
  id: string
  nameAr: string
  nameEn: string
  color: string
}

export function usePublicProjectBadges() {
  return useQuery({
    queryKey: ["website", "public-project-badges"],
    queryFn: async () => {
      const res = await apiClient.get<{ data: PublicProjectBadgeListItem[] }>(
        "/api/website/public-projects/badges"
      )
      return res.data.data
    },
    staleTime: 60_000,
    retry: 1,
  })
}
