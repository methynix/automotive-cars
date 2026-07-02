import { useCallback, useEffect, useState } from "react"
import { useAuth } from "@/lib/auth"
import { getSavedCars, saveCar, unsaveCar } from "@/lib/api"

// Shared saved-car state for the "Virtual Garage" heart toggle. One hook
// instance per page (listings / detail) fetches the customer's saved review
// ids once, then toggles optimistically. Returns `false` from toggle when the
// visitor isn't signed in so the caller can prompt them to sign in.
export function useSavedCars() {
  const { isAuthenticated } = useAuth()
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())
  const [busy, setBusy] = useState<Set<string>>(new Set())

  useEffect(() => {
    let alive = true
    if (!isAuthenticated) { setSavedIds(new Set()); return }
    getSavedCars()
      .then((rows) => { if (alive) setSavedIds(new Set(rows.map((r) => r.review_id))) })
      .catch(() => undefined)
    return () => { alive = false }
  }, [isAuthenticated])

  const isSaved = useCallback((reviewId: string) => savedIds.has(reviewId), [savedIds])

  const toggle = useCallback(async (reviewId: string): Promise<boolean> => {
    if (!isAuthenticated) return false
    const currentlySaved = savedIds.has(reviewId)
    setBusy((b) => new Set(b).add(reviewId))
    // Optimistic update.
    setSavedIds((prev) => {
      const next = new Set(prev)
      if (currentlySaved) next.delete(reviewId); else next.add(reviewId)
      return next
    })
    try {
      if (currentlySaved) await unsaveCar(reviewId); else await saveCar(reviewId)
    } catch {
      // Roll back on failure.
      setSavedIds((prev) => {
        const next = new Set(prev)
        if (currentlySaved) next.add(reviewId); else next.delete(reviewId)
        return next
      })
    } finally {
      setBusy((b) => { const next = new Set(b); next.delete(reviewId); return next })
    }
    return true
  }, [isAuthenticated, savedIds])

  const isBusy = useCallback((reviewId: string) => busy.has(reviewId), [busy])

  return { isSaved, toggle, isBusy, isAuthenticated }
}
