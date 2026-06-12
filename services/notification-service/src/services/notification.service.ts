import { query } from '../db/pool';

interface NotifRow {
  id: string; user_id: string; type: string; title: string;
  message: string; status: string; metadata: Record<string, unknown> | null; created_at: string;
}
interface PrefRow {
  id: string; user_id: string; email_enabled: boolean; sms_enabled: boolean;
  push_enabled: boolean; in_app_enabled: boolean; created_at: string; updated_at: string;
}

function mapN(r: NotifRow) {
  return { id: r.id, userId: r.user_id, type: r.type, title: r.title,
    message: r.message, status: r.status, metadata: r.metadata, createdAt: r.created_at };
}
function mapP(r: PrefRow) {
  return { id: r.id, userId: r.user_id, emailEnabled: r.email_enabled, smsEnabled: r.sms_enabled,
    pushEnabled: r.push_enabled, inAppEnabled: r.in_app_enabled };
}

export async function sendNotification(userId: string, type: string, title: string, message: string, metadata?: Record<string, unknown>) {
  const r = await query<NotifRow>(
    'INSERT INTO notifications (user_id,type,title,message,status,metadata) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
    [userId, type || 'in_app', title, message, 'sent', metadata ? JSON.stringify(metadata) : null]
  );
  return mapN(r.rows[0]);
}

export async function getNotifications(userId: string, page = 1, limit = 20) {
  const offset = (page - 1) * limit;
  const [data, count] = await Promise.all([
    query<NotifRow>('SELECT * FROM notifications WHERE user_id=$1 ORDER BY created_at DESC LIMIT $2 OFFSET $3', [userId, limit, offset]),
    query<{ count: string }>('SELECT COUNT(*) as count FROM notifications WHERE user_id=$1', [userId]),
  ]);
  return { notifications: data.rows.map(mapN), total: parseInt(count.rows[0].count), page, limit };
}

export async function getUnreadCount(userId: string) {
  const r = await query<{ count: string }>('SELECT COUNT(*) as count FROM notifications WHERE user_id=$1 AND status != $2', [userId, 'read']);
  return parseInt(r.rows[0].count);
}

export async function markRead(id: string, userId: string) {
  await query("UPDATE notifications SET status='read' WHERE id=$1 AND user_id=$2", [id, userId]);
}

export async function markAllRead(userId: string) {
  await query("UPDATE notifications SET status='read' WHERE user_id=$1 AND status != 'read'", [userId]);
}

export async function getPreferences(userId: string) {
  const r = await query<PrefRow>('SELECT * FROM notification_preferences WHERE user_id=$1', [userId]);
  if (!r.rows[0]) {
    const ins = await query<PrefRow>('INSERT INTO notification_preferences (user_id) VALUES ($1) RETURNING *', [userId]);
    return mapP(ins.rows[0]);
  }
  return mapP(r.rows[0]);
}

export async function updatePreferences(userId: string, prefs: Record<string, boolean>) {
  const r = await query<PrefRow>(
    `INSERT INTO notification_preferences (user_id,email_enabled,sms_enabled,push_enabled,in_app_enabled)
     VALUES ($1,$2,$3,$4,$5)
     ON CONFLICT (user_id) DO UPDATE SET
       email_enabled=EXCLUDED.email_enabled, sms_enabled=EXCLUDED.sms_enabled,
       push_enabled=EXCLUDED.push_enabled, in_app_enabled=EXCLUDED.in_app_enabled
     RETURNING *`,
    [userId, prefs.emailEnabled ?? true, prefs.smsEnabled ?? false, prefs.pushEnabled ?? true, prefs.inAppEnabled ?? true]
  );
  return mapP(r.rows[0]);
}
