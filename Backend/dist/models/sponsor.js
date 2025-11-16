"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SponsorModel = void 0;
// src/models/sponsor.ts
const user_1 = require("./user"); // Import User
const BaseModels_1 = require("./BaseModels");
class SponsorModel extends BaseModels_1.BaseModel {
    static create(data) {
        this.init();
        const user = user_1.UserModel.create({
            username: data.username,
            email: data.email,
            password: data.password,
            role: "sponsor",
        });
        // Stringify preferences to store as TEXT/JSON string in SQLite
        const prefsJson = data.preferences ? JSON.stringify(data.preferences) : null;
        const insertSponsor = this.db.prepare(`
      INSERT INTO sponsors (sponsor_id, phone, preferences)
      VALUES (?, ?, ?)
    `);
        insertSponsor.run(user.user_id, data.phone ?? null, prefsJson);
        // Select the extension fields
        const extra = this.db.prepare("SELECT sponsor_id, phone, preferences FROM sponsors WHERE sponsor_id = ?").get(user.user_id);
        // Merge and return
        return { ...user, ...extra };
    }
    static find(user_id) {
        this.init();
        const user = user_1.UserModel.findById(user_id);
        if (!user || user.role !== "sponsor")
            return null;
        // Select the extension fields
        const extra = this.db.prepare("SELECT sponsor_id, phone, preferences FROM sponsors WHERE sponsor_id = ?").get(user_id);
        // Merge and return
        return { ...user, ...extra };
    }
}
exports.SponsorModel = SponsorModel;
