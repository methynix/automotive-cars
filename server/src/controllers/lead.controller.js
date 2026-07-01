import { LeadService } from '../services/lead.service.js';
import { success } from '../utils/apiResponse.js';

export const LeadController = {
  async create(req, res, next) {
    try { return success(res, await LeadService.create(req.body), 201); } catch (err) { next(err); }
  },
  async adminList(req, res, next) {
    try {
      const { page, limit, status } = req.query;
      const result = await LeadService.adminGetAll({ page: parseInt(page) || 1, limit: parseInt(limit) || 20, status });
      return success(res, result.data, 200, { page: result.page, limit: result.limit, total: result.total });
    } catch (err) { next(err); }
  },
  async update(req, res, next) {
    try { return success(res, await LeadService.update(req.params.id, req.body)); } catch (err) { next(err); }
  },
  async remove(req, res, next) {
    try { return success(res, await LeadService.remove(req.params.id)); } catch (err) { next(err); }
  },
};
