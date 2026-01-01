import "@tanstack/react-query"
import type { ErrorResponse } from "./error"
import type { AxiosError } from "axios"

declare module "@tanstack/react-query" {
  interface Register {
    defaultError: AxiosError<ErrorResponse>
  }
}
