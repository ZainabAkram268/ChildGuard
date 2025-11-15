// backend/src/controllers/ProgressReportController.ts
import { Request, Response } from 'express';
import { ProgressReportModel } from '../models/progressreport'; // Fixed import path
import { NotificationModel } from '../models/notification';     // Fixed import path

export class ProgressReportController {
  static create(req: Request, res: Response) {
    const { child_id, report_date, grades, attendance } = req.body;

    if (!child_id || !report_date) {
      return res.status(400).json({ error: 'child_id and report_date are required' });
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(report_date)) {
      return res.status(400).json({ error: 'report_date must be YYYY-MM-DD' });
    }

    if (attendance != null && (isNaN(attendance) || attendance < 0 || attendance > 100)) {
      return res.status(400).json({ error: 'attendance must be 0–100' });
    }

    try {
      const progressId = ProgressReportModel.create(child_id, {
        report_date,
        grades: grades ?? null,
        attendance: attendance != null ? Number(attendance) : null  // Fixed: null is safe
      });

      const db = (req.app as any).db;
      const admin = db.prepare(`SELECT user_id FROM users WHERE role = 'admin'`).get();
      if (admin) {
        NotificationModel.create({
          user_id: admin.user_id,
          message: `New progress report for child ${child_id}`,
          type: 'progress'
        });
      }

      return res.status(201).json({
        progress_report_id: progressId,
        message: 'Progress report created'
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to create report' });
    }
  }
}