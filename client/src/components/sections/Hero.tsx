import { Link } from "react-router-dom";
import type { Review } from "@/lib/types";
import { FALLBACK_IMAGE_HERO } from "@/lib/constants";

import { FiArrowRight } from "react-icons/fi";

const cardData = [
  {
    id: 1,
    imageSrc: "/detail-one.jpg",
    altText: "Exclusive Models",
    heading: "Exclusive Models",
    description: "Handpicked luxury sports cars for every enthusiast.",
  },
  {
    id: 2,
    imageSrc: "/detail-two.jpg",
    altText: "Unmatched Performance",
    heading: "Unmatched Performance",
    description: "Experience speed and precision like never before.",
  },
  {
    id: 3,
    imageSrc: "/detail-three.jpg",
    altText: "Expert Assistance",
    heading: "Expert Assistance",
    description: "Guidance from professionals who understand your passion.",
  },
];

interface HeroProps {
  reviews: Review[];
}

export function Hero({ reviews }: HeroProps) {
  return (
    <section className="relative h-[800px] w-full overflow-hidden flex items-end bg-gradient-to-b from-slate-900 to-black">
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
      <div className="relative z-10 w-full px-4 md:px-0 max-w-[1300px] mx-auto pb-10">
        <div className="max-w-2xl mb-10">
          <h1 className="text-4xl md:text-[4rem] font-archivo font-extrabold text-white mb-6 leading-[0.9] tracking-normal uppercase">
            FUTURE <br /> AUTOMOTIVE
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-lg mb-8 font-inter">
            Where technical precision meets elite automotive journalism. Explore
            the engineering, the icons, and the future of high-performance
            electric machines.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {cardData.map((card) => (
            <div
              key={card.id}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-md flex-1 flex flex-col group"
            >
              <div className="overflow-hidden">
                <img
                  src={card.imageSrc}
                  alt={card.altText}
                  className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="px-4 pt-4 pb-2 flex flex-row items-center justify-between gap-4">
                <div className="py-1">
                  <h3 className="text-lg font-bold mb-1 text-gray-900">
                    {card.heading}
                  </h3>
                  <p className="text-gray-700 text-sm leading-snug pb-2">
                    {card.description}
                  </p>
                </div>
                <button className="flex-shrink-0 p-3 bg-white border border-gray-300 rounded-full text-black hover:bg-gray-100 transition-colors">
                  <FiArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
