"use client"

import { type ReactNode, createContext, useState, useContext } from "react"
import { useStore } from "zustand"

import { type SessionStore, createSessionStore } from "@/stores/session-store"

export type SessionStoreApi = ReturnType<typeof createSessionStore>

export const SessionStoreContext = createContext<SessionStoreApi | undefined>(
  undefined
)

export interface SessionStoreProviderProps {
  children: ReactNode
  accessToken: string | null
}

export const SessionStoreProvider = ({
  children,
  accessToken,
}: SessionStoreProviderProps) => {
  const [store] = useState(() =>
    createSessionStore({
      accessToken,
      user: null,
    })
  )
  return (
    <SessionStoreContext.Provider value={store}>
      {children}
    </SessionStoreContext.Provider>
  )
}

export const useSessionStore = <T,>(
  selector: (store: SessionStore) => T
): T => {
  const sessionStoreContext = useContext(SessionStoreContext)
  if (!sessionStoreContext) {
    throw new Error(`useSessionStore must be used within SessionStoreProvider`)
  }

  return useStore(sessionStoreContext, selector)
}
