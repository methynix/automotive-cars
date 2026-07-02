import { Link } from "react-router-dom"
import { FiArrowRight } from "react-icons/fi"
import { IoStar } from "react-icons/io5"
import type { Review } from "@/lib/types"
import { FALLBACK_IMAGE } from "@/lib/constants"
import { Button } from "@/components/ui/Button"

interface EditorialGridProps {
  reviews: Review[]
  isLoading?: boolean
}

export function EditorialGrid({ reviews, isLoading = false }: EditorialGridProps) {
  // Don't assume the parent sorted — sort by publish date ourselves.
  const editorials = [...reviews]
    .sort((a, b) => new Date(b.published_at || b.created_at || 0).getTime() - new Date(a.published_at || a.created_at || 0).getTime())
    .slice(0, 4)

  return (
    <section className="py-24 bg-background border-y border-border">
      <div className="px-6 md:px-12 max-w-[1280px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <span className="text-[11px] font-mono font-bold text-primary uppercase tracking-[0.3em] block mb-4">Deep Dives</span>
            <h2 className="text-2xl md:text-4xl font-archivo font-extrabold uppercase tracking-tighter leading-none">
              LATEST <span className="text-primary tracking-normal">EDITORIALS</span>
            </h2>
            <p className="text-sm font-mono text-slate-500 mt-4 uppercase tracking-normal max-w-xl">
              In-depth analysis and expert reviews of the newest arrivals to our fleet
            </p>
          </div>
          <Link to="/cars">
            <Button className="px-[30px] py-5 text-[11px] font-mono font-black uppercase tracking-normal group flex items-center">
              View All Reviews
            </Button>
          </Link>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={`skeleton-${idx}`} className="flex flex-col animate-pulse">
                <div className="aspect-[4/3] bg-muted mb-6 rounded-sm" />
                <div className="h-3 w-1/3 bg-muted rounded mb-4" />
                <div className="h-6 w-full bg-muted rounded mb-2" />
                <div className="h-6 w-4/5 bg-muted rounded mb-6" />
                <div className="mt-auto flex items-center gap-4 pt-6 border-t border-border">
                  <div className="h-2 w-20 bg-muted rounded" />
                  <span className="w-1 h-1 bg-border rounded-full" />
                  <div className="h-2 w-12 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : editorials.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground"><p className="text-sm font-mono uppercase tracking-widest">No editorials published yet</p></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {editorials.map((article) => (
              <Link key={article.id} to={`/cars/${article.slug}`} className="flex flex-col group cursor-pointer">
                <div className="aspect-[4/3] overflow-hidden mb-6 relative">
                  <img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    src={article.featured_image || FALLBACK_IMAGE} alt={article.title}
                    onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE }} />
                </div>
                <span className="text-xs font-mono text-muted-foreground mb-2 uppercase tracking-widest">{article.manufacturer} {article.model}</span>
                <h3 className="text-lg md:text-xl font-archivo font-bold leading-tight mb-6 group-hover:text-primary transition-colors uppercase line-clamp-3">{article.title}</h3>
                <div className="mt-auto flex items-center gap-4 pt-6 border-t border-border text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                  <span>{new Date(article.updated_at || article.published_at || article.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  {article.rating != null && (
                    <>
                      <span className="w-1 h-1 bg-border rounded-full" />
                      <span className="flex items-center gap-1.5 text-foreground font-bold">
                        <IoStar size={12} className="text-[#FFDF00]" /> {article.rating.toFixed(1)}/10
                      </span>
                    </>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
