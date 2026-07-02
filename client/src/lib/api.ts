// Central API client. All data comes from the real backend — no mock fallback.
import type {
  Review, ReviewInput, ReviewFilters, Comment, CommentInput,
  Brand, BrandInput, Lead, LeadInput, AppUser, Analytics, NewsApiResponse, Paginated,
} from "./types"

const BASE_URL =
  import.meta.env.VITE_API_URL !== undefined
    ? import.meta.env.VITE_API_URL
    : "https://automotive-cars.onrender.com"

const TOKEN_KEY = "fa_token"

export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const setToken = (t: string) => localStorage.setItem(TOKEN_KEY, t)
export const clearToken = () => localStorage.removeItem(TOKEN_KEY)

export class ApiError extends Error {
  status: number
  details?: unknown
  constructor(message: string, status: number, details?: unknown) {
    super(message)
    this.status = status
    this.details = details
  }
}

interface FetchOpts extends RequestInit {
  auth?: boolean
}

// One place that talks to the network. Acts as our "interceptor":
// - attaches the bearer token
// - on 401 (expired/invalid token) it clears auth and broadcasts a logout event
async function apiFetch<T>(endpoint: string, opts: FetchOpts = {}): Promise<T> {
  const { auth, headers, ...rest } = opts
  const token = getToken()

  const finalHeaders: Record<string, string> = {
    ...(rest.body && !(rest.body instanceof FormData) ? { "Content-Type": "application/json" } : {}),
    ...(headers as Record<string, string>),
  }
  if (auth && token) finalHeaders.Authorization = `Bearer ${token}`

  let res: Response
  try {
    res = await fetch(`${BASE_URL}${endpoint}`, { ...rest, headers: finalHeaders })
  } catch {
    throw new ApiError("Network error — could not reach the server.", 0)
  }

  if (res.status === 401) {
    // A 401 on the login/register endpoints means bad credentials — NOT an
    // expired session. Don't wipe anything; let the caller show the real error.
    const isAuthEntry = endpoint.startsWith("/api/auth/login") || endpoint.startsWith("/api/auth/register")
    if (isAuthEntry) {
      throw new ApiError("Invalid email or password.", 401)
    }
    // A 401 elsewhere means the stored token is genuinely invalid/expired.
    clearToken()
    window.dispatchEvent(new CustomEvent("auth:logout"))
    throw new ApiError("Your session has expired. Please sign in again.", 401)
  }

  let payload: any = null
  const text = await res.text()
  if (text) { try { payload = JSON.parse(text) } catch { payload = text } }

  if (!res.ok) {
    const message = payload?.message || payload?.error || `Request failed (${res.status})`
    throw new ApiError(message, res.status, payload?.errors)
  }
  // Backend wraps as { success, data, meta } — unwrap to data when present.
  return (payload && typeof payload === "object" && "data" in payload ? payload.data : payload) as T
}

// Same as apiFetch but also returns pagination meta.
async function apiFetchPaged<T>(endpoint: string, opts: FetchOpts = {}): Promise<Paginated<T>> {
  const { auth, headers, ...rest } = opts
  const token = getToken()
  const finalHeaders: Record<string, string> = { ...(headers as Record<string, string>) }
  if (auth && token) finalHeaders.Authorization = `Bearer ${token}`

  let res: Response
  try {
    res = await fetch(`${BASE_URL}${endpoint}`, { ...rest, headers: finalHeaders })
  } catch {
    throw new ApiError("Network error — could not reach the server.", 0)
  }
  if (res.status === 401) {
    // A 401 on the login/register endpoints means bad credentials — NOT an
    // expired session. Don't wipe anything; let the caller show the real error.
    const isAuthEntry = endpoint.startsWith("/api/auth/login") || endpoint.startsWith("/api/auth/register")
    if (isAuthEntry) {
      throw new ApiError("Invalid email or password.", 401)
    }
    // A 401 elsewhere means the stored token is genuinely invalid/expired.
    clearToken()
    window.dispatchEvent(new CustomEvent("auth:logout"))
    throw new ApiError("Your session has expired. Please sign in again.", 401)
  }
  const payload = await res.json().catch(() => ({}))
  if (!res.ok) throw new ApiError(payload?.message || `Request failed (${res.status})`, res.status)
  const meta = payload.pagination ?? payload.meta ?? {}
  return { data: payload.data ?? [], total: meta.total ?? (payload.data?.length ?? 0), page: meta.page ?? 1, limit: meta.limit ?? 0 }
}

function qs(params: Record<string, unknown>): string {
  const sp = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") sp.append(k, String(v))
  })
  const s = sp.toString()
  return s ? `?${s}` : ""
}

/* ───────────────────────── Public ───────────────────────── */

export const getReviews = (filters: ReviewFilters = {}) =>
  apiFetchPaged<Review>(`/api/reviews${qs(filters as Record<string, unknown>)}`)

export const getFeaturedReviews = (page = 1, limit = 6) =>
  apiFetchPaged<Review>(`/api/reviews/featured${qs({ page, limit })}`)

export const getReviewBySlug = (slug: string) =>
  apiFetch<Review>(`/api/reviews/${slug}`)

export const getComments = (reviewId: string, page = 1, limit = 50) =>
  apiFetchPaged<Comment>(`/api/reviews/${reviewId}/comments${qs({ page, limit })}`)

export const createComment = (reviewId: string, data: CommentInput) =>
  apiFetch<Comment>(`/api/reviews/${reviewId}/comments`, { method: "POST", body: JSON.stringify(data) })

export const getSettings = () =>
  apiFetch<Record<string, any>>(`/api/settings`, { auth: false })
export const updateSettings = (data: Record<string, any>) =>
  apiFetch<Record<string, any>>(`/api/settings`, { method: "PUT", auth: true, body: JSON.stringify(data) })

export const getBrands = () => apiFetch<Brand[]>(`/api/brands`)

export const createLead = (data: LeadInput) =>
  apiFetch<Lead>(`/api/leads`, { method: "POST", body: JSON.stringify(data) })

export const getNews = (page = 1, perPage = 12) =>
  apiFetch<NewsApiResponse>(`/api/news${qs({ page, perPage })}`)

/* ───────────────────────── Auth ───────────────────────── */

export const login = (email: string, password: string) =>
  apiFetch<{ token: string; user: AppUser }>(`/api/auth/login`, {
    method: "POST", body: JSON.stringify({ email: email.trim(), password }),
  })

export const register = (email: string, password: string, full_name: string) =>
  apiFetch<{ token: string; user: AppUser }>(`/api/auth/register`, {
    method: "POST", body: JSON.stringify({ email: email.trim(), password, full_name: full_name.trim() }),
  })

export const getMe = () => apiFetch<AppUser>(`/api/auth/me`, { auth: true })

/* ───────────────────────── Admin: reviews ───────────────────────── */

export const adminGetReviews = (filters: Record<string, unknown> = {}) =>
  apiFetchPaged<Review>(`/api/admin/reviews${qs(filters)}`, { auth: true })

export const createReview = (data: ReviewInput) =>
  apiFetch<Review>(`/api/admin/reviews`, { method: "POST", auth: true, body: JSON.stringify(data) })

export const updateReview = (id: string, data: Partial<ReviewInput>) =>
  apiFetch<Review>(`/api/admin/reviews/${id}`, { method: "PATCH", auth: true, body: JSON.stringify(data) })

export const setReviewPublish = (id: string, status: "draft" | "published") =>
  apiFetch<Review>(`/api/admin/reviews/${id}/publish`, { method: "PATCH", auth: true, body: JSON.stringify({ status }) })

export const deleteReview = (id: string) =>
  apiFetch<{ id: string }>(`/api/admin/reviews/${id}`, { method: "DELETE", auth: true })

/* ───────────────────────── Admin: comments ───────────────────────── */

export const adminGetComments = (filters: Record<string, unknown> = {}) =>
  apiFetchPaged<Comment>(`/api/admin/comments${qs(filters)}`, { auth: true })

export const moderateComment = (id: string, status: "approved" | "pending" | "spam") =>
  apiFetch<Comment>(`/api/admin/comments/${id}`, { method: "PUT", auth: true, body: JSON.stringify({ status }) })

export const adminDeleteComment = (id: string) =>
  apiFetch<{ id: string }>(`/api/admin/comments/${id}`, { method: "DELETE", auth: true })

/* ───────────────────────── Admin: brands ───────────────────────── */

export const adminGetBrands = () => apiFetch<Brand[]>(`/api/admin/brands`, { auth: true })
export const createBrand = (data: BrandInput) =>
  apiFetch<Brand>(`/api/admin/brands`, { method: "POST", auth: true, body: JSON.stringify(data) })
export const updateBrand = (id: string, data: Partial<BrandInput>) =>
  apiFetch<Brand>(`/api/admin/brands/${id}`, { method: "PUT", auth: true, body: JSON.stringify(data) })
export const deleteBrand = (id: string) =>
  apiFetch<{ id: string }>(`/api/admin/brands/${id}`, { method: "DELETE", auth: true })

/* ───────────────────────── Admin: users ───────────────────────── */

export const adminGetUsers = (filters: Record<string, unknown> = {}) =>
  apiFetchPaged<AppUser>(`/api/admin/users${qs(filters)}`, { auth: true })
export const updateUser = (id: string, data: { role?: string; status?: string; full_name?: string }) =>
  apiFetch<AppUser>(`/api/admin/users/${id}`, { method: "PUT", auth: true, body: JSON.stringify(data) })
export const deleteUser = (id: string) =>
  apiFetch<{ id: string }>(`/api/admin/users/${id}`, { method: "DELETE", auth: true })

/* ───────────────────────── Admin: leads ───────────────────────── */

export const adminGetLeads = (filters: Record<string, unknown> = {}) =>
  apiFetchPaged<Lead>(`/api/admin/leads${qs(filters)}`, { auth: true })
export const updateLead = (id: string, data: Partial<Lead>) =>
  apiFetch<Lead>(`/api/admin/leads/${id}`, { method: "PUT", auth: true, body: JSON.stringify(data) })
export const deleteLead = (id: string) =>
  apiFetch<{ id: string }>(`/api/admin/leads/${id}`, { method: "DELETE", auth: true })


/* ───────────────────────── Admin: analytics + media ───────────────────────── */

export const getAnalytics = (range?: string) => apiFetch<Analytics>(`/api/admin/analytics${range && range !== 'all' ? `?range=${range}` : ''}`, { auth: true })

export const uploadImage = async (file: File, manufacturer?: string, model?: string): Promise<{ url: string }> => {
  const form = new FormData()
  form.append("image", file)
  if (manufacturer) form.append("manufacturer", manufacturer)
  if (model) form.append("model", model)
  return apiFetch<{ url: string }>(`/api/upload/image`, { method: "POST", auth: true, body: form })
}
