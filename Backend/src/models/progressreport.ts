// backend/src/models/ProgressReport.ts
import { BaseModel } from './BaseModels';

const insert = BaseModel.db.prepare(`
  INSERT INTO progress_reports (report_id, child_id, report_date, grades, attendance)
  VALUES (?, ?, ?, ?, ?)
`);

export class ProgressReportModel extends BaseModel {
  static create(
    child_id: string,
    data: {
      report_date: string;
      grades?: string | null;     // allow null
      attendance?: number | null; // allow null (matches ?? null)
    }
  ) {
    const id = `PRG${Date.now()}`;
    insert.run(
      id,
      child_id,
      data.report_date,
      data.grades ?? null,
      data.attendance ?? null  // now type-safe
    );
    return id;
  }
}