import { useEffect, useState, FormEvent } from 'react';
import { Property, listProperties, createProperty, deleteProperty } from '../services/property.service';

const statusColor: Record<string, string> = {
  available: '#10b981', rented: '#f59e0b', sold: '#6366f1', inactive: '#94a3b8',
};

const propertyTypeIcon: Record<string, string> = {
  residential: '🏠', commercial: '🏢', land: '🌿',
};

export function Properties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [form, setForm] = useState({
    title: '', city: '', state: '', price: '', propertyType: 'residential',
    bedrooms: '', bathrooms: '', areaSqft: '', status: 'available',
  });

  const load = async (p: number) => {
    setLoading(true);
    try {
      const d = await listProperties(p);
      setProperties(d.properties);
      setTotal(d.total);
    } catch {
      setError('Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(page); }, [page]);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const p = await createProperty({
        ...form,
        price: form.price ? +form.price : undefined,
        bedrooms: form.bedrooms ? +form.bedrooms : undefined,
        bathrooms: form.bathrooms ? +form.bathrooms : undefined,
        areaSqft: form.areaSqft ? +form.areaSqft : undefined,
      });
      setProperties(prev => [p, ...prev]);
      setTotal(t => t + 1);
      setShowForm(false);
      setForm({ title: '', city: '', state: '', price: '', propertyType: 'residential', bedrooms: '', bathrooms: '', areaSqft: '', status: 'available' });
    } catch {
      setError('Failed to create property');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this property?')) return;
    try {
      await deleteProperty(id);
      setProperties(p => p.filter(x => x.id !== id));
      setTotal(t => t - 1);
    } catch {
      setError('Failed to delete');
    }
  };

  const filtered = properties.filter(p => {
    if (filterStatus && p.status !== filterStatus) return false;
    if (filterType && p.propertyType !== filterType) return false;
    return true;
  });

  const totalPages = Math.ceil(total / 20);

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ margin: '0 0 4px', fontSize: '26px', fontWeight: 700, color: '#1e293b' }}>Properties</h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>{total} listings — browse and manage real estate properties</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary" style={btnPrimary}>
          {showForm ? '✕ Cancel' : '+ Add Property'}
        </button>
      </div>

      {error && <div style={errStyle}>{error}</div>}

      {/* Filter bar */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={filterSelect}>
          <option value="">All statuses</option>
          <option value="available">Available</option>
          <option value="rented">Rented</option>
          <option value="sold">Sold</option>
          <option value="inactive">Inactive</option>
        </select>
        <select value={filterType} onChange={e => setFilterType(e.target.value)} style={filterSelect}>
          <option value="">All types</option>
          <option value="residential">Residential</option>
          <option value="commercial">Commercial</option>
          <option value="land">Land</option>
        </select>
        {(filterStatus || filterType) && (
          <button onClick={() => { setFilterStatus(''); setFilterType(''); }} style={{ background: '#f1f5f9', border: 'none', borderRadius: '8px', padding: '8px 14px', fontSize: '13px', color: '#64748b', cursor: 'pointer', fontWeight: 500 }}>
            ✕ Clear filters
          </button>
        )}
      </div>

      {/* Add Property form */}
      {showForm && (
        <div style={{ ...card, marginBottom: '24px' }}>
          <h2 style={{ margin: '0 0 4px', fontSize: '17px', fontWeight: 600, color: '#1e293b' }}>Add New Property</h2>
          <p style={{ margin: '0 0 20px', fontSize: '13px', color: '#64748b' }}>Fill in the details below to list a property</p>
          <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div style={{ gridColumn: '1/-1' }}>
              <label style={lbl}>Property title *</label>
              <input required value={form.title} onChange={set('title')} style={inp} placeholder="e.g. 3BHK Apartment in Banjara Hills" />
            </div>
            <div>
              <label style={lbl}>City</label>
              <input value={form.city} onChange={set('city')} style={inp} placeholder="Hyderabad" />
            </div>
            <div>
              <label style={lbl}>State</label>
              <input value={form.state} onChange={set('state')} style={inp} placeholder="Telangana" />
            </div>
            <div>
              <label style={lbl}>Price (₹)</label>
              <input type="number" value={form.price} onChange={set('price')} style={inp} placeholder="5000000" />
            </div>
            <div>
              <label style={lbl}>Property type</label>
              <select value={form.propertyType} onChange={set('propertyType')} style={inp}>
                <option value="residential">🏠 Residential</option>
                <option value="commercial">🏢 Commercial</option>
                <option value="land">🌿 Land</option>
              </select>
            </div>
            <div>
              <label style={lbl}>Bedrooms</label>
              <input type="number" value={form.bedrooms} onChange={set('bedrooms')} style={inp} placeholder="3" />
            </div>
            <div>
              <label style={lbl}>Bathrooms</label>
              <input type="number" value={form.bathrooms} onChange={set('bathrooms')} style={inp} placeholder="2" />
            </div>
            <div>
              <label style={lbl}>Area (sqft)</label>
              <input type="number" value={form.areaSqft} onChange={set('areaSqft')} style={inp} placeholder="1200" />
            </div>
            <div>
              <label style={lbl}>Status</label>
              <select value={form.status} onChange={set('status')} style={inp}>
                <option value="available">Available</option>
                <option value="rented">Rented</option>
                <option value="sold">Sold</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <button type="submit" disabled={saving} className="btn-primary" style={btnPrimary}>
                {saving ? 'Creating...' : 'Create Property'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Property grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {[1, 2, 3].map(i => <div key={i} style={{ height: '280px', borderRadius: '12px' }} className="skeleton" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: '12px', padding: '60px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.07)' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>⌂</div>
          <p style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: 600, color: '#374151' }}>
            {properties.length === 0 ? 'No properties yet' : 'No properties match your filters'}
          </p>
          <p style={{ margin: 0, fontSize: '14px', color: '#94a3b8' }}>
            {properties.length === 0 ? 'Add your first property using the button above.' : 'Try changing or clearing the filters.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {filtered.map(p => (
            <div key={p.id} className="card-hover" style={{ ...card, padding: 0, overflow: 'hidden', position: 'relative' }}>
              {/* Image placeholder */}
              <div style={{ height: '120px', background: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', color: '#94a3b8', position: 'relative' }}>
                {propertyTypeIcon[p.propertyType] || '🏠'}
                <div style={{ position: 'absolute', top: '12px', left: '12px' }}>
                  <span style={{ background: statusColor[p.status] + '22', color: statusColor[p.status], padding: '3px 9px', borderRadius: '999px', fontSize: '11px', fontWeight: 700, textTransform: 'capitalize', backdropFilter: 'blur(4px)', border: `1px solid ${statusColor[p.status]}44` }}>
                    {p.status}
                  </span>
                </div>
              </div>

              <div style={{ padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#1e293b', lineHeight: 1.3, flex: 1, marginRight: '8px' }}>{p.title}</h3>
                  <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'capitalize', flexShrink: 0 }}>{p.propertyType}</span>
                </div>

                {p.city && (
                  <p style={{ margin: '0 0 10px', fontSize: '13px', color: '#64748b' }}>
                    📍 {[p.city, p.state].filter(Boolean).join(', ')}
                  </p>
                )}

                {p.price && (
                  <p style={{ margin: '0 0 10px', fontSize: '20px', fontWeight: 700, color: '#6366f1' }}>
                    ₹{p.price.toLocaleString('en-IN')}
                    {p.status === 'rented' && <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 400 }}>/mo</span>}
                  </p>
                )}

                <div style={{ display: 'flex', gap: '14px', fontSize: '13px', color: '#64748b', marginBottom: '12px' }}>
                  {p.bedrooms != null && <span>🛏 {p.bedrooms} beds</span>}
                  {p.bathrooms != null && <span>🚿 {p.bathrooms} baths</span>}
                  {p.areaSqft != null && <span>📐 {p.areaSqft} sqft</span>}
                </div>

                <button onClick={() => handleDelete(p.id)} className="btn-danger" style={{ background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', padding: '5px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontWeight: 500 }}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div style={{ display: 'flex', gap: '8px', marginTop: '24px', justifyContent: 'center', alignItems: 'center' }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={pageBtn}>← Prev</button>
          <span style={{ fontSize: '14px', color: '#64748b', minWidth: '80px', textAlign: 'center' }}>Page {page} of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={pageBtn}>Next →</button>
        </div>
      )}
    </div>
  );
}

const card: React.CSSProperties = { background: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.07)' };
const lbl: React.CSSProperties = { display: 'block', marginBottom: '5px', fontSize: '13px', color: '#374151', fontWeight: 500 };
const inp: React.CSSProperties = { width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box', color: '#1e293b' };
const btnPrimary: React.CSSProperties = { background: '#6366f1', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' };
const errStyle: React.CSSProperties = { background: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: '8px', fontSize: '14px', marginBottom: '16px', border: '1px solid #fecaca' };
const pageBtn: React.CSSProperties = { padding: '7px 16px', borderRadius: '8px', border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', fontSize: '14px', fontWeight: 500 };
const filterSelect: React.CSSProperties = { padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #d1d5db', fontSize: '13px', color: '#374151', background: '#fff', cursor: 'pointer' };
