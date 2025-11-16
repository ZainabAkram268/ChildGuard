"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const DatabaseConnection_1 = require("../config/database/DatabaseConnection");
// Use an environment variable in a real app
const JWT_SECRET = "your_jwt_secret";
class AuthController {
    // -----------------------------------------
    // REGISTER
    // -----------------------------------------
    static register(req, res) {
        try {
            const db = DatabaseConnection_1.DatabaseConnection.getInstance();
            const { username, email, password, role, phone, address } = req.body;
            // Validate role
            const allowedRoles = ["parent", "sponsor", "volunteer", "admin", "case_reporter"];
            if (!allowedRoles.includes(role)) {
                return res.status(400).json({ error: "Invalid user role" });
            }
            // Check existing user (synchronous db.get)
            const existing = db.prepare("SELECT * FROM users WHERE email = ? OR username = ?").get(email, username);
            if (existing)
                return res.status(400).json({ error: "User already exists" });
            // Hash password
            const hash = bcryptjs_1.default.hashSync(password, 10);
            // Generate ID
            const user_id = `USR-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            // Use a transaction for the two inserts (users and role-specific table)
            const insertUserAndExtension = db.transaction(() => {
                // 1. Insert user
                db.prepare(`INSERT INTO users (user_id, username, email, password_hash, role)
                     VALUES (?, ?, ?, ?, ?)`).run(user_id, username, email, hash, role);
                // 2. Insert into the role-specific table (e.g., parents or sponsors)
                switch (role) {
                    case "parent":
                        db.prepare(`INSERT INTO parents (parent_id, phone, address)
                             VALUES (?, ?, ?)`).run(user_id, phone ?? null, address ?? null);
                        break;
                    case "sponsor":
                        const prefsJson = req.body.preferences ? JSON.stringify(req.body.preferences) : null;
                        db.prepare(`INSERT INTO sponsors (sponsor_id, phone, preferences)
                             VALUES (?, ?, ?)`).run(user_id, phone ?? null, prefsJson);
                        break;
                    default:
                        break;
                }
                // 3. Select the data needed for the JWT and response body
                return db.prepare("SELECT user_id, username, email, role FROM users WHERE user_id = ?")
                    .get(user_id); // <-- FIX: Explicit Type Cast here
            });
            // newUser is now explicitly typed as AuthResponseUser, fixing errors 1 and 2.
            const newUser = insertUserAndExtension();
            // JWT (uses user_id and role, which are now correctly typed)
            const token = jsonwebtoken_1.default.sign({ user_id: newUser.user_id, role: newUser.role }, JWT_SECRET, { expiresIn: "1h" });
            res.status(201).json({
                message: "Registration successful",
                user: newUser,
                token,
            });
        }
        catch (err) {
            console.error(err);
            res.status(500).json({ error: "Registration failed", details: "A database or internal error occurred." });
        }
    }
    // -----------------------------------------
    // LOGIN
    // -----------------------------------------
    static login(req, res) {
        try {
            const db = DatabaseConnection_1.DatabaseConnection.getInstance();
            const { email, password } = req.body;
            // Lookup user (synchronous db.get)
            // FIX: Explicit Type Cast for user as AuthDbUser or undefined
            const user = db.prepare(`SELECT * FROM users WHERE email = ?`)
                .get(email);
            if (!user)
                return res.status(400).json({ error: "User not found" });
            // Compare passwords (user.password_hash is now correctly typed, fixing error 3)
            const valid = bcryptjs_1.default.compareSync(password, user.password_hash);
            if (!valid)
                return res.status(400).json({ error: "Invalid password" });
            // JWT
            const token = jsonwebtoken_1.default.sign({ user_id: user.user_id, role: user.role }, // user.user_id and user.role are now correctly typed, fixing errors 4 and 5.
            JWT_SECRET, { expiresIn: "1h" });
            res.json({
                message: "Login successful",
                token,
                user: {
                    user_id: user.user_id, // Fixes error 6
                    username: user.username, // Fixes error 7
                    email: user.email, // Fixes error 8
                    role: user.role, // Fixes error 9
                }, // Final cast ensures the response object shape is correct
            });
        }
        catch (err) {
            console.error(err);
            res.status(500).json({ error: "Login failed", details: "A database or internal error occurred." });
        }
    }
}
exports.AuthController = AuthController;
