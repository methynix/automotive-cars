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
  refreshUser: () => Promise<AppUser | null>
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

  const refreshUser = useCallback(async () => {
    const saved = api.getToken()
    if (!saved) {
      setUser(null)
      setTokenState(null)
      return null
    }

    try {
      const me = await api.getMe()
      setUser(me)
      setTokenState(saved)
      return me
    } catch (err) {
      // Only log out if the token is genuinely rejected (401). A network
      // error or a 5xx (e.g. the DB is momentarily unreachable) must NOT
      // wipe the session — otherwise a transient blip logs the user out.
      if (err instanceof api.ApiError && err.status === 401) {
        logout()
      } else {
        setTokenState(saved) // keep the token; user can retry
      }
      throw err
    }
  }, [logout])

  // Validate any stored token on boot.
  useEffect(() => {
    refreshUser().catch(() => undefined).finally(() => setLoading(false))
  }, [refreshUser])

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
        user, token, loading, login, register, logout, refreshUser,
        isAuthenticated: !!user,
        isAdmin: user?.role === "admin",
        isStaff: user?.role === "admin" || user?.role === "operator",
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
