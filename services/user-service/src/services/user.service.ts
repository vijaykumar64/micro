import { query } from '../db/pool';

interface ProfileRow {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

function mapProfile(row: ProfileRow) {
  return {
    id: row.id,
    userId: row.user_id,
    firstName: row.first_name,
    lastName: row.last_name,
    bio: row.bio,
    avatarUrl: row.avatar_url,
    phone: row.phone,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function createProfile(userId: string, firstName?: string, lastName?: string) {
  const result = await query<ProfileRow>(
    `INSERT INTO user_profiles (user_id, first_name, last_name)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id) DO UPDATE SET first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name
     RETURNING *`,
    [userId, firstName || null, lastName || null]
  );
  return mapProfile(result.rows[0]);
}

export async function getProfile(userId: string) {
  const result = await query<ProfileRow>('SELECT * FROM user_profiles WHERE user_id = $1', [userId]);
  if (!result.rows[0]) throw Object.assign(new Error('Profile not found'), { statusCode: 404 });
  return mapProfile(result.rows[0]);
}

export async function updateProfile(userId: string, data: Partial<{
  firstName: string; lastName: string; bio: string; avatarUrl: string; phone: string;
}>) {
  const fields: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (data.firstName !== undefined) { fields.push(`first_name = $${idx++}`); values.push(data.firstName); }
  if (data.lastName !== undefined)  { fields.push(`last_name = $${idx++}`);  values.push(data.lastName); }
  if (data.bio !== undefined)       { fields.push(`bio = $${idx++}`);         values.push(data.bio); }
  if (data.avatarUrl !== undefined) { fields.push(`avatar_url = $${idx++}`);  values.push(data.avatarUrl); }
  if (data.phone !== undefined)     { fields.push(`phone = $${idx++}`);       values.push(data.phone); }

  if (fields.length === 0) return getProfile(userId);

  values.push(userId);
  const result = await query<ProfileRow>(
    `UPDATE user_profiles SET ${fields.join(', ')} WHERE user_id = $${idx} RETURNING *`,
    values
  );
  if (!result.rows[0]) throw Object.assign(new Error('Profile not found'), { statusCode: 404 });
  return mapProfile(result.rows[0]);
}

export async function getAllProfiles(page = 1, limit = 20) {
  const offset = (page - 1) * limit;
  const [data, count] = await Promise.all([
    query<ProfileRow>('SELECT * FROM user_profiles ORDER BY created_at DESC LIMIT $1 OFFSET $2', [limit, offset]),
    query<{ count: string }>('SELECT COUNT(*) as count FROM user_profiles'),
  ]);
  return {
    profiles: data.rows.map(mapProfile),
    total: parseInt(count.rows[0].count),
    page,
    limit,
  };
}

export async function deleteProfile(userId: string) {
  await query('DELETE FROM user_profiles WHERE user_id = $1', [userId]);
}
