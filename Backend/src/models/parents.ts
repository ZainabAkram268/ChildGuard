// backend/src/models/Parent.ts
import { BaseModel } from './BaseModels';
import { UserModel, User } from './user';

export interface Parent extends User {
  phone?: string;
  address?: string;
}

const insertParent = BaseModel.db.prepare(`
  INSERT INTO parents (parent_id, phone, address)
  VALUES (?, ?, ?)
`);

const getParent = BaseModel.db.prepare(`
  SELECT p.* FROM parents p WHERE p.parent_id = ?
`);

export class ParentModel extends BaseModel {
  static create(data: {
    username: string;
    email: string;
    password: string;
    phone?: string;
    address?: string;
  }): Parent {
    const tx = BaseModel.db.transaction(() => {
      const user = UserModel.create({
        username: data.username,
        email: data.email,
        password: data.password,
        role: 'parent',
      });
      insertParent.run(user.user_id, data.phone ?? null, data.address ?? null);
      const extra = getParent.get(user.user_id) as { phone?: string; address?: string };
      return { ...user, ...extra };
    });
    return tx();
  }

  static findById(id: string): Parent | null {
    const user = UserModel.findById(id);
    if (!user || user.role !== 'parent') return null;
    const extra = getParent.get(id) as { phone?: string; address?: string };
    return { ...user, ...extra };
  }
}