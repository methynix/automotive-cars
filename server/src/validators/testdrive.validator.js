import { z } from 'zod';

export const createTestDriveSchema = z.object({
  review_id: z.string().uuid().optional().nullable(),
  full_name: z.string().min(1, 'Name is required').max(120),
  email: z.string().email('A valid email is required'),
  phone: z.string().max(40).optional().nullable(),
  preferred_date: z.coerce.date({ errorMap: () => ({ message: 'A valid preferred date is required' }) }),
  preferred_time: z.string().max(20).optional().nullable(),
  preferred_location: z.string().max(160).optional().nullable(),
  message: z.string().max(2000).optional().nullable(),
});

export const updateTestDriveSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'completed', 'cancelled']),
});
