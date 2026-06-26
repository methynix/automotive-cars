import { z } from 'zod';

export const updateUserSchema = z.object({
  role: z.enum(['admin', 'editor', 'user']).optional(),
  status: z.enum(['active', 'suspended']).optional(),
  full_name: z.string().max(120).optional(),
}).refine((d) => Object.keys(d).length > 0, { message: 'No fields to update' });
