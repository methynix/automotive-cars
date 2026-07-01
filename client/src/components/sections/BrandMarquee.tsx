import { Fragment } from "react"

export function BrandMarquee() {
  const brands = [
    "BYD", "GEELY", "LI AUTO", "AITO", "WULING", 
    "XIAOMI", "GAC AION", "NIO", "XPENG", "ZEEKR", "CHANGAN"
  ]
  
  return (
    <div className="w-full bg-background border-b border-border overflow-hidden py-10 relative">
      <div className="flex w-max animate-marquee">
        {/* We duplicate the array to create a seamless loop. */}
        {[...Array(2)].map((_, i) => (
          <div key={i} className="flex flex-shrink-0 items-center space-x-16 px-8">
            {brands.map((brand, j) => (
              <span key={`${i}-${j}`} className="text-4xl md:text-5xl font-archivo font-black uppercase text-muted-foreground/30 hover:text-muted-foreground/80 transition-colors cursor-default select-none">
                {brand}
              </span>
            ))}
          </div>
        ))}
      </div>
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-background via-transparent to-background" />
    </div>
  )
}
