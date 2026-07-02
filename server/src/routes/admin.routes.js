import express from 'express';
import { ReviewController } from '../controllers/review.controller.js';
import { CommentController } from '../controllers/comment.controller.js';
import { BrandController } from '../controllers/brand.controller.js';
import { LeadController } from '../controllers/lead.controller.js';
import { UserController } from '../controllers/user.controller.js';
import { AnalyticsController } from '../controllers/analytics.controller.js';
import { requireAdmin, requireStaff } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { validateUUID } from '../middlewares/validate-uuid.middleware.js';
import { createReviewSchema, updateReviewSchema, setPublishSchema } from '../validators/review.validator.js';
import { moderateCommentSchema } from '../validators/comment.validator.js';
import { createBrandSchema, updateBrandSchema } from '../validators/brand.validator.js';
import { updateLeadSchema } from '../validators/lead.validator.js';
import { updateUserSchema } from '../validators/user.validator.js';

const router = express.Router();

// Authentication for the whole admin area: admin OR operator.
// Sensitive actions below are additionally gated to admin only.
router.use('/api/admin', requireStaff);

// ── Reviews ──
// Operators can create & edit (their creates are forced to draft in the controller);
// only admins can publish, delete or restore.
router.post('/api/admin/reviews', validate(createReviewSchema), ReviewController.create);
router.get('/api/admin/reviews', ReviewController.adminList);
router.patch('/api/admin/reviews/:id', validateUUID(), validate(updateReviewSchema), ReviewController.update);
router.patch('/api/admin/reviews/:id/publish', requireAdmin, validateUUID(), validate(setPublishSchema), ReviewController.setPublish);
router.delete('/api/admin/reviews/:id', requireAdmin, validateUUID(), ReviewController.remove);
router.post('/api/admin/reviews/:id/restore', requireAdmin, validateUUID(), ReviewController.restore);

// ── Comments (moderation — admin & operator) ──
router.get('/api/admin/comments', CommentController.adminList);
router.put('/api/admin/comments/:id', validateUUID(), validate(moderateCommentSchema), CommentController.moderate);
router.delete('/api/admin/comments/:id', validateUUID(), CommentController.remove);

// ── Brands (admin only) ──
router.get('/api/admin/brands', BrandController.list);
router.post('/api/admin/brands', requireAdmin, validate(createBrandSchema), BrandController.create);
router.put('/api/admin/brands/:id', requireAdmin, validateUUID(), validate(updateBrandSchema), BrandController.update);
router.delete('/api/admin/brands/:id', requireAdmin, validateUUID(), BrandController.remove);

// ── Users (admin only) ──
router.get('/api/admin/users', requireAdmin, UserController.list);
router.put('/api/admin/users/:id', requireAdmin, validateUUID(), validate(updateUserSchema), UserController.update);
router.delete('/api/admin/users/:id', requireAdmin, validateUUID(), UserController.remove);

// ── Leads (view/update — staff; delete — admin only) ──
router.get('/api/admin/leads', LeadController.adminList);
router.put('/api/admin/leads/:id', validateUUID(), validate(updateLeadSchema), LeadController.update);
router.delete('/api/admin/leads/:id', requireAdmin, validateUUID(), LeadController.remove);

// ── Analytics ──
router.get('/api/admin/analytics', AnalyticsController.overview);

export default router;
