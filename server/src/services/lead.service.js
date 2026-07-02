import prisma from '../config/prisma.js';

export const LeadService = {
  async create(payload, profileId = null) {
    if (payload.review_id) {
      const review = await prisma.review.findFirst({ where: { id: payload.review_id, deleted_at: null } });
      if (!review) throw Object.assign(new Error('Vehicle not found'), { status: 404 });
    }

    // Newsletter-style signups (no vehicle attached) are deduped by email so the
    // same address can't subscribe twice. Vehicle enquiries are NOT deduped — a
    // customer may legitimately enquire about several cars from the same email.
    if (!payload.review_id) {
      const existing = await prisma.lead.findFirst({ where: { email: payload.email, review_id: null } });
      if (existing) {
        throw Object.assign(new Error('You are already subscribed'), { status: 409 });
      }
    }

    return prisma.lead.create({ data: { ...payload, profile_id: profileId } });
  },
  async adminGetAll({ page = 1, limit = 20, status } = {}) {
    const skip = (page - 1) * limit;
    const where = { ...(status && { status }) };
    const [data, total] = await Promise.all([
      prisma.lead.findMany({
        where, orderBy: { created_at: 'desc' }, skip, take: limit,
        include: { review: { select: { title: true, slug: true, manufacturer: true, model: true } } },
      }),
      prisma.lead.count({ where }),
    ]);
    return { data, total, page, limit };
  },
  async update(id, data) {
    return prisma.lead.update({ where: { id }, data });
  },
  async remove(id) {
    await prisma.lead.delete({ where: { id } });
    return { id };
  },
};
