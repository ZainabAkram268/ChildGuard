// backend/src/models/FeeChallan.ts
import { BaseModel } from './BaseModels';
const insert = BaseModel.db.prepare(`
  INSERT INTO fee_challans (challan_id, application_id, amount, challan_url)
  VALUES (?, ?, ?, ?)
`);
export class FeeChallanModel extends BaseModel {
    static create(application_id, amount, url) {
        const id = `CHL${Date.now()}`;
        insert.run(id, application_id, amount, url);
        return id;
    }
}
