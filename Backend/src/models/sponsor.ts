// backend/src/models/Sponsor.ts
import { BaseModel } from './BaseModels';
import { UserModel, User } from './user';

export interface Sponsor extends User {
  phone?: string;
  preferences?: string;  // JSON string
}

const insertSponsor = BaseModel.db.prepare(`
  INSERT INTO sponsors (sponsor_id, phone, preferences)
  VALUES (?, ?, ?)
`);

const getSponsor = BaseModel.db.prepare(`
  SELECT phone, preferences FROM sponsors WHERE sponsor_id = ?
`);

export class SponsorModel extends BaseModel {
  static create(data: {
    username: string;
    email: string;
    password: string;
    phone?: string;
    preferences?: object;
  }): Sponsor {
    const tx = BaseModel.db.transaction(() => {
      const user = UserModel.create({
        username: data.username,
        email: data.email,
        password: data.password,
        role: 'sponsor',
      });

      const preferencesJson = data.preferences 
        ? JSON.stringify(data.preferences) 
        : null;

      insertSponsor.run(user.user_id, data.phone ?? null, preferencesJson);

      const extra = getSponsor.get(user.user_id) as { 
        phone?: string; 
        preferences?: string 
      };

      return { ...user, phone: extra.phone, preferences: extra.preferences };
    });

    return tx();
  }

  static findById(id: string): Sponsor | null {
    const user = UserModel.findById(id);
    if (!user || user.role !== 'sponsor') return null;
    const extra = getSponsor.get(id) as { phone?: string; preferences?: string };
    return { ...user, ...extra };
  }
}