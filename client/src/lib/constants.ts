export const CHINESE_BRANDS = [
  "BYD",
  "NIO",
  "XPeng",
  "Li Auto",
  "Great Wall",
  "Chery",
  "Geely",
  "SAIC",
]

export const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=600&q=80"
export const FALLBACK_IMAGE_HERO = "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=1600&q=80"
export const FALLBACK_IMAGE_LG = "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=1200&q=80"

export const CATEGORY_IMAGES: Record<string, string> = {
  SUV: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600&q=80",
  Sedan: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=600&q=80",
  Sports: "https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=600&q=80",
  Electric: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=600&q=80",
}

export const PROMO_IMAGE = "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=600&q=80"

// ── Catalog taxonomy (used by listings filters + admin forms) ──
export const BODY_STYLES = ["Sedan", "SUV", "Coupe", "Hatchback", "Wagon", "Convertible", "Truck", "Van"]

export const CONDITIONS: { value: "new" | "used" | "certified"; label: string }[] = [
  { value: "new", label: "New" },
  { value: "used", label: "Used" },
  { value: "certified", label: "Certified Pre-Owned" },
]

export const DRIVETRAINS = ["Rear-Wheel Drive", "All-Wheel Drive", "Front-Wheel Drive"]

// value maps to the backend sort keys in review.service.js -> buildOrderBy()
export const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "mileage-asc", label: "Mileage: Low to High" },
  { value: "rating-desc", label: "Top Rated" },
  { value: "year-desc", label: "Year: Newest" },
]

// Dealer pickup points for the test-drive lead form.
export const DEALER_LOCATIONS = [
  "Dar es Salaam — Masaki Showroom",
  "Dar es Salaam — Mlimani City",
  "Dodoma — City Centre",
  "Arusha — Njiro",
  "Mwanza — Nyerere Rd",
]
