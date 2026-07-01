import { Router } from 'express';
import { SettingsController } from '../controllers/settings.controller.js';
import { requireAuth, requireAdmin } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', SettingsController.getSettings);
router.put('/', requireAuth, requireAdmin, SettingsController.updateSettings);

export default router;
