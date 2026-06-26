import { StorageService } from '../services/storage.service.js';
import { success } from '../utils/apiResponse.js';

export const UploadController = {
  async uploadImage(req, res, next) {
    try {
      const file = req.file; // This comes from 'multer' middleware
      if (!file) return res.status(400).json({ success: false, message: 'No file uploaded' });

      const manufacturer = req.body.manufacturer || 'general';
      const model = req.body.model || 'misc';
      const filename = `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;
      const path = `${manufacturer}/${model}/${filename}`;

      const publicUrl = await StorageService.uploadImage(path, file);

      return success(res, { url: publicUrl }, 201);
    } catch (err) {
      next(err);
    }
  }
};