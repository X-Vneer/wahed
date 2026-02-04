"use client"

import { Card, CardContent } from "@/components/ui/card"
import { useTranslations } from "next-intl"
import type { TaskDetail } from "@/prisma/tasks"
import UserAvatar from "@/components/user-avatar"

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
              return (
                <UserAvatar
                  key={user.id}
                  name={user.name ?? ""}
                  email={user.email ?? ""}
                  image={user.image ?? undefined}
                />
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
