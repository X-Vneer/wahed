"use client"

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { useQuery, UseQueryOptions } from "@tanstack/react-query"
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table"
import { AlertCircle, Loader2 } from "lucide-react"
import * as React from "react"

import { DynamicPagination } from "../dynamic-pagination"
import SearchInput from "../search-input"
import { Separator } from "../ui/separator"
import StatusFilter from "./status-filter"
import { useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"

export interface TableQueryResponse<TData> {
  data: TData[]
  from?: number
  to?: number
  total?: number
  per_page?: number
  current_page?: number
  last_page?: number
}

interface BaseTableProps<TData> {
  columns: ColumnDef<TData, unknown>[]
  emptyMessage?: React.ReactNode
  caption?: React.ReactNode
  className?: string
  queryKey: string[]
  queryFn: (searchParams: URLSearchParams) => Promise<TableQueryResponse<TData>>
  children?: React.ReactNode
  filters?: React.ReactNode
  statuses?: { value: string; label: string }[]
  statusFilterKey?: string
  queryOptions?: Omit<
    UseQueryOptions<TableQueryResponse<TData>, Error>,
    "retry" | "queryFn" | "queryKey"
  >
}

const DEFAULT_PAGINATION_DATA = {
  data: [] as unknown[],
  from: 0,
  to: 0,
  total: 0,
  per_page: 15,
  current_page: 1,
  last_page: 1,
}

export function BaseTable<TData>({
  columns,
  emptyMessage,
  caption,
  className,
  queryKey,
  queryFn,
  statuses,
  statusFilterKey,
  children,
  filters,
  queryOptions,
}: BaseTableProps<TData>) {
  const t = useTranslations("table")
  const searchParams = useSearchParams()
  const defaultEmptyMessage = emptyMessage ?? t("noDataFound")
  const {
    data = DEFAULT_PAGINATION_DATA,
    isLoading,
    error,
  } = useQuery({
    queryKey: [...queryKey, searchParams.toString()],
    queryFn: () => queryFn(searchParams),
    refetchOnWindowFocus: false,
    retry: false,
    ...queryOptions,
  })

  // React Compiler warning: TanStack Table's useReactTable() returns functions
  // that cannot be memoized safely. This is expected behavior and can be ignored.
  const table = useReactTable({
    data: (data.data ?? []) as TData[],
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  const columnCount = table.getAllLeafColumns().length

  if (error) {
    return (
      <div className="rounded bg-white p-4 shadow">
        <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
          <AlertCircle className="text-destructive h-8 w-8" />
          <p className="text-destructive text-sm font-medium">
            {t("failedToLoad")}
          </p>
          <p className="text-muted-foreground text-xs">
            {error instanceof Error ? error.message : t("unexpectedError")}
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="mb-2 flex items-center justify-between">
        <SearchInput />

        <div className="flex items-center gap-2">
          {filters}
          <StatusFilter statusFilterKey={statusFilterKey} statuses={statuses} />
          {children}
        </div>
      </div>
      <div className="rounded bg-white p-4 shadow">
        <Table className={cn("w-full min-w-4xl", className)}>
          {caption && <TableCaption>{caption}</TableCaption>}
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columnCount} className="text-center">
                  <div className="flex h-[300px] items-center justify-center">
                    <Loader2 className="text-muted-foreground h-5 w-5 animate-spin" />
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columnCount} className="text-center">
                  <div className="text-muted-foreground py-8">
                    {defaultEmptyMessage}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="hover:bg-accent-foreground/10"
                  data-state={row.getIsSelected() ? "selected" : undefined}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {!!data.last_page && data.last_page > 1 && (
          <>
            <Separator className="my-4" />
            <div className="flex justify-end">
              <DynamicPagination totalPageCount={data.last_page} />
            </div>
          </>
        )}
      </div>
    </>
  )
}
