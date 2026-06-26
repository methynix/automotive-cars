import { ReviewService } from '../services/review.service.js';
import { success } from '../utils/apiResponse.js';

export const ReviewController = {
  async listPublic(req, res, next) {
    try {
      const { page, limit, sort, search, manufacturer, bodyStyle, condition, drivetrain,
        minYear, maxYear, minRating, minPrice, maxPrice, minMileage, maxMileage, featured } = req.query;
      const result = await ReviewService.getPublishedReviews({
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
        sort, search, manufacturer, bodyStyle, condition, drivetrain,
        minYear, maxYear, minRating, minPrice, maxPrice, minMileage, maxMileage, featured,
      });
      return success(res, result.data, 200, { page: result.page, limit: result.limit, total: result.total });
    } catch (err) { next(err); }
  },

  async getBySlug(req, res, next) {
    try {
      const data = await ReviewService.getReviewBySlug(req.params.slug);
      if (!data) return res.status(404).json({ success: false, message: 'Review not found' });
      return success(res, data);
    } catch (err) { next(err); }
  },

  async listFeatured(req, res, next) {
    try {
      const result = await ReviewService.getFeaturedReviews({
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
      });
      return success(res, result.data, 200, { page: result.page, limit: result.limit, total: result.total });
    } catch (err) { next(err); }
  },

  async create(req, res, next) {
    try {
      const payload = { ...req.body, created_by: req.user.id };
      // Operators can only create drafts — publishing is an admin action.
      if (req.user.role !== 'admin') {
        payload.status = 'draft';
        payload.featured = false;
      }
      const data = await ReviewService.createReview(payload);
      return success(res, data, 201);
    } catch (err) { next(err); }
  },

  async update(req, res, next) {
    try {
      const payload = { ...req.body };
      // Operators may edit content but cannot publish or feature a vehicle.
      if (req.user.role !== 'admin') {
        delete payload.status;
        delete payload.featured;
      }
      const data = await ReviewService.updateReview(req.params.id, payload);
      return success(res, data);
    } catch (err) { next(err); }
  },

  async setPublish(req, res, next) {
    try {
      const data = await ReviewService.setPublishStatus(req.params.id, req.body.status);
      return success(res, data);
    } catch (err) { next(err); }
  },

  async remove(req, res, next) {
    try {
      const data = await ReviewService.softDeleteReview(req.params.id);
      return success(res, data);
    } catch (err) { next(err); }
  },

  async restore(req, res, next) {
    try {
      const data = await ReviewService.restoreReview(req.params.id);
      return success(res, data);
    } catch (err) { next(err); }
  },

  async adminList(req, res, next) {
    try {
      const { page, limit, status, search, includeDeleted } = req.query;
      const result = await ReviewService.adminGetAll({
        page: parseInt(page) || 1, limit: parseInt(limit) || 20,
        status, search, includeDeleted: includeDeleted === 'true',
      });
      return success(res, result.data, 200, { page: result.page, limit: result.limit, total: result.total });
    } catch (err) { next(err); }
  },
};
