import { Link } from "react-router-dom"
import { FiArrowRight, FiClock } from "react-icons/fi"
import type { Review } from "@/lib/types"
import { FALLBACK_IMAGE } from "@/lib/constants"

interface EditorialGridProps {
  reviews: Review[]
}

// Estimate read time from the review body so we don't repeat the manufacturer twice.
function readTime(r: Review): number {
  const words = String(r.content?.body || "").trim().split(/\s+/).filter(Boolean).length
  return Math.max(2, Math.round(words / 200))
}

export function EditorialGrid({ reviews }: EditorialGridProps) {
  // Don't assume the parent sorted — sort by publish date ourselves.
  const editorials = [...reviews]
    .sort((a, b) => new Date(b.published_at || b.created_at || 0).getTime() - new Date(a.published_at || a.created_at || 0).getTime())
    .slice(0, 4)

  return (
    <section className="py-24 bg-background border-y border-border">
      <div className="px-6 md:px-12 max-w-[1280px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-sm font-mono text-primary block mb-2 uppercase tracking-widest">Deep Dives</span>
            <h2 className="text-4xl md:text-5xl font-archivo font-extrabold uppercase">LATEST <span className="text-primary tracking-normal">EDITORIALS</span></h2>
          </div>
          <Link className="text-sm font-mono text-foreground border-b-2 border-primary pb-1 group flex items-center gap-2 uppercase tracking-widest font-bold" to="/cars">
            VIEW ALL REVIEWS <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        {editorials.length === 0 ? (
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
                <h3 className="text-2xl font-archivo font-bold leading-tight mb-6 group-hover:text-primary transition-colors uppercase">{article.title}</h3>
                <div className="mt-auto flex items-center gap-4 pt-6 border-t border-border text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                  <span className="flex items-center gap-1.5"><FiClock size={12} /> {readTime(article)} min read</span>
                  <span className="w-1 h-1 bg-border rounded-full" />
                  <span>{article.year}</span>
                  {article.rating != null && <><span className="w-1 h-1 bg-border rounded-full" /><span className="text-foreground font-bold">{article.rating.toFixed(1)}/10</span></>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
