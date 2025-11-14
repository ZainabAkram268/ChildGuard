import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

// Extend the Request object type to include the decoded user payload
interface AuthRequest extends Request {
    user?: { id: number; role: string };
}

// IMPORTANT: Must match the secret in server.ts and authController.ts
const JWT_SECRET = process.env.JWT_SECRET || 'your_strong_secret_key_here'; 

/**
 * Middleware to verify JWT token and protect routes.
 * It reads the 'Authorization' header, verifies the token, and attaches user data to req.user.
 */
export const protect = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        // Verify the token using the secret key
        const decoded = jwt.verify(token, JWT_SECRET) as { id: number; role: string; iat: number; exp: number };
        
        // Attach the decoded user payload (id and role) to the request
        req.user = { id: decoded.id, role: decoded.role };

        // Proceed to the next middleware or route handler
        next();
    } catch (err) {
        // Handle token expiration or invalid signature
        return res.status(401).json({ error: 'Access denied. Invalid or expired token.' });
    }
};