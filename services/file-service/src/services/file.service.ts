import fs from 'fs';
import { createReadStream } from 'fs';
import axios from 'axios';
import { query } from '../db/pool';

const DASHBOARD_URL = process.env.DASHBOARD_SERVICE_URL || 'http://localhost:3003';
const INTERNAL_SECRET = process.env.INTERNAL_SERVICE_SECRET || 'internal_secret_dev';

interface FileRow {
  id: string;
  user_id: string;
  original_name: string;
  stored_name: string;
  mime_type: string;
  size_bytes: string;
  storage_path: string;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

function mapFile(row: FileRow) {
  return {
    id: row.id,
    userId: row.user_id,
    originalName: row.original_name,
    storedName: row.stored_name,
    mimeType: row.mime_type,
    sizeBytes: parseInt(row.size_bytes),
    storagePath: row.storage_path,
    isDeleted: row.is_deleted,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function saveFileRecord(
  userId: string,
  file: Express.Multer.File
) {
  const result = await query<FileRow>(
    `INSERT INTO files (user_id, original_name, stored_name, mime_type, size_bytes, storage_path)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [userId, file.originalname, file.filename, file.mimetype, file.size, file.path]
  );

  try {
    await axios.post(
      `${DASHBOARD_URL}/internal/log`,
      { userId, action: 'FILE_UPLOAD', metadata: { fileId: result.rows[0].id, fileName: file.originalname } },
      { headers: { 'x-internal-secret': INTERNAL_SECRET } }
    );
  } catch {
    // non-critical: don't fail upload if logging fails
  }

  return mapFile(result.rows[0]);
}

export async function getFilesByUser(userId: string, page = 1, limit = 20) {
  const offset = (page - 1) * limit;
  const [data, count] = await Promise.all([
    query<FileRow>(
      'SELECT * FROM files WHERE user_id = $1 AND is_deleted = false ORDER BY created_at DESC LIMIT $2 OFFSET $3',
      [userId, limit, offset]
    ),
    query<{ count: string }>(
      'SELECT COUNT(*) as count FROM files WHERE user_id = $1 AND is_deleted = false',
      [userId]
    ),
  ]);
  return {
    files: data.rows.map(mapFile),
    total: parseInt(count.rows[0].count),
    page,
    limit,
  };
}

export async function getFileById(fileId: string, userId: string, role: string) {
  const result = await query<FileRow>(
    'SELECT * FROM files WHERE id = $1 AND is_deleted = false',
    [fileId]
  );
  const file = result.rows[0];
  if (!file) throw Object.assign(new Error('File not found'), { statusCode: 404 });
  if (file.user_id !== userId && role !== 'admin') {
    throw Object.assign(new Error('Access denied'), { statusCode: 403 });
  }
  return mapFile(file);
}

export async function deleteFile(fileId: string, userId: string, role: string) {
  const file = await getFileById(fileId, userId, role);
  await query('UPDATE files SET is_deleted = true WHERE id = $1', [fileId]);
  try {
    fs.unlinkSync(file.storagePath);
  } catch {
    // file may already be gone from disk
  }
}

export async function getFileStream(fileId: string, userId: string, role: string) {
  const file = await getFileById(fileId, userId, role);
  const stream = createReadStream(file.storagePath);
  return { stream, file };
}
