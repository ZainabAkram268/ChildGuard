"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = void 0;
const database_1 = require("../config/database");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_here";
const login = async (req, res) => {
    try {
        const db = await (0, database_1.openDb)();
        const { email, password } = req.body;
        const user = await db.get("SELECT * FROM users WHERE email = ?", [email]);
        if (!user)
            return res.status(400).json({ error: "User not found" });
        const valid = await bcryptjs_1.default.compare(password, user.password);
        if (!valid)
            return res.status(400).json({ error: "Invalid password" });
        const token = jsonwebtoken_1.default.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "1h" });
        res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
    }
    catch (err) {
        res.status(500).json({ error: "Login failed", details: err });
    }
};
exports.login = login;
