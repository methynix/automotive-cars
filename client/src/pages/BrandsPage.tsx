import { Link } from "react-router-dom"
import { FiArrowRight, FiMapPin, FiCalendar } from "react-icons/fi"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { Reveal } from "@/components/ui/Reveal"
import { useBrands } from "@/hooks/useApi"

export default function BrandsPage() {
  const { data: brands, isLoading, isError } = useBrands()
  const list = brands ?? []

  return (
    <div className="min-h-screen bg-background font-inter selection:bg-primary selection:text-white">
      <Header />
      <main className="pt-24 pb-24">
        <div className="px-5 md:px-12 max-w-[1280px] mx-auto">
          <Reveal animation="fade-down" duration={500}>
            <header className="mb-10 border-b border-border pb-8">
              <span className="text-[10px] font-mono font-bold text-primary uppercase tracking-[0.3em]">The makers</span>
              <h1 className="text-4xl md:text-5xl font-archivo font-extrabold uppercase tracking-tighter mt-2 mb-3">
                BR<span className="text-primary">ANDS</span>
              </h1>
              <p className="text-muted-foreground font-mono uppercase tracking-widest text-xs">
                {list.length} manufacturer{list.length === 1 ? "" : "s"} · tap one to see its vehicles
              </p>
            </header>
          </Reveal>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="border border-border p-6 animate-pulse">
                  <div className="h-12 w-12 bg-muted/40 mb-4 rounded" />
                  <div className="h-5 bg-muted/40 w-1/2 mb-3" />
                  <div className="h-3 bg-muted/30 w-3/4" />
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="text-center py-24 border border-dashed border-border">
              <p className="text-red-500 font-mono">Couldn't load brands. Please try again.</p>
            </div>
          ) : list.length === 0 ? (
            <div className="text-center py-24 border border-dashed border-border">
              <p className="font-archivo font-bold uppercase tracking-widest mb-2">No brands yet</p>
              <p className="text-sm text-muted-foreground">Brands added in the admin console will appear here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {list.map((b, idx) => (
                <Reveal key={b.id} animation="fade-up" delay={idx * 40}>
                  <Link
                    to={`/cars?manufacturer=${encodeURIComponent(b.name)}`}
                    className="group flex flex-col h-full border border-border p-6 hover:border-primary transition-colors"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      {b.logo_url ? (
                        <img src={b.logo_url} alt={b.name} className="h-12 w-12 object-contain"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }} />
                      ) : (
                        <div className="h-12 w-12 flex items-center justify-center bg-muted font-archivo font-extrabold text-lg uppercase">
                          {b.name.slice(0, 2)}
                        </div>
                      )}
                      <h2 className="text-2xl font-archivo font-extrabold uppercase tracking-tight">{b.name}</h2>
                    </div>

                    {(b.country || b.founded_year) && (
                      <div className="flex items-center gap-4 text-[11px] font-mono text-muted-foreground uppercase tracking-widest mb-4">
                        {b.country && <span className="flex items-center gap-1.5"><FiMapPin size={11} /> {b.country}</span>}
                        {b.founded_year && <span className="flex items-center gap-1.5"><FiCalendar size={11} /> {b.founded_year}</span>}
                      </div>
                    )}

                    {b.description && (
                      <p className="text-sm text-muted-foreground leading-relaxed mb-6 line-clamp-3">{b.description}</p>
                    )}

                    <span className="mt-auto inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-primary">
                      View vehicles <FiArrowRight className="group-hover:translate-x-1 transition-transform" size={14} />
                    </span>
                  </Link>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
