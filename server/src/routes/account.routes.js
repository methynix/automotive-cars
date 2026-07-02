import express from 'express';
import { AccountController } from '../controllers/account.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { validateUUID } from '../middlewares/validate-uuid.middleware.js';
import { saveCarSchema, updatePreferencesSchema } from '../validators/account.validator.js';

const router = express.Router();

// The whole /api/account area is for the signed-in customer acting on themselves.
router.use('/api/account', requireAuth);

// Virtual Garage
router.get('/api/account/saved-cars', AccountController.listSavedCars);
router.post('/api/account/saved-cars', validate(saveCarSchema), AccountController.addSavedCar);
router.delete('/api/account/saved-cars/:reviewId', validateUUID('reviewId'), AccountController.removeSavedCar);

// Test drives (booking itself is public; this lists the customer's own)
router.get('/api/account/test-drives', AccountController.listTestDrives);

// Preference Center
router.get('/api/account/preferences', AccountController.getPreferences);
router.put('/api/account/preferences', validate(updatePreferencesSchema), AccountController.updatePreferences);

// My Inquiries
router.get('/api/account/inquiries', AccountController.listInquiries);

export default router;
