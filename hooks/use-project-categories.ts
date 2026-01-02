import { useQuery } from "@tanstack/react-query"
import axios from "axios"

export const useProjectCategories = () => {
  return useQuery({
    queryKey: ["project-categories"],
    queryFn: () => axios.get("/api/lists/project-categories"),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
  })
}
