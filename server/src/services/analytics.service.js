import prisma from '../config/prisma.js';

export const AnalyticsService = {
  async overview(range = 'all') {
    let dateFilter = {};
    if (range === '7d') {
      const d = new Date(); d.setDate(d.getDate() - 7);
      dateFilter = { created_at: { gte: d } };
    } else if (range === '30d') {
      const d = new Date(); d.setDate(d.getDate() - 30);
      dateFilter = { created_at: { gte: d } };
    }

    const [totalReviews, published, drafts, totalComments, pendingComments,
      totalLeads, newLeads, totalBrands, totalUsers, viewsAgg, ratingAgg, topReviews,
      recentReviews, recentComments, recentLeads] = await Promise.all([
      prisma.review.count({ where: { deleted_at: null, ...dateFilter } }),
      prisma.review.count({ where: { deleted_at: null, status: 'published', ...dateFilter } }),
      prisma.review.count({ where: { deleted_at: null, status: 'draft', ...dateFilter } }),
      prisma.comment.count({ where: { ...dateFilter } }),
      prisma.comment.count({ where: { status: 'pending', ...dateFilter } }),
      prisma.lead.count({ where: { ...dateFilter } }),
      prisma.lead.count({ where: { status: 'new', ...dateFilter } }),
      prisma.brand.count({ where: { ...dateFilter } }),
      prisma.profile.count({ where: { ...dateFilter } }),
      prisma.review.aggregate({ _sum: { views: true }, where: { deleted_at: null, ...dateFilter } }),
      prisma.review.aggregate({ _avg: { rating: true }, where: { deleted_at: null, status: 'published', ...dateFilter } }),
      prisma.review.findMany({
        where: { deleted_at: null, status: 'published', ...dateFilter },
        orderBy: { views: 'desc' }, take: 7,
        select: { title: true, model: true, manufacturer: true, views: true, slug: true },
      }),
      prisma.review.findMany({ where: { deleted_at: null }, orderBy: { created_at: 'desc' }, take: 5, select: { id: true, created_at: true, model: true, manufacturer: true, status: true, profile: { select: { email: true, full_name: true } } } }),
      prisma.comment.findMany({ orderBy: { created_at: 'desc' }, take: 5, select: { id: true, created_at: true, author_name: true, status: true, review: { select: { manufacturer: true, model: true } } } }),
      prisma.lead.findMany({ orderBy: { created_at: 'desc' }, take: 5, select: { id: true, created_at: true, full_name: true, status: true, review: { select: { manufacturer: true, model: true } } } }),
    ]);

    const activity = [
      ...recentReviews.map(r => ({ id: r.id, type: 'review', date: r.created_at, msg: `${r.profile?.full_name || r.profile?.email || 'Admin'} ${r.status === 'published' ? 'published' : 'drafted'} ${r.manufacturer} ${r.model}` })),
      ...recentComments.map(c => ({ id: c.id, type: 'comment', date: c.created_at, msg: `New ${c.status} comment from ${c.author_name} on ${c.review?.manufacturer} ${c.review?.model}` })),
      ...recentLeads.map(l => ({ id: l.id, type: 'lead', date: l.created_at, msg: `New lead from ${l.full_name} for ${l.review ? l.review.manufacturer + ' ' + l.review.model : 'general inquiry'}` }))
    ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 10);

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
      recentActivity: activity,
    };
  },
};
