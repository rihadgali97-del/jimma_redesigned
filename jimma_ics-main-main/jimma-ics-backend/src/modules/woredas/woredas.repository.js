import { prisma } from '../../config/database.js';

export const woredasRepository = {
  async findMany({ skip, take }) {
    const [items, totalItems] = await Promise.all([
      prisma.woreda.findMany({ skip, take, orderBy: { code: 'asc' } }),
      prisma.woreda.count(),
    ]);
    return { items, totalItems };
  },

  findById(id) {
    return prisma.woreda.findUnique({ where: { id } });
  },

  findByCode(code) {
    return prisma.woreda.findUnique({ where: { code } });
  },

  create(data) {
    return prisma.woreda.create({ data });
  },
};