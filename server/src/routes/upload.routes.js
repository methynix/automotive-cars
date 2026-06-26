import express from 'express';
import multer from 'multer';
import { requireAdmin } from '../middlewares/auth.middleware.js';
import { UploadController } from '../controllers/upload.controller.js';

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) return cb(new Error('Only image uploads allowed'), false);
    return cb(null, true);
  }
});

/**
 * @openapi
 * /api/upload/image:
 *   post:
 *     tags: [Upload]
 *     summary: Upload an image
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *               manufacturer:
 *                 type: string
 *               model:
 *                 type: string
 *     responses:
 *       201:
 *         description: Image uploaded
 */
router.post('/api/upload/image', requireAdmin, upload.single('image'), UploadController.uploadImage);

export default router;
