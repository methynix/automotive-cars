import { z } from 'zod';

export const BODY_STYLES = ['Sedan', 'SUV', 'Coupe', 'Hatchback', 'Wagon', 'Convertible', 'Truck', 'Van'];
export const CONDITIONS = ['new', 'used', 'certified'];

const specsSchema = z.object({
  engine: z.string().nullish(),
  horsepower: z.number().int().nonnegative().nullish(),
  torque: z.number().int().nonnegative().nullish(),
  transmission: z.string().nullish(),
  drivetrain: z.string().nullish(),
  fuel_type: z.string().nullish(),
  fuel_economy: z.string().nullish(),
  top_speed: z.string().nullish(),
  acceleration: z.string().nullish(),
  seating: z.number().int().positive().nullish(),
  mileage: z.number().int().nonnegative().nullish(),
  price: z.number().nonnegative().nullish(), // price can never be negative
}).nullish();

export const createReviewSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  excerpt: z.string().nullish(),
  featured_image: z.string().url().nullish().or(z.literal('')),
  manufacturer: z.string().min(1, 'Manufacturer is required'),
  model: z.string().min(1, 'Model is required'),
  year: z.number().int().gte(1886).lte(new Date().getFullYear() + 2),
  body_style: z.enum(BODY_STYLES).nullish(),
  condition: z.enum(CONDITIONS).nullish(),
  content: z.any(),
  rating: z.number().min(0).max(10).nullish(),
  status: z.enum(['draft', 'published']).nullish(),
  featured: z.boolean().nullish(),
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
