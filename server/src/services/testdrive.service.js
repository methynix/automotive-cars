import prisma from '../config/prisma.js';

const reviewSummary = { select: { title: true, slug: true, manufacturer: true, model: true, featured_image: true } };

export const TestDriveService = {
  // Booking is public: profileId is attached only when the visitor is logged in.
  async create(payload, profileId = null) {
    if (payload.review_id) {
      const review = await prisma.review.findFirst({ where: { id: payload.review_id, deleted_at: null } });
      if (!review) throw Object.assign(new Error('Vehicle not found'), { status: 404 });
    }
    return prisma.testDrive.create({
      data: { ...payload, profile_id: profileId },
    });
  },

  // A customer's own appointments.
  async getByProfile(profileId) {
    return prisma.testDrive.findMany({
      where: { profile_id: profileId },
      orderBy: { preferred_date: 'desc' },
      include: { review: reviewSummary },
    });
  },

  async adminGetAll({ page = 1, limit = 20, status } = {}) {
    const skip = (page - 1) * limit;
    const where = { ...(status && { status }) };
    const [data, total] = await Promise.all([
      prisma.testDrive.findMany({
        where, orderBy: { created_at: 'desc' }, skip, take: limit,
        include: { review: reviewSummary },
      }),
      prisma.testDrive.count({ where }),
    ]);
    return { data, total, page, limit };
  },

  async update(id, data) {
    return prisma.testDrive.update({ where: { id }, data });
  },
};
