"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = require("../lib/prisma");
const router = express_1.default.Router();
router.post("/login", async (req, res) => {
    const { username, password } = req.body;
    const user = await prisma_1.prisma.user.findUnique({ where: { username } });
    if (!user)
        return res.status(401).json({ error: "Invalid credentials" });
    const match = await bcryptjs_1.default.compare(password, user.password);
    if (!match)
        return res.status(401).json({ error: "Invalid credentials" });
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is missing in environment variables");
    }
    const token = jsonwebtoken_1.default.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ token });
});
exports.default = router;
