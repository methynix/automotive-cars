export type Condition = "new" | "used" | "certified"
export type ReviewStatus = "draft" | "published"
export type CommentStatus = "approved" | "pending" | "spam"
export type LeadStatus = "new" | "contacted" | "qualified" | "closed"
export type UserRole = "admin" | "operator" | "user"

export interface ReviewSpec {
  id?: string
  engine?: string | null
  horsepower?: number | null
  torque?: number | null
  transmission?: string | null
  drivetrain?: string | null
  fuel_type?: string | null
  fuel_economy?: string | null
  top_speed?: string | null
  acceleration?: string | null
  seating?: number | null
  mileage?: number | null
  price?: number | null
}

export interface GalleryImage {
  id?: string
  image_url: string
  alt_text?: string | null
  sort_order?: number | null
}

export interface ReviewContent {
  body?: string
  pros?: string[]
  cons?: string[]
  [key: string]: unknown
}

export interface Review {
  id: string
  slug: string
  title: string
  excerpt?: string | null
  featured_image?: string | null
  manufacturer: string
  model: string
  year: number
  body_style?: string | null
  condition?: Condition
  content: ReviewContent
  rating?: number | null
  status: ReviewStatus
  featured: boolean
  views: number
  published_at?: string | null
  created_at?: string
  updated_at?: string | null
  specs?: ReviewSpec | null
  gallery?: GalleryImage[]
}

export interface ReviewInput {
  title: string
  excerpt?: string
  featured_image?: string
  manufacturer: string
  model: string
  year: number
  body_style?: string
  condition?: Condition
  content: ReviewContent
  rating?: number
  status?: ReviewStatus
  featured?: boolean
  specs?: Partial<ReviewSpec>
  gallery?: GalleryImage[]
}

export interface ReviewFilters {
  page?: number
  limit?: number
  sort?: string
  search?: string
  manufacturer?: string
  bodyStyle?: string
  condition?: Condition | string
  drivetrain?: string
  minYear?: number
  maxYear?: number
  minRating?: number
  minPrice?: number
  maxPrice?: number
  minMileage?: number
  maxMileage?: number
  featured?: boolean
}

export interface Comment {
  id: string
  review_id: string
  author_name: string
  author_email?: string | null
  body: string
  status: CommentStatus
  created_at: string
}
export interface CommentInput {
  author_name: string
  author_email?: string
  body: string
}

export interface Brand {
  id: string
  name: string
  country?: string | null
  founded_year?: number | null
  logo_url?: string | null
  description?: string | null
  created_at?: string
}
export interface BrandInput {
  name: string
  country?: string | null
  founded_year?: number | null
  logo_url?: string | null
  description?: string | null
}

export interface Lead {
  id: string
  review_id?: string | null
  full_name: string
  email: string
  phone: string
  message?: string | null
  preferred_location?: string | null
  status: LeadStatus
  created_at: string
  review?: { title: string; slug: string; manufacturer: string; model: string } | null
}
export interface LeadInput {
  review_id?: string | null
  full_name: string
  email: string
  phone: string
  message?: string
  preferred_location?: string
}

export interface AppUser {
  id: string
  email: string
  full_name?: string | null
  role: UserRole
  status?: "active" | "suspended"
  created_at?: string
}

export interface Analytics {
  totals: {
    reviews: number; published: number; drafts: number
    comments: number; pendingComments: number
    leads: number; newLeads: number
    brands: number; users: number
    views: number; avgRating: number
  }
  topReviews: { name: string; views: number; slug: string }[]
}

export interface Paginated<T> {
  data: T[]
  total: number
  page: number
  limit: number
}

// News (RSS aggregation from backend)
export interface NewsArticle {
  id: string
  url: string
  published_at: string
  title: string
  description?: string
  content?: string
  image_url?: string
  source: { name: string; domain: string }
}
export interface NewsApiResponse {
  status: string
  page: number
  has_next_pages: boolean
  results: NewsArticle[]
}
