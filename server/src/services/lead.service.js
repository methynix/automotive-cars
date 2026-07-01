import prisma from '../config/prisma.js';

export const LeadService = {
  async create(payload) {
    if (payload.review_id) {
      const review = await prisma.review.findFirst({ where: { id: payload.review_id, deleted_at: null } });
      if (!review) throw Object.assign(new Error('Vehicle not found'), { status: 404 });
    }
    return prisma.lead.create({ data: payload });
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
