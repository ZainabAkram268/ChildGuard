"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
// src/models/user.ts
const BaseModels_1 = require("./BaseModels");
const bcrypt_1 = __importDefault(require("bcrypt"));
class UserModel extends BaseModels_1.BaseModel {
    // Create user (synchronous)
    static create(data) {
        // ensure DB initialized
        this.init();
        const id = `USR-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        // The salt rounds must be a number (10) as in the original code, but bcrypt.hashSync handles it.
        const hash = bcrypt_1.default.hashSync(data.password, 10);
        const insert = this.db.prepare(`
      INSERT INTO users (user_id, username, email, password_hash, role)
      VALUES (?, ?, ?, ?, ?)
    `);
        insert.run(id, data.username, data.email, hash, data.role);
        // SELECT * is crucial to get the defaults: status, created_at, updated_at
        const user = this.db.prepare("SELECT * FROM users WHERE user_id = ?").get(id);
        return user;
    }
    static findByEmail(email) {
        this.init();
        return this.db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    }
    static findById(id) {
        this.init();
        return this.db.prepare("SELECT * FROM users WHERE user_id = ?").get(id);
    }
    static validatePassword(user, password) {
        return bcrypt_1.default.compareSync(password, user.password_hash);
    }
    static suspend(id) {
        this.init();
        // The DB only allows 'active', 'inactive', 'suspended'. No 'soft_delete'.
        this.db.prepare("UPDATE users SET status = 'suspended', updated_at = datetime('now') WHERE user_id = ?").run(id);
    }
    static activate(id) {
        this.init();
        // The DB only allows 'active', 'inactive', 'suspended'.
        this.db.prepare("UPDATE users SET status = 'active', updated_at = datetime('now') WHERE user_id = ?").run(id);
    }
}
exports.UserModel = UserModel;
