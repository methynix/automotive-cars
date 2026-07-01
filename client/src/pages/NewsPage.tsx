import { useState, useEffect } from "react"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { getNews } from "@/lib/api"
import type { NewsArticle } from "@/lib/types"
import { FALLBACK_IMAGE } from "@/lib/constants"
import { Reveal } from "@/components/ui/Reveal"

export default function NewsPage() {
  const [news, setNews] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    getNews(1, 12)
      .then((res) => {
        if (res?.results) {
          setNews(res.results)
        }
        setLoading(false)
      })
      .catch((err) => {
        console.error("Failed to fetch news:", err)
        setError("Failed to load news. Please try again later.")
        setLoading(false)
      })
  }, [])

  return (
    <div className="min-h-screen bg-background font-inter selection:bg-primary selection:text-white">
      <Header />
      <main className="pt-24 pb-24">
        <div className="px-6 md:px-12 max-w-[1280px] mx-auto">
          <Reveal animation="fade-down" duration={500}>
            <header className="mb-12 border-b border-border pb-8">
              <h1 className="text-4xl md:text-5xl font-archivo font-extrabold uppercase tracking-tighter mb-4">
                AUTO <span className="text-primary">NEWS</span>
              </h1>
              <p className="text-muted-foreground font-mono uppercase tracking-widest text-xs">
                LATEST FROM THE AUTOMOTIVE WORLD
              </p>
            </header>
          </Reveal>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-video bg-muted mb-4" />
                  <div className="h-6 bg-muted mb-2 w-3/4" />
                  <div className="h-4 bg-muted w-1/2" />
                </div>
              ))}
            </div>
          ) : error ? (
            <Reveal animation="zoom-in">
              <div className="text-center py-24 border border-dashed border-border">
                <p className="text-red-500 font-mono mb-4">{error}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="text-xs font-mono font-bold uppercase tracking-widest border border-primary px-6 py-2 hover:bg-primary hover:text-white transition-colors"
                >
                  Try Again
                </button>
              </div>
            </Reveal>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {news.map((article, idx) => (
                <Reveal key={article.id} animation="fade-up" delay={idx * 50}>
                  <article className="group border border-border flex flex-col hover:border-primary transition-colors duration-500 h-full">
                    <a href={article.url} target="_blank" rel="noopener noreferrer" className="block overflow-hidden aspect-video relative">
                      <img 
                        src={article.image_url || FALLBACK_IMAGE} 
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = FALLBACK_IMAGE
                        }}
                      />
                      <div className="absolute top-4 left-4">
                        <span className="bg-primary text-white text-[10px] font-mono font-bold px-2 py-1 uppercase tracking-widest">
                          {article.source.name}
                        </span>
                      </div>
                    </a>
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex items-center gap-4 mb-4 text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                        <span>{new Date(article.published_at).toLocaleDateString()}</span>
                        <span className="w-1 h-1 bg-border rounded-full" />
                        <span>{article.source.domain}</span>
                      </div>
                      <h2 className="text-xl font-archivo font-extrabold mb-4 group-hover:text-primary transition-colors uppercase leading-tight">
                        <a href={article.url} target="_blank" rel="noopener noreferrer">
                          {article.title}
                        </a>
                      </h2>
                      <p className="text-sm text-muted-foreground line-clamp-3 mb-6 font-inter leading-relaxed">
                        {article.description}
                      </p>
                      <div className="mt-auto pt-6 border-t border-border">
                        <a 
                          href={article.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs font-mono font-bold uppercase tracking-[0.2em] group-hover:text-primary flex items-center gap-2"
                        >
                          Read Article <span className="text-lg">→</span>
                        </a>
                      </div>
                    </div>
                  </article>
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
