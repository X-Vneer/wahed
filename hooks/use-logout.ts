"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "@/lib/i18n/navigation"
import apiClient from "@/services"

export function useLogout() {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.post("/api/auth/logout")
      return response.data
    },
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ["user", "me"] })
      router.refresh()
      router.push("/auth/login")
    },
    onError: (error) => {
      console.error("Logout error:", error)
    },
  })
}
