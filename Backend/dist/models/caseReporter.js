// src/models/caseReporter.ts
import { BaseModel } from "./BaseModels";
export class CaseReporterModel extends BaseModel {
    static reportCase(data) {
        this.init();
        // Generate IDs
        const reporterId = `REP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const reportId = `RPT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        // Insert reporter (anonymous or linked)
        this.db.prepare(`
      INSERT INTO case_reporters (reporter_id, user_id, phone, is_anonymous)
      VALUES (?, ?, ?, ?)
    `).run(reporterId, data.user_id ?? null, data.phone ?? null, data.is_anonymous ? 1 : 0);
        // Insert the actual report
        this.db.prepare(`
      INSERT INTO reports (report_id, reporter_id, location, description, child_name, child_age, photo_url)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(reportId, reporterId, data.location, data.description, data.child_name ?? null, data.child_age ?? null, data.photo_url ?? null);
        // Return the report
        const report = this.db.prepare("SELECT * FROM reports WHERE report_id = ?").get(reportId);
        return report;
    }
}
