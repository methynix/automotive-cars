import prisma from '../config/prisma.js';

export const CommentService = {
  async getCommentsByReview(reviewId, userId, { page = 1, limit = 20 } = {}) {
    const skip = (page - 1) * limit;
    const where = { review_id: reviewId, status: 'approved', parent_id: null };

    const [data, total] = await Promise.all([
      prisma.comment.findMany({
        where,
        orderBy: { created_at: 'asc' },
        skip,
        take: limit,
        include: {
          _count: { select: { likes: true } },
          ...(userId && { likes: { where: { profile_id: userId } } }),
          replies: {
            where: { status: 'approved' },
            orderBy: { created_at: 'asc' },
            include: {
              _count: { select: { likes: true } },
              ...(userId && { likes: { where: { profile_id: userId } } })
            }
          }
        }
      }),
      prisma.comment.count({ where })
    ]);
    return { data, total, page, limit };
  },

  async createComment(reviewId, payload) {
    const review = await prisma.review.findFirst({
      where: { id: reviewId, deleted_at: null }
    });

    if (!review) throw Object.assign(new Error('Review not found'), { status: 404 });

    const data = await prisma.comment.create({
      data: { ...payload, review_id: reviewId }
    });
    return data;
  },

  async adminGetAll({ page = 1, limit = 20, status } = {}) {
    const skip = (page - 1) * limit;
    const where = { ...(status && { status }) };

    const [data, total] = await Promise.all([
      prisma.comment.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
        include: { review: { select: { title: true, slug: true } } }
      }),
      prisma.comment.count({ where })
    ]);
    return { data, total, page, limit };
  },

  async moderateComment(id, status) {
    const data = await prisma.comment.update({
      where: { id },
      data: { status }
    });
    return data;
  },

  async deleteComment(id) {
    await prisma.comment.delete({ where: { id } });
    return { id };
  },

  async toggleLike(commentId, userId) {
    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) throw Object.assign(new Error('Comment not found'), { status: 404 });

    const existing = await prisma.commentLike.findUnique({
      where: { comment_id_profile_id: { comment_id: commentId, profile_id: userId } }
    });

    if (existing) {
      await prisma.commentLike.delete({ where: { id: existing.id } });
      return { action: 'unliked' };
    } else {
      await prisma.commentLike.create({
        data: { comment_id: commentId, profile_id: userId }
      });
      return { action: 'liked' };
    }
  }
};
