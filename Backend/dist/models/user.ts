import BetterSqlite3 from 'better-sqlite3';  // Import the class
import { BaseModel } from './BaseModels';
import bcrypt from 'bcryptjs';

// BaseModel.db should be typed as BetterSqlite3.Database | undefined
function getDb(): BetterSqlite3.Database {
    if (!BaseModel.db) BaseModel.init();
    return BaseModel.db!;
}

// Prepare statements
const insert = getDb().prepare(`
  INSERT INTO users (user_id, username, email, password_hash, role)
  VALUES (?, ?, ?, ?, ?)
`);

const byEmail = getDb().prepare(`SELECT * FROM users WHERE email = ?`);
const byId = getDb().prepare(`SELECT * FROM users WHERE user_id = ?`);
const updateStatus = getDb().prepare(`UPDATE users SET status = ? WHERE user_id = ?`);
