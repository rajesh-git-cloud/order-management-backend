import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import redis from "../lib/redis";
import { Prisma } from "@prisma/client";
import { createOrderSchema, updateOrderSchema } from "../lib/validator";

async function invalidateOrderCaches() {
  if (!redis) return;
  const keys = await redis.keys("orders:*");
  if (keys.length) await redis.del(...keys);
}

export async function listOrders(req: Request, res: Response) {
  try {
    const page = Number(req.query.page || 1);
    const pageSize = Number(req.query.pageSize || 10);

    const search = (req.query.search as string)?.trim() || "";
    const customerName = (req.query.customerName as string)?.trim() || "";
    
    let statuses: string[] = [];
    if (req.query['status[]']) {
      statuses = Array.isArray(req.query['status[]'])
        ? (req.query['status[]'] as string[])
        : [(req.query['status[]'] as string)];
    }

    const sortBy = (req.query.sortBy as string) || "createdAt";
    const sortDirection = req.query.sortDirection === "asc" ? "asc" : "desc";

    const filters: any = {};

    // Global search
    if (search) {
      filters.OR = [
        { orderNo: { contains: search, mode: "insensitive" } },
        { customerName: { contains: search, mode: "insensitive" } },
      ];
    }

    // Status filter (multi-select)
    if (statuses.length > 0) {
      filters.status = { in: statuses };
    }

    // Customer filter
    if (customerName) {
      if (!filters.OR) {
        filters.customerName = { contains: customerName, mode: "insensitive" };
      } else {
        filters.OR.push({ customerName: { contains: customerName, mode: "insensitive" } });
      }
    }

    const total = await prisma.order.count({ where: filters });
    const items = await prisma.order.findMany({
      where: filters,
      orderBy: { [sortBy]: sortDirection },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    res.json({ total, page, pageSize, items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
}

export async function createOrder(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const parsed = createOrderSchema.parse(req.body);

    const order = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        const newOrder = await tx.order.create({ data: parsed });

        await tx.auditLog.create({
          data: {
            orderId: newOrder.id,
            action: "CREATE",
            actor: "system",
            after: newOrder as any,
          },
        });

        return newOrder;
      }
    );

    await invalidateOrderCaches();
    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
}

export async function updateOrder(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = Number(req.params.id);
    const data = updateOrderSchema.parse(req.body);

    const order = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        const before = await tx.order.findUnique({ where: { id } });

        if (!before) {
          return res.status(404).json({ error: "Order not found" });
        }

        const after = await tx.order.update({ where: { id }, data });

        await tx.auditLog.create({
          data: {
            orderId: id,
            action: "UPDATE",
            actor: "system",
            before,
            after,
          },
        });

        return after;
      }
    );

    await invalidateOrderCaches();
    res.json(order);
  } catch (err) {
    next(err);
  }
}

export async function deleteOrder(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = Number(req.params.id);

    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const before = await tx.order.findUnique({ where: { id } });
      if (!before) {
        return res.status(404).json({ error: "Order not found" });
      }

      await tx.auditLog.create({
        data: {
          orderId: id,
          action: "DELETE",
          actor: "system",
          before,
        },
      });

      await tx.order.delete({ where: { id } });
    });

    await invalidateOrderCaches();
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
