import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserStats, AdminStats } from '../types';
import * as dashboardService from '../services/dashboard.service';

const actionIcon: Record<string, string> = {
  login: '🔐', logout: '🚪', upload: '📤', download: '📥',
  profile_update: '✏️', create: '✨', update: '✏️', delete: '🗑️', view: '👁️',
};

const roleStyle = (role: string): React.CSSProperties => {
  if (role === 'admin') return { background: '#fee2e2', color: '#dc2626' };
  if (role === 'moderator') return { background: '#fef3c7', color: '#b45309' };
  return { background: '#e0e7ff', color: '#4338ca' };
};

export function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const [s] = await Promise.all([dashboardService.getStats()]);
        setStats(s);
        if (user?.role === 'admin') {
          const a = await dashboardService.getAdminStats();
          setAdminStats(a);
        }
      } catch {
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  if (loading) return (
    <div>
      <div style={{ margin: '0 0 8px', height: '32px', width: '160px' }} className="skeleton" />
      <div style={{ margin: '0 0 32px', height: '20px', width: '240px' }} className="skeleton" />
      <div style={gridStyle}>
        {[1, 2, 3].map(i => <div key={i} style={{ height: '100px', borderRadius: '12px' }} className="skeleton" />)}
      </div>
    </div>
  );

  if (error) return <div style={errorStyle}>{error}</div>;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <h1 style={{ margin: 0, fontSize: '26px', fontWeight: 700, color: '#1e293b' }}>Dashboard</h1>
          <span style={{ ...roleStyle(user?.role || 'user'), fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '999px', textTransform: 'capitalize' }}>
            {user?.role}
          </span>
        </div>
        <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>Welcome back, <strong style={{ color: '#334155' }}>{user?.email}</strong></p>
      </div>

      {/* Your Activity */}
      <h2 style={subHeadingStyle}>Your Activity</h2>
      <div style={gridStyle}>
        <StatCard label="Total Logins" value={stats?.totalLogins ?? 0} color="#6366f1" icon="🔐" />
        <StatCard label="Files Uploaded" value={stats?.totalUploads ?? 0} color="#06b6d4" icon="📤" />
        <StatCard label="Profile Updates" value={stats?.totalProfileUpdates ?? 0} color="#10b981" icon="✏️" />
      </div>

      {/* Admin Overview */}
      {adminStats && (
        <>
          <h2 style={{ ...subHeadingStyle, marginTop: '40px' }}>Admin Overview</h2>
          <div style={gridStyle}>
            <StatCard label="Total Users" value={adminStats.totalUsers} color="#f59e0b" icon="👥" />
            <StatCard label="Active (30 days)" value={adminStats.activeUsersLast30Days} color="#ef4444" icon="⚡" />
            <StatCard label="All Uploads" value={adminStats.totalUploads} color="#8b5cf6" icon="📁" />
            <StatCard label="All Logins" value={adminStats.totalLogins} color="#ec4899" icon="📊" />
          </div>

          <h2 style={{ ...subHeadingStyle, marginTop: '32px' }}>Services Overview</h2>
          <div style={gridStyle}>
            <StatCard label="Properties Listed" value={adminStats.totalProperties ?? 0} color="#0ea5e9" icon="⌂" />
            <StatCard label="Pending Verifications" value={adminStats.pendingVerifications ?? 0} color="#f97316" icon="✔" />
            <StatCard label="Open Work Items" value={adminStats.openWorkItems ?? 0} color="#14b8a6" icon="◈" />
          </div>
        </>
      )}

      {/* Recent Activity */}
      <h2 style={{ ...subHeadingStyle, marginTop: '40px' }}>Recent Activity</h2>
      {stats && stats.recentActivity.length > 0 ? (
        <div style={tableContainer}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}></th>
                <th style={thStyle}>Action</th>
                <th style={thStyle}>Time</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentActivity.map((a) => (
                <tr key={a.id}>
                  <td style={{ ...tdStyle, width: '40px', textAlign: 'center', fontSize: '16px' }}>
                    {actionIcon[a.action] || '◉'}
                  </td>
                  <td style={tdStyle}>
                    <span style={badgeStyle}>{a.action.replace(/_/g, ' ')}</span>
                  </td>
                  <td style={{ ...tdStyle, color: '#94a3b8', fontSize: '13px' }}>
                    {new Date(a.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ background: '#fff', borderRadius: '12px', padding: '48px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.07)' }}>
          <div style={{ fontSize: '36px', marginBottom: '12px' }}>📊</div>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '14px' }}>No activity recorded yet. Start using the platform to see your history here.</p>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color, icon }: { label: string; value: number; color: string; icon: string }) {
  return (
    <div className="card-hover" style={{ background: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.07)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
          {icon}
        </div>
        <div style={{ fontSize: '28px', fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
      </div>
      <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>{label}</div>
    </div>
  );
}

const subHeadingStyle: React.CSSProperties = { fontSize: '16px', fontWeight: 600, color: '#334155', margin: '0 0 14px', textTransform: 'uppercase', letterSpacing: '0.04em' };
const gridStyle: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '14px' };
const tableContainer: React.CSSProperties = { background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.07)' };
const thStyle: React.CSSProperties = { padding: '11px 16px', textAlign: 'left', fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' };
const tdStyle: React.CSSProperties = { padding: '12px 16px', fontSize: '14px', color: '#374151', borderBottom: '1px solid #f1f5f9' };
const badgeStyle: React.CSSProperties = { background: '#ede9fe', color: '#6d28d9', padding: '3px 9px', borderRadius: '999px', fontSize: '12px', fontWeight: 500, textTransform: 'capitalize' };
const errorStyle: React.CSSProperties = { background: '#fee2e2', color: '#dc2626', padding: '12px 16px', borderRadius: '8px' };
