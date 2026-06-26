import { UserService } from '../services/user.service.js';
import { success } from '../utils/apiResponse.js';

export const UserController = {
  async list(req, res, next) {
    try {
      const { page, limit, search } = req.query;
      const result = await UserService.list({ page: parseInt(page) || 1, limit: parseInt(limit) || 50, search });
      return success(res, result.data, 200, { page: result.page, limit: result.limit, total: result.total });
    } catch (err) { next(err); }
  },
  async update(req, res, next) {
    try { return success(res, await UserService.update(req.params.id, req.body)); } catch (err) { next(err); }
  },
  async remove(req, res, next) {
    try { return success(res, await UserService.remove(req.params.id, req.user.id)); } catch (err) { next(err); }
  },
};
