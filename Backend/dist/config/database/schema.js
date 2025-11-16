"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseConnection = void 0;
const sqlite3_1 = __importDefault(require("sqlite3"));
const sqlite_1 = require("sqlite");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class DatabaseConnection {
    static async getInstance() {
        if (!this.instance) {
            this.instance = await (0, sqlite_1.open)({
                filename: "childguard.db",
                driver: sqlite3_1.default.Database
            });
            // Enable FK
            await this.instance.exec("PRAGMA foreign_keys = ON;");
            // Load schema.sql only once when DB is first created
            const schemaPath = path_1.default.join(__dirname, "schema.sql");
            const schema = fs_1.default.readFileSync(schemaPath, "utf8");
            await this.instance.exec(schema);
        }
        return this.instance;
    }
}
exports.DatabaseConnection = DatabaseConnection;
DatabaseConnection.instance = null;
