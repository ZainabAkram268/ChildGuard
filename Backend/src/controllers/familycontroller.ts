// backend/src/controllers/familyController.ts
import { Request, Response } from 'express';
import { FamilyModel } from '../models/family'; // Fixed import path

export class FamilyController {
  static enroll(req: Request, res: Response) {
    const { parent_id, income, address, children } = req.body;

    // Only pass what FamilyModel.create() accepts
    const family = FamilyModel.create({
      parent_id,
      income,
      address
    });

    // You can update status later if needed
    const db = (req.app as any).db;
    db.prepare(`
      UPDATE families 
      SET support_status = 'support_needed' 
      WHERE family_id = ?
    `).run(family.family_id);

    res.json({ 
      family_id: family.family_id, 
      message: 'Family enrolled successfully' 
    });
  }
}