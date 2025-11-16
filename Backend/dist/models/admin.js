// backend/src/models/Admin.ts
import { BaseModel } from './BaseModels';
import { UserModel } from './user';
const insertAdmin = BaseModel.db.prepare(`
  INSERT INTO admins (admin_id, phone) VALUES (?, ?)
`);
export class AdminModel extends BaseModel {
    static create(data) {
        const tx = BaseModel.db.transaction(() => {
            const user = UserModel.create({ ...data, role: 'admin' });
            insertAdmin.run(user.user_id, data.phone ?? null);
            return { ...user, phone: data.phone };
        });
        return tx();
    }
}
