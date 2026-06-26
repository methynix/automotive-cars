import { useState, useEffect, useMemo } from "react"
import { Link } from "react-router-dom"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { Hero } from "@/components/sections/Hero"
import { EditorialGrid } from "@/components/sections/EditorialGrid"
import { Button } from "@/components/ui/Button"
import { getReviews } from "@/lib/api"
import type { Review } from "@/lib/types"
import { CATEGORY_IMAGES, FALLBACK_IMAGE } from "@/lib/constants"
import { FiSearch, FiArrowRight, FiStar, FiZap } from "react-icons/fi"
import { Reveal } from "@/components/ui/Reveal"

export default function HomePage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [newsletterEmail, setNewsletterEmail] = useState("")
  const [newsletterDone, setNewsletterDone] = useState(false)

  useEffect(() => {
    getReviews({ limit: 20 })
      .then((res) => {
        if (res?.data) {
          setReviews(res.data)
        }
      })
      .catch((err) => {
        console.error("API Error in HomePage:", err)
      })
  }, [])

  const filteredReviews = useMemo(() => {
    if (!searchQuery) return reviews
    return reviews.filter(r => 
      r.manufacturer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [searchQuery, reviews])

  const categories = [
    { name: "SUV", image: CATEGORY_IMAGES.SUV },
    { name: "Sedan", image: CATEGORY_IMAGES.Sedan },
    { name: "Sports", image: CATEGORY_IMAGES.Sports },
    { name: "Electric", image: CATEGORY_IMAGES.Electric },
  ]

  const uniqueBrands = useMemo(() => {
    const brands = new Set(reviews.map(r => r.manufacturer).filter(Boolean))
    return brands.size
  }, [reviews])

  return (
    <div className="min-h-screen bg-background font-inter selection:bg-primary selection:text-white">
      
      {/* GLOBAL SEARCH OVERLAY / TOP BAR */}
      <section className="bg-foreground text-background py-3 px-6 md:px-12 border-b border-white/10">
        <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row items-center gap-4">
          <span className="text-[10px] font-mono font-black uppercase tracking-[0.3em] text-primary whitespace-nowrap">Global Search</span>
          <div className="relative flex-1 w-full">
            <FiSearch className="absolute left-0 top-1/2 -translate-y-1/2 text-primary" />
            <input 
              type="text" 
              placeholder="SEARCH BY BRAND, MODEL, OR KEYWORD..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-none pl-8 pr-4 py-2 text-xs font-mono font-bold uppercase tracking-widest placeholder:text-white/20 outline-none focus:ring-0"
            />
          </div>
          <div className="hidden lg:flex items-center gap-6 text-[10px] font-mono text-white/40 uppercase tracking-widest">
            <span>Quick:</span>
            <button onClick={() => setSearchQuery("BYD")} className="hover:text-primary transition-colors font-black">BYD</button>
            <button onClick={() => setSearchQuery("NIO")} className="hover:text-primary transition-colors font-black">NIO</button>
            <button onClick={() => setSearchQuery("Electric")} className="hover:text-primary transition-colors font-black">EV</button>
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="text-primary font-black ml-4">CLEAR ×</button>
            )}
          </div>
        </div>
      </section>

      <Header />
      
      <main>
        {searchQuery ? (
          <section className="py-16 px-6 md:px-12 max-w-[1280px] mx-auto">
            <Reveal animation="fade-down" duration={500}>
              <div className="mb-12 flex justify-between items-end border-b border-border pb-8">
                <div>
                  <h2 className="text-4xl md:text-6xl font-archivo font-black uppercase tracking-tighter">
                    SEARCH <span className="text-primary italic">RESULTS</span>
                  </h2>
                  <p className="text-xs font-mono font-bold text-muted-foreground mt-2 uppercase tracking-widest">
                    Found {filteredReviews.length} matching vehicles for "{searchQuery}"
                  </p>
                </div>
              </div>
            </Reveal>

            {filteredReviews.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1">
                {filteredReviews.map((r, idx) => (
                  <Reveal key={r.id} animation="fade-up" delay={idx * 50}>
                    <Link to={`/cars/${r.slug}`} className="group bg-white border border-border p-6 hover:border-primary transition-colors block h-full">
                      <div className="aspect-video overflow-hidden mb-6 relative">
                        <img src={r.featured_image || FALLBACK_IMAGE} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={r.title} />
                        <div className="absolute top-4 left-4 bg-primary text-white text-[10px] font-mono font-bold px-2 py-1 uppercase tracking-widest">
                          {r.manufacturer}
                        </div>
                      </div>
                      <h3 className="text-xl font-archivo font-black uppercase tracking-tight mb-2 group-hover:text-primary transition-colors">{r.title}</h3>
                      <p className="text-sm text-muted-foreground mb-6 line-clamp-2">{r.excerpt}</p>
                      <div className="flex items-center justify-between pt-6 border-t border-border mt-auto">
                        <span className="text-xs font-mono font-bold uppercase tracking-widest">${r.specs?.price?.toLocaleString()}</span>
                        <FiArrowRight className="group-hover:translate-x-2 transition-transform text-primary" />
                      </div>
                    </Link>
                  </Reveal>
                ))}
              </div>
            ) : (
              <Reveal animation="zoom-in">
                <div className="py-16 text-center border border-dashed border-border bg-muted/5">
                  <p className="text-sm font-mono font-bold text-muted-foreground uppercase tracking-widest mb-6">No matches found in our current database.</p>
                  <Button onClick={() => setSearchQuery("")} variant="outline" className="px-8">View Full Fleet</Button>
                </div>
              </Reveal>
            )}
          </section>
        ) : (
          <>
            <Hero reviews={reviews.slice(0, 3)} />

            {/* EXPLORE THE FLEET — redesigned */}
            <section className="py-16 md:py-20">
              <div className="px-6 md:px-12 max-w-[1280px] mx-auto">
                <Reveal animation="fade-right">
                  <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
                    <div>
                      <span className="text-[11px] font-mono font-bold text-primary uppercase tracking-[0.3em] block mb-4">Curated Collection</span>
                      <h2 className="text-5xl md:text-7xl font-archivo font-black uppercase tracking-tighter leading-none">
                        EXPLORE <br className="hidden md:block" />
                        <span className="text-primary italic">THE FLEET</span>
                      </h2>
                      <p className="text-sm font-mono text-slate-500 mt-4 uppercase tracking-[0.3em] max-w-xl">
                        {reviews.length} vehicles across {uniqueBrands} manufacturers — rigorously tested and reviewed
                      </p>
                    </div>
                    <Link to="/cars">
                      <Button className="px-8 py-5 text-[11px] font-mono font-black uppercase tracking-[0.3em] group">
                        View All Vehicles
                        <FiArrowRight className="ml-3 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </div>
                </Reveal>

                {/* Featured card — first review as hero */}
                {reviews.length > 0 && (
                  <Reveal animation="zoom-in" delay={200}>
                    <Link
                      to={`/cars/${reviews[0].slug}`}
                      className="group grid grid-cols-1 lg:grid-cols-2 border border-border bg-white mb-px hover:border-primary transition-colors block"
                    >
                      <div className="aspect-[4/3] lg:aspect-auto overflow-hidden relative">
                        <img
                          src={reviews[0].featured_image || FALLBACK_IMAGE}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          alt={reviews[0].title}
                        />
                        <div className="absolute top-5 left-5 bg-primary text-white text-[10px] font-mono font-bold px-3 py-1.5 uppercase tracking-widest">
                          Featured Review
                        </div>
                      </div>
                      <div className="p-8 md:p-12 flex flex-col justify-center">
                        <span className="text-[10px] font-mono font-bold text-primary uppercase tracking-[0.3em] mb-3">{reviews[0].manufacturer}</span>
                        <h3 className="text-3xl md:text-4xl font-archivo font-black uppercase tracking-tight leading-tight mb-4 group-hover:text-primary transition-colors">
                          {reviews[0].model} <span className="text-muted-foreground">{reviews[0].year}</span>
                        </h3>
                        <p className="text-sm text-slate-700 mb-8 line-clamp-3 leading-relaxed">{reviews[0].excerpt}</p>
                        <div className="grid grid-cols-3 gap-6 border-t border-border pt-6">
                          <div>
                            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block mb-1">Horsepower</span>
                            <span className="text-lg font-archivo font-bold text-foreground">{reviews[0].specs?.horsepower ?? "—"}</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block mb-1">0-60 mph</span>
                            <span className="text-lg font-archivo font-bold text-foreground">{reviews[0].specs?.acceleration ?? "—"}s</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block mb-1">Rating</span>
                            <span className="text-lg font-archivo font-bold text-primary">{reviews[0].rating ?? "—"}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </Reveal>
                )}

                {/* Grid cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border mt-px">
                  {reviews.slice(1).map((r, idx) => (
                    <Reveal key={r.id} animation="fade-up" delay={100 + idx * 50}>
                      <Link
                        to={`/cars/${r.slug}`}
                        className="group bg-white p-6 md:p-8 hover:bg-slate-50 transition-all duration-300 flex flex-col h-full"
                      >
                        <div className="aspect-[4/3] overflow-hidden mb-6 relative">
                          <img
                            src={r.featured_image || FALLBACK_IMAGE}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            alt={r.title}
                          />
                          <div className="absolute top-3 left-3 bg-foreground/80 text-white text-[9px] font-mono font-bold px-2 py-1 uppercase tracking-widest">
                            {r.manufacturer}
                          </div>
                        </div>
                        <span className="text-[11px] font-mono font-bold text-primary uppercase tracking-widest mb-1.5">{r.manufacturer}</span>
                        <h3 className="text-xl font-archivo font-black uppercase tracking-tight mb-3 group-hover:text-primary transition-colors leading-tight">
                          {r.model}
                        </h3>
                        <p className="text-[13px] text-slate-600 leading-relaxed mb-5 line-clamp-2 flex-1">{r.excerpt}</p>
                        <div className="flex items-center justify-between text-[11px] font-mono text-slate-700 font-bold border-t border-slate-200 pt-4 mt-auto">
                          <span className="flex items-center gap-1">
                            <FiZap size={12} className="text-primary" /> {r.specs?.horsepower ?? "—"} HP
                          </span>
                          <span className="flex items-center gap-1">
                            <FiStar size={12} className={r.rating && r.rating >= 8 ? "text-primary" : "text-muted-foreground"} /> {r.rating ?? "—"}
                          </span>
                        </div>
                      </Link>
                    </Reveal>
                  ))}
                </div>
              </div>
            </section>

            {/* CATEGORIES — polished */}
            <section className="py-16 md:py-20">
              <div className="px-6 md:px-12 max-w-[1280px] mx-auto">
                <Reveal animation="fade-left">
                  <div className="mb-10 text-center md:text-left">
                    <span className="text-[11px] font-mono font-bold text-primary uppercase tracking-[0.3em] block mb-4">Browse by</span>
                    <h2 className="text-5xl md:text-7xl font-archivo font-black uppercase tracking-tighter">
                      Vehicle <span className="text-primary italic">Segment</span>
                    </h2>
                  </div>
                </Reveal>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {categories.map((cat, idx) => (
                    <Reveal key={cat.name} animation="zoom-in" delay={idx * 100}>
                      <Link
                        to="/cars"
                        className="group relative h-96 overflow-hidden border border-border bg-foreground block"
                      >
                        <img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" src={cat.image} alt={cat.name} />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-8">
                          <span className="text-[10px] font-mono font-black uppercase tracking-[0.3em] text-primary block mb-2">{cat.name}</span>
                          <span className="block text-3xl font-archivo font-black uppercase text-white mb-3">Explore Range</span>
                          <span className="inline-flex items-center gap-2 text-[10px] font-mono font-bold text-white/60 uppercase tracking-widest group-hover:text-primary transition-colors">
                            View Vehicles <FiArrowRight size={12} />
                          </span>
                        </div>
                      </Link>
                    </Reveal>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}

        <EditorialGrid reviews={reviews} />

        {/* NEWSLETTER — redesigned */}
        <section className="py-20 bg-foreground relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
          <div className="px-6 md:px-12 max-w-[1280px] mx-auto relative">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-16 items-center">
              <div className="lg:col-span-3">
                <Reveal animation="fade-right">
                  <span className="text-[10px] font-mono font-bold text-primary uppercase tracking-[0.3em] block mb-4">Newsletter</span>
                  <h2 className="text-5xl md:text-7xl font-archivo font-black uppercase tracking-tighter leading-none text-white">
                    Stay in <span className="text-primary italic">the Know</span>
                  </h2>
                  <div className="mt-8 space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-1 h-8 bg-primary mt-1 shrink-0" />
                      <p className="text-sm font-mono text-white/60 uppercase tracking-wider leading-relaxed">
                        Weekly deep-dive technical reports delivered to your inbox every Monday
                      </p>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-1 h-8 bg-primary mt-1 shrink-0" />
                      <p className="text-sm font-mono text-white/60 uppercase tracking-wider leading-relaxed">
                        First access to new reviews, industry analysis, and exclusive editorial content
                      </p>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-1 h-8 bg-primary mt-1 shrink-0" />
                      <p className="text-sm font-mono text-white/60 uppercase tracking-wider leading-relaxed">
                        No spam — unsubscribe at any time with one click
                      </p>
                    </div>
                  </div>
                </Reveal>
              </div>
              <div className="lg:col-span-2">
                <Reveal animation="fade-left" delay={200}>
                  <form
                    className="border border-white/20 bg-white/5 p-8 md:p-10"
                    onSubmit={(e) => { e.preventDefault(); if (newsletterEmail.trim()) setNewsletterDone(true) }}
                  >
                    <p className="text-[10px] font-mono font-bold text-primary uppercase tracking-[0.3em] mb-6">Subscribe to Core</p>
                    {newsletterDone ? (
                      <p className="text-green-400 text-sm font-mono text-center py-8">✓ Subscribed! Check your inbox.</p>
                    ) : (
                      <div className="space-y-4">
                        <input
                          className="w-full px-5 py-4 bg-transparent border border-white/20 text-sm font-mono outline-none uppercase tracking-widest text-white placeholder:text-white/20 focus:border-primary transition-colors"
                          placeholder="Your email address"
                          type="email"
                          value={newsletterEmail}
                          onChange={(e) => setNewsletterEmail(e.target.value)}
                          required
                        />
                        <button type="submit" className="w-full py-4 bg-primary text-white text-xs font-mono font-black uppercase tracking-[0.3em] hover:bg-white hover:text-foreground transition-all">
                          Subscribe
                        </button>
                        <a
                          href="https://wa.me/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-center w-full py-4 bg-primary text-white text-xs font-mono font-black uppercase tracking-[0.3em] hover:bg-white hover:text-foreground transition-all"
                        >
                          Join our WhatsApp channel
                        </a>
                      </div>
                    )}
                    <p className="text-[9px] font-mono text-white/20 uppercase tracking-wider mt-4 text-center">
                      Join 2,400+ automotive professionals
                    </p>
                  </form>
                </Reveal>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
