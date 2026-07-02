import { CommentService } from '../services/comment.service.js';
import { success, error as apiError } from '../utils/apiResponse.js';

export const CommentController = {
  async listByReview(req, res, next) {
    try {
      const { id } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const userId = req.user?.id;
      const result = await CommentService.getCommentsByReview(id, userId, { page, limit });
      return success(res, result.data, 200, { page: result.page, limit: result.limit, total: result.total });
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      const { id } = req.params;
      const payload = req.body;
      const data = await CommentService.createComment(id, payload);
      return success(res, data, 201);
    } catch (err) {
      next(err);
    }
  },

  async toggleLike(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const data = await CommentService.toggleLike(id, userId);
      return success(res, data, 200);
    } catch (err) {
      next(err);
    }
  },

  async adminList(req, res, next) {
    try {
      const { page, limit, status } = req.query;
      const result = await CommentService.adminGetAll({
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
        status
      });
      return success(res, result.data, 200, { page: result.page, limit: result.limit, total: result.total });
    } catch (err) {
      next(err);
    }
  },

  async moderate(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const data = await CommentService.moderateComment(id, status);
      return success(res, data);
    } catch (err) {
      next(err);
    }
  },

  async remove(req, res, next) {
    try {
      const { id } = req.params;
      const data = await CommentService.deleteComment(id);
      return success(res, data);
    } catch (err) {
      next(err);
    }
  }
};
