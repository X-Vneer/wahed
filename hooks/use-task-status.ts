import { useQuery } from "@tanstack/react-query"
import axios from "axios"

export const useTaskStatuses = () => {
  return useQuery({
    queryKey: ["lists", "task-statuses"],
    queryFn: () => axios.get("/api/lists/task-status"),
    staleTime: Infinity,
    retry: 1,
  })
}
