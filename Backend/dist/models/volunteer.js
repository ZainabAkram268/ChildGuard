// backend/src/models/Volunteer.ts
import { BaseModel } from './BaseModels';
import { UserModel } from './user';
const insertVolunteer = BaseModel.db.prepare(`
  INSERT INTO volunteers (volunteer_id, user_id, phone, availability, area, status)
  VALUES (?, ?, ?, ?, ?, 'pending')
`);
const getVolunteer = BaseModel.db.prepare(`
  SELECT phone, availability, area, status AS volunteer_status 
  FROM volunteers WHERE volunteer_id = ?
`);
const updateStatus = BaseModel.db.prepare(`
  UPDATE volunteers SET status = ? WHERE volunteer_id = ?
`);
export class VolunteerModel extends BaseModel {
    static create(data) {
        const tx = BaseModel.db.transaction(() => {
            const user = UserModel.create({ ...data, role: 'volunteer' });
            const availabilityJson = data.availability ? JSON.stringify(data.availability) : null;
            insertVolunteer.run(user.user_id, user.user_id, data.phone ?? null, availabilityJson, data.area ?? null);
            const extra = getVolunteer.get(user.user_id);
            return { ...user, ...extra };
        });
        return tx();
    }
    static approve(id) {
        updateStatus.run('approved', id);
    }
    static reject(id) {
        updateStatus.run('rejected', id);
    }
    static findById(id) {
        const user = UserModel.findById(id);
        if (!user || user.role !== 'volunteer')
            return null;
        const extra = getVolunteer.get(id);
        return { ...user, ...extra };
    }
}
