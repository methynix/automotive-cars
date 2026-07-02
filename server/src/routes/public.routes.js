import express from 'express';
import { ReviewController } from '../controllers/review.controller.js';
import { CommentController } from '../controllers/comment.controller.js';
import { BrandController } from '../controllers/brand.controller.js';
import { LeadController } from '../controllers/lead.controller.js';
import { TestDriveController } from '../controllers/testdrive.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { validateUUID } from '../middlewares/validate-uuid.middleware.js';
import { optionalAuth, requireAuth } from '../middlewares/auth.middleware.js';
import { createCommentSchema } from '../validators/comment.validator.js';
import { createLeadSchema } from '../validators/lead.validator.js';
import { createTestDriveSchema } from '../validators/testdrive.validator.js';

const router = express.Router();

// Reviews (featured must be declared before :slug)
router.get('/api/reviews', ReviewController.listPublic);
router.get('/api/reviews/featured', ReviewController.listFeatured);
router.get('/api/reviews/:slug', ReviewController.getBySlug);

// Comments
router.get('/api/reviews/:id/comments', validateUUID(), optionalAuth, CommentController.listByReview);
router.post('/api/reviews/:id/comments', validateUUID(), validate(createCommentSchema), CommentController.create);
router.post('/api/comments/:id/like', validateUUID(), requireAuth, CommentController.toggleLike);

// Brands (public, read-only) — used by listings/filter UI so the brand list is data-driven
router.get('/api/brands', BrandController.list);

// Leads (public create — "Enquire" / inquiry). optionalAuth links it to the
// customer's profile when they're signed in so it shows under "My Inquiries".
router.post('/api/leads', optionalAuth, validate(createLeadSchema), LeadController.create);

// Test-drive booking (public — optionalAuth attaches the profile when signed in)
router.post('/api/test-drives', optionalAuth, validate(createTestDriveSchema), TestDriveController.create);

export default router;
