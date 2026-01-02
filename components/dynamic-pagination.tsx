"use client"

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
} from "./ui/pagination"
import { parseAsInteger, useQueryState } from "nuqs"
import { type ReactNode } from "react"
import { useTranslations } from "next-intl"
import { Button } from "./ui/button"

export interface DynamicPaginationProps {
  totalPageCount: number
}

export function DynamicPagination({ totalPageCount }: DynamicPaginationProps) {
  const t = useTranslations()
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1))

  const renderPageNumbers = () => {
    const items: ReactNode[] = []
    const maxVisiblePages = 5

    if (totalPageCount <= maxVisiblePages) {
      for (let i = 1; i <= totalPageCount; i++) {
        items.push(
          <PaginationItem key={i}>
            <Button
              size={"icon"}
              onClick={() => {
                setPage(i)
              }}
              variant={page === i ? "default" : "ghost"}
            >
              {i}
            </Button>
          </PaginationItem>
        )
      }
    } else {
      items.push(
        <PaginationItem key={1}>
          <Button
            size={"icon"}
            onClick={() => {
              setPage(1)
            }}
            variant={page === 1 ? "default" : "ghost"}
          >
            1
          </Button>
        </PaginationItem>
      )

      if (page > 3) {
        items.push(
          <PaginationItem key="ellipsis-start">
            <PaginationEllipsis />
          </PaginationItem>
        )
      }

      const start = Math.max(2, page - 1)
      const end = Math.min(totalPageCount - 1, page + 1)

      for (let i = start; i <= end; i++) {
        items.push(
          <PaginationItem key={i}>
            <Button
              size={"icon"}
              onClick={() => {
                setPage(i)
              }}
              variant={page === i ? "default" : "ghost"}
            >
              {i}
            </Button>
          </PaginationItem>
        )
      }

      if (page < totalPageCount - 2) {
        items.push(
          <PaginationItem key="ellipsis-end">
            <PaginationEllipsis />
          </PaginationItem>
        )
      }

      items.push(
        <PaginationItem key={totalPageCount}>
          <Button
            size={"icon"}
            onClick={() => {
              setPage(totalPageCount)
            }}
            variant={page === totalPageCount ? "default" : "ghost"}
          >
            {totalPageCount}
          </Button>
        </PaginationItem>
      )
    }

    return items
  }

  return (
    <div className="mt-4 flex w-fit flex-col items-center gap-3 md:flex-row">
      <Pagination>
        <PaginationContent className="max-sm:gap-0">
          <PaginationItem>
            <Button
              size={"sm"}
              onClick={() => {
                setPage(Math.max(page - 1, 1))
              }}
              tabIndex={page === 1 ? -1 : undefined}
              variant={"ghost"}
              disabled={page === 1}
            >
              {t("previous")}
            </Button>
          </PaginationItem>
          {renderPageNumbers()}

          <PaginationItem>
            <Button
              size={"sm"}
              onClick={() => {
                setPage(Math.min(page + 1, totalPageCount))
              }}
              tabIndex={page === totalPageCount ? -1 : undefined}
              variant={"ghost"}
              disabled={page === totalPageCount}
            >
              {t("next")}
            </Button>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}
