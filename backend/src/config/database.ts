// backend/src/config/database.ts
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

/* -------------------------------------------------
   Resolve DB location – one folder above backend/
   ------------------------------------------------- */
const dbDir = path.resolve(__dirname, '../../');
const dbPath = path.join(dbDir, 'childguard.db');

/* -------------------------------------------------
   Create directory if it does not exist
   ------------------------------------------------- */
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

/* -------------------------------------------------
   Open the DB
   ------------------------------------------------- */
const db = new Database(dbPath, {
  verbose: process.env.NODE_ENV === 'development' ? console.log : undefined,
});

/* -------------------------------------------------
   Enforce referential integrity
   ------------------------------------------------- */
db.pragma('foreign_keys = ON');

/* -------------------------------------------------
   Load schema only when the DB is brand-new
   ------------------------------------------------- */
const schemaPath = path.join(__dirname, '../database/schema.sql');
if (fs.existsSync(schemaPath)) {
  const hasUsers = db
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='users'")
    .get();

  if (!hasUsers) {
    console.log('Creating tables from schema.sql ...');
    const sql = fs.readFileSync(schemaPath, 'utf-8');
    db.exec(sql);
    console.log('Schema loaded.');
  }
} else {
  console.warn('schema.sql not found →', schemaPath);
}

/* -------------------------------------------------
   Graceful shutdown
   ------------------------------------------------- */
process.on('SIGINT', () => {
  db.close();
  console.log('SQLite connection closed.');
  process.exit(0);
});

export default db;