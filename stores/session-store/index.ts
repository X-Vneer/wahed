import { createStore } from "zustand/vanilla"
import type { User } from "@/lib/generated/prisma/client"
export type SessionState = {
  accessToken: string | null
  user: User | null
}

export type SessionActions = {
  setAccessToken: (accessToken: string) => void
  setUser: (user: User) => void
  clearSession: () => void
}

export type SessionStore = SessionState & SessionActions

export const defaultInitState: SessionState = {
  accessToken: null,
  user: null,
}

export const createSessionStore = (
  initState: SessionState = defaultInitState
) => {
  return createStore<SessionStore>()((set, get) => ({
    ...initState,
    setAccessToken: (accessToken) => set({ accessToken }),
    setUser: (user) => set({ user }),
    clearSession: () => set({ accessToken: null, user: null }),
  }))
}
