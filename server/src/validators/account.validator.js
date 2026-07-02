import { z } from 'zod';

export const saveCarSchema = z.object({
  review_id: z.string().uuid('A valid vehicle id is required'),
});

export const updatePreferencesSchema = z.object({
  body_styles: z.array(z.string().max(60)).max(20).optional(),
  fuel_types: z.array(z.string().max(60)).max(20).optional(),
  budget_min: z.number().int().nonnegative().nullable().optional(),
  budget_max: z.number().int().nonnegative().nullable().optional(),
  notify_on_match: z.boolean().optional(),
});
