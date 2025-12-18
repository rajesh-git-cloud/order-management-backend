"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ordersController_1 = require("../controllers/ordersController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
router.get("/", authMiddleware_1.authMiddleware, ordersController_1.listOrders);
router.post("/", authMiddleware_1.authMiddleware, ordersController_1.createOrder);
router.put("/:id", authMiddleware_1.authMiddleware, ordersController_1.updateOrder);
router.delete("/:id", authMiddleware_1.authMiddleware, ordersController_1.deleteOrder);
router.get("/next-order-no", authMiddleware_1.authMiddleware, ordersController_1.getNextOrderNo);
exports.default = router;
