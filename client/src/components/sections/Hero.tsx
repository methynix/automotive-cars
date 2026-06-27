import { Link } from "react-router-dom"
import type { Review } from "@/lib/types"
import { FALLBACK_IMAGE_HERO } from "@/lib/constants"


interface HeroProps {
  reviews: Review[]
}

export function Hero({ reviews }: HeroProps) {
  const featured = reviews.slice(0, 3)

  return (
    <section className="relative h-[800px] w-full overflow-hidden flex items-end bg-black">
      <video
        className="absolute inset-0 w-full h-full object-cover"
        src="ad.mp4"
        poster={FALLBACK_IMAGE_HERO}
        preload="metadata"
        autoPlay
        muted
        loop
        playsInline
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
      <div className="relative z-10 w-full px-6 md:px-12 max-w-[1280px] mx-auto pb-16">
        <div className="max-w-2xl mb-10">
          <h1 className="text-6xl md:text-8xl font-archivo font-extrabold text-white mb-6 leading-[0.9] tracking-tighter uppercase">
            FUTURE  <br /> AUTOMOTIVE
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-lg mb-8 font-inter">
            Where technical precision meets elite automotive journalism. Explore the engineering, the icons, and the future of high-performance machines.
          </p>
        </div>
        {featured.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {featured.map((r) => (
              <Link
                key={r.id}
                to={`/cars/${r.slug}`}
                className="group bg-white/10 backdrop-blur-md border border-white/20 p-5 hover:bg-white/20 transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono font-bold text-primary uppercase tracking-widest">{r.manufacturer}</span>
                  {r.rating && <span className="text-xs font-bold text-yellow-400">{r.rating.toFixed(1)}</span>}
                </div>
                <h3 className="text-lg font-archivo font-bold text-white uppercase tracking-tight mb-2">{r.model}</h3>
                <div className="flex items-center gap-4 text-[11px] font-mono text-white/60">
                  {r.specs?.horsepower && <span>{r.specs.horsepower} HP</span>}
                  {r.specs?.acceleration && <span>0-60 {r.specs.acceleration}</span>}
                  {r.specs?.price && <span>${r.specs.price.toLocaleString()}</span>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
