// backend/src/models/Admin.ts
import { BaseModel } from './BaseModels';
import { UserModel, User } from './user';

export interface Admin extends User {
  phone?: string;
}

const insertAdmin = BaseModel.db.prepare(`
  INSERT INTO admins (admin_id, phone) VALUES (?, ?)
`);

export class AdminModel extends BaseModel {
  static create(data: {
    username: string;
    email: string;
    password: string;
    phone?: string;
  }): Admin {
    const tx = BaseModel.db.transaction(() => {
      const user = UserModel.create({ ...data, role: 'admin' });
      insertAdmin.run(user.user_id, data.phone ?? null);
      return { ...user, phone: data.phone };
    });
    return tx();
  }
}