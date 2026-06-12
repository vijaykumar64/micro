import { query } from '../db/pool';

interface AuditRow {
  id: string; user_id: string | null; action: string; service: string;
  resource_type: string | null; resource_id: string | null;
  changes: Record<string, unknown> | null; ip_address: string | null;
  user_agent: string | null; created_at: string;
}

function map(r: AuditRow) {
  return { id: r.id, userId: r.user_id, action: r.action, service: r.service,
    resourceType: r.resource_type, resourceId: r.resource_id,
    changes: r.changes, ipAddress: r.ip_address, userAgent: r.user_agent, createdAt: r.created_at };
}

export async function logEvent(data: {
  userId?: string; action: string; service: string;
  resourceType?: string; resourceId?: string;
  changes?: Record<string, unknown>; ipAddress?: string; userAgent?: string;
}) {
  await query(
    'INSERT INTO audit_logs (user_id,action,service,resource_type,resource_id,changes,ip_address,user_agent) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',
    [data.userId||null, data.action, data.service, data.resourceType||null, data.resourceId||null,
     data.changes ? JSON.stringify(data.changes) : null, data.ipAddress||null, data.userAgent||null]
  );
}

export async function getLogs(page = 1, limit = 50, filters: Record<string, string> = {}) {
  const conditions: string[] = [];
  const params: unknown[] = [];
  let i = 1;
  if (filters.service)      { conditions.push(`service=$${i++}`);       params.push(filters.service); }
  if (filters.action)       { conditions.push(`action=$${i++}`);        params.push(filters.action); }
  if (filters.userId)       { conditions.push(`user_id=$${i++}`);       params.push(filters.userId); }
  if (filters.resourceType) { conditions.push(`resource_type=$${i++}`); params.push(filters.resourceType); }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const offset = (page - 1) * limit;
  const [data, count] = await Promise.all([
    query<AuditRow>(`SELECT * FROM audit_logs ${where} ORDER BY created_at DESC LIMIT $${i} OFFSET $${i+1}`, [...params, limit, offset]),
    query<{ count: string }>(`SELECT COUNT(*) as count FROM audit_logs ${where}`, params),
  ]);
  return { logs: data.rows.map(map), total: parseInt(count.rows[0].count), page, limit };
}

export async function getUserLogs(userId: string, page = 1, limit = 50) {
  const offset = (page - 1) * limit;
  const [data, count] = await Promise.all([
    query<AuditRow>('SELECT * FROM audit_logs WHERE user_id=$1 ORDER BY created_at DESC LIMIT $2 OFFSET $3', [userId, limit, offset]),
    query<{ count: string }>('SELECT COUNT(*) as count FROM audit_logs WHERE user_id=$1', [userId]),
  ]);
  return { logs: data.rows.map(map), total: parseInt(count.rows[0].count), page, limit };
}

export async function getResourceHistory(resourceType: string, resourceId: string) {
  const r = await query<AuditRow>(
    'SELECT * FROM audit_logs WHERE resource_type=$1 AND resource_id=$2 ORDER BY created_at DESC',
    [resourceType, resourceId]
  );
  return r.rows.map(map);
}
