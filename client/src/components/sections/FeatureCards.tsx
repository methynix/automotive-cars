import { FiArrowRight } from "react-icons/fi"

export const cardData = [
  {
    id: 1,
    imageSrc: '/detail-one.jpg',
    altText: 'Exclusive Models',
    heading: 'Exclusive Models',
    description: 'Handpicked luxury sports cars for every enthusiast.',
  },
  {
    id: 2,
    imageSrc: '/detail-two.jpg',
    altText: 'Unmatched Performance',
    heading: 'Unmatched Performance',
    description: 'Experience speed and precision like never before.',
  },
  {
    id: 3,
    imageSrc: '/detail-three.jpg',
    altText: 'Expert Assistance',
    heading: 'Expert Assistance',
    description: 'Guidance from professionals who understand your passion.',
  },
]

export function FeatureCards({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-col md:flex-row gap-6 ${className}`}>
      {cardData.map(card => (
        <div key={card.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-md flex-1 flex flex-col group">
          <div className="overflow-hidden">
            <img 
              src={card.imageSrc} 
              alt={card.altText} 
              className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <div className="px-4 pt-4 pb-2 flex flex-row items-center justify-between gap-4">
            <div className="py-1">
              <h3 className="text-lg font-bold mb-1 text-gray-900">{card.heading}</h3>
              <p className="text-gray-700 text-sm leading-snug pb-2">{card.description}</p>
            </div>
            <button className="flex-shrink-0 p-3 bg-white border border-gray-300 rounded-full text-black hover:bg-gray-100 transition-colors">
              <FiArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
