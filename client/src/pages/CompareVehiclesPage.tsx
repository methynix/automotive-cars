import { useMemo } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { FiPlus, FiX, FiArrowRight } from "react-icons/fi"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { useReviews } from "@/hooks/useApi"
import { usePriceFormatter } from "@/lib/currency"
import { FALLBACK_IMAGE } from "@/lib/constants"
import type { Review } from "@/lib/types"

const MAX = 3
const num = (v: unknown): number | null => {
  if (v == null) return null
  const n = parseFloat(String(v).replace(/[^0-9.]/g, ""))
  return Number.isFinite(n) ? n : null
}

// dir: "high" = bigger is better, "low" = smaller is better, "none" = no winner
const METRICS: { label: string; get: (r: Review) => number | null; fmt: (r: Review) => string; dir: "high" | "low" | "none" }[] = [
  { label: "Price", dir: "low", get: (r) => r.specs?.price ?? null, fmt: (r) => r.specs?.price != null ? `$${r.specs.price.toLocaleString()}` : "—" },
  { label: "Horsepower", dir: "high", get: (r) => r.specs?.horsepower ?? null, fmt: (r) => r.specs?.horsepower != null ? `${r.specs.horsepower} hp` : "—" },
  { label: "Torque", dir: "high", get: (r) => r.specs?.torque ?? null, fmt: (r) => r.specs?.torque != null ? `${r.specs.torque} Nm` : "—" },
  { label: "0–100 (s)", dir: "low", get: (r) => num(r.specs?.acceleration), fmt: (r) => r.specs?.acceleration ? `${r.specs.acceleration}s` : "—" },
  { label: "Top Speed", dir: "high", get: (r) => num(r.specs?.top_speed), fmt: (r) => r.specs?.top_speed ? `${r.specs.top_speed} mph` : "—" },
  { label: "Mileage", dir: "low", get: (r) => r.specs?.mileage ?? null, fmt: (r) => r.specs?.mileage != null ? `${r.specs.mileage.toLocaleString()} km` : "—" },
  { label: "Editor Score", dir: "high", get: (r) => r.rating ?? null, fmt: (r) => r.rating != null ? `${r.rating.toFixed(1)}/10` : "—" },
  { label: "Year", dir: "high", get: (r) => r.year, fmt: (r) => String(r.year) },
  { label: "Drivetrain", dir: "none", get: () => null, fmt: (r) => r.specs?.drivetrain || "—" },
  { label: "Body Style", dir: "none", get: () => null, fmt: (r) => r.body_style || "—" },
]

export default function CompareVehiclesPage() {
  const [params, setParams] = useSearchParams()
  const slugs = (params.get("v") || "").split(",").map((s) => s.trim()).filter(Boolean).slice(0, MAX)

  // Pull the catalog once; pick from it (no hardcoded selection).
  const { data } = useReviews({ limit: 100, sort: "newest" })
  const catalog = data?.data ?? []
  const fmtPrice = usePriceFormatter()

  const selected = useMemo(
    () => slugs.map((s) => catalog.find((r) => r.slug === s)).filter(Boolean) as Review[],
    [slugs, catalog]
  )

  const setSlugs = (next: string[]) => {
    const p = new URLSearchParams(params)
    if (next.length) p.set("v", next.join(",")); else p.delete("v")
    setParams(p)
  }
  const addSlug = (slug: string) => { if (slug && !slugs.includes(slug) && slugs.length < MAX) setSlugs([...slugs, slug]) }
  const removeSlug = (slug: string) => setSlugs(slugs.filter((s) => s !== slug))

  // Pre-compute the winner index per metric.
  const winners = useMemo(() => {
    return METRICS.map((m) => {
      if (m.dir === "none" || selected.length < 2) return -1
      let best = -1, bestVal: number | null = null
      selected.forEach((r, i) => {
        const v = m.get(r)
        if (v == null) return
        if (bestVal == null || (m.dir === "high" ? v > bestVal : v < bestVal)) { bestVal = v; best = i }
      })
      return best
    })
  }, [selected])

  const remaining = catalog.filter((r) => !slugs.includes(r.slug))

  return (
    <div className="min-h-screen bg-background font-inter selection:bg-primary selection:text-white">
      <Header />
      <main className="pt-24 pb-24">
        <div className="px-6 md:px-12 max-w-[1400px] mx-auto">
          <header className="mb-10 border-b border-border pb-8">
            <h1 className="text-5xl md:text-7xl font-archivo font-extrabold uppercase tracking-tighter mb-3">
              COM<span className="text-primary">PARE</span>
            </h1>
            <p className="text-muted-foreground font-mono uppercase tracking-widest text-xs">
              Pick up to {MAX} vehicles — the better spec is highlighted
            </p>
          </header>

          {/* Picker */}
          <div className="flex flex-wrap items-center gap-3 mb-8">
            <select
              className="bg-background border border-border px-4 py-3 text-sm font-mono focus:border-primary outline-none"
              value=""
              disabled={slugs.length >= MAX}
              onChange={(e) => addSlug(e.target.value)}
            >
              <option value="">{slugs.length >= MAX ? "Maximum reached" : "+ Add a vehicle to compare"}</option>
              {remaining.map((r) => (
                <option key={r.id} value={r.slug}>{r.manufacturer} {r.model} ({r.year})</option>
              ))}
            </select>
            {selected.map((r) => (
              <span key={r.id} className="inline-flex items-center gap-2 border border-primary text-primary px-3 py-2 text-xs font-mono uppercase">
                {r.manufacturer} {r.model}
                <button onClick={() => removeSlug(r.slug)} aria-label="remove"><FiX size={12} /></button>
              </span>
            ))}
          </div>

          {selected.length === 0 ? (
            <div className="text-center py-24 border border-dashed border-border">
              <p className="font-archivo font-bold uppercase tracking-widest mb-2">Nothing to compare yet</p>
              <p className="text-sm text-muted-foreground">Add vehicles from the dropdown above. Your selection is saved in the link, so you can share it.</p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-border">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr>
                    <th className="w-40 p-4" />
                    {selected.map((r) => (
                      <th key={r.id} className="p-4 align-top text-left border-l border-border">
                        <div className="h-28 mb-3 overflow-hidden bg-muted">
                          <img src={r.featured_image || FALLBACK_IMAGE} alt={r.title} className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE }} />
                        </div>
                        <span className="text-[10px] font-mono text-primary uppercase tracking-widest">{r.manufacturer}</span>
                        <p className="font-archivo font-extrabold uppercase leading-tight">{r.model} {r.year}</p>
                      </th>
                    ))}
                    {/* empty add slots */}
                    {Array.from({ length: MAX - selected.length }).map((_, i) => (
                      <th key={`empty-${i}`} className="p-4 border-l border-border text-center align-middle">
                        <FiPlus className="mx-auto text-muted-foreground" />
                        <span className="text-[10px] font-mono text-muted-foreground uppercase">Add vehicle</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {METRICS.map((m, rowIdx) => (
                    <tr key={m.label} className="border-t border-border">
                      <td className="p-4 text-[11px] font-mono uppercase tracking-widest text-muted-foreground">{m.label}</td>
                      {selected.map((r, i) => {
                        const isWinner = winners[rowIdx] === i
                        return (
                          <td key={r.id}
                            className={`p-4 border-l border-border text-sm font-archivo font-bold ${isWinner ? "bg-green-500/10 text-green-600" : ""}`}>
                            {m.label === "Price" ? fmtPrice(r.specs?.price) : m.fmt(r)}{isWinner && <span className="ml-2 text-[9px] font-mono uppercase align-middle">Best</span>}
                          </td>
                        )
                      })}
                      {Array.from({ length: MAX - selected.length }).map((_, i) => (
                        <td key={`e-${i}`} className="p-4 border-l border-border" />
                      ))}
                    </tr>
                  ))}
                  {/* Per-vehicle CTAs */}
                  <tr className="border-t border-border">
                    <td className="p-4" />
                    {selected.map((r) => (
                      <td key={r.id} className="p-4 border-l border-border">
                        <Link to={`/cars/${r.slug}`}
                          className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 text-[10px] font-mono font-black uppercase tracking-widest hover:bg-foreground transition-colors">
                          Inquire <FiArrowRight size={12} />
                        </Link>
                      </td>
                    ))}
                    {Array.from({ length: MAX - selected.length }).map((_, i) => (
                      <td key={`c-${i}`} className="p-4 border-l border-border" />
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
