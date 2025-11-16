// backend/src/models/CaseReporter.ts
import { BaseModel } from './BaseModels';

const insertReporter = BaseModel.db.prepare(`
  INSERT INTO case_reporters (reporter_id, user_id, phone, is_anonymous)
  VALUES (?, ?, ?, ?)
`);

export class CaseReporterModel extends BaseModel {
  static create(data: {
    user_id?: string;
    phone?: string;
    is_anonymous?: boolean;
  }) {
    const id = `REP${Date.now()}`;
    insertReporter.run(
      id,
      data.user_id ?? null,
      data.phone ?? null,
      data.is_anonymous ? 1 : 0
    );
    return id;
  }
}