// backend/src/models/Notification.ts
import { BaseModel } from './BaseModels';

const insert = BaseModel.db.prepare(`
  INSERT INTO notifications (notification_id, user_id, message, type, is_read, created_at)
  VALUES (?, ?, ?, ?, 0, datetime('now'))
`);

const getUnread = BaseModel.db.prepare(`
  SELECT * FROM notifications WHERE user_id = ? AND is_read = 0 ORDER BY created_at DESC
`);

const markReadStmt = BaseModel.db.prepare(`
  UPDATE notifications SET is_read = 1 WHERE notification_id = ?
`);

export class NotificationModel extends BaseModel {
  // Create a new notification (used in reportController)
  static create(data: { user_id: string; message: string; type: string }) {
    const id = `NOT${Date.now()}`;
    insert.run(id, data.user_id, data.message, data.type);
    return id;
  }

  static getUnread(user_id: string) {
    return getUnread.all(user_id);
  }

  static markRead(id: string) {
    markReadStmt.run(id);
  }
}