import { useQuery } from "@tanstack/react-query"
import apiClient from "@/services"
import { City } from "@/prisma/cities"

export const useCities = (regionId?: string | null) => {
  return useQuery({
    queryKey: ["lists", "cities", regionId],
    queryFn: () => {
      const params = regionId ? { region_id: regionId } : {}
      return apiClient.get<{ data: City[] }>("/api/lists/cities", { params })
    },
    staleTime: Infinity,
    retry: 1,
  })
}
