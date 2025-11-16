// src/models/report.ts
import { BaseModel } from "./BaseModels";
export class ReportModel extends BaseModel {
    // Submit a new report
    static submit(data) {
        this.init();
        const reportId = `RPT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const insert = this.db.prepare(`
      INSERT INTO reports (report_id, reporter_id, location, description, child_name, child_age, photo_url)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
        insert.run(reportId, data.reporter_id || null, data.location, data.description, data.child_name || null, data.child_age || null, data.photo_url || null);
        const report = this.db
            .prepare("SELECT * FROM reports WHERE report_id = ?")
            .get(reportId);
        return report;
    }
    static findById(report_id) {
        this.init();
        return this.db
            .prepare("SELECT * FROM reports WHERE report_id = ?")
            .get(report_id);
    }
}
