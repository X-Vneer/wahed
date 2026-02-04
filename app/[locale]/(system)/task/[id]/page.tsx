"use client"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Spinner } from "@/components/ui/spinner"
import { useQuery } from "@tanstack/react-query"
import { useTranslations } from "next-intl"
import type { TaskDetail } from "@/prisma/tasks"
import { TaskActionButtons } from "./_components/task-action-buttons"
import { TaskAddComment } from "./_components/task-add-comment"
import { TaskAssignees } from "./_components/task-assignees"
import { TaskComments } from "./_components/task-comments"
import { TaskDetailsSidebar } from "./_components/task-details-sidebar"
import { TaskHeaderDescription } from "./_components/task-header-description"
import { TaskSupportingDocuments } from "./_components/task-supporting-documents"
import apiClient from "@/services"
import { use } from "react"

type PageProps = {
  params: Promise<{ id: string; locale: string }>
}

export default function TaskDetailPage({ params }: PageProps) {
  const { id } = use(params)
  const t = useTranslations()

  const {
    data: task,
    isLoading,
    isError,
  } = useQuery<TaskDetail, Error>({
    queryKey: ["task", id],
    queryFn: async () => {
      const response = await apiClient.get<TaskDetail>(`/api/tasks/${id}`)
      return response.data
    },
  })

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner className="size-6" />
      </div>
    )
  }

  if (isError || !task) {
    return (
      <div className="text-destructive flex h-full items-center justify-center text-sm">
        {t("errors.internal_server_error")}
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="flex flex-wrap justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">{t("tasks.viewMode")}</h1>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">{t("sidebar.home")}</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/tasks">
                  {t("sidebar.tasks")}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{task.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Main content */}
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <TaskHeaderDescription task={task} />
          <TaskComments taskId={task.id} />
        </div>

        {/* Sidebar */}
        <div className="flex w-full flex-col gap-6 lg:w-90 lg:shrink-0">
          <TaskSupportingDocuments
            taskId={task.id}
            attachments={task.taskAttachments}
          />
          <TaskDetailsSidebar task={task} />
          <TaskAssignees assignees={task.assignedTo} />
        </div>
      </div>
    </div>
  )
}
