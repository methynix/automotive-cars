import { useState } from "react"
import { Link, useParams } from "react-router-dom"
import {
  FiArrowLeft, FiShare2, FiCheck, FiX, FiSettings,
  FiChevronRight, FiChevronLeft, FiCalendar, FiHeart,
} from "react-icons/fi"
import { LuSettings2 } from "react-icons/lu"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { Reveal } from "@/components/ui/Reveal"
import { Comments } from "@/components/sections/Comments"
import { Price } from "@/components/ui/Price"
import { useReview, useReviews } from "@/hooks/useApi"
import { useSavedCars } from "@/hooks/useSavedCars"
import { useToast } from "@/lib/toast"
import { bookTestDrive } from "@/lib/api"
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
  const toast = useToast()
  const { isSaved, toggle, isBusy } = useSavedCars()

  const [lightbox, setLightbox] = useState<string | null>(null)
  const [color, setColor] = useState(PAINT[0])
  const [interior, setInterior] = useState(INTERIOR[0])
  const [shareMsg, setShareMsg] = useState(false)
  const [activeHeroImg, setActiveHeroImg] = useState(0)

  // Test-drive booking form
  const [showLead, setShowLead] = useState(false)
  const [leadDone, setLeadDone] = useState(false)
  const [booking, setBooking] = useState(false)
  const [lead, setLead] = useState({ full_name: "", email: "", phone: "", preferred_date: "", preferred_time: "", preferred_location: DEALER_LOCATIONS[0], message: "" })
  const [leadErr, setLeadErr] = useState<string | null>(null)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col font-inter selection:bg-primary selection:text-white">
        <Header />
        <main className="flex-1">
          {/* Hero skeleton */}
          <div className="w-full h-[480px] bg-muted/20 animate-pulse relative overflow-hidden">
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 max-w-[1280px] mx-auto z-40">
              <div className="flex items-end justify-between flex-wrap gap-4">
                <div>
                  <div className="h-3 w-32 bg-muted/40 mb-3 rounded-sm" />
                  <div className="h-10 w-64 md:w-96 bg-muted/40 rounded-sm" />
                </div>
                <div className="h-10 w-28 bg-muted/40 rounded-sm" />
              </div>
            </div>
          </div>

          <div className="px-6 md:px-12 max-w-[1280px] mx-auto py-6 md:py-12 grid lg:grid-cols-3 gap-12">
            {/* Main column skeleton */}
            <div className="lg:col-span-2 space-y-10 md:space-y-12">
              <div className="space-y-3 md:space-y-6">
                <div className="h-4 w-32 bg-muted/20 animate-pulse rounded-sm" />
                <div className="flex flex-wrap items-center justify-between gap-4 md:gap-6 border-b border-border pb-6 md:pb-8 animate-pulse">
                  <div className="flex items-center gap-8 md:gap-20">
                    <div className="h-14 w-24 bg-muted/30 rounded-sm" />
                    <div className="h-10 w-32 bg-muted/30 rounded-sm" />
                  </div>
                  <div className="h-14 w-48 bg-muted/30 rounded-sm" />
                </div>
              </div>

              <div className="space-y-4 animate-pulse">
                <div className="h-4 w-full bg-muted/20 rounded-sm" />
                <div className="h-4 w-full bg-muted/20 rounded-sm" />
                <div className="h-4 w-[90%] bg-muted/20 rounded-sm" />
                <div className="h-4 w-[85%] bg-muted/20 rounded-sm" />
                <div className="h-4 w-[60%] bg-muted/20 rounded-sm" />
              </div>

              <div className="grid md:grid-cols-2 gap-6 animate-pulse">
                <div className="h-48 border border-border bg-muted/10 p-6" />
                <div className="h-48 border border-border bg-muted/10 p-6" />
              </div>
            </div>

            {/* Sidebar skeleton */}
            <aside className="space-y-8 animate-pulse">
              <div className="border border-border p-6 h-[400px] bg-muted/10" />
              <div className="border border-border p-6 h-[200px] bg-muted/10" />
              <div className="h-14 w-full bg-muted/20 rounded-sm" />
            </aside>
          </div>
        </main>
        <Footer />
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
  const descriptionHtml = typeof content.body === "string" ? content.body : ""
  const pros = (content.pros as string[]) || []
  const cons = (content.cons as string[]) || []
  const gallery = review.gallery || []
  const related = (relatedData?.data ?? []).filter((r) => r.slug !== review.slug).slice(0, 3)

  let heroImages = [
    { url: review.featured_image || FALLBACK_IMAGE_LG, alt: review.title },
    ...gallery.map(g => ({ url: g.image_url, alt: g.alt_text || review.title }))
  ].filter((v, i, a) => a.findIndex(t => t.url === v.url) === i);

  if (heroImages.length === 1) heroImages = [heroImages[0], heroImages[0], heroImages[0]];
  else if (heroImages.length === 2) heroImages = [heroImages[0], heroImages[1], heroImages[0]];

  const nextHero = () => setActiveHeroImg(p => (p + 1) % heroImages.length)
  const prevHero = () => setActiveHeroImg(p => (p - 1 + heroImages.length) % heroImages.length)

  const getSlideClass = (i: number) => {
    let offset = ((i - activeHeroImg) % heroImages.length + heroImages.length) % heroImages.length;
    if (offset > heroImages.length / 2) offset -= heroImages.length;

    let base = "absolute top-0 h-full transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] cursor-pointer ";
    
    if (offset === 0) {
      base += "z-20 opacity-100 left-[15%] w-[70%] md:left-[20%] md:w-[60%] ";
    } else if (offset === -1) {
      base += "z-10 opacity-100 left-0 w-[15%] md:left-0 md:w-[20%] ";
    } else if (offset === 1) {
      base += "z-10 opacity-100 left-[85%] w-[15%] md:left-[80%] md:w-[20%] ";
    } else {
      base += "z-0 opacity-0 pointer-events-none ";
      if (offset < -1) base += "-left-[15%] md:-left-[20%] w-[15%] md:w-[20%] ";
      if (offset > 1) base += "left-[100%] md:left-[100%] w-[15%] md:w-[20%] ";
    }
    return base;
  }

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${review.manufacturer} ${review.model} - Future Automotive`,
          url: window.location.href,
        })
      } catch { /* ignore cancelled share */ }
    } else {
      try { await navigator.clipboard.writeText(window.location.href); setShareMsg(true); setTimeout(() => setShareMsg(false), 2000) } catch { /* ignore */ }
    }
  }

  const submitLead = async () => {
    setLeadErr(null)
    if (lead.full_name.trim().length < 2) return setLeadErr("Please enter your name.")
    if (!/^\S+@\S+\.\S+$/.test(lead.email)) return setLeadErr("Please enter a valid email.")
    if (lead.phone.trim().length < 6) return setLeadErr("Please enter a valid phone number.")
    if (!lead.preferred_date) return setLeadErr("Please choose a preferred date.")
    setBooking(true)
    try {
      await bookTestDrive({
        review_id: review.id,
        full_name: lead.full_name.trim(),
        email: lead.email.trim(),
        phone: lead.phone.trim(),
        preferred_date: lead.preferred_date,
        preferred_time: lead.preferred_time || undefined,
        preferred_location: lead.preferred_location,
        message: lead.message || undefined,
      })
      setLeadDone(true)
    } catch (e: any) {
      setLeadErr(e?.message || "Could not submit your request.")
    } finally {
      setBooking(false)
    }
  }

  const handleSaveToggle = async () => {
    const wasSaved = isSaved(review.id)
    const ok = await toggle(review.id)
    if (!ok) toast.error("Please sign in to save vehicles to your garage.")
    else toast.success(wasSaved ? "Removed from your garage." : "Saved to your garage.")
  }

  return (
    <div className="min-h-screen bg-background font-inter selection:bg-primary selection:text-white">
      <Header />
      <main>
        {/* Hero image carousel */}
        <div className="relative h-[480px] overflow-hidden bg-black group">
          <div className="w-full h-full relative">
            {heroImages.map((img, i) => {
              let offset = ((i - activeHeroImg) % heroImages.length + heroImages.length) % heroImages.length;
              if (offset > heroImages.length / 2) offset -= heroImages.length;
              const isCenter = offset === 0;
              
              return (
                <div key={i} className={getSlideClass(i)} onClick={() => {
                  if (offset === 1) nextHero();
                  if (offset === -1) prevHero();
                }}>
                  <img src={img.url} alt={img.alt} className={`w-full h-full object-cover transition-all duration-700 ${isCenter ? 'brightness-100' : 'brightness-50 hover:brightness-75'}`} onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE_LG }} />
                  {!isCenter && <div className="absolute inset-0 bg-black/20 pointer-events-none" />}
                </div>
              );
            })}
          </div>

          {/* Configurator paint tint */}
          <div className="absolute inset-0 mix-blend-multiply pointer-events-none transition-colors duration-500 z-30"
            style={{ backgroundColor: color.hex, opacity: color.name === "Arctic White" ? 0.05 : 0.28 }} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 z-30 pointer-events-none" />

          {/* Controls */}
          <button onClick={prevHero} className="absolute left-4 top-1/2 -translate-y-1/2 z-40 bg-black/50 hover:bg-primary text-white p-3 rounded-full backdrop-blur-md transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100">
            <FiChevronLeft size={24} />
          </button>
          <button onClick={nextHero} className="absolute right-4 top-1/2 -translate-y-1/2 z-40 bg-black/50 hover:bg-primary text-white p-3 rounded-full backdrop-blur-md transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100">
            <FiChevronRight size={24} />
          </button>

          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 max-w-[1280px] mx-auto z-40 pointer-events-none">
            <div className="flex items-end justify-between flex-wrap gap-4">
              <div className="pointer-events-auto">
                <span className="text-[11px] font-mono font-bold text-primary uppercase tracking-[0.3em]">{review.manufacturer}{review.body_style ? ` · ${review.body_style}` : ""}</span>
                <h1 className="text-3xl md:text-4xl font-archivo font-bold uppercase tracking-normal text-white mt-2">
                  {review.model} <span className="text-white/60">{review.year}</span>
                </h1>
              </div>
              <div className="flex items-center gap-2 pointer-events-auto">
                <button onClick={handleSaveToggle} disabled={isBusy(review.id)}
                  aria-label={isSaved(review.id) ? "Remove from garage" : "Save to garage"}
                  className={`inline-flex items-center gap-2 border px-4 py-2 text-xs font-mono uppercase tracking-widest transition-colors disabled:opacity-60 ${
                    isSaved(review.id) ? "bg-primary border-primary text-white" : "border-white/40 text-white hover:bg-white hover:text-black"
                  }`}>
                  <FiHeart size={14} className={isSaved(review.id) ? "fill-current" : ""} /> {isSaved(review.id) ? "Saved" : "Save"}
                </button>
                <button onClick={share} className="relative inline-flex items-center gap-2 border border-white/40 text-white px-4 py-2 text-xs font-mono uppercase tracking-widest hover:bg-white hover:text-black transition-colors">
                  <FiShare2 size={14} /> Share
                  {shareMsg && <span className="absolute -top-9 right-0 bg-white text-black px-3 py-1 text-[10px] whitespace-nowrap">Link copied</span>}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 md:px-12 max-w-[1280px] mx-auto py-6 md:py-12 grid lg:grid-cols-3 gap-12">
          {/* Main column */}
          <div className="lg:col-span-2 space-y-10 md:space-y-12">
            
            <div className="space-y-3 md:space-y-6">
              <Link to="/cars" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary text-xs font-mono uppercase tracking-widest transition-colors">
                <FiArrowLeft size={14} /> Back to garage
              </Link>

              {/* Score + price + CTA */}
              <div className="flex flex-wrap items-center justify-between gap-4 md:gap-6 border-b border-border pb-6 md:pb-8">
                <div className="flex items-center gap-8 md:gap-20">
                  {review.rating != null && (
                    <div>
                      <div className="text-5xl font-archivo font-extrabold">{review.rating.toFixed(1)}<span className="text-xl text-muted-foreground">/10</span></div>
                      <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-muted-foreground">Editor Score</div>
                    </div>
                  )}
                  <div>
                    <Price usd={review.specs?.price} size="lg" />
                  </div>
                </div>
                <button onClick={() => { setShowLead(true); setLeadDone(false) }}
                  className="inline-flex items-center gap-2 bg-primary text-white px-6 py-4 text-xs font-mono font-black uppercase tracking-[0.2em] hover:bg-foreground transition-colors">
                  <FiCalendar size={14} /> Book a Test Drive
                </button>
              </div>
            </div>

            {/* Body */}
            {descriptionHtml && (
              <Reveal animation="fade-up">
                <div
                  className="text-lg leading-relaxed text-muted-foreground prose prose-invert max-w-none [&_p]:mb-4 [&_strong]:font-semibold [&_em]:italic [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-6 [&_ol]:pl-6"
                  dangerouslySetInnerHTML={{ __html: descriptionHtml }}
                />
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
              <div className="flex items-center gap-2 mb-5"><LuSettings2 className="text-primary" size={16} /><h3 className="text-xs font-mono uppercase tracking-[0.3em]">Specifications</h3></div>
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
              className="w-full inline-flex justify-center items-center gap-2 bg-primary text-white py-4 text-xs font-mono font-black uppercase tracking-[0.2em] hover:bg-foreground transition-colors">
              <FiCalendar size={14} /> Enquire about this {review.model}
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
          <Comments reviewId={review.id} featuredImage={review.featured_image || undefined} />
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
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6 backdrop-blur-sm" onClick={() => setShowLead(false)}>
          <div className="relative overflow-hidden bg-zinc-900 border border-white/10 w-full max-w-lg p-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            
            {/* Background Image Reveal with Special Effect */}
            <div className="absolute top-0 left-0 w-full h-[65%] lg:h-full lg:w-[65%] z-0 pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-zinc-900/80 to-zinc-900 z-10" />
              <div className="absolute inset-0 bg-gradient-to-b from-zinc-900 via-transparent to-zinc-900 z-10" />
              <img 
                src={review.featured_image || "/detail-one.jpg"}
                alt="Modal Background" 
                className="w-full h-full object-cover opacity-40 grayscale mix-blend-lighten" 
              />
            </div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-archivo font-extrabold uppercase tracking-tight text-white">Book a Test Drive</h3>
                <button className="text-white/60 hover:text-white transition-colors" onClick={() => setShowLead(false)}><FiX size={20} /></button>
              </div>

              {leadDone ? (
                <div className="text-center py-8">
                  <div className="w-14 h-14 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center mx-auto mb-4"><FiCheck size={24} /></div>
                  <p className="font-archivo font-bold uppercase text-white mb-1">Request received</p>
                  <p className="text-sm text-white/60">A specialist will contact you to arrange your drive of the {review.manufacturer} {review.model}.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-xs font-mono font-bold text-primary uppercase">{review.manufacturer} {review.model} · {review.year}</p>
                  <input className="w-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-white focus:border-primary outline-none"
                    placeholder="Full name *" value={lead.full_name} onChange={(e) => setLead({ ...lead, full_name: e.target.value })} />
                  <div className="grid grid-cols-2 gap-3">
                    <input className="w-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-white focus:border-primary outline-none"
                      placeholder="Phone *" value={lead.phone} onChange={(e) => setLead({ ...lead, phone: e.target.value })} />
                    <input className="w-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-white focus:border-primary outline-none"
                      placeholder="Email *" value={lead.email} onChange={(e) => setLead({ ...lead, email: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="block">
                      <span className="block text-[10px] font-mono uppercase tracking-widest text-white/50 mb-1">Preferred date *</span>
                      <input type="date" min={new Date().toISOString().split("T")[0]}
                        className="w-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-white focus:border-primary outline-none [color-scheme:dark]"
                        value={lead.preferred_date} onChange={(e) => setLead({ ...lead, preferred_date: e.target.value })} />
                    </label>
                    <label className="block">
                      <span className="block text-[10px] font-mono uppercase tracking-widest text-white/50 mb-1">Preferred time</span>
                      <input type="time"
                        className="w-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-white focus:border-primary outline-none [color-scheme:dark]"
                        value={lead.preferred_time} onChange={(e) => setLead({ ...lead, preferred_time: e.target.value })} />
                    </label>
                  </div>
                  <select className="w-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-white focus:border-primary outline-none"
                    value={lead.preferred_location} onChange={(e) => setLead({ ...lead, preferred_location: e.target.value })}>
                    {DEALER_LOCATIONS.map((d) => <option key={d} value={d} className="bg-zinc-900 text-white">{d}</option>)}
                  </select>
                  <textarea className="w-full border border-white/10 bg-black/40 px-4 py-3 text-sm font-semibold text-white focus:border-primary outline-none h-[100px] resize-none"
                    placeholder="Anything we should know? (optional)" value={lead.message} onChange={(e) => setLead({ ...lead, message: e.target.value })} />
                  {leadErr && <p className="text-red-500 text-xs font-mono">{leadErr}</p>}
                  <button onClick={submitLead} disabled={booking}
                    className="w-full bg-primary text-white py-4 text-xs font-mono font-black uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-colors disabled:opacity-60">
                    {booking ? "Sending..." : "Request Test Drive"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
