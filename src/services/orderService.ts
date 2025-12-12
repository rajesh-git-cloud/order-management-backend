import { prisma } from '../lib/prisma';

export type OrdersQuery = {
  page?: number;
  pageSize?: number;
  search?: string;
  statuses?: string[];
  customerName?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
};

export async function getOrders(q: OrdersQuery) {
  const page = Math.max(1, q.page || 1);
  const pageSize = Math.min(100, q.pageSize || 10);

  const where: any = {};

  if (q.search) {
    const s = q.search.trim();
    where.OR = [
      { orderNo: { contains: s, mode: 'insensitive' } },
      { customerName: { contains: s, mode: 'insensitive' } },
    ];
  }

  if (q.customerName) {
    where.customerName = { contains: q.customerName, mode: 'insensitive' };
  }

  if (q.statuses && q.statuses.length > 0) {
    where.status = { in: q.statuses };
  }

  const orderBy: any = {};
  if (q.sortBy) {
    orderBy[q.sortBy] = q.sortDirection || 'asc';
  } else {
    orderBy.createdAt = 'desc';
  }

  const [total, items] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy,
    }),
  ]);

  return { total, page, pageSize, items };
}
