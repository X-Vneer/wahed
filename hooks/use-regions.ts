import { useQuery } from "@tanstack/react-query"
import axios from "axios"

export const useRegions = () => {
  return useQuery({
    queryKey: ["lists", "regions"],
    queryFn: () => axios.get("/api/lists/regions"),
    staleTime: Infinity,
    retry: 1,
  })
}
