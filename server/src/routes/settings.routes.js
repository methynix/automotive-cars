import { Router } from 'express';
import { SettingsController } from '../controllers/settings.controller.js';
import { requireAdmin } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', SettingsController.getSettings);
router.put('/', requireAdmin, SettingsController.updateSettings);

export default router;
