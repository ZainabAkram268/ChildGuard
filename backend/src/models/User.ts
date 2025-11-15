// src/models/user.ts
import { BaseModel } from "./BaseModels";
import bcrypt from "bcrypt";

export interface User {
  user_id: string;
  username: string;
  email: string;
  password_hash: string;
  role: "parent" | "sponsor" | "volunteer" | "admin" | "case_reporter";
  status: "active" | "inactive" | "suspended"; // Made non-optional, as DB sets a default
  created_at: string; // Made non-optional, as DB sets a default
  updated_at: string; // Made non-optional, as DB sets a default
}

export class UserModel extends BaseModel {
  // Create user (synchronous)
  static create(data: {
    username: string;
    email: string;
    password: string;
    role: User["role"];
  }): User {
    // ensure DB initialized
    this.init();

    const id = `USR-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    // The salt rounds must be a number (10) as in the original code, but bcrypt.hashSync handles it.
    const hash = bcrypt.hashSync(data.password, 10);

    const insert = this.db.prepare(`
      INSERT INTO users (user_id, username, email, password_hash, role)
      VALUES (?, ?, ?, ?, ?)
    `);

    insert.run(id, data.username, data.email, hash, data.role);

    // SELECT * is crucial to get the defaults: status, created_at, updated_at
    const user = this.db.prepare("SELECT * FROM users WHERE user_id = ?").get(id) as User;
    return user;
  }

  static findByEmail(email: string): User | null {
    this.init();
    return this.db.prepare("SELECT * FROM users WHERE email = ?").get(email) as User | null;
  }

  static findById(id: string): User | null {
    this.init();
    return this.db.prepare("SELECT * FROM users WHERE user_id = ?").get(id) as User | null;
  }

  static validatePassword(user: User, password: string): boolean {
    return bcrypt.compareSync(password, user.password_hash);
  }

  static suspend(id: string): void {
    this.init();
    // The DB only allows 'active', 'inactive', 'suspended'. No 'soft_delete'.
    this.db.prepare("UPDATE users SET status = 'suspended', updated_at = datetime('now') WHERE user_id = ?").run(id);
  }

  static activate(id: string): void {
    this.init();
    // The DB only allows 'active', 'inactive', 'suspended'.
    this.db.prepare("UPDATE users SET status = 'active', updated_at = datetime('now') WHERE user_id = ?").run(id);
  }
}