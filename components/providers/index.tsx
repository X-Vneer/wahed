import React from "react"
import { QueryProvider } from "./query-provider"

type Props = {
  children: React.ReactNode
}

const Providers = async ({ children }: Props) => {
  return <QueryProvider>{children}</QueryProvider>
}

export default Providers
