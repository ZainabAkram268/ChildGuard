"use strict";
// src/middleware/authMiddleware.ts (Conceptual file)
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Assuming JWT_SECRET is imported or defined here
const JWT_SECRET = 'your_jwt_secret';
// 3. The actual middleware function
const authMiddleware = (req, // Use the extended type here
res, next) => {
    // The 'headers' property is now correctly recognized from the Express Request base type.
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).json({ message: 'Authorization header missing' });
    }
    // Expecting "Bearer TOKEN"
    const [scheme, token] = authHeader.split(' ');
    if (scheme !== 'Bearer' || !token) {
        return res.status(401).json({ message: 'Token format is "Bearer [token]"' });
    }
    try {
        // Verify and decode the JWT
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        // Attach the decoded user data to the request object for downstream controllers
        req.user = decoded;
        next(); // Proceed to the next middleware or controller
    }
    catch (error) {
        return res.status(403).json({ message: 'Invalid or expired token' });
    }
};
exports.authMiddleware = authMiddleware;
