import { z } from 'zod';

export const BODY_STYLES = ['Sedan', 'SUV', 'Coupe', 'Hatchback', 'Wagon', 'Convertible', 'Truck', 'Van'];
export const CONDITIONS = ['new', 'used', 'certified'];

const specsSchema = z.object({
  engine: z.string().optional(),
  horsepower: z.number().int().nonnegative().optional(),
  torque: z.number().int().nonnegative().optional(),
  transmission: z.string().optional(),
  drivetrain: z.string().optional(),
  fuel_type: z.string().optional(),
  fuel_economy: z.string().optional(),
  top_speed: z.string().optional(),
  acceleration: z.string().optional(),
  seating: z.number().int().positive().optional(),
  mileage: z.number().int().nonnegative().optional(),
  price: z.number().nonnegative().optional(), // price can never be negative
}).optional();

export const createReviewSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  excerpt: z.string().optional(),
  featured_image: z.string().url().optional().or(z.literal('')),
  manufacturer: z.string().min(1, 'Manufacturer is required'),
  model: z.string().min(1, 'Model is required'),
  year: z.number().int().gte(1886).lte(new Date().getFullYear() + 2),
  body_style: z.enum(BODY_STYLES).optional(),
  condition: z.enum(CONDITIONS).optional(),
  content: z.any(),
  rating: z.number().min(0).max(10).optional(),
  status: z.enum(['draft', 'published']).optional(),
  featured: z.boolean().optional(),
  specs: specsSchema,
  gallery: z.array(z.object({
    image_url: z.string().min(1),
    alt_text: z.string().optional(),
    sort_order: z.number().int().optional(),
  })).optional(),
});

export const updateReviewSchema = createReviewSchema.partial();

export const setPublishSchema = z.object({
  status: z.enum(['draft', 'published']),
});
