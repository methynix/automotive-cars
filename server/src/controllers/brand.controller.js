import { BrandService } from '../services/brand.service.js';
import { success } from '../utils/apiResponse.js';

export const BrandController = {
  async list(req, res, next) {
    try { return success(res, await BrandService.list()); } catch (err) { next(err); }
  },
  async create(req, res, next) {
    try { return success(res, await BrandService.create(req.body), 201); } catch (err) { next(err); }
  },
  async update(req, res, next) {
    try { return success(res, await BrandService.update(req.params.id, req.body)); } catch (err) { next(err); }
  },
  async remove(req, res, next) {
    try { return success(res, await BrandService.remove(req.params.id)); } catch (err) { next(err); }
  },
};
