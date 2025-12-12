import { z } from 'zod';

export const createOrderSchema = z.object({
  orderNo: z.string().min(1),
  customerName: z.string().min(1),
  status: z.string(),
  amount: z.number().positive(),
});

export const updateOrderSchema = z.object({
  customerName: z.string().optional(),
  status: z.string().optional(),
  amount: z.number().positive().optional(),
});
