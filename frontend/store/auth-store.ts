import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface User {
  id: string | number
  email: string
  role: string
  [key: string]: any
}

interface AuthState {
  accessToken: string | null
  user: User | null
  isAuthenticated: boolean
  setAuth: (accessToken: string, user: User) => void
  setAccessToken: (accessToken: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      user: null,
      isAuthenticated: false,

      setAuth: (accessToken: string, user: User) =>
        set({
          accessToken,
          user,
          isAuthenticated: true,
        }),

      setAccessToken: (accessToken: string) =>
        set((state) => ({
          ...state,
          accessToken,
          isAuthenticated: !!state.user, // remain authenticated if user exists
        })),

      logout: () =>
        set({
          accessToken: null,
          user: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: 'auth-storage', // name of item in localStorage
    }
  )
)
