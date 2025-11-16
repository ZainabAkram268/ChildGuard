// src/routes/index.ts
import { Router } from 'express';
const router = Router();
// Define a simple GET route for the root path '/'
router.get('/', (req, res) => {
    res.json({
        message: "Welcome to the ChildGuard API!",
        status: "Running",
        version: "1.0",
        endpoints: {
            register: "/api/auth/register",
            login: "/api/auth/login",
            // ... list other primary endpoints
        }
    });
});
export default router;
