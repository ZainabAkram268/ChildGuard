// backend/src/models/User.ts
import { BaseModel } from './BaseModels';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

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

// Helper to ensure DB is initialized
function getDb() {
  if (!BaseModel.db) BaseModel.init();
  return BaseModel.db!;
}

export class UserModel extends BaseModel {
  // Create a new user
  static create(data: {
    username: string;
    email: string;
    password: string;
    role: User['role'];
  }): User {
    const db = getDb();
    const insertStmt = db.prepare(`
      INSERT INTO users (user_id, username, email, password_hash, role)
      VALUES (?, ?, ?, ?, ?)
    `);

    const id = `USR-${randomUUID()}`;
    const hash = bcrypt.hashSync(data.password, 10); // sync for simplicity
    insertStmt.run(id, data.username, data.email, hash, data.role);

    const selectStmt = db.prepare('SELECT * FROM users WHERE user_id = ?');
    return selectStmt.get(id) as User;
  }

  // Find user by email
  static findByEmail(email: string): User | null {
    const db = getDb();
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    return stmt.get(email) as User | null;
  }

  // Find user by ID
  static findById(id: string): User | null {
    const db = getDb();
    const stmt = db.prepare('SELECT * FROM users WHERE user_id = ?');
    return stmt.get(id) as User | null;
  }

  // Validate password
  static validatePassword(user: User, password: string): boolean {
    return bcrypt.compareSync(password, user.password_hash);
  }

  // Suspend user
  static suspend(id: string): void {
    const db = getDb();
    const stmt = db.prepare('UPDATE users SET status = ? WHERE user_id = ?');
    stmt.run('suspended', id);
  }

  // Activate user
  static activate(id: string): void {
    const db = getDb();
    const stmt = db.prepare('UPDATE users SET status = ? WHERE user_id = ?');
    stmt.run('active', id);
  }
}
