import { useQuery } from "@tanstack/react-query"
import axios from "axios"

export const useProjectCategories = () => {
  return useQuery({
    queryKey: ["lists", "project-categories"],
    queryFn: () => axios.get("/api/lists/project-categories"),
    staleTime: Infinity,
    retry: 1,
  })
}
