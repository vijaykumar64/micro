import { query } from '../db/pool';

interface VerifRow {
  id: string; user_id: string; type: string; status: string;
  notes: string | null; reviewed_by: string | null; reviewed_at: string | null;
  created_at: string; updated_at: string;
}

function map(r: VerifRow) {
  return { id: r.id, userId: r.user_id, type: r.type, status: r.status,
    notes: r.notes, reviewedBy: r.reviewed_by, reviewedAt: r.reviewed_at,
    createdAt: r.created_at, updatedAt: r.updated_at };
}

export async function submitRequest(userId: string, type: string) {
  const r = await query<VerifRow>(
    'INSERT INTO verification_requests (user_id, type) VALUES ($1, $2) RETURNING *',
    [userId, type]
  );
  return map(r.rows[0]);
}

export async function getMyRequests(userId: string) {
  const r = await query<VerifRow>('SELECT * FROM verification_requests WHERE user_id=$1 ORDER BY created_at DESC', [userId]);
  return r.rows.map(map);
}

export async function getPendingRequests(page = 1, limit = 20) {
  const offset = (page - 1) * limit;
  const [data, count] = await Promise.all([
    query<VerifRow>("SELECT * FROM verification_requests WHERE status IN ('pending','in_review') ORDER BY created_at ASC LIMIT $1 OFFSET $2", [limit, offset]),
    query<{ count: string }>("SELECT COUNT(*) as count FROM verification_requests WHERE status IN ('pending','in_review')"),
  ]);
  return { requests: data.rows.map(map), total: parseInt(count.rows[0].count), page, limit };
}

export async function getById(id: string, userId: string, role: string) {
  const r = await query<VerifRow>('SELECT * FROM verification_requests WHERE id=$1', [id]);
  if (!r.rows[0]) throw Object.assign(new Error('Request not found'), { statusCode: 404 });
  if (r.rows[0].user_id !== userId && !['admin','moderator'].includes(role))
    throw Object.assign(new Error('Access denied'), { statusCode: 403 });
  return map(r.rows[0]);
}

export async function reviewRequest(id: string, reviewerId: string, role: string, status: string, notes?: string) {
  if (!['admin','moderator'].includes(role)) throw Object.assign(new Error('Access denied'), { statusCode: 403 });
  if (!['approved','rejected','in_review'].includes(status)) throw Object.assign(new Error('Invalid status'), { statusCode: 400 });
  const r = await query<VerifRow>(
    'UPDATE verification_requests SET status=$1, notes=$2, reviewed_by=$3, reviewed_at=NOW() WHERE id=$4 RETURNING *',
    [status, notes||null, reviewerId, id]
  );
  if (!r.rows[0]) throw Object.assign(new Error('Request not found'), { statusCode: 404 });
  return map(r.rows[0]);
}

export async function getPendingCount() {
  const r = await query<{ count: string }>("SELECT COUNT(*) as count FROM verification_requests WHERE status='pending'");
  return parseInt(r.rows[0].count);
}
