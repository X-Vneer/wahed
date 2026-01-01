"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Search, Plus } from "lucide-react"
import { useUsers } from "@/hooks/use-users"
import type { User } from "@/prisma/users/select"
import { useDebouncedValue } from "@/hooks/use-debounced"
import { parseAsString, useQueryState } from "nuqs"

export function UsersList() {
  const t = useTranslations("employees")
  const [q, setQ] = useState("")
  const debouncedValue = useDebouncedValue(q, 500)

  const { data: users = [], isLoading } = useUsers({ q: debouncedValue })

  //   selected user
  const [selectedUser, setSelectedUser] = useQueryState(
    "user_id",
    parseAsString.withDefault("")
  )

  const handleSelectUser = (user: User) => {
    setSelectedUser(user.id)
  }

  return (
    <Card className="w-xs">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{t("users")}</CardTitle>
          <Button
            onClick={() => {
              setSelectedUser(null)
            }}
            size="sm"
          >
            <Plus className="size-4" />
            {t("addNew")}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Search */}
        <div className="mb-4">
          <div className="relative">
            <Search className="text-muted-foreground absolute top-1/2 right-3 size-4 -translate-y-1/2" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("search")}
              className="pr-10"
            />
          </div>
        </div>

        {/* Users List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Spinner className="size-6" />
          </div>
        ) : (
          <div className="space-y-2">
            {users.map((user) => (
              <button
                key={user.id}
                onClick={() => handleSelectUser(user)}
                className={`w-full rounded-lg border p-3 text-right transition-colors ${
                  selectedUser === user.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:bg-muted"
                }`}
              >
                <p className="font-medium">{user.name}</p>
                <p className="text-muted-foreground text-sm">{user.email}</p>
              </button>
            ))}
            {users.length === 0 && (
              <p className="text-muted-foreground py-8 text-center text-sm">
                {t("no_users found")}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
