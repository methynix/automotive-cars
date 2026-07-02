import { z } from 'zod';

export const createCommentSchema = z.object({
  author_name: z.string().min(1).max(100),
  author_email: z.string().email().optional().nullable(),
  body: z.string().min(1).max(5000),
  parent_id: z.string().uuid().optional().nullable()
});

export const moderateCommentSchema = z.object({
  status: z.enum(['approved', 'pending', 'spam'])
});
