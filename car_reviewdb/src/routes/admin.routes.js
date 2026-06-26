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

// Everything under /api/admin requires an admin role (re-checked against the DB).
router.use('/api/admin', requireStaff); // admin or editor for all content routes

// ── Reviews ──
router.post('/api/admin/reviews', validate(createReviewSchema), ReviewController.create);
router.get('/api/admin/reviews', ReviewController.adminList);
router.put('/api/admin/reviews/:id', validateUUID(), validate(updateReviewSchema), ReviewController.update);
router.patch('/api/admin/reviews/:id/publish', validateUUID(), validate(setPublishSchema), ReviewController.setPublish);
router.delete('/api/admin/reviews/:id', validateUUID(), ReviewController.remove);
router.post('/api/admin/reviews/:id/restore', validateUUID(), ReviewController.restore);

// ── Comments ──
router.get('/api/admin/comments', CommentController.adminList);
router.put('/api/admin/comments/:id', validateUUID(), validate(moderateCommentSchema), CommentController.moderate);
router.delete('/api/admin/comments/:id', validateUUID(), CommentController.remove);

// ── Brands (CRUD) ──
router.get('/api/admin/brands', BrandController.list);
router.post('/api/admin/brands', validate(createBrandSchema), BrandController.create);
router.put('/api/admin/brands/:id', validateUUID(), validate(updateBrandSchema), BrandController.update);
router.delete('/api/admin/brands/:id', validateUUID(), BrandController.remove);

// ── Users (CRUD + roles) ──
router.get('/api/admin/users', requireAdmin, UserController.list);
router.put('/api/admin/users/:id', requireAdmin, validateUUID(), validate(updateUserSchema), UserController.update);
router.delete('/api/admin/users/:id', requireAdmin, validateUUID(), UserController.remove);

// ── Leads ──
router.get('/api/admin/leads', LeadController.adminList);
router.put('/api/admin/leads/:id', validateUUID(), validate(updateLeadSchema), LeadController.update);
router.delete('/api/admin/leads/:id', validateUUID(), LeadController.remove);

// ── Analytics ──
router.get('/api/admin/analytics', AnalyticsController.overview);

export default router;
