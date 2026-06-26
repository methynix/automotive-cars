import { z } from 'zod';

export const createLeadSchema = z.object({
  review_id: z.string().uuid().optional().nullable(),
  full_name: z.string().min(1, 'Name is required').max(120),
  email: z.string().email('A valid email is required'),
  phone: z.string().min(6, 'A valid phone number is required').max(40),
  message: z.string().max(2000).optional().nullable(),
  preferred_location: z.string().max(160).optional().nullable(),
});

export const updateLeadSchema = z.object({
  status: z.enum(['new', 'contacted', 'qualified', 'closed']),
});
