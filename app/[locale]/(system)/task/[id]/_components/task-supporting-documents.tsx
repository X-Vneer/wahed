"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useTranslations } from "next-intl"
import { Plus, Download, FileText } from "lucide-react"
import type { TaskDetail } from "@/prisma/tasks"
import Link from "next/link"

type TaskSupportingDocumentsProps = {
  taskId: string
  attachments: TaskDetail["taskAttachments"]
}

export function TaskSupportingDocuments({
  taskId,
  attachments,
}: TaskSupportingDocumentsProps) {
  const t = useTranslations("taskPage")

  return (
    <Card>
      <CardContent>
        <div className="mb-4 flex items-center justify-between gap-2">
          <h3 className="text-foreground font-semibold">
            {t("supportingDocuments")}
          </h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="bg-primary/5 hover:bg-primary/10 border-primary/30 text-primary shrink-0 gap-2"
          >
            <Plus className="size-4" />
            {t("addDocuments")}
          </Button>
        </div>
        <ul className="flex flex-col gap-2">
          {attachments.length === 0 ? (
            <p className="text-muted-foreground py-2 text-sm">
              No documents attached
            </p>
          ) : (
            attachments.map((att) => (
              <li
                key={att.id}
                className="flex items-center gap-3 rounded-lg border p-2"
              >
                <FileText className="text-muted-foreground size-5 shrink-0" />
                <span className="text-foreground min-w-0 truncate text-sm">
                  {att.fileName ?? "Document"}
                </span>
                {att.fileUrl ? (
                  <Link
                    href={att.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80 shrink-0"
                    aria-label="Download"
                  >
                    <Download className="size-4" />
                  </Link>
                ) : null}
              </li>
            ))
          )}
        </ul>
      </CardContent>
    </Card>
  )
}
