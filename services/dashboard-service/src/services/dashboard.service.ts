import axios from 'axios';
import { query } from '../db/pool';

const USER_SERVICE_URL         = process.env.USER_SERVICE_URL         || 'http://localhost:3002';
const PROPERTY_SERVICE_URL     = process.env.PROPERTY_SERVICE_URL     || 'http://localhost:3005';
const VERIFICATION_SERVICE_URL = process.env.VERIFICATION_SERVICE_URL || 'http://localhost:3006';
const WORK_ITEMS_SERVICE_URL   = process.env.WORK_ITEMS_SERVICE_URL   || 'http://localhost:3007';
const INTERNAL_SECRET = process.env.INTERNAL_SERVICE_SECRET || 'internal_secret_dev';

interface ActivityRow {
  id: string;
  user_id: string;
  action: string;
  metadata: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

function mapActivity(row: ActivityRow) {
  return {
    id: row.id,
    userId: row.user_id,
    action: row.action,
    metadata: row.metadata,
    ipAddress: row.ip_address,
    userAgent: row.user_agent,
    createdAt: row.created_at,
  };
}

export async function logActivity(
  userId: string,
  action: string,
  metadata?: Record<string, unknown>,
  ipAddress?: string,
  userAgent?: string
) {
  await query(
    'INSERT INTO activity_logs (user_id, action, metadata, ip_address, user_agent) VALUES ($1, $2, $3, $4, $5)',
    [userId, action, metadata ? JSON.stringify(metadata) : null, ipAddress || null, userAgent || null]
  );
}

export async function getUserStats(userId: string) {
  const [counts, recent] = await Promise.all([
    query<{ action: string; count: string }>(
      'SELECT action, COUNT(*) as count FROM activity_logs WHERE user_id = $1 GROUP BY action',
      [userId]
    ),
    query<ActivityRow>(
      'SELECT * FROM activity_logs WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10',
      [userId]
    ),
  ]);

  const countMap: Record<string, number> = {};
  counts.rows.forEach((r) => { countMap[r.action] = parseInt(r.count); });

  return {
    totalLogins: countMap['LOGIN'] || 0,
    totalUploads: countMap['FILE_UPLOAD'] || 0,
    totalProfileUpdates: countMap['PROFILE_UPDATE'] || 0,
    recentActivity: recent.rows.map(mapActivity),
  };
}

export async function getAdminStats() {
  const [uploadCount, loginCount, activeUsers] = await Promise.all([
    query<{ count: string }>('SELECT COUNT(*) as count FROM activity_logs WHERE action = $1', ['FILE_UPLOAD']),
    query<{ count: string }>('SELECT COUNT(*) as count FROM activity_logs WHERE action = $1', ['LOGIN']),
    query<{ count: string }>(
      "SELECT COUNT(DISTINCT user_id) as count FROM activity_logs WHERE created_at > NOW() - INTERVAL '30 days'"
    ),
  ]);

  let totalUsers = 0;
  try {
    const userRes = await axios.get<{ data: { total: number } }>(
      `${USER_SERVICE_URL}/admin/profiles?limit=1`,
      { headers: { 'x-internal-secret': INTERNAL_SECRET, 'x-user-role': 'admin', 'x-user-id': 'system' } }
    );
    totalUsers = userRes.data.data.total;
  } catch {
    // fallback: use distinct users from activity logs
    const res = await query<{ count: string }>('SELECT COUNT(DISTINCT user_id) as count FROM activity_logs');
    totalUsers = parseInt(res.rows[0].count);
  }

  let totalProperties = 0, pendingVerifications = 0, openWorkItems = 0;
  try {
    const r = await axios.get<{ data: { total: number } }>(`${PROPERTY_SERVICE_URL}/internal/count`, { headers: { 'x-internal-secret': INTERNAL_SECRET } });
    totalProperties = r.data.data.total;
  } catch { /* non-critical */ }
  try {
    const r = await axios.get<{ data: { pendingCount: number } }>(`${VERIFICATION_SERVICE_URL}/internal/count`, { headers: { 'x-internal-secret': INTERNAL_SECRET } });
    pendingVerifications = r.data.data.pendingCount;
  } catch { /* non-critical */ }
  try {
    const r = await axios.get<{ data: { openCount: number } }>(`${WORK_ITEMS_SERVICE_URL}/internal/count`, { headers: { 'x-internal-secret': INTERNAL_SECRET } });
    openWorkItems = r.data.data.openCount;
  } catch { /* non-critical */ }

  return {
    totalUsers,
    activeUsersLast30Days: parseInt(activeUsers.rows[0].count),
    totalUploads: parseInt(uploadCount.rows[0].count),
    totalLogins: parseInt(loginCount.rows[0].count),
    totalProperties,
    pendingVerifications,
    openWorkItems,
  };
}

export async function getRecentActivity(userId: string, page = 1, limit = 20) {
  const offset = (page - 1) * limit;
  const [data, count] = await Promise.all([
    query<ActivityRow>(
      'SELECT * FROM activity_logs WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
      [userId, limit, offset]
    ),
    query<{ count: string }>('SELECT COUNT(*) as count FROM activity_logs WHERE user_id = $1', [userId]),
  ]);
  return {
    activity: data.rows.map(mapActivity),
    total: parseInt(count.rows[0].count),
    page,
    limit,
  };
}
