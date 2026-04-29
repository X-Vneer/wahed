import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
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

const NOTIFICATIONS_PER_PAGE = 20

export function useInfiniteNotifications() {
  return useInfiniteQuery({
    queryKey: ["notifications", "infinite"],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await apiClient.get<NotificationsResponse>(
        "/api/notifications",
        {
          params: { page: pageParam, per_page: NOTIFICATIONS_PER_PAGE },
        }
      )
      return response.data
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.current_page < lastPage.last_page
        ? lastPage.current_page + 1
        : undefined,
    refetchInterval: 5000,
    staleTime: 5000,
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
    refetchInterval: 5000,
    staleTime: 4000,
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
      const response = await apiClient.patch("/api/notifications/mark-all-read")
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
    },
  })
}
