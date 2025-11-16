"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseConnection = void 0;
// src/config/database/DatabaseConnection.ts
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const DB_FILE = path_1.default.join(process.cwd(), "childguard.db");
const SCHEMA_FILE = path_1.default.join(__dirname, "schema.sql");
class DatabaseConnection {
    // synchronous getter for better-sqlite3
    static getInstance() {
        if (!this.instance) {
            const isNew = !fs_1.default.existsSync(DB_FILE);
            // open database (synchronous)
            this.instance = new better_sqlite3_1.default(DB_FILE);
            // enable foreign keys
            this.instance.pragma("foreign_keys = ON");
            // if new DB, run schema.sql synchronously
            if (isNew && fs_1.default.existsSync(SCHEMA_FILE)) {
                const schema = fs_1.default.readFileSync(SCHEMA_FILE, "utf8");
                // execute whole schema (may contain multiple statements)
                this.instance.exec(schema);
            }
        }
        return this.instance;
    }
}
exports.DatabaseConnection = DatabaseConnection;
DatabaseConnection.instance = null;
