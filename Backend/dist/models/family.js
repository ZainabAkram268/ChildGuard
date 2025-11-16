// backend/src/models/Family.ts
import { BaseModel } from './BaseModels';
const insert = BaseModel.db.prepare(`
  INSERT INTO families (
    family_id, parent_id, income, address,
    number_of_children, verification_status, support_status, created_at
  ) VALUES (?, ?, ?, ?, 0, 'pending', 'support_needed', datetime('now'))
`);
export class FamilyModel extends BaseModel {
    static create(data) {
        const id = `FAM${Date.now()}`;
        insert.run(id, data.parent_id, data.income, data.address);
        return BaseModel.db.prepare('SELECT * FROM families WHERE family_id = ?').get(id);
    }
}
