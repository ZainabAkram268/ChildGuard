// backend/src/routes/progressReportRoutes.ts
import { Router } from 'express';
import { ProgressReportController } from '../controllers/reportcontroller';

const router = Router();

// Create a new progress report
router.post('/', ProgressReportController.create);


export default router;
