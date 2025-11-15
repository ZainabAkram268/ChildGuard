// src/config/database/DatabaseConnection.ts
import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

const DB_FILE = path.join(process.cwd(), "childguard.db");

// FIX: Explicitly set the path to the schema file relative to the project root (process.cwd())
// This ensures that ts-node-dev finds the file correctly inside the 'src' directory.
const SCHEMA_FILE = path.join(process.cwd(), "src", "config", "database", "schema.sql");

export class DatabaseConnection {
    private static instance: Database.Database | null = null;

    // synchronous getter for better-sqlite3
    static getInstance(): Database.Database {
        if (!this.instance) {
            const isNew = !fs.existsSync(DB_FILE);

            // open database (synchronous)
            this.instance = new Database(DB_FILE);

            // enable foreign keys
            this.instance.pragma("foreign_keys = ON");

            // if new DB, run schema.sql synchronously
            if (isNew && fs.existsSync(SCHEMA_FILE)) {
                console.log(`[DB] Database created. Running schema from: ${SCHEMA_FILE}`); // Added a log to confirm
                const schema = fs.readFileSync(SCHEMA_FILE, "utf8");
                // execute whole schema (may contain multiple statements)
                this.instance.exec(schema);
                console.log("[DB] Schema executed successfully.");
            } else if (!fs.existsSync(SCHEMA_FILE)) {
                console.error(`[DB ERROR] Schema file not found at: ${SCHEMA_FILE}`);
            }
        }
        return this.instance;
    }
}