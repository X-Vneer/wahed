import { useQuery } from "@tanstack/react-query"
import apiClient from "@/services"

export const useRegions = () => {
  return useQuery({
    queryKey: ["lists", "regions"],
    queryFn: () => apiClient.get("/api/lists/regions"),
    staleTime: Infinity,
    retry: 1,
  })
}
