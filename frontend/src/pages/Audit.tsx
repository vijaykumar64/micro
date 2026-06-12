import { useEffect, useState } from 'react';
import { AuditLog, getLogs } from '../services/audit.service';

const actionColor: Record<string, string> = {
  create: '#dcfce7', update: '#dbeafe', delete: '#fee2e2', login: '#f3e8ff',
  logout: '#f1f5f9', view: '#fef9c3', upload: '#dbeafe', download: '#dcfce7',
};
const actionText: Record<string, string> = {
  create: '#16a34a', update: '#2563eb', delete: '#dc2626', login: '#7c3aed',
  logout: '#64748b', view: '#ca8a04', upload: '#2563eb', download: '#16a34a',
};

const SERVICES = ['auth', 'user', 'dashboard', 'file', 'property', 'verification', 'work-items', 'notification', 'audit'];
const ACTIONS = ['create', 'update', 'delete', 'login', 'logout', 'view', 'upload', 'download'];

export function Audit() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ service: '', action: '', userId: '' });
  const [applied, setApplied] = useState<typeof filters>({ service: '', action: '', userId: '' });
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  const load = async (p: number, f: typeof filters) => {
    setLoading(true);
    try {
      const active: Record<string, string> = {};
      if (f.service) active.service = f.service;
      if (f.action) active.action = f.action;
      if (f.userId) active.userId = f.userId;
      const d = await getLogs(p, active);
      setLogs(d.logs);
      setTotal(d.total);
    } catch { setError('Failed to load audit logs'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(page, applied); }, [page, applied]);

  const handleApply = () => { setPage(1); setApplied({ ...filters }); };
  const handleClear = () => {
    const empty = { service: '', action: '', userId: '' };
    setFilters(empty);
    setPage(1);
    setApplied(empty);
  };

  const totalPages = Math.ceil(total / 20);
  const hasFilters = applied.service || applied.action || applied.userId;

  return (
    <div>
      <h1 style={{ margin: '0 0 4px', fontSize: '26px', fontWeight: 700, color: '#1e293b' }}>Audit Log</h1>
      <p style={{ color: '#64748b', marginBottom: '20px', fontSize: '14px' }}>
        Track all system events and changes across microservices — visible to admins and moderators only
      </p>

      {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: '8px', fontSize: '14px', marginBottom: '16px', border: '1px solid #fecaca' }}>{error}</div>}

      {/* Filter panel */}
      <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.07)', marginBottom: '20px' }}>
        <div style={{ fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '12px' }}>Filter Logs</div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div>
            <label style={lbl}>Service</label>
            <select value={filters.service} onChange={e => setFilters(f => ({ ...f, service: e.target.value }))} style={filterSel}>
              <option value="">All services</option>
              {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label style={lbl}>Action</label>
            <select value={filters.action} onChange={e => setFilters(f => ({ ...f, action: e.target.value }))} style={filterSel}>
              <option value="">All actions</option>
              {ACTIONS.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <div>
            <label style={lbl}>User ID</label>
            <input
              value={filters.userId}
              onChange={e => setFilters(f => ({ ...f, userId: e.target.value }))}
              placeholder="UUID..."
              style={{ ...filterSel, width: '200px' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={handleApply} className="btn-primary" style={{ background: '#6366f1', color: '#fff', border: 'none', borderRadius: '8px', padding: '9px 18px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
              Apply
            </button>
            {hasFilters && (
              <button onClick={handleClear} className="btn-secondary" style={{ background: '#e2e8f0', color: '#374151', border: 'none', borderRadius: '8px', padding: '9px 16px', fontSize: '14px', cursor: 'pointer' }}>
                Clear
              </button>
            )}
          </div>
        </div>
        {hasFilters && (
          <div style={{ marginTop: '10px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', color: '#64748b' }}>Active filters:</span>
            {applied.service && <span style={filterChip}>service: {applied.service}</span>}
            {applied.action && <span style={filterChip}>action: {applied.action}</span>}
            {applied.userId && <span style={filterChip}>user: {applied.userId.slice(0, 8)}...</span>}
          </div>
        )}
      </div>

      {/* Results */}
      <div style={{ background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.07)' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
          <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>
            {total.toLocaleString()} total entries
            {hasFilters && ' (filtered)'}
          </span>
          {totalPages > 1 && (
            <span style={{ fontSize: '13px', color: '#64748b' }}>Page {page} of {totalPages}</span>
          )}
        </div>

        {loading ? (
          <div style={{ padding: '24px 16px' }}>
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} style={{ height: '44px', borderRadius: '6px', marginBottom: '8px' }} className="skeleton" />
            ))}
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={th}>Time</th>
                <th style={th}>User</th>
                <th style={th}>Action</th>
                <th style={th}>Service</th>
                <th style={th}>Resource</th>
                <th style={th}>IP</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: '48px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
                    <div style={{ fontSize: '32px', marginBottom: '10px' }}>📋</div>
                    No audit logs found{hasFilters ? ' for the current filters' : ''}
                  </td>
                </tr>
              )}
              {logs.map(log => (
                <tr
                  key={log.id}
                  onMouseEnter={() => setHoveredRow(log.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                  style={{ background: hoveredRow === log.id ? '#fafafa' : '', borderBottom: '1px solid #f8fafc', transition: 'background 0.1s' }}
                >
                  <td style={td}>
                    <div style={{ fontSize: '13px', color: '#1e293b', fontWeight: 500 }}>{new Date(log.createdAt).toLocaleDateString()}</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>{new Date(log.createdAt).toLocaleTimeString()}</div>
                  </td>
                  <td style={td}>
                    <div
                      style={{ fontSize: '12px', fontFamily: 'monospace', color: '#374151', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                      title={log.userId || undefined}
                    >
                      {log.userId || <span style={{ color: '#94a3b8', fontFamily: 'inherit', fontSize: '12px' }}>System</span>}
                    </div>
                  </td>
                  <td style={td}>
                    <span style={{ background: actionColor[log.action] || '#f1f5f9', color: actionText[log.action] || '#64748b', padding: '2px 9px', borderRadius: '4px', fontSize: '12px', fontWeight: 600, textTransform: 'capitalize' }}>
                      {log.action}
                    </span>
                  </td>
                  <td style={td}>
                    <span style={{ fontSize: '12px', color: '#6366f1', fontWeight: 600, background: '#eef2ff', padding: '2px 7px', borderRadius: '4px' }}>
                      {log.service}
                    </span>
                  </td>
                  <td style={td}>
                    {log.resourceType ? (
                      <div>
                        <span style={{ fontSize: '12px', color: '#374151', textTransform: 'capitalize', fontWeight: 500 }}>{log.resourceType}</span>
                        {log.resourceId && (
                          <div
                            style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'monospace', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                            title={log.resourceId}
                          >
                            {log.resourceId}
                          </div>
                        )}
                      </div>
                    ) : <span style={{ color: '#cbd5e1' }}>—</span>}
                  </td>
                  <td style={td}>
                    <span style={{ fontSize: '12px', color: '#64748b', fontFamily: 'monospace' }}>
                      {log.ipAddress || '—'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', gap: '8px', marginTop: '20px', justifyContent: 'center', alignItems: 'center' }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={pageBtn}>← Prev</button>
          <span style={{ fontSize: '14px', color: '#64748b', minWidth: '90px', textAlign: 'center' }}>Page {page} of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={pageBtn}>Next →</button>
        </div>
      )}
    </div>
  );
}

const th: React.CSSProperties = { padding: '10px 16px', textAlign: 'left', fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', background: '#f8fafc', fontWeight: 600 };
const td: React.CSSProperties = { padding: '10px 16px', fontSize: '13px', color: '#374151' };
const lbl: React.CSSProperties = { display: 'block', marginBottom: '4px', fontSize: '12px', color: '#374151', fontWeight: 500 };
const filterSel: React.CSSProperties = { padding: '8px 10px', borderRadius: '7px', border: '1.5px solid #d1d5db', fontSize: '13px', color: '#374151', background: '#fff', cursor: 'pointer' };
const filterChip: React.CSSProperties = { background: '#eef2ff', color: '#4338ca', padding: '2px 9px', borderRadius: '4px', fontSize: '12px', fontWeight: 500 };
const pageBtn: React.CSSProperties = { padding: '7px 16px', borderRadius: '8px', border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', fontSize: '14px', fontWeight: 500 };
