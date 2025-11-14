import sqlite3 from "sqlite3";
import { open, Database } from "sqlite";

export class DatabaseConnection {
  private static instance: Database<sqlite3.Database, sqlite3.Statement>;

  static async getInstance() {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = await open({
        filename: "./childguard.db",
        driver: sqlite3.Database,
      });
    }
    return DatabaseConnection.instance;
  }
}
