// backend/src/models/Volunteer.ts
import { BaseModel } from './BaseModels';
import { UserModel, User } from './user';

export interface Volunteer extends User {
  phone?: string;
  availability?: string; // JSON string
  area?: string;
  volunteer_status: 'pending' | 'approved' | 'rejected'; // New field
}

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
  static create(data: {
    username: string;
    email: string;
    password: string;
    phone?: string;
    availability?: object;
    area?: string;
  }): Volunteer {
    const tx = BaseModel.db.transaction(() => {
      const user = UserModel.create({ ...data, role: 'volunteer' });
      const availabilityJson = data.availability ? JSON.stringify(data.availability) : null;

      insertVolunteer.run(
        user.user_id,
        user.user_id,
        data.phone ?? null,
        availabilityJson,
        data.area ?? null
      );

      const extra = getVolunteer.get(user.user_id) as {
        phone?: string;
        availability?: string;
        area?: string;
        volunteer_status: 'pending' | 'approved' | 'rejected';
      };

      return { ...user, ...extra };
    });
    return tx();
  }

  static approve(id: string): void {
    updateStatus.run('approved', id);
  }

  static reject(id: string): void {
    updateStatus.run('rejected', id);
  }

  static findById(id: string): Volunteer | null {
    const user = UserModel.findById(id);
    if (!user || user.role !== 'volunteer') return null;
    const extra = getVolunteer.get(id) as any;
    return { ...user, ...extra };
  }
}