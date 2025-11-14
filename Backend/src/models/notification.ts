// backend/src/models/Notification.ts
import { BaseModel } from './BaseModels';

const getUnread = BaseModel.db.prepare(`
  SELECT * FROM notifications WHERE user_id = ? AND is_read = 0 ORDER BY created_at DESC
`);

export class NotificationModel extends BaseModel {
  static getUnread(user_id: string) {
    return getUnread.all(user_id);
  }

  static markRead(id: string) {
    BaseModel.db.prepare('UPDATE notifications SET is_read = 1 WHERE notification_id = ?').run(id);
  }
}