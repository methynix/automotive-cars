import { z } from 'zod';

export const createBrandSchema = z.object({
  name: z.string().min(1, 'Brand name is required').max(80),
  country: z.string().max(80).optional().nullable(),
  founded_year: z.number().int().gte(1800).lte(new Date().getFullYear()).optional().nullable(),
  logo_url: z.string().url().optional().or(z.literal('')).nullable(),
  description: z.string().max(2000).optional().nullable(),
});

export const updateBrandSchema = createBrandSchema.partial();
