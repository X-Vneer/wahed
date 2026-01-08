import { useQuery } from "@tanstack/react-query"
import axios from "axios"

export const useCities = (regionId?: string | null) => {
  return useQuery({
    queryKey: ["lists", "cities", regionId],
    queryFn: () => {
      const params = regionId ? { region_id: regionId } : {}
      return axios.get("/api/lists/cities", { params })
    },
    staleTime: Infinity,
    retry: 1,
  })
}
