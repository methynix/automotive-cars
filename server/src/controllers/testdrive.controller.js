import { TestDriveService } from '../services/testdrive.service.js';
import { success } from '../utils/apiResponse.js';

export const TestDriveController = {
  // Public booking — optionalAuth may set req.user for logged-in customers.
  async create(req, res, next) {
    try {
      const profileId = req.user?.id || null;
      return success(res, await TestDriveService.create(req.body, profileId), 201);
    } catch (err) { next(err); }
  },

  // Admin (staff)
  async adminList(req, res, next) {
    try {
      const { page, limit, status } = req.query;
      const result = await TestDriveService.adminGetAll({ page: parseInt(page) || 1, limit: parseInt(limit) || 20, status });
      return success(res, result.data, 200, { page: result.page, limit: result.limit, total: result.total });
    } catch (err) { next(err); }
  },
  async update(req, res, next) {
    try { return success(res, await TestDriveService.update(req.params.id, req.body)); } catch (err) { next(err); }
  },
};
