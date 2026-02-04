"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useTranslations } from "next-intl"
import type { TaskDetail } from "@/prisma/tasks"

type TaskAssigneesProps = {
  assignees: TaskDetail["assignedTo"]
}

export function TaskAssignees({ assignees }: TaskAssigneesProps) {
  const t = useTranslations("taskPage")
  const tTasks = useTranslations("tasks")

  return (
    <Card>
      <CardContent>
        <h3 className="text-foreground mb-4 text-lg font-semibold">
          {t("assignees")}
        </h3>
        {assignees.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            {tTasks("noAssignee")}
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {assignees.map((user) => {
              const name = user.name ?? "?"
              const initials = name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)
              return (
                <li
                  key={user.id}
                  className="flex items-center gap-3 rounded-lg border p-2"
                >
                  <Avatar className="size-9 shrink-0">
                    <AvatarImage src={user.image ?? undefined} />
                    <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-foreground truncate text-sm font-medium">
                    {name}
                  </span>
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
