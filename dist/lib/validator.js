"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrderSchema = exports.createOrderSchema = void 0;
const zod_1 = require("zod");
exports.createOrderSchema = zod_1.z.object({
    orderNo: zod_1.z.string().min(1),
    customerName: zod_1.z.string().min(1),
    status: zod_1.z.string(),
    amount: zod_1.z.number().positive(),
});
exports.updateOrderSchema = zod_1.z.object({
    customerName: zod_1.z.string().optional(),
    status: zod_1.z.string().optional(),
    amount: zod_1.z.number().positive().optional(),
});
