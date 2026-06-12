import { query } from '../db/pool';

interface WorkItemRow {
  id: string; title: string; description: string | null;
  assigned_to: string | null; assigned_by: string; status: string;
  priority: string; due_date: string | null; created_at: string; updated_at: string;
}

function map(r: WorkItemRow) {
  return { id: r.id, title: r.title, description: r.description,
    assignedTo: r.assigned_to, assignedBy: r.assigned_by,
    status: r.status, priority: r.priority, dueDate: r.due_date,
    createdAt: r.created_at, updatedAt: r.updated_at };
}

export async function createItem(assignedBy: string, data: Record<string, unknown>) {
  const r = await query<WorkItemRow>(
    'INSERT INTO work_items (title,description,assigned_to,assigned_by,status,priority,due_date) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
    [data.title, data.description||null, data.assignedTo||null, assignedBy,
     data.status||'todo', data.priority||'medium', data.dueDate||null]
  );
  return map(r.rows[0]);
}

export async function getMyItems(userId: string) {
  const r = await query<WorkItemRow>(
    'SELECT * FROM work_items WHERE assigned_to=$1 OR assigned_by=$1 ORDER BY created_at DESC',
    [userId]
  );
  return r.rows.map(map);
}

export async function getAllItems(page = 1, limit = 50) {
  const offset = (page - 1) * limit;
  const [data, count] = await Promise.all([
    query<WorkItemRow>('SELECT * FROM work_items ORDER BY created_at DESC LIMIT $1 OFFSET $2', [limit, offset]),
    query<{ count: string }>('SELECT COUNT(*) as count FROM work_items'),
  ]);
  return { items: data.rows.map(map), total: parseInt(count.rows[0].count), page, limit };
}

export async function getItemById(id: string) {
  const r = await query<WorkItemRow>('SELECT * FROM work_items WHERE id=$1', [id]);
  if (!r.rows[0]) throw Object.assign(new Error('Work item not found'), { statusCode: 404 });
  return map(r.rows[0]);
}

export async function updateItem(id: string, userId: string, role: string, data: Record<string, unknown>) {
  const item = await getItemById(id);
  const canEdit = ['admin','moderator'].includes(role) || item.assignedBy === userId || item.assignedTo === userId;
  if (!canEdit) throw Object.assign(new Error('Access denied'), { statusCode: 403 });
  const fields: string[] = []; const vals: unknown[] = []; let i = 1;
  if (data.title)       { fields.push(`title=$${i++}`);       vals.push(data.title); }
  if (data.description !== undefined) { fields.push(`description=$${i++}`); vals.push(data.description); }
  if (data.assignedTo !== undefined) { fields.push(`assigned_to=$${i++}`); vals.push(data.assignedTo); }
  if (data.status)      { fields.push(`status=$${i++}`);      vals.push(data.status); }
  if (data.priority)    { fields.push(`priority=$${i++}`);    vals.push(data.priority); }
  if (data.dueDate !== undefined)    { fields.push(`due_date=$${i++}`);     vals.push(data.dueDate); }
  if (!fields.length) return item;
  vals.push(id);
  const r = await query<WorkItemRow>(`UPDATE work_items SET ${fields.join(',')} WHERE id=$${i} RETURNING *`, vals);
  return map(r.rows[0]);
}

export async function updateStatus(id: string, userId: string, role: string, status: string) {
  const item = await getItemById(id);
  const canUpdate = ['admin','moderator'].includes(role) || item.assignedTo === userId || item.assignedBy === userId;
  if (!canUpdate) throw Object.assign(new Error('Access denied'), { statusCode: 403 });
  const r = await query<WorkItemRow>('UPDATE work_items SET status=$1 WHERE id=$2 RETURNING *', [status, id]);
  return map(r.rows[0]);
}

export async function getOpenCount() {
  const r = await query<{ count: string }>("SELECT COUNT(*) as count FROM work_items WHERE status IN ('todo','in_progress','blocked')");
  return parseInt(r.rows[0].count);
}
