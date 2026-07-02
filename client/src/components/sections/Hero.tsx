import type { Review } from "@/lib/types";
import { FALLBACK_IMAGE_HERO } from "@/lib/constants";
import { FeatureCards } from "@/components/sections/FeatureCards";

interface HeroProps {
  reviews: Review[];
}

export function Hero({ reviews }: HeroProps) {
  return (
    <section className="relative h-[77svh] min-h-[500px] md:min-h-0 md:h-[800px] w-full overflow-hidden flex items-end bg-gradient-to-b from-slate-900 to-black">
      <video
        className="absolute inset-0 w-full h-full object-cover"
        src="https://res.cloudinary.com/dwt1u991q/video/upload/v1782556431/ad2_y62xjs.mp4"
        poster={FALLBACK_IMAGE_HERO}
        preload="metadata"
        autoPlay
        muted
        loop
        playsInline
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
      <div className="relative z-10 w-full px-5 md:px-12 max-w-[1300px] mx-auto pb-8">
        <div className="max-w-2xl mb-10">
          <h1 className="text-5xl md:text-[4rem] font-archivo font-extrabold text-white mb-6 leading-[0.9] tracking-normal uppercase">
            FUTURE <br /> <span className="text-[#C91F20]">AUTOMOTIVE</span>
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-lg mb-8 font-inter">
            Where technical precision meets elite automotive journalism. Explore
            the engineering, the icons, and the future of high-performance
            electric machines.
          </p>
        </div>

        <FeatureCards className="hidden md:flex" />
      </div>
    </section>
  );
}
