import prisma from '../config/prisma.js';

export const BrandService = {
  async list() {
    return prisma.brand.findMany({ orderBy: { name: 'asc' } });
  },
  async create(data) {
    return prisma.brand.create({ data });
  },
  async update(id, data) {
    return prisma.brand.update({ where: { id }, data });
  },
  async remove(id) {
    await prisma.brand.delete({ where: { id } });
    return { id };
  },
};
