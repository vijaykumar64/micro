import { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const navItems = [
  { to: '/dashboard', icon: '⊞', label: 'Dashboard', group: 'Core' },
  { to: '/profile', icon: '◎', label: 'Profile', group: 'Core' },
  { to: '/files', icon: '⬡', label: 'Files', group: 'Core' },
  { to: '/properties', icon: '⌂', label: 'Properties', group: 'Services' },
  { to: '/verifications', icon: '✔', label: 'Verifications', group: 'Services' },
  { to: '/work-items', icon: '◈', label: 'Work Items', group: 'Services' },
  { to: '/notifications', icon: '🔔', label: 'Notifications', group: 'Services' },
];

const adminItems = [
  { to: '/audit', icon: '📋', label: 'Audit Log', group: 'Admin' },
];

function getInitials(email: string): string {
  const parts = email.split('@')[0].split(/[._-]/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return email.slice(0, 2).toUpperCase();
}

function roleBadgeStyle(role: string): React.CSSProperties {
  if (role === 'admin') return { background: '#fee2e2', color: '#dc2626' };
  if (role === 'moderator') return { background: '#fef3c7', color: '#b45309' };
  return { background: '#e0e7ff', color: '#4338ca' };
}

export function Layout({ children }: { children?: ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isStaff = user?.role === 'admin' || user?.role === 'moderator';

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const linkStyle = (isActive: boolean): React.CSSProperties => ({
    color: isActive ? '#f1f5f9' : '#94a3b8',
    textDecoration: 'none',
    padding: '8px 12px',
    borderRadius: '6px',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '9px',
    borderLeft: isActive ? '3px solid #6366f1' : '3px solid transparent',
    background: isActive ? '#334155' : 'transparent',
    fontWeight: isActive ? 500 : 400,
    transition: 'background 0.15s, color 0.15s',
  });

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <nav style={navStyle}>
        {/* Logo */}
        <div style={{ padding: '0 12px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: 'linear-gradient(135deg, #6366f1, #818cf8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0 }}>
            ◈
          </div>
          <span style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '16px', letterSpacing: '-0.01em' }}>Micro Arc</span>
        </div>

        {/* Core group */}
        <div style={sectionLabel}>Core</div>
        {navItems.filter(i => i.group === 'Core').map(item => (
          <NavLink key={item.to} to={item.to} className="nav-link" style={({ isActive }) => linkStyle(isActive)}>
            <span style={{ fontSize: '13px', width: '16px', textAlign: 'center', flexShrink: 0 }}>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}

        {/* Services group */}
        <div style={{ ...sectionLabel, marginTop: '8px' }}>Services</div>
        {navItems.filter(i => i.group === 'Services').map(item => (
          <NavLink key={item.to} to={item.to} className="nav-link" style={({ isActive }) => linkStyle(isActive)}>
            <span style={{ fontSize: '13px', width: '16px', textAlign: 'center', flexShrink: 0 }}>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}

        {/* Admin group */}
        {isStaff && (
          <>
            <div style={{ ...sectionLabel, marginTop: '8px' }}>Admin</div>
            {adminItems.map(item => (
              <NavLink key={item.to} to={item.to} className="nav-link" style={({ isActive }) => linkStyle(isActive)}>
                <span style={{ fontSize: '13px', width: '16px', textAlign: 'center', flexShrink: 0 }}>{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </>
        )}

        {/* User footer */}
        <div style={{ marginTop: 'auto', borderTop: '1px solid #334155', paddingTop: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0 12px', marginBottom: '12px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #818cf8)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '12px', fontWeight: 700, flexShrink: 0 }}>
              {user?.email ? getInitials(user.email) : 'U'}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ color: '#cbd5e1', fontSize: '12px', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.email}
              </div>
              <span style={{ ...roleBadgeStyle(user?.role || 'user'), fontSize: '10px', fontWeight: 600, padding: '1px 6px', borderRadius: '999px', textTransform: 'capitalize', display: 'inline-block', marginTop: '2px' }}>
                {user?.role}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              background: 'transparent',
              border: '1px solid #334155',
              color: '#64748b',
              padding: '7px 12px',
              borderRadius: '6px',
              cursor: 'pointer',
              width: '100%',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <span>↩</span> Logout
          </button>
        </div>
      </nav>

      <main style={{ flex: 1, padding: '32px', background: '#f8fafc', overflowY: 'auto', minHeight: '100vh' }}>
        {children}
      </main>
    </div>
  );
}

const navStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
  width: '230px',
  background: '#1e293b',
  minHeight: '100vh',
  padding: '20px 12px',
  flexShrink: 0,
  position: 'sticky',
  top: 0,
  height: '100vh',
  overflowY: 'auto',
};

const sectionLabel: React.CSSProperties = {
  color: '#475569',
  fontSize: '10px',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  padding: '10px 12px 4px',
};
