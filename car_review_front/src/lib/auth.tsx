import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import * as api from "@/lib/api"
import type { AppUser } from "@/lib/types"

interface AuthContextValue {
  user: AppUser | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<AppUser>
  register: (email: string, password: string, full_name: string) => Promise<AppUser>
  logout: () => void
  isAuthenticated: boolean
  isAdmin: boolean
  isStaff: boolean
}

const AuthContext = createContext<AuthContextValue>(null!)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null)
  const [token, setTokenState] = useState<string | null>(api.getToken())
  const [loading, setLoading] = useState(true)

  const logout = useCallback(() => {
    setUser(null)
    setTokenState(null)
    api.clearToken()
  }, [])

  // Validate any stored token on boot.
  useEffect(() => {
    const saved = api.getToken()
    if (!saved) { setLoading(false); return }
    api.getMe()
      .then((u) => { setUser(u); setTokenState(saved) })
      .catch(() => logout())
      .finally(() => setLoading(false))
  }, [logout])

  // 401 "interceptor": api.ts broadcasts this when a token expires mid-session.
  useEffect(() => {
    const onForcedLogout = () => logout()
    window.addEventListener("auth:logout", onForcedLogout)
    return () => window.removeEventListener("auth:logout", onForcedLogout)
  }, [logout])

  const login = async (email: string, password: string) => {
    const { token, user } = await api.login(email, password)
    api.setToken(token); setTokenState(token); setUser(user)
    return user
  }

  const register = async (email: string, password: string, full_name: string) => {
    const { token, user } = await api.register(email, password, full_name)
    api.setToken(token); setTokenState(token); setUser(user)
    return user
  }

  return (
    <AuthContext.Provider
      value={{
        user, token, loading, login, register, logout,
        isAuthenticated: !!user,
        isAdmin: user?.role === "admin",
        isStaff: user?.role === "admin" || user?.role === "editor",
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
