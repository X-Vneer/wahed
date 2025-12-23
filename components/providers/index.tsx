import React from "react"
import { QueryProvider } from "./query-provider"
import { SessionStoreProvider } from "@/stores/session-store/session-store-provider"
import { getAccessToken } from "@/lib/get-access-token"

type Props = {
  children: React.ReactNode
}

const Providers = async ({ children }: Props) => {
  const accessToken = await getAccessToken()
  return (
    <QueryProvider>
      <SessionStoreProvider accessToken={accessToken}>
        {children}
      </SessionStoreProvider>
    </QueryProvider>
  )
}

export default Providers
