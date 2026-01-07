import { useQuery } from "@tanstack/react-query"
import axios from "axios"

export const useTaskCategories = () => {
  return useQuery({
    queryKey: ["lists", "task-categories"],
    queryFn: () => axios.get("/api/task-category"),
    staleTime: Infinity,
    retry: 1,
  })
}
