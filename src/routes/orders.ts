import express from 'express';
import { listOrders, createOrder, updateOrder, deleteOrder, getNextOrderNo } from '../controllers/ordersController';
import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/", authMiddleware, listOrders);
router.post("/", authMiddleware, createOrder);
router.put("/:id", authMiddleware, updateOrder);
router.delete("/:id", authMiddleware, deleteOrder);
router.get("/next-order-no", authMiddleware, getNextOrderNo);

export default router;