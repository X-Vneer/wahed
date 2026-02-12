"use client"

import { useQuery, type UseQueryOptions } from "@tanstack/react-query"
import apiClient from "@/services"
import type {
  FilesFolder,
  FilesResponse,
  FileItem,
  FileSource,
} from "@/@types/files"

export type { FilesFolder, FilesResponse, FileItem, FileSource }

export const useFiles = (
  options?: Omit<UseQueryOptions<FilesResponse, Error>, "queryKey" | "queryFn">
) => {
  const fetchFiles = async () => {
    const response = await apiClient.get<FilesResponse>("/api/files")
    return response.data
  }

  return useQuery<FilesResponse, Error>({
    queryKey: ["files"],
    queryFn: fetchFiles,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
    ...options,
  })
}
