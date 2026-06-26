import { useRef, useState, useCallback } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/Button"
import { FiChevronLeft, FiChevronRight } from "react-icons/fi"
import type { Review } from "@/lib/types"
import { FALLBACK_IMAGE } from "@/lib/constants"

interface TrendingCarsProps {
  // The caller decides what "trending" means (e.g. featured, or sorted by views
  // from the API). No hardcoded brand list here — it's fully data-driven.
  reviews: Review[]
}

export function TrendingCars({ reviews }: TrendingCarsProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const display = reviews.slice(0, 6)

  const scrollToIndex = useCallback((index: number) => {
    const container = scrollRef.current
    if (!container) return
    const card = container.children[index] as HTMLElement | undefined
    if (card) {
      const offset = card.getBoundingClientRect().left - container.getBoundingClientRect().left + container.scrollLeft
      container.scrollTo({ left: offset - 24, behavior: "smooth" })
    }
  }, [])

  // Keep the dots in sync when the user swipes/scrolls manually.
  const handleScroll = useCallback(() => {
    const container = scrollRef.current
    if (!container) return
    let nearest = 0
    let min = Infinity
    Array.from(container.children).forEach((child, i) => {
      const el = child as HTMLElement
      const dist = Math.abs(el.getBoundingClientRect().left - container.getBoundingClientRect().left - 24)
      if (dist < min) { min = dist; nearest = i }
    })
    setCurrentIndex(nearest)
  }, [])

  const goNext = () => { const n = Math.min(currentIndex + 1, display.length - 1); setCurrentIndex(n); scrollToIndex(n) }
  const goPrev = () => { const p = Math.max(currentIndex - 1, 0); setCurrentIndex(p); scrollToIndex(p) }

  return (
    <section className="py-24 bg-muted/30 overflow-hidden">
      <div className="px-6 md:px-12 max-w-[1280px] mx-auto mb-12 flex justify-between items-end">
        <div>
          <span className="text-sm font-mono text-primary block mb-2 uppercase tracking-widest">Market Intelligence</span>
          <h2 className="text-4xl md:text-5xl font-archivo font-extrabold text-foreground uppercase tracking-tight">TRENDING NOW</h2>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest hidden md:block">
            {String(currentIndex + 1).padStart(2, "0")}/{String(display.length).padStart(2, "0")}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={goPrev} className="rounded-full border-border"><FiChevronLeft className="text-xl" /></Button>
            <Button variant="outline" size="icon" onClick={goNext} className="rounded-full border-border"><FiChevronRight className="text-xl" /></Button>
          </div>
        </div>
      </div>
      {display.length === 0 ? (
        <div className="px-6 md:px-12"><div className="text-center py-16 text-muted-foreground"><p className="text-sm font-mono uppercase tracking-widest">No vehicles available yet</p></div></div>
      ) : (
        <div ref={scrollRef} onScroll={handleScroll} className="flex gap-6 overflow-x-auto px-6 md:px-12 pb-8 hide-scrollbar snap-x">
          {display.map((car, i) => (
            <Link key={car.id} to={`/cars/${car.slug}`}
              className={`min-w-[320px] md:min-w-[420px] snap-start bg-card border border-border group transition-all duration-300 ${i === currentIndex ? "border-primary" : "hover:border-primary"}`}>
              <div className="aspect-[16/10] overflow-hidden relative">
                <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  src={car.gallery?.[0]?.image_url || car.featured_image || FALLBACK_IMAGE}
                  alt={car.title || `${car.manufacturer} ${car.model}`}
                  onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE }} />
                <div className="absolute top-4 left-4 bg-foreground text-background px-3 py-1 text-xs font-mono">{String(i + 1).padStart(2, "0")}</div>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl font-archivo font-bold leading-none uppercase">{car.manufacturer} {car.model}</h3>
                  {car.specs?.price && <span className="text-sm font-mono text-primary font-bold">${car.specs.price.toLocaleString()}</span>}
                </div>
                <div className="grid grid-cols-3 gap-4 border-t border-border pt-6">
                  <div><span className="text-[10px] uppercase text-muted-foreground block mb-1">HP</span><span className="text-sm font-mono font-bold">{car.specs?.horsepower ?? "—"}</span></div>
                  <div><span className="text-[10px] uppercase text-muted-foreground block mb-1">0–100</span><span className="text-sm font-mono font-bold">{car.specs?.acceleration ?? "—"}</span></div>
                  <div><span className="text-[10px] uppercase text-muted-foreground block mb-1">TOP</span><span className="text-sm font-mono font-bold">{car.specs?.top_speed ?? "—"}</span></div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
      {display.length > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {display.map((_, i) => (
            <button key={i} onClick={() => { setCurrentIndex(i); scrollToIndex(i) }}
              className={`h-1.5 transition-all duration-300 ${i === currentIndex ? "w-8 bg-primary" : "w-4 bg-border hover:bg-muted-foreground/30"}`}
              aria-label={`Go to slide ${i + 1}`} />
          ))}
        </div>
      )}
    </section>
  )
}
