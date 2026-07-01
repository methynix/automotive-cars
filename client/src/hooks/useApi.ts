import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import * as api from "@/lib/api"
import type { ReviewFilters, ReviewInput, CommentInput, BrandInput, LeadInput, Lead } from "@/lib/types"

/* ───────── Public reads ───────── */

export const useReviews = (filters: ReviewFilters = {}) =>
  useQuery({ queryKey: ["reviews", filters], queryFn: () => api.getReviews(filters) })

export const useFeaturedReviews = (limit = 6) =>
  useQuery({ queryKey: ["reviews", "featured", limit], queryFn: () => api.getFeaturedReviews(1, limit) })

export const useReview = (slug?: string) =>
  useQuery({ queryKey: ["review", slug], queryFn: () => api.getReviewBySlug(slug!), enabled: !!slug })

export const useComments = (reviewId?: string) =>
  useQuery({ queryKey: ["comments", reviewId], queryFn: () => api.getComments(reviewId!), enabled: !!reviewId })

export const useBrands = () =>
  useQuery({ queryKey: ["brands"], queryFn: api.getBrands })

export const useNews = () =>
  useQuery({ queryKey: ["news"], queryFn: () => api.getNews(1, 12) })

/* ───────── Public writes ───────── */

export const useCreateComment = (reviewId: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CommentInput) => api.createComment(reviewId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["comments", reviewId] }),
  })
}

export const useCreateLead = () =>
  useMutation({ mutationFn: (data: LeadInput) => api.createLead(data) })

/* ───────── Admin: reviews ───────── */

export const useAdminReviews = (filters: Record<string, unknown> = {}) =>
  useQuery({ queryKey: ["admin", "reviews", filters], queryFn: () => api.adminGetReviews(filters) })

export const useCreateReview = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: ReviewInput) => api.createReview(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin", "reviews"] }); qc.invalidateQueries({ queryKey: ["reviews"] }) },
  })
}

export const useUpdateReview = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ReviewInput> }) => api.updateReview(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin", "reviews"] }); qc.invalidateQueries({ queryKey: ["reviews"] }) },
  })
}

export const useSetPublish = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: "draft" | "published" }) => api.setReviewPublish(id, status),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin", "reviews"] }); qc.invalidateQueries({ queryKey: ["reviews"] }) },
  })
}

export const useDeleteReview = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.deleteReview(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin", "reviews"] }); qc.invalidateQueries({ queryKey: ["reviews"] }) },
  })
}

/* ───────── Admin: comments ───────── */

export const useAdminComments = (filters: Record<string, unknown> = {}) =>
  useQuery({ queryKey: ["admin", "comments", filters], queryFn: () => api.adminGetComments(filters) })

export const useModerateComment = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: "approved" | "pending" | "spam" }) => api.moderateComment(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "comments"] }),
  })
}

export const useDeleteComment = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.adminDeleteComment(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "comments"] }),
  })
}

/* ───────── Admin: brands ───────── */

export const useAdminBrands = () =>
  useQuery({ queryKey: ["admin", "brands"], queryFn: api.adminGetBrands })

export const useCreateBrand = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: BrandInput) => api.createBrand(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin", "brands"] }); qc.invalidateQueries({ queryKey: ["brands"] }) },
  })
}

export const useUpdateBrand = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<BrandInput> }) => api.updateBrand(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin", "brands"] }); qc.invalidateQueries({ queryKey: ["brands"] }) },
  })
}

export const useDeleteBrand = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.deleteBrand(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin", "brands"] }); qc.invalidateQueries({ queryKey: ["brands"] }) },
  })
}

/* ───────── Admin: users ───────── */

export const useUsers = (filters: Record<string, unknown> = {}) =>
  useQuery({ queryKey: ["admin", "users", filters], queryFn: () => api.adminGetUsers(filters) })

export const useUpdateUser = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { role?: string; status?: string } }) => api.updateUser(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "users"] }),
  })
}

export const useDeleteUser = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.deleteUser(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "users"] }),
  })
}

/* ───────── Admin: leads ───────── */

export const useLeads = (filters: Record<string, unknown> = {}) =>
  useQuery({ queryKey: ["admin", "leads", filters], queryFn: () => api.adminGetLeads(filters) })

export const useUpdateLead = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Lead> }) => api.updateLead(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "leads"] }),
  })
}

export const useSettings = () =>
  useQuery({ queryKey: ["settings"], queryFn: api.getSettings })

export const useUpdateSettings = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, any>) => api.updateSettings(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["settings"] }),
  })
}

export const useDeleteLead = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.deleteLead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "leads"] }),
  })
}

/* ───────── Admin: analytics ───────── */

export const useAnalytics = (range?: string) =>
  useQuery({ queryKey: ["admin", "analytics", range], queryFn: () => api.getAnalytics(range) })
