// backend/src/models/Report.ts
import { BaseModel } from './BaseModels';

const insert = BaseModel.db.prepare(`
  INSERT INTO reports (report_id, reporter_id, location, description, photo_url)
  VALUES (?, ?, ?, ?, ?)
`);

export class ReportModel extends BaseModel {
  static create(data: {
    reporter_id?: string;
    location: string;
    description: string;
    photo_url?: string;
  }) {
    const id = `RPT${Date.now()}`;
    insert.run(id, data.reporter_id ?? null, data.location, data.description, data.photo_url ?? null);
    return id;
  }
}