import { useQuery } from "@tanstack/react-query"
import apiClient from "@/services"
import { Region } from "@/prisma/regions"

export const useRegions = () => {
  return useQuery({
    queryKey: ["lists", "regions"],
    queryFn: () => apiClient.get<{ data: Region[] }>("/api/lists/regions"),
    staleTime: Infinity,
    retry: 1,
  })
}
