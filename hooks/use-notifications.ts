import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import apiClient from "@/services"

export interface Notification {
  id: string
  userId: string
  type: string
  title: string
  message: string
  relatedId: string | null
  relatedType: string | null
  isRead: boolean
  createdAt: string
  updatedAt: string
}

interface NotificationsResponse {
  data: Notification[]
  total: number
  unreadCount: number
  current_page: number
  last_page: number
}

export function useNotifications(page = 1) {
  return useQuery({
    queryKey: ["notifications", page],
    queryFn: async () => {
      const response = await apiClient.get<NotificationsResponse>(
        "/api/notifications",
        {
          params: { page, per_page: 20 },
        }
      )
      return response.data
    },
    refetchInterval: 15000, // Poll every 15 seconds
    staleTime: 10000,
  })
}

export function useUnreadCount() {
  return useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: async () => {
      const response = await apiClient.get<NotificationsResponse>(
        "/api/notifications",
        {
          params: { page: 1, per_page: 1 },
        }
      )
      return response.data.unreadCount
    },
    refetchInterval: 15000,
    staleTime: 10000,
  })
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.patch(`/api/notifications/${id}`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
    },
  })
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.patch(
        "/api/notifications/mark-all-read"
      )
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
    },
  })
}
