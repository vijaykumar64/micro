import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { WorkItem, getMyItems, getAllItems, createItem, updateStatus } from '../services/work-items.service';

const STATUSES = ['todo', 'in_progress', 'done', 'blocked'] as const;
const PRIORITIES = ['low', 'medium', 'high', 'urgent'] as const;

const statusLabel: Record<string, string> = { todo: 'To Do', in_progress: 'In Progress', done: 'Done', blocked: 'Blocked' };
const statusDesc: Record<string, string> = { todo: 'Not started yet', in_progress: 'Being worked on', done: 'Completed', blocked: 'Waiting on something' };
const statusColor: Record<string, string> = { todo: '#6366f1', in_progress: '#f59e0b', done: '#10b981', blocked: '#ef4444' };
const statusBg: Record<string, string> = { todo: '#eef2ff', in_progress: '#fffbeb', done: '#f0fdf4', blocked: '#fef2f2' };
const priorityColor: Record<string, [string, string]> = {
  low: ['#f0fdf4', '#16a34a'],
  medium: ['#fefce8', '#ca8a04'],
  high: ['#fff7ed', '#ea580c'],
  urgent: ['#fef2f2', '#dc2626'],
};

export function WorkItems() {
  const { user } = useAuth();
  const isStaff = user?.role === 'admin' || user?.role === 'moderator';
  const [items, setItems] = useState<WorkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [viewAll, setViewAll] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium', dueDate: '', assignedTo: '' });

  const load = async () => {
    setLoading(true);
    try {
      if (isStaff && viewAll) {
        const d = await getAllItems(); setItems(d.items);
      } else {
        const d = await getMyItems(); setItems(d);
      }
    } catch { setError('Failed to load'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [viewAll, isStaff]);

  const handleCreate = async () => {
    if (!form.title.trim()) { setError('Title is required'); return; }
    setSaving(true); setError('');
    try {
      const payload: Record<string, unknown> = { title: form.title, priority: form.priority };
      if (form.description) payload.description = form.description;
      if (form.dueDate) payload.dueDate = form.dueDate;
      if (form.assignedTo) payload.assignedTo = form.assignedTo;
      const item = await createItem(payload);
      setItems(prev => [item, ...prev]);
      setShowForm(false);
      setForm({ title: '', description: '', priority: 'medium', dueDate: '', assignedTo: '' });
    } catch { setError('Failed to create'); }
    finally { setSaving(false); }
  };

  const handleStatus = async (id: string, status: string) => {
    try {
      const updated = await updateStatus(id, status);
      setItems(p => p.map(x => x.id === id ? updated : x));
    } catch { setError('Failed to update status'); }
  };

  const byStatus = (s: string) => items.filter(i => i.status === s);

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ margin: '0 0 4px', fontSize: '26px', fontWeight: 700, color: '#1e293b' }}>Work Items</h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>{items.length} items — track tasks across stages with a Kanban board</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {isStaff && (
            <button
              onClick={() => setViewAll(v => !v)}
              style={{ background: viewAll ? '#1e293b' : '#e2e8f0', color: viewAll ? '#fff' : '#374151', border: 'none', borderRadius: '8px', padding: '10px 16px', fontSize: '14px', fontWeight: 500, cursor: 'pointer' }}
            >
              {viewAll ? '👁 All Items' : '👤 My Items'}
            </button>
          )}
          <button
            onClick={() => setShowForm(!showForm)}
            style={{ background: '#6366f1', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
          >
            {showForm ? '✕ Cancel' : '+ New Item'}
          </button>
        </div>
      </div>

      {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: '8px', fontSize: '14px', marginBottom: '16px', border: '1px solid #fecaca' }}>{error}</div>}

      {/* Create form */}
      {showForm && (
        <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.07)', marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: 600, color: '#1e293b' }}>New Work Item</h3>
          <p style={{ margin: '0 0 18px', fontSize: '13px', color: '#64748b' }}>Add a task to your board</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div style={{ gridColumn: '1/-1' }}>
              <label style={lbl}>Title *</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} style={inp} placeholder="What needs to be done?" />
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <label style={lbl}>Description</label>
              <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={inp} placeholder="Add more context or details..." />
            </div>
            <div>
              <label style={lbl}>Priority</label>
              <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))} style={inp}>
                {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Due Date</label>
              <input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} style={inp} />
            </div>
            {isStaff && (
              <div style={{ gridColumn: '1/-1' }}>
                <label style={lbl}>
                  Assign To (User ID)
                  <span style={{ color: '#94a3b8', fontWeight: 400, marginLeft: '6px' }}>— leave blank to assign to yourself</span>
                </label>
                <input value={form.assignedTo} onChange={e => setForm(f => ({ ...f, assignedTo: e.target.value }))} style={inp} placeholder="UUID of the person to assign this to" />
              </div>
            )}
            <div style={{ gridColumn: '1/-1' }}>
              <button onClick={handleCreate} disabled={saving} className="btn-primary" style={{ background: '#6366f1', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 22px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
                {saving ? 'Creating...' : 'Create Item'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Kanban board */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          {[1, 2, 3, 4].map(i => <div key={i} style={{ height: '300px', borderRadius: '12px' }} className="skeleton" />)}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', alignItems: 'start' }}>
          {STATUSES.map(s => (
            <div key={s} style={{ background: statusBg[s], borderRadius: '12px', padding: '14px', minHeight: '200px', border: `1px solid ${statusColor[s]}22` }}>
              {/* Column header */}
              <div style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                  <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: statusColor[s], flexShrink: 0 }} />
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>{statusLabel[s]}</span>
                  <span style={{ marginLeft: 'auto', background: statusColor[s] + '22', color: statusColor[s], borderRadius: '999px', padding: '1px 7px', fontSize: '11px', fontWeight: 700 }}>{byStatus(s).length}</span>
                </div>
                <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8', paddingLeft: '17px' }}>{statusDesc[s]}</p>
              </div>

              {/* Items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {byStatus(s).length === 0 && (
                  <div style={{ border: '1.5px dashed #d1d5db', borderRadius: '8px', padding: '20px 12px', textAlign: 'center' }}>
                    <p style={{ color: '#cbd5e1', fontSize: '12px', margin: 0 }}>No items here</p>
                  </div>
                )}
                {byStatus(s).map(item => (
                  <div key={item.id} className="card-hover" style={{ background: '#fff', borderRadius: '8px', padding: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.07)', borderLeft: `3px solid ${statusColor[s]}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', lineHeight: 1.3, marginRight: '6px' }}>{item.title}</span>
                      <span style={{ background: priorityColor[item.priority][0], color: priorityColor[item.priority][1], padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 700, textTransform: 'capitalize', whiteSpace: 'nowrap', flexShrink: 0 }}>
                        {item.priority}
                      </span>
                    </div>
                    {item.description && (
                      <p style={{ margin: '0 0 8px', fontSize: '12px', color: '#64748b', lineHeight: 1.4 }}>{item.description}</p>
                    )}
                    {item.dueDate && (
                      <p style={{ margin: '0 0 8px', fontSize: '11px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        📅 Due {new Date(item.dueDate).toLocaleDateString()}
                      </p>
                    )}
                    <select
                      value={item.status}
                      onChange={e => handleStatus(item.id, e.target.value)}
                      style={{ width: '100%', padding: '4px 8px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '11px', color: '#374151', background: '#f8fafc', cursor: 'pointer' }}
                    >
                      {STATUSES.map(st => <option key={st} value={st}>{statusLabel[st]}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const lbl: React.CSSProperties = { display: 'block', marginBottom: '5px', fontSize: '13px', color: '#374151', fontWeight: 500 };
const inp: React.CSSProperties = { width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box', color: '#1e293b' };
