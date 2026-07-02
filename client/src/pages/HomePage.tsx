import { useState, useEffect, useMemo, useRef } from "react"
import { Link } from "react-router-dom"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { usePriceFormatter } from "@/lib/currency"
import { Hero } from "@/components/sections/Hero"
import { BrandMarquee } from "@/components/sections/BrandMarquee"
import { FeatureCards } from "@/components/sections/FeatureCards"
import { EditorialGrid } from "@/components/sections/EditorialGrid"
import { Button } from "@/components/ui/Button"
import { getFeaturedReviews, createLead } from "@/lib/api"
import type { Review } from "@/lib/types"
import { CATEGORY_IMAGES, FALLBACK_IMAGE } from "@/lib/constants"
import { FiArrowRight, FiStar, FiZap } from "react-icons/fi"
import { IoStar } from "react-icons/io5"
import { Reveal } from "@/components/ui/Reveal"
import { motion, useScroll, useTransform } from "framer-motion"

function MobileSegmentReel({ categories }: { categories: any[] }) {
  const targetRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: targetRef })
  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-75%"])

  return (
    <div ref={targetRef} className="relative h-[400vh] md:hidden bg-background">
      <div className="sticky top-[64px] flex flex-col h-[calc(100svh-64px)] overflow-hidden">
        
        <div className="px-6 py-6 shrink-0">
          <span className="text-[11px] font-mono font-bold text-primary uppercase tracking-[0.3em] block mb-3">Browse by</span>
          <h2 className="text-2xl font-archivo font-extrabold uppercase tracking-tighter leading-none">
            VEHICLE <span className="text-primary tracking-normal">SEGMENT</span>
          </h2>
          <p className="text-sm font-mono text-slate-500 mt-3 uppercase tracking-normal">
            Discover the perfect fit — browse our extensive catalog by body style and technology
          </p>
        </div>

        <div className="relative flex-1 overflow-hidden w-full">
          <motion.div style={{ x }} className="absolute top-0 left-0 h-full w-[400vw] flex pb-6">
            {categories.map((cat, idx) => {
              const heading = cat.name === 'SUV' ? 'Family & Off-Road' :
                              cat.name === 'Sedan' ? 'Executive Touring' :
                              cat.name === 'Sports' ? 'Pure Performance' :
                              cat.name === 'Electric' ? 'Future Efficiency' : 'Explore Range';
              
              // Dynamic padding to perfectly align outer edges with the px-6 heading, but keep gaps small (16px)
              const paddingClass = idx === 0 ? "pl-6 pr-2" : idx === categories.length - 1 ? "pl-2 pr-6" : "px-2";

              return (
                <div key={cat.name} className={`w-[100vw] h-full flex-shrink-0 ${paddingClass}`}>
                  <Link
                    to="/cars"
                    className="group relative h-full w-full overflow-hidden border border-border bg-foreground block rounded-none"
                  >
                    <img className="w-full h-full object-cover" src={cat.image} alt={cat.name} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-5 pb-6">
                      <span className="text-[10px] font-mono font-black uppercase tracking-widest text-white bg-primary px-2.5 py-1 inline-block mb-3">{cat.name}</span>
                      <span className="block text-3xl font-archivo font-black uppercase text-white mb-2 leading-tight">{heading}</span>
                      <span className="inline-flex items-center gap-2 text-[10px] font-mono font-bold text-white/70 uppercase tracking-widest mt-2">
                        View Vehicles <FiArrowRight size={12} />
                      </span>
                    </div>
                  </Link>
                </div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default function HomePage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [newsletterName, setNewsletterName] = useState("")
  const [newsletterEmail, setNewsletterEmail] = useState("")
  const [newsletterPhoneCode, setNewsletterPhoneCode] = useState("+255")
  const [newsletterPhone, setNewsletterPhone] = useState("")
  const [newsletterError, setNewsletterError] = useState("")
  const [newsletterDone, setNewsletterDone] = useState(false)
  const [isSubscribing, setIsSubscribing] = useState(false)
  const fmtPrice = usePriceFormatter()
  const carousel = useRef<HTMLDivElement>(null)
  const [carouselWidth, setCarouselWidth] = useState(0)

  useEffect(() => {
    if (carousel.current) {
      setCarouselWidth(carousel.current.scrollWidth - carousel.current.offsetWidth)
    }
    const handleResize = () => {
      if (carousel.current) {
        setCarouselWidth(carousel.current.scrollWidth - carousel.current.offsetWidth)
      }
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    getFeaturedReviews(1, 10)
      .then((res) => {
        if (res?.data) {
          setReviews(res.data)
        }
      })
      .catch((err) => {
        console.error("API Error in HomePage:", err)
      })
      .finally(() => setIsLoading(false))
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

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setNewsletterError("")
    
    if (!newsletterName.trim()) {
      setNewsletterError("Username is required")
      return
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(newsletterEmail)) {
      setNewsletterError("Please enter a valid email address")
      return
    }

    setIsSubscribing(true)
    try {
      const phoneStr = newsletterPhone.trim() ? `${newsletterPhoneCode}${newsletterPhone.trim()}` : ""
      await createLead({
        full_name: newsletterName.trim(),
        email: newsletterEmail.trim(),
        phone: phoneStr,
        message: "Newsletter Subscription"
      })
      setNewsletterDone(true)
    } catch (err: any) {
      setNewsletterError(err.message || "Failed to subscribe. Please try again.")
    } finally {
      setIsSubscribing(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col font-archivo selection:bg-primary/30 selection:text-white">
      
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
                    <Link to={`/cars/${r.slug}`} className="group bg-card border border-border p-6 hover:border-primary transition-colors block h-full">
                      <div className="aspect-video overflow-hidden mb-6 relative">
                        <img src={r.featured_image || FALLBACK_IMAGE} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={r.title} />
                        <div className="absolute top-4 left-4 bg-primary text-white text-[10px] font-mono font-bold px-2 py-1 uppercase tracking-widest">
                          {r.manufacturer}
                        </div>
                      </div>
                      <h3 className="text-xl font-archivo font-black uppercase tracking-tight mb-2 group-hover:text-primary transition-colors">{r.title}</h3>
                      <p className="text-sm text-muted-foreground mb-6 line-clamp-2">{r.excerpt}</p>
                      <div className="flex items-center justify-between pt-6 border-t border-border mt-auto">
                        <span className="text-xs font-mono font-bold uppercase tracking-widest">{fmtPrice(r.specs?.price)}</span>
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
            
            <BrandMarquee />

            <div className="px-6 py-10 md:hidden bg-background">
              <FeatureCards className="flex" />
            </div>

            {/* EXPLORE THE FLEET — redesigned */}
            <section className="py-16 md:py-20 border-b border-border">
              <div className="px-6 md:px-12 max-w-[1280px] mx-auto">
                <Reveal animation="fade-right">
                  <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
                    <div>
                      <span className="text-[11px] font-mono font-bold text-primary uppercase tracking-[0.3em] block mb-4">Curated Collection</span>
                      <h2 className="text-2xl md:text-4xl font-archivo font-extrabold uppercase tracking-tighter leading-none">
                        EXPLORE <span className="text-primary tracking-normal">THE FLEET</span>
                      </h2>
                      <p className="text-sm font-mono text-slate-500 mt-4 uppercase tracking-normal max-w-xl">
                        Vehicles across multiple manufacturers — rigorously tested and reviewed
                      </p>
                    </div>
                    <Link to="/cars">
                      <Button className="px-[30px] py-5 text-[11px] font-mono font-black uppercase tracking-normal group flex items-center">
                        View All Vehicles
                      </Button>
                    </Link>
                  </div>
                </Reveal>

                {/* Featured card — first review as hero */}
                {reviews.length > 0 && (
                  <Reveal animation="zoom-in" delay={200}>
                    <Link
                      to={`/cars/${reviews[0].slug}`}
                      className="group grid grid-cols-1 lg:grid-cols-2 bg-background border border-border rounded-lg shadow-md hover:bg-muted/40 transition-all duration-300 block overflow-hidden"
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-x-[22px] mt-6">
                  {Array.from({ length: Math.max(8, Math.min(9, reviews.length - 1)) }).map((_, idx) => {
                    const r = reviews[idx + 1];
                    if (!r) {
                      return (
                        <div key={`skeleton-${idx}`} className="bg-muted/50 border border-border rounded-lg shadow-sm h-full min-h-[380px] animate-pulse flex flex-col">
                          <div className="aspect-[4/3] bg-muted w-full" />
                          <div className="p-4 md:p-6 flex flex-col flex-1 gap-4">
                            <div className="h-3 w-1/3 bg-muted-foreground/20 rounded" />
                            <div className="h-6 w-2/3 bg-muted-foreground/20 rounded" />
                            <div className="flex-1" />
                            <div className="h-4 w-full bg-muted-foreground/20 rounded" />
                          </div>
                        </div>
                      );
                    }
                    return (
                      <Reveal key={r.id} animation="fade-up" delay={100 + idx * 50}>
                        <Link
                          to={`/cars/${r.slug}`}
                          className="group bg-background border border-border rounded-lg shadow-md hover:bg-muted/40 transition-all duration-300 flex flex-col h-full overflow-hidden"
                        >
                          <div className="aspect-[4/3] overflow-hidden relative">
                            <img
                              src={r.featured_image || FALLBACK_IMAGE}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                              alt={r.title}
                            />
                          </div>
                          <div className="flex flex-col flex-1 p-4 md:p-6">
                            <span className="text-[11px] font-mono font-bold text-primary uppercase tracking-widest mb-1.5">{r.manufacturer}</span>
                            <h3 className="text-xl font-archivo font-black uppercase tracking-tight mb-3 group-hover:text-primary transition-colors leading-tight">
                              {r.model}
                            </h3>
                            <p className="text-[13px] text-slate-600 leading-relaxed mb-5 line-clamp-2 flex-1">{r.excerpt}</p>
                            <div className="flex items-center justify-between text-[11px] font-mono text-slate-700 font-bold border-t border-slate-200 pt-4 mt-auto">
                              <span className="flex items-center gap-1">
                                {r.specs?.horsepower ?? "—"} HP
                              </span>
                              <span className="flex items-center gap-1">
                                Rating <IoStar size={12} className="text-[#FFDF00]" /> {r.rating ?? "—"}
                              </span>
                            </div>
                          </div>
                        </Link>
                      </Reveal>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* CATEGORIES — Desktop */}
            <section className="hidden md:block py-20">
              <div className="px-12 max-w-[1280px] mx-auto">
                <Reveal animation="fade-right">
                  <div className="flex items-end justify-between mb-10 gap-6">
                    <div>
                      <span className="text-[11px] font-mono font-bold text-primary uppercase tracking-[0.3em] block mb-4">Browse by</span>
                      <h2 className="text-4xl font-archivo font-extrabold uppercase tracking-tighter leading-none">
                        VEHICLE <span className="text-primary tracking-normal">SEGMENT</span>
                      </h2>
                      <p className="text-sm font-mono text-slate-500 mt-4 uppercase tracking-normal max-w-xl">
                        Discover the perfect fit — browse our extensive catalog by body style and technology
                      </p>
                    </div>
                  </div>
                </Reveal>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                  {categories.map((cat, idx) => {
                    const heading = cat.name === 'SUV' ? 'Family & Off-Road' :
                                    cat.name === 'Sedan' ? 'Executive Touring' :
                                    cat.name === 'Sports' ? 'Pure Performance' :
                                    cat.name === 'Electric' ? 'Future Efficiency' : 'Explore Range';
                    return (
                      <Reveal key={cat.name} animation="zoom-in" delay={idx * 100}>
                        <Link
                          to="/cars"
                          className="group relative h-96 overflow-hidden border border-border bg-foreground block rounded-lg"
                        >
                          <img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" src={cat.image} alt={cat.name} />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                          <div className="absolute bottom-0 left-0 right-0 p-4 pb-6">
                            <span className="text-[10px] font-mono font-black uppercase tracking-widest text-white bg-primary px-2.5 py-1 inline-block mb-3 rounded-sm">{cat.name}</span>
                            <span className="block text-2xl font-archivo font-black uppercase text-white mb-2 leading-tight">{heading}</span>
                            <span className="inline-flex items-center gap-2 text-[10px] font-mono font-bold text-white/70 uppercase tracking-widest group-hover:text-primary transition-colors mt-2">
                              View Vehicles <FiArrowRight size={12} />
                            </span>
                          </div>
                        </Link>
                      </Reveal>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* CATEGORIES — Mobile Sticky Reel */}
            <MobileSegmentReel categories={categories} />
          </>
        )}

        <EditorialGrid reviews={reviews} isLoading={isLoading} />

        {/* NEWSLETTER — redesigned */}
        <section id="newsletter" className="py-20 bg-zinc-950 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
          <div className="px-6 md:px-12 max-w-[1280px] mx-auto relative">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-16 items-center">
              <div className="lg:col-span-3">
                <Reveal animation="fade-right">
                  <span className="text-[11px] font-mono font-bold text-primary uppercase tracking-[0.3em] block mb-4">Newsletter</span>
                  <h2 className="text-2xl md:text-4xl font-archivo font-extrabold uppercase tracking-tighter leading-none text-white">
                    Stay in <span className="text-primary tracking-normal">the Know</span>
                  </h2>
                  <div className="mt-8 space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-1 h-8 bg-primary mt-1 shrink-0" />
                      <p className="text-sm font-mono text-white/60 tracking-wider leading-relaxed">
                        Weekly deep-dive technical reports delivered to your inbox every Monday
                      </p>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-1 h-8 bg-primary mt-1 shrink-0" />
                      <p className="text-sm font-mono text-white/60 tracking-wider leading-relaxed">
                        Exclusive access to new reviews and industry analysis
                      </p>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-1 h-8 bg-primary mt-1 shrink-0" />
                      <p className="text-sm font-mono text-white/60 tracking-wider leading-relaxed">
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
                    onSubmit={handleNewsletterSubmit}
                  >
                    <p className="text-[10px] font-mono font-bold text-primary uppercase tracking-[0.3em] mb-6">Subscribe to Core</p>
                    {newsletterDone ? (
                      <p className="text-green-400 text-sm font-mono text-center py-8">✓ Subscribed successfully!</p>
                    ) : (
                      <div className="space-y-4">
                        {newsletterError && (
                          <p className="text-red-400 text-[11px] font-mono mb-2">{newsletterError}</p>
                        )}
                        <input
                          className="w-full px-5 py-3 bg-transparent border border-white/20 text-sm font-mono outline-none tracking-widest text-white placeholder:text-white/40 focus:border-primary transition-colors"
                          placeholder="Username"
                          type="text"
                          value={newsletterName}
                          onChange={(e) => setNewsletterName(e.target.value)}
                          required
                        />
                        <input
                          className="w-full px-5 py-3 bg-transparent border border-white/20 text-sm font-mono outline-none tracking-widest text-white placeholder:text-white/40 focus:border-primary transition-colors"
                          placeholder="Your email address"
                          type="email"
                          value={newsletterEmail}
                          onChange={(e) => setNewsletterEmail(e.target.value)}
                          required
                        />
                        <div className="flex border border-white/20 focus-within:border-primary transition-colors">
                          <select 
                            className="bg-white/5 text-white text-sm font-mono outline-none px-3 py-3 border-r border-white/20 appearance-none cursor-pointer"
                            value={newsletterPhoneCode}
                            onChange={(e) => setNewsletterPhoneCode(e.target.value)}
                          >
                            <option value="+1" className="text-black">🇺🇸 +1</option>
                            <option value="+44" className="text-black">🇬🇧 +44</option>
                            <option value="+61" className="text-black">🇦🇺 +61</option>
                            <option value="+49" className="text-black">🇩🇪 +49</option>
                            <option value="+86" className="text-black">🇨🇳 +86</option>
                            <option value="+91" className="text-black">🇮🇳 +91</option>
                            <option value="+971" className="text-black">🇦🇪 +971</option>
                            <option value="+974" className="text-black">🇶🇦 +974</option>
                            <option value="+255" className="text-black">🇹🇿 +255</option>
                            <option value="+254" className="text-black">🇰🇪 +254</option>
                            <option value="+256" className="text-black">🇺🇬 +256</option>
                            <option value="+250" className="text-black">🇷🇼 +250</option>
                            <option value="+257" className="text-black">🇧🇮 +257</option>
                            <option value="+234" className="text-black">🇳🇬 +234</option>
                            <option value="+233" className="text-black">🇬🇭 +233</option>
                            <option value="+243" className="text-black">🇨🇩 +243</option>
                            <option value="+27" className="text-black">🇿🇦 +27</option>
                            <option value="+260" className="text-black">🇿🇲 +260</option>
                            <option value="+263" className="text-black">🇿🇼 +263</option>
                            <option value="+261" className="text-black">🇲🇬 +261</option>
                            <option value="+212" className="text-black">🇲🇦 +212</option>
                          </select>
                          <input
                            className="w-full px-4 py-3 bg-transparent text-sm font-mono outline-none tracking-widest text-white placeholder:text-white/40"
                            placeholder="WhatsApp (Optional)"
                            type="tel"
                            value={newsletterPhone}
                            onChange={(e) => setNewsletterPhone(e.target.value)}
                          />
                        </div>
                        <button disabled={isSubscribing} type="submit" className="w-full py-3 bg-primary text-white text-xs font-mono font-black uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-all disabled:opacity-50">
                          {isSubscribing ? "Subscribing..." : "Subscribe"}
                        </button>
                      </div>
                    )}
                    <p className="text-[9px] font-mono text-white/20 uppercase tracking-wider mt-6 text-center">
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
