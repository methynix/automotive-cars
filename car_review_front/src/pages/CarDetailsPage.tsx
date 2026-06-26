import { useState } from "react"
import { Link, useParams } from "react-router-dom"
import {
  FiArrowLeft, FiShare2, FiCheck, FiX, FiZap, FiSettings,
  FiChevronRight, FiCalendar,
} from "react-icons/fi"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { Reveal } from "@/components/ui/Reveal"
import { Comments } from "@/components/sections/Comments"
import { useReview, useReviews, useCreateLead } from "@/hooks/useApi"
import { FALLBACK_IMAGE, FALLBACK_IMAGE_LG, DEALER_LOCATIONS } from "@/lib/constants"

const PAINT = [
  { name: "Obsidian Black", hex: "#111111" },
  { name: "Arctic White", hex: "#f4f4f4" },
  { name: "Signal Red", hex: "#E31837" },
  { name: "Deep Ocean", hex: "#1e3a5f" },
  { name: "Titanium Grey", hex: "#7a7d80" },
]
const INTERIOR = [
  { name: "Charcoal", hex: "#1c1c1c" },
  { name: "Cognac", hex: "#7b4b2a" },
  { name: "Ivory", hex: "#e8e3d8" },
]

export default function CarDetailsPage() {
  const { id: slug } = useParams()
  const { data: review, isLoading, isError } = useReview(slug)
  const { data: relatedData } = useReviews({ limit: 3, sort: "newest" })
  const createLead = useCreateLead()

  const [lightbox, setLightbox] = useState<string | null>(null)
  const [color, setColor] = useState(PAINT[0])
  const [interior, setInterior] = useState(INTERIOR[0])
  const [shareMsg, setShareMsg] = useState(false)

  // Test-drive lead form
  const [showLead, setShowLead] = useState(false)
  const [leadDone, setLeadDone] = useState(false)
  const [lead, setLead] = useState({ full_name: "", email: "", phone: "", preferred_location: DEALER_LOCATIONS[0], message: "" })
  const [leadErr, setLeadErr] = useState<string | null>(null)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background"><Header />
        <div className="pt-32 px-6 max-w-[1200px] mx-auto animate-pulse">
          <div className="h-[420px] bg-muted/30 mb-8" />
          <div className="h-10 bg-muted/30 w-1/2 mb-4" />
          <div className="h-4 bg-muted/20 w-3/4" />
        </div>
      </div>
    )
  }

  if (isError || !review) {
    return (
      <div className="min-h-screen bg-background flex flex-col"><Header />
        <main className="flex-1 flex items-center justify-center text-center px-6">
          <div>
            <h1 className="text-3xl font-archivo font-extrabold uppercase mb-4">Vehicle not found</h1>
            <Link to="/cars" className="text-primary font-mono text-sm uppercase tracking-widest hover:underline">← Back to the garage</Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const content = review.content || {}
  const pros = (content.pros as string[]) || []
  const cons = (content.cons as string[]) || []
  const gallery = review.gallery || []
  const related = (relatedData?.data ?? []).filter((r) => r.slug !== review.slug).slice(0, 3)

  const share = async () => {
    try { await navigator.clipboard.writeText(window.location.href); setShareMsg(true); setTimeout(() => setShareMsg(false), 2000) } catch { /* ignore */ }
  }

  const submitLead = async () => {
    setLeadErr(null)
    if (lead.full_name.trim().length < 2) return setLeadErr("Please enter your name.")
    if (!/^\S+@\S+\.\S+$/.test(lead.email)) return setLeadErr("Please enter a valid email.")
    if (lead.phone.trim().length < 6) return setLeadErr("Please enter a valid phone number.")
    try {
      await createLead.mutateAsync({ review_id: review.id, ...lead })
      setLeadDone(true)
    } catch (e: any) {
      setLeadErr(e?.message || "Could not submit your request.")
    }
  }

  return (
    <div className="min-h-screen bg-background font-inter selection:bg-primary selection:text-white">
      <Header />
      <main className="pt-20">
        {/* Hero image with live paint overlay */}
        <div className="relative h-[480px] overflow-hidden bg-black">
          <img src={review.featured_image || FALLBACK_IMAGE_LG} alt={review.title}
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE_LG }} />
          {/* Configurator paint tint (visual; true per-colour shots need image assets) */}
          <div className="absolute inset-0 mix-blend-multiply pointer-events-none transition-colors duration-500"
            style={{ backgroundColor: color.hex, opacity: color.name === "Arctic White" ? 0.05 : 0.28 }} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 max-w-[1280px] mx-auto">
            <Link to="/cars" className="inline-flex items-center gap-2 text-white/80 hover:text-white text-xs font-mono uppercase tracking-widest mb-4">
              <FiArrowLeft size={14} /> Back to garage
            </Link>
            <div className="flex items-end justify-between flex-wrap gap-4">
              <div>
                <span className="text-[11px] font-mono font-bold text-primary uppercase tracking-[0.3em]">{review.manufacturer}{review.body_style ? ` · ${review.body_style}` : ""}</span>
                <h1 className="text-4xl md:text-6xl font-archivo font-extrabold uppercase tracking-tighter text-white mt-2">
                  {review.model} <span className="text-white/60">{review.year}</span>
                </h1>
              </div>
              <button onClick={share} className="relative inline-flex items-center gap-2 border border-white/40 text-white px-4 py-2 text-xs font-mono uppercase tracking-widest hover:bg-white hover:text-black transition-colors">
                <FiShare2 size={14} /> Share
                {shareMsg && <span className="absolute -top-9 right-0 bg-white text-black px-3 py-1 text-[10px] whitespace-nowrap">Link copied</span>}
              </button>
            </div>
          </div>
        </div>

        <div className="px-6 md:px-12 max-w-[1280px] mx-auto py-12 grid lg:grid-cols-3 gap-12">
          {/* Main column */}
          <div className="lg:col-span-2 space-y-12">
            {/* Score + price + CTA */}
            <div className="flex flex-wrap items-center justify-between gap-6 border-b border-border pb-8">
              <div className="flex items-center gap-8">
                {review.rating != null && (
                  <div>
                    <div className="text-5xl font-archivo font-extrabold">{review.rating.toFixed(1)}<span className="text-xl text-muted-foreground">/10</span></div>
                    <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-muted-foreground">Editor Score</div>
                  </div>
                )}
                <div>
                  <div className="text-3xl font-archivo font-extrabold">
                    {review.specs?.price != null ? `$${review.specs.price.toLocaleString()}` : "On request"}
                  </div>
                  <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-muted-foreground">
                    {review.condition === "certified" ? "Certified Pre-Owned" : review.condition === "used" ? "Used" : "New"}
                    {review.specs?.mileage != null ? ` · ${review.specs.mileage.toLocaleString()} km` : ""}
                  </div>
                </div>
              </div>
              <button onClick={() => { setShowLead(true); setLeadDone(false) }}
                className="inline-flex items-center gap-2 bg-primary text-white px-6 py-4 text-xs font-mono font-black uppercase tracking-[0.2em] hover:bg-foreground transition-colors">
                <FiCalendar size={14} /> Book a Test Drive
              </button>
            </div>

            {/* Body */}
            {content.body && (
              <Reveal animation="fade-up">
                <p className="text-lg leading-relaxed text-muted-foreground">{content.body}</p>
              </Reveal>
            )}

            {/* Pros / cons */}
            {(pros.length > 0 || cons.length > 0) && (
              <div className="grid md:grid-cols-2 gap-6">
                {pros.length > 0 && (
                  <div className="border border-border p-6">
                    <h3 className="text-xs font-mono uppercase tracking-[0.3em] text-green-600 mb-4">The Good</h3>
                    <ul className="space-y-2">
                      {pros.map((p, i) => <li key={i} className="flex items-start gap-2 text-sm"><FiCheck className="text-green-600 mt-0.5 shrink-0" size={14} />{p}</li>)}
                    </ul>
                  </div>
                )}
                {cons.length > 0 && (
                  <div className="border border-border p-6">
                    <h3 className="text-xs font-mono uppercase tracking-[0.3em] text-primary mb-4">The Trade-offs</h3>
                    <ul className="space-y-2">
                      {cons.map((c, i) => <li key={i} className="flex items-start gap-2 text-sm"><FiX className="text-primary mt-0.5 shrink-0" size={14} />{c}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Gallery */}
            {gallery.length > 0 && (
              <div>
                <h2 className="text-2xl font-archivo font-extrabold uppercase tracking-tight mb-6">Gallery</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {gallery.map((g) => (
                    <button key={g.id || g.image_url} onClick={() => setLightbox(g.image_url)} className="aspect-video overflow-hidden bg-muted group">
                      <img src={g.image_url} alt={g.alt_text || review.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-8">
            {/* Specs */}
            <div className="border border-border p-6">
              <div className="flex items-center gap-2 mb-5"><FiZap className="text-primary" size={16} /><h3 className="text-xs font-mono uppercase tracking-[0.3em]">Specifications</h3></div>
              <dl className="space-y-3 text-sm">
                {([
                  ["Engine", review.specs?.engine],
                  ["Power", review.specs?.horsepower != null ? `${review.specs.horsepower} hp` : null],
                  ["Torque", review.specs?.torque != null ? `${review.specs.torque} Nm` : null],
                  ["0–100", review.specs?.acceleration ? `${review.specs.acceleration}s` : null],
                  ["Top Speed", review.specs?.top_speed ? `${review.specs.top_speed} mph` : null],
                  ["Drivetrain", review.specs?.drivetrain],
                  ["Fuel", review.specs?.fuel_type],
                  ["Seating", review.specs?.seating],
                  ["Mileage", review.specs?.mileage != null ? `${review.specs.mileage.toLocaleString()} km` : null],
                ] as [string, unknown][]).filter(([, v]) => v != null && v !== "").map(([k, v]) => (
                  <div key={k} className="flex justify-between border-b border-border/60 pb-2">
                    <dt className="text-muted-foreground font-mono text-xs uppercase">{k}</dt>
                    <dd className="font-archivo font-bold">{String(v)}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Configurator (stateful) */}
            <div className="border border-border p-6">
              <div className="flex items-center gap-2 mb-5"><FiSettings className="text-primary" size={16} /><h3 className="text-xs font-mono uppercase tracking-[0.3em]">Configure</h3></div>
              <p className="text-[11px] font-mono uppercase text-muted-foreground mb-2">Paint · <span className="text-foreground">{color.name}</span></p>
              <div className="flex gap-3 mb-6">
                {PAINT.map((c) => (
                  <button key={c.name} onClick={() => setColor(c)} title={c.name}
                    className={`w-8 h-8 rounded-full border-2 transition-transform ${color.name === c.name ? "border-primary scale-110" : "border-border"}`}
                    style={{ backgroundColor: c.hex }} />
                ))}
              </div>
              <p className="text-[11px] font-mono uppercase text-muted-foreground mb-2">Interior · <span className="text-foreground">{interior.name}</span></p>
              <div className="flex gap-3">
                {INTERIOR.map((c) => (
                  <button key={c.name} onClick={() => setInterior(c)} title={c.name}
                    className={`w-8 h-8 rounded-full border-2 ${interior.name === c.name ? "border-primary scale-110" : "border-border"}`}
                    style={{ backgroundColor: c.hex }} />
                ))}
              </div>
            </div>

            <button onClick={() => { setShowLead(true); setLeadDone(false) }}
              className="w-full bg-foreground text-background py-4 text-xs font-mono font-black uppercase tracking-[0.2em] hover:bg-primary hover:text-white transition-colors">
              Enquire about this {review.model}
            </button>
          </aside>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="px-6 md:px-12 max-w-[1280px] mx-auto py-12 border-t border-border">
            <h2 className="text-2xl font-archivo font-extrabold uppercase tracking-tight mb-6">More to explore</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {related.map((r) => (
                <Link key={r.id} to={`/cars/${r.slug}`} className="group border border-border hover:border-primary transition-colors">
                  <div className="h-44 overflow-hidden bg-muted">
                    <img src={r.featured_image || FALLBACK_IMAGE} alt={r.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE }} />
                  </div>
                  <div className="p-5">
                    <span className="text-[10px] font-mono text-primary uppercase tracking-widest">{r.manufacturer}</span>
                    <p className="font-archivo font-extrabold uppercase flex items-center justify-between">{r.model} <FiChevronRight /></p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
        {/* Comments — at the very bottom, collapsible + sign-in to post */}
        <div className="px-6 md:px-12 max-w-[1280px] mx-auto pb-16">
          <Comments reviewId={review.id} />
        </div>
      </main>
      <Footer />

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-6" onClick={() => setLightbox(null)}>
          <button className="absolute top-6 right-6 text-white" onClick={() => setLightbox(null)}><FiX size={28} /></button>
          <img src={lightbox} alt="" className="max-w-full max-h-full object-contain" />
        </div>
      )}

      {/* Test-drive lead modal */}
      {showLead && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6" onClick={() => setShowLead(false)}>
          <div className="bg-background border border-border w-full max-w-lg p-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-archivo font-extrabold uppercase tracking-tight">Book a Test Drive</h3>
              <button onClick={() => setShowLead(false)}><FiX size={20} /></button>
            </div>

            {leadDone ? (
              <div className="text-center py-8">
                <div className="w-14 h-14 rounded-full bg-green-500/10 text-green-600 flex items-center justify-center mx-auto mb-4"><FiCheck size={24} /></div>
                <p className="font-archivo font-bold uppercase mb-1">Request received</p>
                <p className="text-sm text-muted-foreground">A specialist will contact you to arrange your drive of the {review.manufacturer} {review.model}.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs font-mono text-muted-foreground uppercase">{review.manufacturer} {review.model} · {review.year}</p>
                <input className="w-full border border-border bg-background px-4 py-3 text-sm focus:border-primary outline-none"
                  placeholder="Full name *" value={lead.full_name} onChange={(e) => setLead({ ...lead, full_name: e.target.value })} />
                <div className="grid grid-cols-2 gap-3">
                  <input className="w-full border border-border bg-background px-4 py-3 text-sm focus:border-primary outline-none"
                    placeholder="Phone *" value={lead.phone} onChange={(e) => setLead({ ...lead, phone: e.target.value })} />
                  <input className="w-full border border-border bg-background px-4 py-3 text-sm focus:border-primary outline-none"
                    placeholder="Email *" value={lead.email} onChange={(e) => setLead({ ...lead, email: e.target.value })} />
                </div>
                <select className="w-full border border-border bg-background px-4 py-3 text-sm focus:border-primary outline-none"
                  value={lead.preferred_location} onChange={(e) => setLead({ ...lead, preferred_location: e.target.value })}>
                  {DEALER_LOCATIONS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
                <textarea className="w-full border border-border bg-background px-4 py-3 text-sm focus:border-primary outline-none min-h-[80px]"
                  placeholder="Anything we should know? (optional)" value={lead.message} onChange={(e) => setLead({ ...lead, message: e.target.value })} />
                {leadErr && <p className="text-red-500 text-xs font-mono">{leadErr}</p>}
                <button onClick={submitLead} disabled={createLead.isPending}
                  className="w-full bg-primary text-white py-4 text-xs font-mono font-black uppercase tracking-[0.2em] hover:bg-foreground transition-colors disabled:opacity-60">
                  {createLead.isPending ? "Sending..." : "Request Test Drive"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}