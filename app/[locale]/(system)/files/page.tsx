"use client"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { useFiles, type FilesFolder } from "@/hooks/use-files"
import { useUserData } from "@/hooks/use-user-data"
import { useTranslations } from "next-intl"
import { useMemo } from "react"
import { Folder, MoreVertical } from "lucide-react"
import { cn } from "@/lib/utils"
import { Link } from "@/lib/i18n/navigation"

const FilesPage = () => {
  const t = useTranslations()
  const { data: user } = useUserData()
  const { data, isLoading, error } = useFiles()

  const folders: FilesFolder[] = useMemo(() => data?.folders ?? [], [data])

  const isAdmin = user?.role === "ADMIN"

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">{t("projects.sidebar.files")}</h1>
        {isAdmin && (
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">{t("sidebar.home")}</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{t("projects.sidebar.files")}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        )}
      </div>

      {/* Folders row (archive overview) */}
      {!isLoading && !error && folders.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {folders.map((folder: FilesFolder) => (
            <Link key={folder.id} href={`/files/${folder.id}`}>
              <Card
                className={cn(
                  "hover:border-primary hover:bg-primary/5 cursor-pointer border border-transparent bg-[#f7f7f7] transition-colors"
                )}
              >
                <CardContent className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col">
                      <span className="line-clamp-1 text-sm font-semibold">
                        {folder.name}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        {folder.files.length}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-center rounded-lg bg-white p-2">
                    <Folder className="text-primary size-5" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Loading & error states */}
      {isLoading && (
        <div className="flex flex-1 items-center justify-center py-12">
          <Spinner className="size-8" />
        </div>
      )}

      {error && (
        <div className="flex flex-1 items-center justify-center py-12">
          <p className="text-destructive text-sm">
            {t("errors.internal_server_error")}
          </p>
        </div>
      )}

      {/* No per-folder listing here; that lives in /files/[folderId] */}
    </div>
  )
}

export default FilesPage
