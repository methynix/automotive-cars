import prisma from '../config/prisma.js';

const publicSelect = { id: true, email: true, full_name: true, role: true, status: true, created_at: true };

export const UserService = {
  async list({ page = 1, limit = 50, search } = {}) {
    const skip = (page - 1) * limit;
    const where = {
      ...(search && {
        OR: [
          { email: { contains: search, mode: 'insensitive' } },
          { full_name: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };
    const [data, total] = await Promise.all([
      prisma.profile.findMany({ where, orderBy: { created_at: 'desc' }, skip, take: limit, select: publicSelect }),
      prisma.profile.count({ where }),
    ]);
    return { data, total, page, limit };
  },
  async update(id, data) {
    return prisma.profile.update({ where: { id }, data, select: publicSelect });
  },
  async remove(id, currentUserId) {
    if (id === currentUserId) throw Object.assign(new Error('You cannot delete your own account'), { status: 400 });
    await prisma.profile.delete({ where: { id } });
    return { id };
  },
};
