// backend/src/models/ChildProfile.ts
import { BaseModel } from './BaseModels';
const insert = BaseModel.db.prepare(`
  INSERT INTO child_profiles (child_id, family_id, name, age, gender, needs)
  VALUES (?, ?, ?, ?, ?, ?)
`);
export class ChildProfileModel extends BaseModel {
    static create(data) {
        const id = `CHD${Date.now()}`;
        insert.run(id, data.family_id, data.name, data.age, data.gender, data.needs ? JSON.stringify(data.needs) : null);
        return id;
    }
}
