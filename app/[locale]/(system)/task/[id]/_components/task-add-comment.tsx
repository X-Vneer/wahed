"use client"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { useCreateTaskComment } from "@/hooks/use-create-task-comment"
import { useTranslations } from "next-intl"
import { useState } from "react"

type TaskAddCommentProps = {
  taskId: string
}

export function TaskAddComment({ taskId }: TaskAddCommentProps) {
  const t = useTranslations("taskPage")
  const [content, setContent] = useState("")
  const createCommentMutation = useCreateTaskComment()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    createCommentMutation.mutate(
      { taskId, content: content.trim() },
      {
        onSuccess: () => {
          setContent("")
        },
      }
    )
  }

  return (
    <div>
      <h3 className="text-foreground text-sm font-semibold">
        {t("writeComment")}
      </h3>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <Textarea
          placeholder={t("commentPlaceholder")}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          className="bg-muted/40 resize-none"
          disabled={createCommentMutation.isPending}
        />
        <div className="flex justify-end">
          <Button
            type="submit"
            className="w-full max-w-28"
            disabled={!content.trim() || createCommentMutation.isPending}
          >
            {createCommentMutation.isPending && <Spinner />}
            {t("send")}
          </Button>
        </div>
      </form>
    </div>
  )
}
