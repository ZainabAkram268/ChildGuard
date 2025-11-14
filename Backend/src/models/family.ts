// backend/src/models/Family.ts
import { BaseModel } from './BaseModels';

export interface Family {
  family_id: string;
  parent_id: string;
  income: number;
  address: string;
  number_of_children: number;
  verification_status: string;
  support_status: string;
  created_at: string;
}

const insert = BaseModel.db.prepare(`
  INSERT INTO families (family_id, parent_id, income, address)
  VALUES (?, ?, ?, ?)
`);

export class FamilyModel extends BaseModel {
  static create(data: {
    parent_id: string;
    income: number;
    address: string;
  }): Family {
    const id = `FAM${Date.now()}`;
    insert.run(id, data.parent_id, data.income, data.address);
    return BaseModel.db.prepare('SELECT * FROM families WHERE family_id = ?').get(id) as Family;
  }
}