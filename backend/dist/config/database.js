"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.openDb = openDb;
const sqlite3_1 = __importDefault(require("sqlite3"));
const sqlite_1 = require("sqlite");
// Open SQLite database
async function openDb() {
    return (0, sqlite_1.open)({
        filename: "./childguard.db", // Database file
        driver: sqlite3_1.default.Database,
    });
}
