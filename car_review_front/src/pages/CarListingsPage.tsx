import { useMemo } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { FiSliders, FiX } from "react-icons/fi"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { Reveal } from "@/components/ui/Reveal"
import { useReviews, useBrands } from "@/hooks/useApi"
import { BODY_STYLES, CONDITIONS, DRIVETRAINS, SORT_OPTIONS, FALLBACK_IMAGE } from "@/lib/constants"
import type { ReviewFilters } from "@/lib/types"

const LIMIT = 9

export default function CarListingsPage() {
  // ── All filter state lives in the URL (shareable + survives refresh) ──
  const [params, setParams] = useSearchParams()

  const get = (k: string) => params.get(k) || ""
  const page = Number(params.get("page")) || 1

  const setParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(params)
    if (value === null || value === "") next.delete(key)
    else next.set(key, value)
    if (key !== "page") next.delete("page") // any filter change resets to page 1
    setParams(next, { replace: false })
  }

  const clearAll = () => setParams(new URLSearchParams(), { replace: false })

  // ── Build the server query from the URL ──
  const filters: ReviewFilters = useMemo(() => ({
    page,
    limit: LIMIT,
    sort: get("sort") || "newest",
    search: get("search") || undefined,
    manufacturer: get("manufacturer") || undefined,
    bodyStyle: get("bodyStyle") || undefined,
    condition: get("condition") || undefined,
    drivetrain: get("drivetrain") || undefined,
    minPrice: get("minPrice") ? Number(get("minPrice")) : undefined,
    maxPrice: get("maxPrice") ? Number(get("maxPrice")) : undefined,
    maxMileage: get("maxMileage") ? Number(get("maxMileage")) : undefined,
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [params])

  const { data, isLoading, isError, error } = useReviews(filters)
  const reviews = data?.data ?? []
  const total = data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / LIMIT))

  const { data: brands } = useBrands()

  const activeCount = ["search", "manufacturer", "bodyStyle", "condition", "drivetrain", "minPrice", "maxPrice", "maxMileage"]
    .filter((k) => get(k)).length

  return (
    <div className="min-h-screen bg-background font-inter selection:bg-primary selection:text-white">
      <Header />
      <main className="pt-24 pb-24">
        <div className="px-6 md:px-12 max-w-[1400px] mx-auto">
          <Reveal animation="fade-down" duration={500}>
            <header className="mb-10 border-b border-border pb-8">
              <h1 className="text-5xl md:text-7xl font-archivo font-extrabold uppercase tracking-tighter mb-3">
                THE <span className="text-primary">GARAGE</span>
              </h1>
              <p className="text-muted-foreground font-mono uppercase tracking-widest text-xs">
                {total} vehicle{total === 1 ? "" : "s"} available
              </p>
            </header>
          </Reveal>

          <div className="flex flex-col lg:flex-row gap-10">
            {/* ── Sidebar filters ── */}
            <aside className="lg:w-72 flex-shrink-0">
              <div className="lg:sticky lg:top-28 border border-border p-6 space-y-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FiSliders size={14} className="text-primary" />
                    <h2 className="text-xs font-mono font-bold uppercase tracking-[0.3em]">Filters</h2>
                  </div>
                  {activeCount > 0 && (
                    <button onClick={clearAll} className="text-[10px] font-mono uppercase text-primary hover:underline flex items-center gap-1">
                      <FiX size={10} /> Clear ({activeCount})
                    </button>
                  )}
                </div>

                {/* Search */}
                <input
                  className="w-full bg-background border border-border px-4 py-3 text-sm focus:border-primary outline-none"
                  placeholder="Search make or model"
                  value={get("search")}
                  onChange={(e) => setParam("search", e.target.value)}
                />

                {/* Manufacturer (data-driven from /api/brands) */}
                <section>
                  <h3 className="text-xs font-mono mb-3 text-muted-foreground uppercase">Manufacturer</h3>
                  <select
                    className="w-full bg-background border border-border px-3 py-2 text-sm focus:border-primary outline-none"
                    value={get("manufacturer")}
                    onChange={(e) => setParam("manufacturer", e.target.value || null)}
                  >
                    <option value="">All manufacturers</option>
                    {(brands ?? []).map((b) => (
                      <option key={b.id} value={b.name}>{b.name}</option>
                    ))}
                  </select>
                </section>

                {/* Body Style */}
                <section>
                  <h3 className="text-xs font-mono mb-3 text-muted-foreground uppercase">Body Style</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {BODY_STYLES.map((style) => {
                      const active = get("bodyStyle") === style
                      return (
                        <button key={style}
                          className={`border py-2 text-xs font-mono transition-colors ${
                            active ? "border-primary bg-primary/10 text-primary font-bold" : "border-border hover:bg-muted/30"
                          }`}
                          onClick={() => setParam("bodyStyle", active ? null : style)}
                        >{style}</button>
                      )
                    })}
                  </div>
                </section>

                {/* Condition */}
                <section>
                  <h3 className="text-xs font-mono mb-3 text-muted-foreground uppercase">Condition</h3>
                  <div className="space-y-2">
                    {CONDITIONS.map((c) => {
                      const active = get("condition") === c.value
                      return (
                        <button key={c.value}
                          className={`w-full text-left border px-3 py-2 text-xs font-mono transition-colors ${
                            active ? "border-primary bg-primary/10 text-primary font-bold" : "border-border hover:bg-muted/30"
                          }`}
                          onClick={() => setParam("condition", active ? null : c.value)}
                        >{c.label}</button>
                      )
                    })}
                  </div>
                </section>

                {/* Price */}
                <section>
                  <h3 className="text-xs font-mono mb-3 text-muted-foreground uppercase">Price ($)</h3>
                  <div className="flex items-center gap-2">
                    <input type="number" min="0" placeholder="Min"
                      className="w-full bg-background border border-border px-3 py-2 text-sm focus:border-primary outline-none"
                      value={get("minPrice")}
                      onChange={(e) => setParam("minPrice", e.target.value || null)}
                    />
                    <span className="text-muted-foreground">–</span>
                    <input type="number" min="0" placeholder="Max"
                      className="w-full bg-background border border-border px-3 py-2 text-sm focus:border-primary outline-none"
                      value={get("maxPrice")}
                      onChange={(e) => setParam("maxPrice", e.target.value || null)}
                    />
                  </div>
                </section>

                {/* Max mileage */}
                <section>
                  <h3 className="text-xs font-mono mb-3 text-muted-foreground uppercase">Max Mileage (km)</h3>
                  <input type="number" min="0" placeholder="Any"
                    className="w-full bg-background border border-border px-3 py-2 text-sm focus:border-primary outline-none"
                    value={get("maxMileage")}
                    onChange={(e) => setParam("maxMileage", e.target.value || null)}
                  />
                </section>

                {/* Drivetrain */}
                <section>
                  <h3 className="text-xs font-mono mb-3 text-muted-foreground uppercase">Drivetrain</h3>
                  <div className="space-y-2">
                    {DRIVETRAINS.map((dt) => {
                      const active = get("drivetrain") === dt
                      return (
                        <button key={dt}
                          className={`w-full text-left border px-3 py-2 text-xs font-mono transition-colors ${
                            active ? "border-primary bg-primary/10 text-primary font-bold" : "border-border hover:bg-muted/30"
                          }`}
                          onClick={() => setParam("drivetrain", active ? null : dt)}
                        >{dt}</button>
                      )
                    })}
                  </div>
                </section>
              </div>
            </aside>

            {/* ── Results ── */}
            <div className="flex-grow">
              {/* Sort bar (server-side sort) */}
              <div className="flex items-center justify-between mb-6 border-b border-border pb-4">
                <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
                  Page {page} of {totalPages}
                </span>
                <select
                  className="bg-background border border-border px-3 py-2 text-xs font-mono uppercase tracking-widest focus:border-primary outline-none"
                  value={get("sort") || "newest"}
                  onChange={(e) => setParam("sort", e.target.value)}
                >
                  {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>

              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-background border border-border overflow-hidden animate-pulse">
                      <div className="h-56 bg-muted/30" />
                      <div className="p-6 space-y-3">
                        <div className="h-4 bg-muted/30 w-1/3" />
                        <div className="h-6 bg-muted/30 w-2/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : isError ? (
                <div className="text-center py-24 border border-dashed border-border">
                  <p className="text-red-500 font-mono mb-4">{(error as Error)?.message || "Failed to load vehicles."}</p>
                </div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-24 border border-dashed border-border">
                  <p className="font-archivo font-bold uppercase tracking-widest mb-2">No vehicles found</p>
                  <p className="text-sm text-muted-foreground mb-6">Try widening your filters.</p>
                  <button onClick={clearAll} className="text-xs font-mono font-bold uppercase tracking-widest border border-primary px-6 py-2 hover:bg-primary hover:text-white transition-colors">
                    Clear filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {reviews.map((r, idx) => (
                    <Reveal key={r.id} animation="fade-up" delay={idx * 40}>
                      <Link to={`/cars/${r.slug}`} className="group block bg-background border border-border overflow-hidden hover:border-primary transition-colors">
                        <div className="relative h-56 overflow-hidden bg-muted">
                          <img src={r.featured_image || FALLBACK_IMAGE} alt={r.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE }} />
                          {r.condition && (
                            <span className="absolute top-3 left-3 bg-primary text-white text-[10px] font-mono font-bold px-2 py-1 uppercase tracking-widest">
                              {r.condition === "certified" ? "Certified" : r.condition}
                            </span>
                          )}
                          {r.body_style && (
                            <span className="absolute top-3 right-3 bg-black/70 text-white text-[10px] font-mono px-2 py-1 uppercase tracking-widest">
                              {r.body_style}
                            </span>
                          )}
                        </div>
                        <div className="p-6">
                          <span className="text-[10px] font-mono font-bold text-primary uppercase tracking-[0.3em]">{r.manufacturer}</span>
                          <h3 className="text-xl font-archivo font-extrabold uppercase tracking-tight mt-1 mb-3">
                            {r.model} <span className="text-muted-foreground">{r.year}</span>
                          </h3>
                          <div className="flex items-center justify-between text-xs font-mono text-muted-foreground border-t border-border pt-3">
                            <span>{r.specs?.mileage != null ? `${r.specs.mileage.toLocaleString()} km` : "—"}</span>
                            {r.rating != null && <span className="text-foreground font-bold">{r.rating.toFixed(1)}/10</span>}
                          </div>
                          <div className="mt-3 text-lg font-archivo font-extrabold">
                            {r.specs?.price != null ? `$${r.specs.price.toLocaleString()}` : "Price on request"}
                          </div>
                        </div>
                      </Link>
                    </Reveal>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-12">
                  <button
                    disabled={page <= 1}
                    onClick={() => setParam("page", String(page - 1))}
                    className="px-4 py-2 text-xs font-mono uppercase border border-border disabled:opacity-40 hover:border-primary"
                  >Prev</button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button key={p}
                      onClick={() => setParam("page", String(p))}
                      className={`w-10 h-10 text-xs font-mono border ${p === page ? "border-primary bg-primary text-white" : "border-border hover:border-primary"}`}
                    >{p}</button>
                  ))}
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setParam("page", String(page + 1))}
                    className="px-4 py-2 text-xs font-mono uppercase border border-border disabled:opacity-40 hover:border-primary"
                  >Next</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
