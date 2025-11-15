// src/middleware/authMiddleware.ts (Conceptual file)

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
// Assuming JWT_SECRET is imported or defined here
const JWT_SECRET = 'your_jwt_secret'; 

// 1. Define the payload shape that your JWT carries
interface AuthPayload {
    user_id: string;
    role: string;
}

// 2. Extend the Express Request interface to include your custom property
export interface AuthRequest extends Request {
    // This allows you to attach user data after successful authentication
    user?: AuthPayload; 
}

// 3. The actual middleware function
export const authMiddleware = (
    req: AuthRequest, // Use the extended type here
    res: Response, 
    next: NextFunction
) => {
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
        const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload;

        // Attach the decoded user data to the request object for downstream controllers
        req.user = decoded; 

        next(); // Proceed to the next middleware or controller
    } catch (error) {
        return res.status(403).json({ message: 'Invalid or expired token' });
    }
};