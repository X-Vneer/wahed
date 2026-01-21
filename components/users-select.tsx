"use client"

import { ReactNode } from "react"
import { useTranslations } from "next-intl"
import type { UseFormReturnType } from "@mantine/form"

import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import UserAvatar from "@/components/user-avatar"
import { useUsers } from "@/hooks/use-users"
import { Badge } from "./ui/badge"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./ui/hover-card"

type UsersSelectProps<FormValues extends Record<string, unknown>> = {
  form: UseFormReturnType<FormValues>
  /** Name of the field in the form values that holds the selected user ids */
  name: keyof FormValues & string
  /** Label for the field (e.g. translated text) */
  label: ReactNode
  /** Label shown when no users are selected (e.g. 'Public') */
  publicLabel: ReactNode
  multiple?: boolean
  onValueChange: (value: string[] | string) => void
}

const UsersSelect = <FormValues extends Record<string, unknown>>({
  form,
  name,
  label,
  publicLabel,
  multiple = true,
  onValueChange,
}: UsersSelectProps<FormValues>) => {
  const { data: users = [] } = useUsers()
  const tCommon = useTranslations("common")

  const selectedUsers = form.values[name] as string[] | string

  return (
    <Field>
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      <Select
        multiple={multiple}
        value={selectedUsers}
        onValueChange={(value) => {
          if (value === null) {
            onValueChange(multiple ? [] : "")
          } else {
            onValueChange(value)
          }
        }}
      >
        <SelectTrigger className="w-full" id={name}>
          <SelectValue>
            {Array.isArray(selectedUsers) ? (
              selectedUsers.length > 0 ? (
                <span className="flex gap-2 p-1">
                  {(() => {
                    const selectedUserObjects = users.filter((user) =>
                      selectedUsers.includes(user.id)
                    )
                    if (selectedUserObjects.length === 0) {
                      return <span>{publicLabel}</span>
                    }

                    const [firstUser, ...restUsers] = selectedUserObjects
                    const restCount = restUsers.length

                    return (
                      <>
                        <UserAvatar key={firstUser.id} {...firstUser} />
                        {restCount > 0 && (
                          <HoverCard>
                            <HoverCardTrigger
                              render={
                                <Badge className="cursor-pointer self-center text-sm">
                                  +{restCount}
                                </Badge>
                              }
                            />

                            <HoverCardContent>
                              <div className="space-y-2">
                                <p className="text-sm font-semibold">
                                  {tCommon("moreUsers", { count: restCount })}
                                </p>
                                <div className="flex flex-col gap-2">
                                  {restUsers.map((user) => (
                                    <div
                                      key={user.id}
                                      className="flex items-center gap-2"
                                    >
                                      <UserAvatar {...user} />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </HoverCardContent>
                          </HoverCard>
                        )}
                      </>
                    )
                  })()}
                </span>
              ) : (
                <span>{publicLabel}</span>
              )
            ) : (
              <span>{selectedUsers}</span>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={null}>
            <span>{publicLabel}</span>
          </SelectItem>
          {users.map((user) => (
            <SelectItem key={user.id} value={user.id}>
              <UserAvatar {...user} />
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {form.errors[name] && (
        <FieldError errors={[{ message: String(form.errors[name]) }]} />
      )}
    </Field>
  )
}

export default UsersSelect
