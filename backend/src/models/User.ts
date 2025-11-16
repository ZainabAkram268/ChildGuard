// backend/src/models/User.ts
import { BaseModel } from './BaseModels';
import bcrypt from 'bcrypt';

export interface User {
  user_id: string;
  username: string;
  email: string;
  password_hash: string;
  role: 'parent' | 'sponsor' | 'volunteer' | 'admin' | 'case_reporter';
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  updated_at: string;
}

const insert = BaseModel.db.prepare(`
  INSERT INTO users (user_id, username, email, password_hash, role)
  VALUES (?, ?, ?, ?, ?)
`);

const byEmail = BaseModel.db.prepare('SELECT * FROM users WHERE email = ?');
const byId = BaseModel.db.prepare('SELECT * FROM users WHERE user_id = ?');
const updateStatus = BaseModel.db.prepare('UPDATE users SET status = ? WHERE user_id = ?');

export class UserModel extends BaseModel {
  static create(data: {
    username: string;
    email: string;
    password: string;
    role: User['role'];
  }): User {
    const id = `USR${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const hash = bcrypt.hashSync(data.password, 10);
    insert.run(id, data.username, data.email, hash, data.role);
    return byId.get(id) as User;
  }

  static findByEmail(email: string): User | null {
    return byEmail.get(email) as User | null;
  }

  static findById(id: string): User | null {
    return byId.get(id) as User | null;
  }

  static validatePassword(user: User, password: string): boolean {
    return bcrypt.compareSync(password, user.password_hash);
  }

  static suspend(id: string): void {
    updateStatus.run('suspended', id);
  }

  static activate(id: string): void {
    updateStatus.run('active', id);
  }
}