import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import type {
  NotificationCategory,
  NotificationChannel,
} from "@/lib/generated/prisma/enums"
import apiClient from "@/services"

export type NotificationPreferenceItem = {
  category: NotificationCategory
  channel: NotificationChannel
  group: "TASKS" | "PROJECTS" | "EVENTS" | "CONTACTS"
}

interface PreferencesResponse {
  preferences: NotificationPreferenceItem[]
}

const QUERY_KEY = ["notification-preferences"] as const

export function useNotificationPreferences() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const response = await apiClient.get<PreferencesResponse>(
        "/api/notifications/preferences"
      )
      return response.data.preferences
    },
    staleTime: 60_000,
  })
}

export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (
      preferences: { category: NotificationCategory; channel: NotificationChannel }[]
    ) => {
      const response = await apiClient.put("/api/notifications/preferences", {
        preferences,
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}
