import { useQuery } from "@tanstack/react-query"
import axios from "axios"

export const useCities = () => {
  return useQuery({
    queryKey: ["lists", "cities"],
    queryFn: () => axios.get("/api/lists/cities"),
    staleTime: Infinity,
    retry: 1,
  })
}
