import { query } from '../db/pool';

interface PropertyRow {
  id: string; owner_id: string; title: string; description: string | null;
  address: string | null; city: string | null; state: string | null; country: string | null;
  price: string | null; status: string; property_type: string;
  bedrooms: number | null; bathrooms: number | null; area_sqft: string | null;
  is_deleted: boolean; created_at: string; updated_at: string;
}

function map(r: PropertyRow) {
  return { id: r.id, ownerId: r.owner_id, title: r.title, description: r.description,
    address: r.address, city: r.city, state: r.state, country: r.country,
    price: r.price ? parseFloat(r.price) : null, status: r.status, propertyType: r.property_type,
    bedrooms: r.bedrooms, bathrooms: r.bathrooms, areaSqft: r.area_sqft ? parseFloat(r.area_sqft) : null,
    createdAt: r.created_at, updatedAt: r.updated_at };
}

export async function createProperty(ownerId: string, data: Record<string, unknown>) {
  const r = await query<PropertyRow>(
    `INSERT INTO properties (owner_id,title,description,address,city,state,country,price,status,property_type,bedrooms,bathrooms,area_sqft)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
    [ownerId, data.title, data.description||null, data.address||null, data.city||null,
     data.state||null, data.country||'India', data.price||null, data.status||'available',
     data.propertyType||'residential', data.bedrooms||null, data.bathrooms||null, data.areaSqft||null]
  );
  return map(r.rows[0]);
}

export async function listProperties(page = 1, limit = 20, filters: Record<string, string> = {}) {
  const conditions: string[] = ['is_deleted = false'];
  const params: unknown[] = [];
  let i = 1;
  if (filters.city)   { conditions.push(`city ILIKE $${i++}`);   params.push(`%${filters.city}%`); }
  if (filters.status) { conditions.push(`status = $${i++}`);     params.push(filters.status); }
  if (filters.type)   { conditions.push(`property_type = $${i++}`); params.push(filters.type); }
  const where = conditions.join(' AND ');
  const offset = (page - 1) * limit;
  const [data, count] = await Promise.all([
    query<PropertyRow>(`SELECT * FROM properties WHERE ${where} ORDER BY created_at DESC LIMIT $${i} OFFSET $${i+1}`, [...params, limit, offset]),
    query<{ count: string }>(`SELECT COUNT(*) as count FROM properties WHERE ${where}`, params),
  ]);
  return { properties: data.rows.map(map), total: parseInt(count.rows[0].count), page, limit };
}

export async function getMyProperties(ownerId: string, page = 1, limit = 20) {
  const offset = (page - 1) * limit;
  const [data, count] = await Promise.all([
    query<PropertyRow>('SELECT * FROM properties WHERE owner_id=$1 AND is_deleted=false ORDER BY created_at DESC LIMIT $2 OFFSET $3', [ownerId, limit, offset]),
    query<{ count: string }>('SELECT COUNT(*) as count FROM properties WHERE owner_id=$1 AND is_deleted=false', [ownerId]),
  ]);
  return { properties: data.rows.map(map), total: parseInt(count.rows[0].count), page, limit };
}

export async function getPropertyById(id: string) {
  const r = await query<PropertyRow>('SELECT * FROM properties WHERE id=$1 AND is_deleted=false', [id]);
  if (!r.rows[0]) throw Object.assign(new Error('Property not found'), { statusCode: 404 });
  return map(r.rows[0]);
}

export async function updateProperty(id: string, userId: string, role: string, data: Record<string, unknown>) {
  const prop = await getPropertyById(id);
  if (prop.ownerId !== userId && role !== 'admin') throw Object.assign(new Error('Access denied'), { statusCode: 403 });
  const fields: string[] = []; const vals: unknown[] = []; let i = 1;
  const allowed = ['title','description','address','city','state','country','price','status','property_type','bedrooms','bathrooms','area_sqft'];
  const keyMap: Record<string, string> = { propertyType: 'property_type', areaSqft: 'area_sqft' };
  for (const [k, v] of Object.entries(data)) {
    const col = keyMap[k] || k;
    if (allowed.includes(col)) { fields.push(`${col}=$${i++}`); vals.push(v); }
  }
  if (!fields.length) return prop;
  vals.push(id);
  const r = await query<PropertyRow>(`UPDATE properties SET ${fields.join(',')} WHERE id=$${i} RETURNING *`, vals);
  return map(r.rows[0]);
}

export async function deleteProperty(id: string, role: string) {
  if (role !== 'admin') throw Object.assign(new Error('Admin access required'), { statusCode: 403 });
  await query('UPDATE properties SET is_deleted=true WHERE id=$1', [id]);
}

export async function getTotalCount() {
  const r = await query<{ count: string }>('SELECT COUNT(*) as count FROM properties WHERE is_deleted=false');
  return parseInt(r.rows[0].count);
}
