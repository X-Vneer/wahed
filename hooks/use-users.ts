"use client"

import { User } from "@/prisma/users/select"
import { useQuery, type UseQueryOptions } from "@tanstack/react-query"
import axios from "axios"

export const useUsers = (
  params?: { q?: string },
  options?: Omit<UseQueryOptions<User[], Error>, "queryKey" | "queryFn">
) => {
  const fetchUsers = async () => {
    const response = await axios.get<User[]>("/api/users", {
      params,
      withCredentials: true,
    })
    return response.data
  }

  return useQuery<User[], Error>({
    queryKey: ["users", params?.q || ""],
    queryFn: fetchUsers,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
    ...options,
  })
}
