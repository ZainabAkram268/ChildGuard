import { DatabaseConnection } from "../config/database/DatabaseConnection";
export class BaseModel {
    static init() {
        if (!this.db) {
            this.db = DatabaseConnection.getInstance();
            console.log("BaseModel DB instance created");
        }
    }
}
