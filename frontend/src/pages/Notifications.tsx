import { useEffect, useState } from 'react';
import {
  Notification, NotificationPreferences,
  getNotifications, getUnreadCount, markRead, markAllRead,
  getPreferences, updatePreferences,
} from '../services/notification.service';

const typeIcon: Record<string, string> = { email: '📧', sms: '💬', push: '🔔', in_app: '📱' };
const typeColor: Record<string, string> = { email: '#dbeafe', sms: '#dcfce7', push: '#fef9c3', in_app: '#f3e8ff' };
const prefDesc: Record<string, string> = {
  emailEnabled: 'Receive important updates and alerts via email',
  smsEnabled: 'Get time-sensitive notifications via SMS',
  pushEnabled: 'Browser push notifications for real-time alerts',
  inAppEnabled: 'Show notifications inside the app',
};
const prefLabel: Record<string, string> = {
  emailEnabled: 'Email Notifications',
  smsEnabled: 'SMS Notifications',
  pushEnabled: 'Push Notifications',
  inAppEnabled: 'In-App Notifications',
};

export function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'all' | 'prefs'>('all');
  const [prefs, setPrefs] = useState<NotificationPreferences | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [list, cnt] = await Promise.all([getNotifications(), getUnreadCount()]);
      setNotifications(list);
      setUnread(cnt);
    } catch { setError('Failed to load notifications'); }
    finally { setLoading(false); }
  };

  const loadPrefs = async () => {
    try { setPrefs(await getPreferences()); }
    catch { setError('Failed to load preferences'); }
  };

  useEffect(() => { load(); }, []);
  useEffect(() => { if (tab === 'prefs' && !prefs) loadPrefs(); }, [tab]);

  const handleMarkRead = async (id: string) => {
    try {
      const updated = await markRead(id);
      setNotifications(p => p.map(n => n.id === id ? updated : n));
      setUnread(u => Math.max(0, u - 1));
    } catch { setError('Failed to mark read'); }
  };

  const handleMarkAll = async () => {
    try {
      await markAllRead();
      setNotifications(p => p.map(n => ({ ...n, status: 'read' as const })));
      setUnread(0);
      setMsg('All notifications marked as read');
    } catch { setError('Failed to mark all'); }
  };

  const handleSavePrefs = async () => {
    if (!prefs) return;
    setSaving(true); setError(''); setMsg('');
    try {
      const updated = await updatePreferences(prefs);
      setPrefs(updated);
      setMsg('Preferences saved!');
    } catch { setError('Failed to save preferences'); }
    finally { setSaving(false); }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <h1 style={{ margin: 0, fontSize: '26px', fontWeight: 700, color: '#1e293b' }}>Notifications</h1>
            {unread > 0 && (
              <span style={{ background: '#ef4444', color: '#fff', borderRadius: '999px', padding: '2px 9px', fontSize: '13px', fontWeight: 700, minWidth: '24px', textAlign: 'center' }}>
                {unread}
              </span>
            )}
          </div>
          <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
            {unread > 0 ? `${unread} unread notification${unread !== 1 ? 's' : ''}` : 'You\'re all caught up!'}
          </p>
        </div>
        {tab === 'all' && unread > 0 && (
          <button onClick={handleMarkAll} className="btn-secondary" style={{ background: '#e2e8f0', color: '#374151', border: 'none', borderRadius: '8px', padding: '9px 16px', fontSize: '14px', fontWeight: 500, cursor: 'pointer' }}>
            ✓ Mark All Read
          </button>
        )}
      </div>

      {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: '8px', fontSize: '14px', marginBottom: '16px', border: '1px solid #fecaca' }}>{error}</div>}
      {msg && <div style={{ background: '#dcfce7', color: '#16a34a', padding: '10px 14px', borderRadius: '8px', fontSize: '14px', marginBottom: '16px', border: '1px solid #bbf7d0' }}>{msg}</div>}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        <button
          onClick={() => setTab('all')}
          style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 500, background: tab === 'all' ? '#6366f1' : '#e2e8f0', color: tab === 'all' ? '#fff' : '#374151', display: 'flex', alignItems: 'center', gap: '7px' }}
        >
          🔔 Notifications
          {unread > 0 && tab !== 'all' && (
            <span style={{ background: '#ef4444', color: '#fff', borderRadius: '999px', padding: '0px 6px', fontSize: '11px', fontWeight: 700 }}>{unread}</span>
          )}
        </button>
        <button
          onClick={() => setTab('prefs')}
          style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 500, background: tab === 'prefs' ? '#6366f1' : '#e2e8f0', color: tab === 'prefs' ? '#fff' : '#374151' }}
        >
          ⚙️ Preferences
        </button>
      </div>

      {/* Notifications list */}
      {tab === 'all' && (
        loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[1, 2, 3].map(i => <div key={i} style={{ height: '72px', borderRadius: '10px' }} className="skeleton" />)}
          </div>
        ) : notifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', background: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.07)' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔔</div>
            <p style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: 600, color: '#374151' }}>No notifications yet</p>
            <p style={{ margin: 0, fontSize: '14px', color: '#94a3b8' }}>You'll see notifications here when there's activity in your account.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {notifications.map(n => {
              const isUnread = n.status !== 'read';
              return (
                <div
                  key={n.id}
                  style={{
                    background: isUnread ? '#f8faff' : '#fff',
                    borderRadius: '10px',
                    padding: '14px 16px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                    borderLeft: `3px solid ${isUnread ? '#6366f1' : 'transparent'}`,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = isUnread ? '#f0f4ff' : '#fafafa')}
                  onMouseLeave={e => (e.currentTarget.style.background = isUnread ? '#f8faff' : '#fff')}
                >
                  {/* Type icon */}
                  <div style={{ background: typeColor[n.type] || '#f1f5f9', borderRadius: '8px', padding: '8px', fontSize: '16px', flexShrink: 0 }}>
                    {typeIcon[n.type] || '📨'}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                      <p style={{ margin: '0 0 2px', fontSize: '14px', color: '#1e293b', fontWeight: isUnread ? 600 : 400, lineHeight: 1.4 }}>
                        {isUnread && <span className="unread-dot" style={{ marginRight: '6px' }} />}
                        {n.message}
                      </p>
                      <span style={{ fontSize: '11px', color: '#94a3b8', whiteSpace: 'nowrap', flexShrink: 0 }}>
                        {new Date(n.createdAt).toLocaleString()}
                      </span>
                    </div>
                    {n.title && <p style={{ margin: '0 0 8px', fontSize: '12px', color: '#64748b' }}>{n.title}</p>}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                      <span style={{ background: typeColor[n.type] || '#f1f5f9', padding: '1px 7px', borderRadius: '4px', fontSize: '11px', color: '#374151', textTransform: 'capitalize' }}>
                        {n.type.replace('_', ' ')}
                      </span>
                      {isUnread ? (
                        <button onClick={() => handleMarkRead(n.id)} style={{ background: 'none', border: '1px solid #d1d5db', borderRadius: '5px', padding: '2px 8px', fontSize: '11px', color: '#6366f1', cursor: 'pointer', fontWeight: 500 }}>
                          Mark read
                        </button>
                      ) : (
                        <span style={{ fontSize: '11px', color: '#94a3b8' }}>✓ Read</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* Preferences tab */}
      {tab === 'prefs' && (
        <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.07)', maxWidth: '520px' }}>
          <h3 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: 600, color: '#1e293b' }}>Notification Preferences</h3>
          <p style={{ margin: '0 0 24px', fontSize: '13px', color: '#64748b' }}>Choose how you want to receive notifications</p>

          {!prefs ? (
            <div>
              {[1, 2, 3, 4].map(i => <div key={i} style={{ height: '56px', borderRadius: '8px', marginBottom: '12px' }} className="skeleton" />)}
            </div>
          ) : (
            <>
              {(['emailEnabled', 'smsEnabled', 'pushEnabled', 'inAppEnabled'] as const).map(key => (
                <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ flex: 1, marginRight: '16px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 500, color: '#1e293b', marginBottom: '2px' }}>{prefLabel[key]}</div>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>{prefDesc[key]}</div>
                  </div>
                  <div
                    onClick={() => setPrefs(p => p ? { ...p, [key]: !p[key] } : p)}
                    style={{ width: '44px', height: '24px', borderRadius: '999px', background: prefs[key] ? '#6366f1' : '#d1d5db', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}
                  >
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '2px', left: prefs[key] ? '22px' : '2px', transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.25)' }} />
                  </div>
                </div>
              ))}
              <button onClick={handleSavePrefs} disabled={saving} className="btn-primary" style={{ marginTop: '20px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 22px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
                {saving ? 'Saving...' : 'Save Preferences'}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
