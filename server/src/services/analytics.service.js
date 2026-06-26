import prisma from '../config/prisma.js';

export const AnalyticsService = {
  async overview() {
    const [totalReviews, published, drafts, totalComments, pendingComments,
      totalLeads, newLeads, totalBrands, totalUsers, viewsAgg, ratingAgg, topReviews] = await Promise.all([
      prisma.review.count({ where: { deleted_at: null } }),
      prisma.review.count({ where: { deleted_at: null, status: 'published' } }),
      prisma.review.count({ where: { deleted_at: null, status: 'draft' } }),
      prisma.comment.count(),
      prisma.comment.count({ where: { status: 'pending' } }),
      prisma.lead.count(),
      prisma.lead.count({ where: { status: 'new' } }),
      prisma.brand.count(),
      prisma.profile.count(),
      prisma.review.aggregate({ _sum: { views: true }, where: { deleted_at: null } }),
      prisma.review.aggregate({ _avg: { rating: true }, where: { deleted_at: null, status: 'published' } }),
      prisma.review.findMany({
        where: { deleted_at: null, status: 'published' },
        orderBy: { views: 'desc' }, take: 7,
        select: { title: true, model: true, manufacturer: true, views: true, slug: true },
      }),
    ]);

    return {
      totals: {
        reviews: totalReviews, published, drafts,
        comments: totalComments, pendingComments,
        leads: totalLeads, newLeads,
        brands: totalBrands, users: totalUsers,
        views: viewsAgg._sum.views || 0,
        avgRating: ratingAgg._avg.rating ? Number(ratingAgg._avg.rating.toFixed(1)) : 0,
      },
      // Real "views by top vehicle" series for the dashboard chart (no fake numbers).
      topReviews: topReviews.map((r) => ({ name: r.model || r.manufacturer, views: r.views, slug: r.slug })),
    };
  },
};
