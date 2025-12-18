"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNextOrderNo = void 0;
exports.listOrders = listOrders;
exports.createOrder = createOrder;
exports.updateOrder = updateOrder;
exports.deleteOrder = deleteOrder;
const prisma_1 = require("../lib/prisma");
const redis_1 = __importDefault(require("../lib/redis"));
const client_1 = require("@prisma/client");
const validator_1 = require("../lib/validator");
function isUniqueConstraintError(err, field) {
    return (err instanceof client_1.Prisma.PrismaClientKnownRequestError &&
        err.code === "P2002" &&
        Array.isArray(err.meta?.target) &&
        err.meta.target.includes(field));
}
async function invalidateOrderCaches() {
    if (!redis_1.default)
        return;
    const keys = await redis_1.default.keys("orders:*");
    if (keys.length)
        await redis_1.default.del(...keys);
}
async function listOrders(req, res) {
    try {
        const page = Number(req.query.page || 1);
        const pageSize = Number(req.query.pageSize || 10);
        const search = req.query.search?.trim() || "";
        const customerName = req.query.customerName?.trim() || "";
        let statuses = [];
        if (req.query['status[]']) {
            statuses = Array.isArray(req.query['status[]'])
                ? req.query['status[]']
                : [req.query['status[]']];
        }
        const sortBy = req.query.sortBy || "createdAt";
        const sortDirection = req.query.sortDirection === "asc" ? "asc" : "desc";
        const filters = {};
        // if (search) {
        //   filters.OR = [
        //     { orderNo: { contains: search, mode: "insensitive" } },
        //     { customerName: { contains: search, mode: "insensitive" } },
        //   ];
        // }
        if (search) {
            filters.OR = [
                { orderNo: { contains: search, mode: "insensitive" } },
                { customerName: { contains: search, mode: "insensitive" } },
                { status: { contains: search, mode: "insensitive" } },
                { amount: !isNaN(Number(search)) ? { equals: Number(search) } : undefined },
            ].filter(Boolean);
        }
        if (statuses.length > 0) {
            filters.status = { in: statuses };
        }
        if (customerName) {
            if (!filters.OR) {
                filters.customerName = { contains: customerName, mode: "insensitive" };
            }
            else {
                filters.OR.push({ customerName: { contains: customerName, mode: "insensitive" } });
            }
        }
        const total = await prisma_1.prisma.order.count({ where: filters });
        const items = await prisma_1.prisma.order.findMany({
            where: filters,
            orderBy: { [sortBy]: sortDirection },
            skip: (page - 1) * pageSize,
            take: pageSize,
        });
        res.json({ total, page, pageSize, items });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch orders" });
    }
}
async function createOrder(req, res, next) {
    try {
        const parsed = validator_1.createOrderSchema.parse(req.body);
        const order = await prisma_1.prisma.$transaction(async (tx) => {
            const newOrder = await tx.order.create({ data: parsed });
            await tx.auditLog.create({
                data: {
                    orderId: newOrder.id,
                    action: "CREATE",
                    actor: "system",
                    after: newOrder,
                },
            });
            return newOrder;
        });
        await invalidateOrderCaches();
        res.status(201).json(order);
    }
    catch (err) {
        if (isUniqueConstraintError(err, "orderNo")) {
            return res.status(409).json({
                message: "Order number already exists",
            });
        }
        next(err);
    }
}
async function updateOrder(req, res, next) {
    try {
        const id = Number(req.params.id);
        const data = validator_1.updateOrderSchema.parse(req.body);
        const order = await prisma_1.prisma.$transaction(async (tx) => {
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
        });
        await invalidateOrderCaches();
        res.json(order);
    }
    catch (err) {
        if (isUniqueConstraintError(err, "orderNo")) {
            return res.status(409).json({
                message: "Order number already exists",
            });
        }
        next(err);
    }
}
async function deleteOrder(req, res, next) {
    try {
        const id = Number(req.params.id);
        await prisma_1.prisma.$transaction(async (tx) => {
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
    }
    catch (err) {
        next(err);
    }
}
const getNextOrderNo = async (req, res) => {
    try {
        const lastOrder = await prisma_1.prisma.order.findFirst({
            orderBy: { id: "desc" },
        });
        const lastNo = lastOrder?.orderNo || "ORD-1000";
        const nextNumber = parseInt(lastNo.split("-")[1]) + 1;
        const nextOrderNo = `ORD-${nextNumber}`;
        res.json({ orderNo: nextOrderNo });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to get next order number" });
    }
};
exports.getNextOrderNo = getNextOrderNo;
