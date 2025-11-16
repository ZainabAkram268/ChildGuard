// backend/src/models/Application.ts
import { BaseModel } from './BaseModels';

const insert = BaseModel.db.prepare(`
  INSERT INTO applications (application_id, child_id, sponsor_id, status)
  VALUES (?, ?, ?, 'pending')
`);

const updateStatus = BaseModel.db.prepare(`
  UPDATE applications SET status = ?, sponsor_id = ? WHERE application_id = ?
`);

export class ApplicationModel extends BaseModel {
  static create(child_id: string, sponsor_id?: string) {
    const id = `APP${Date.now()}`;
    insert.run(id, child_id, sponsor_id ?? null);
    return id;
  }

  static updateStatus(id: string, status: string, sponsor_id?: string) {
    updateStatus.run(status, sponsor_id ?? null, id);
  }
}