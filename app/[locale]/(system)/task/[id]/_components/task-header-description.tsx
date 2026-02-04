import { Card, CardContent } from "@/components/ui/card"
import type { TaskDetail } from "@/prisma/tasks"
import { useTranslations } from "next-intl"
import { TaskSubtasks } from "./task-subtasks"

type TaskHeaderDescriptionProps = {
  task: TaskDetail
}

export function TaskHeaderDescription({ task }: TaskHeaderDescriptionProps) {
  const t = useTranslations()
  return (
    <Card>
      <CardContent className="">
        <h2 className="text-foreground mb-3 text-xl font-bold">
          {t("task.title")} {task.order + 1} : {task.title}
        </h2>
        {task.description ? (
          <div className="text-sm leading-relaxed whitespace-pre-wrap text-[#2B3445]">
            {task.description}
          </div>
        ) : null}
        <div className="mt-10"></div>
        <TaskSubtasks taskId={task.id} subTasks={task.subTasks} />
      </CardContent>
    </Card>
  )
}
