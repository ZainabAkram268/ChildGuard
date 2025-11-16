// backend/src/models/AwarenessContent.ts
import { BaseModel } from './BaseModels';
const insert = BaseModel.db.prepare(`
  INSERT INTO awareness_contents (content_id, admin_id, title, content, type, status)
  VALUES (?, ?, ?, ?, ?, 'published')
`);
export class AwarenessContentModel extends BaseModel {
    static publish(admin_id, title, content, type) {
        const id = `CNT${Date.now()}`;
        insert.run(id, admin_id, title, content, type);
        return id;
    }
}
