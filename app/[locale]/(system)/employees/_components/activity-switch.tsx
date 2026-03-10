import { useTranslations } from "next-intl"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Switch } from "@/components/ui/switch"
import apiClient from "@/services"
import { toast } from "sonner"
import type { User } from "@/prisma/users/select"
import type { TableQueryResponse } from "@/components/table/table"
import { useUserData } from "@/hooks/use-user-data"

type ToggleActivityPayload = {
  id: string
  isActive: boolean
}

type ActivitySwitchProps = {
  userId: string
  isActive: boolean
}

export const ActivitySwitch = ({ userId, isActive }: ActivitySwitchProps) => {
  const t = useTranslations()
  const queryClient = useQueryClient()
  const { data: currentUser } = useUserData()
  const isSelf = currentUser?.id === userId

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, isActive }: ToggleActivityPayload) => {
      const response = await apiClient.patch(`/api/users/${id}/activity`, {
        isActive,
      })
      return response.data
    },
    onMutate: async ({ id, isActive }: ToggleActivityPayload) => {
      await queryClient.cancelQueries({ queryKey: ["employees"] })

      const previousEmployees = queryClient.getQueriesData<
        TableQueryResponse<User>
      >({
        queryKey: ["employees"],
      })

      queryClient.setQueriesData<TableQueryResponse<User>>(
        { queryKey: ["employees"] },
        (old) => {
          if (!old) return old

          return {
            ...old,
            data: old.data.map((user) =>
              user.id === id ? { ...user, isActive } : user
            ),
          }
        }
      )

      return { previousEmployees }
    },
    onError: (error, _variables, context) => {
      if (context && "previousEmployees" in context) {
        const typedContext = context as {
          previousEmployees?: [unknown, TableQueryResponse<User> | undefined][]
        }

        typedContext.previousEmployees?.forEach(([queryKey, data]) => {
          if (data) {
            queryClient.setQueryData<TableQueryResponse<User>>(
              queryKey as readonly unknown[],
              data
            )
          }
        })
      }

      const message =
        error?.response?.data?.error ?? t("errors.internal_server_error")
      toast.error(message)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] })
    },
  })

  if (isSelf) {
    return null
  }

  return (
    <Switch
      checked={isActive}
      disabled={updateUserMutation.isPending}
      onCheckedChange={(checked) => {
        updateUserMutation.mutate({
          id: userId,
          isActive: checked,
        })
      }}
      aria-label={t("employees.table.activity")}
    />
  )
}
