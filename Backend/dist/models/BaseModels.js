"use strict";
// src/models/BaseModels.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseModel = void 0;
const DatabaseConnection_1 = require("../config/database/DatabaseConnection");
class BaseModel {
    // init remains synchronous, as previously corrected
    static init() {
        if (!this.db) {
            this.db = DatabaseConnection_1.DatabaseConnection.getInstance();
        }
    }
}
exports.BaseModel = BaseModel;
