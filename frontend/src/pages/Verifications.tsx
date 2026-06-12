import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { VerificationRequest, getMyRequests, getPendingRequests, submitRequest, reviewRequest } from '../services/verification.service';

const verificationTypeInfo: Record<string, { icon: string; desc: string }> = {
  identity: { icon: '🪪', desc: 'Government ID, passport, or national ID card' },
  address: { icon: '🏠', desc: 'Utility bill, bank statement, or lease agreement' },
  employment: { icon: '💼', desc: 'Employment letter or salary slip' },
  property: { icon: '📑', desc: 'Property deed or ownership documents' },
};

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, [string, string]> = {
    pending: ['#fef9c3', '#ca8a04'],
    in_review: ['#dbeafe', '#2563eb'],
    approved: ['#dcfce7', '#16a34a'],
    rejected: ['#fee2e2', '#dc2626'],
  };
  const [bg, fg] = colors[status] || ['#f1f5f9', '#64748b'];
  const dotColors: Record<string, string> = { pending: '#f59e0b', in_review: '#3b82f6', approved: '#10b981', rejected: '#ef4444' };
  return (
    <span style={{ background: bg, color: fg, padding: '3px 9px', borderRadius: '999px', fontSize: '12px', fontWeight: 600, textTransform: 'capitalize', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: dotColors[status] || '#94a3b8', display: 'inline-block', flexShrink: 0 }} />
      {status.replace('_', ' ')}
    </span>
  );
}

export function Verifications() {
  const { user } = useAuth();
  const isStaff = user?.role === 'admin' || user?.role === 'moderator';
  const [tab, setTab] = useState<'mine' | 'pending'>('mine');
  const [myRequests, setMyRequests] = useState<VerificationRequest[]>([]);
  const [pending, setPending] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedType, setSelectedType] = useState('identity');
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const mine = await getMyRequests();
        setMyRequests(mine);
        if (isStaff) { const p = await getPendingRequests(); setPending(p.requests); }
      } catch { setError('Failed to load'); }
      finally { setLoading(false); }
    }
    load();
  }, [isStaff]);

  const handleSubmit = async () => {
    setSubmitting(true); setError(''); setMsg('');
    try {
      const r = await submitRequest(selectedType);
      setMyRequests(prev => [r, ...prev]);
      setMsg('Verification request submitted! A staff member will review it shortly.');
    } catch { setError('Failed to submit'); }
    finally { setSubmitting(false); }
  };

  const handleReview = async (id: string, status: string) => {
    const notes = status === 'rejected' ? prompt('Rejection reason:') || '' : undefined;
    try {
      const updated = await reviewRequest(id, status, notes);
      setPending(p => p.filter(x => x.id !== id));
      setMyRequests(p => p.map(x => x.id === id ? updated : x));
      setMsg(status === 'approved' ? 'Request approved.' : 'Request rejected.');
    } catch { setError('Failed to update'); }
  };

  const displayList = tab === 'mine' ? myRequests : pending;

  return (
    <div>
      <h1 style={{ margin: '0 0 4px', fontSize: '26px', fontWeight: 700, color: '#1e293b' }}>Verifications</h1>
      <p style={{ color: '#64748b', marginBottom: '20px', fontSize: '14px' }}>Submit and track identity & document verification requests</p>

      {/* Feature explanation */}
      <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '13px 16px', marginBottom: '24px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
        <span style={{ fontSize: '18px', flexShrink: 0 }}>ℹ️</span>
        <p style={{ margin: 0, fontSize: '13px', color: '#1e40af', lineHeight: 1.6 }}>
          Verification requests are reviewed by staff members (moderators and admins). Select a document type below, submit your request, and a staff member will approve or reject it — usually within 1–2 business days.
        </p>
      </div>

      {error && <div style={errStyle}>{error}</div>}
      {msg && <div style={{ background: '#dcfce7', color: '#16a34a', padding: '10px 14px', borderRadius: '8px', fontSize: '14px', marginBottom: '16px', border: '1px solid #bbf7d0' }}>{msg}</div>}

      {/* Submit new request */}
      <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.07)', marginBottom: '24px' }}>
        <h3 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: 600, color: '#1e293b' }}>Submit New Request</h3>
        <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#64748b' }}>Choose the type of document you want to verify</p>

        {/* Type selector cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '10px', marginBottom: '16px' }}>
          {Object.entries(verificationTypeInfo).map(([type, info]) => (
            <div
              key={type}
              onClick={() => setSelectedType(type)}
              style={{
                padding: '12px',
                borderRadius: '8px',
                border: `2px solid ${selectedType === type ? '#6366f1' : '#e2e8f0'}`,
                background: selectedType === type ? '#eef2ff' : '#f8fafc',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              <div style={{ fontSize: '20px', marginBottom: '6px' }}>{info.icon}</div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', textTransform: 'capitalize', marginBottom: '2px' }}>{type}</div>
              <div style={{ fontSize: '11px', color: '#94a3b8', lineHeight: 1.4 }}>{info.desc}</div>
            </div>
          ))}
        </div>

        <button onClick={handleSubmit} disabled={submitting} className="btn-primary" style={{ background: '#6366f1', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 22px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
          {submitting ? 'Submitting...' : `Submit ${selectedType.charAt(0).toUpperCase() + selectedType.slice(1)} Request`}
        </button>
      </div>

      {/* Tabs (staff only) */}
      {isStaff && (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          {(['mine', 'pending'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 500, background: tab === t ? '#6366f1' : '#e2e8f0', color: tab === t ? '#fff' : '#374151' }}>
              {t === 'mine' ? 'My Requests' : (
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  Pending Review
                  {pending.length > 0 && <span style={{ background: '#ef4444', color: '#fff', borderRadius: '999px', padding: '1px 6px', fontSize: '11px', fontWeight: 700 }}>{pending.length}</span>}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Requests table */}
      {loading ? (
        <div style={{ background: '#fff', borderRadius: '12px', padding: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.07)' }}>
          {[1, 2, 3].map(i => <div key={i} style={{ height: '20px', borderRadius: '4px', marginBottom: '12px' }} className="skeleton" />)}
        </div>
      ) : displayList.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: '12px', padding: '48px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.07)' }}>
          <div style={{ fontSize: '36px', marginBottom: '12px' }}>✔</div>
          <p style={{ margin: 0, fontSize: '14px', color: '#94a3b8' }}>
            {tab === 'mine' ? 'No verification requests yet. Submit one above.' : 'No pending requests to review.'}
          </p>
        </div>
      ) : (
        <div style={{ background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.07)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={th}>Type</th>
                <th style={th}>Status</th>
                <th style={th}>Date</th>
                {displayList.some(r => r.notes) && <th style={th}>Notes</th>}
                {isStaff && tab === 'pending' && <th style={th}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {displayList.map(r => (
                <tr key={r.id}
                  onMouseEnter={e => (e.currentTarget.style.background = '#fafafa')}
                  onMouseLeave={e => (e.currentTarget.style.background = '')}>
                  <td style={td}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                      <span style={{ fontSize: '15px' }}>{verificationTypeInfo[r.type]?.icon || '📄'}</span>
                      <span style={{ textTransform: 'capitalize', fontWeight: 500 }}>{r.type}</span>
                    </span>
                  </td>
                  <td style={td}><StatusBadge status={r.status} /></td>
                  <td style={{ ...td, color: '#64748b', fontSize: '13px' }}>{new Date(r.createdAt).toLocaleDateString()}</td>
                  {displayList.some(x => x.notes) && (
                    <td style={{ ...td, color: '#64748b', fontSize: '13px', maxWidth: '200px' }}>
                      {r.notes ? <span style={{ color: '#dc2626' }}>{r.notes}</span> : '—'}
                    </td>
                  )}
                  {isStaff && tab === 'pending' && (
                    <td style={td}>
                      <button onClick={() => handleReview(r.id, 'approved')} style={{ ...actionBtn, color: '#16a34a', borderColor: '#16a34a', marginRight: '6px' }}>✓ Approve</button>
                      <button onClick={() => handleReview(r.id, 'rejected')} style={{ ...actionBtn, color: '#dc2626', borderColor: '#dc2626' }}>✕ Reject</button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const th: React.CSSProperties = { padding: '11px 16px', textAlign: 'left', fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' };
const td: React.CSSProperties = { padding: '13px 16px', fontSize: '14px', color: '#374151', borderBottom: '1px solid #f1f5f9' };
const actionBtn: React.CSSProperties = { background: 'transparent', border: '1px solid', padding: '5px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontWeight: 500 };
const errStyle: React.CSSProperties = { background: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: '8px', fontSize: '14px', marginBottom: '16px', border: '1px solid #fecaca' };
