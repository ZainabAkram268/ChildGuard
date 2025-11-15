"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParentModel = void 0;
// src/models/parents.ts
const user_1 = require("./user"); // Import User for better type merging
const BaseModels_1 = require("./BaseModels");
class ParentModel extends BaseModels_1.BaseModel {
    static create(data) {
        this.init();
        // create user synchronously
        const user = user_1.UserModel.create({
            username: data.username,
            email: data.email,
            password: data.password,
            role: "parent",
        });
        const insertParent = this.db.prepare(`
      INSERT INTO parents (parent_id, phone, address)
      VALUES (?, ?, ?)
    `);
        // Use the null-coalescing operator ?? to ensure null is passed to DB if undefined
        insertParent.run(user.user_id, data.phone ?? null, data.address ?? null);
        // Select the extension fields. Note: The database will return NULL if the columns are empty.
        const extra = this.db.prepare("SELECT parent_id, phone, address FROM parents WHERE parent_id = ?").get(user.user_id);
        // Merge the user object with the parent extension data
        return { ...user, ...extra };
    }
    static find(user_id) {
        this.init();
        const user = user_1.UserModel.findById(user_id);
        if (!user || user.role !== "parent")
            return null;
        // Select the extension fields
        const extra = this.db.prepare("SELECT parent_id, phone, address FROM parents WHERE parent_id = ?").get(user_id);
        // Merge the user object with the parent extension data
        return { ...user, ...extra };
    }
}
exports.ParentModel = ParentModel;
