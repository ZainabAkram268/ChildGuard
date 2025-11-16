// backend/src/models/VerificationVisit.ts
import { BaseModel } from './BaseModels';

const insert = BaseModel.db.prepare(`
  INSERT INTO verification_visits (visit_id, volunteer_id, target_id, target_type)
  VALUES (?, ?, ?, ?)
`);

export class VerificationVisitModel extends BaseModel {
  static assign(volunteer_id: string, target_id: string, type: 'application' | 'report') {
    const id = `VIS${Date.now()}`;
    insert.run(id, volunteer_id, target_id, type);
    return id;
  }
}