// src/models/BaseModels.ts

import { DatabaseConnection } from "../config/database/DatabaseConnection";
// FIX: Change to import * as Database from "better-sqlite3" 
// This resolves the 'Cannot use namespace as a type' error (Code 2709)
import * as BetterSqlite3 from "better-sqlite3"; 

export class BaseModel {
    // Access the Database type via the imported namespace
    public static db: BetterSqlite3.Database;

    // init remains synchronous, as previously corrected
    static init(): void {
        if (!this.db) {
            this.db = DatabaseConnection.getInstance();
        }
    }
}