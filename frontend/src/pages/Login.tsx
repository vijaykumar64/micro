import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } }).response?.data?.error;
      setError(msg || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      {/* Left branding panel */}
      <div style={leftPanelStyle}>
        <div style={{ maxWidth: '360px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '9px', background: 'rgba(99,102,241,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>◈</div>
            <span style={{ color: '#f1f5f9', fontSize: '20px', fontWeight: 700, letterSpacing: '-0.01em' }}>Micro Arc</span>
          </div>
          <h2 style={{ color: '#fff', fontSize: '28px', fontWeight: 700, margin: '0 0 12px', lineHeight: 1.25 }}>
            The microservices platform for modern teams
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '15px', margin: '0 0 36px', lineHeight: 1.6 }}>
            Manage properties, files, verifications, and work items — all in one place.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              { icon: '🔐', text: 'Secure JWT authentication with refresh token rotation' },
              { icon: '📁', text: 'File uploads with progress tracking and download' },
              { icon: '⌂', text: 'Property listings, verifications & work item tracking' },
            ].map(f => (
              <div key={f.text} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: 'rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0 }}>{f.icon}</div>
                <span style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: 1.5 }}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div style={rightPanelStyle}>
        <div style={cardStyle}>
          <div style={{ marginBottom: '28px' }}>
            <h1 style={{ margin: '0 0 6px', fontSize: '24px', fontWeight: 700, color: '#1e293b' }}>Welcome back</h1>
            <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
              Sign in to your account to continue
            </p>
          </div>

          {error && <div style={errorStyle}>{error}</div>}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label style={labelStyle}>Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={inputStyle}
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label style={labelStyle}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={inputStyle}
                placeholder="••••••••"
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary" style={btnStyle}>
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <span style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                  Signing in...
                </span>
              ) : 'Sign in'}
            </button>
          </form>

          <p style={{ margin: '20px 0 0', textAlign: 'center', fontSize: '14px', color: '#64748b' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#6366f1', fontWeight: 500 }}>Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const containerStyle: React.CSSProperties = {
  display: 'flex',
  minHeight: '100vh',
};

const leftPanelStyle: React.CSSProperties = {
  flex: 1,
  background: 'linear-gradient(145deg, #1e293b 0%, #2d3f55 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '48px',
};

const rightPanelStyle: React.CSSProperties = {
  flex: 1,
  background: '#f8fafc',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '40px 24px',
};

const cardStyle: React.CSSProperties = {
  background: '#fff',
  borderRadius: '16px',
  padding: '40px',
  width: '100%',
  maxWidth: '400px',
  boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: '6px',
  fontSize: '14px',
  color: '#374151',
  fontWeight: 500,
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: '8px',
  border: '1.5px solid #d1d5db',
  fontSize: '14px',
  background: '#fff',
  color: '#1e293b',
};

const btnStyle: React.CSSProperties = {
  background: '#6366f1',
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  padding: '12px',
  fontSize: '14px',
  fontWeight: 600,
  cursor: 'pointer',
  width: '100%',
};

const errorStyle: React.CSSProperties = {
  background: '#fee2e2',
  color: '#dc2626',
  padding: '10px 14px',
  borderRadius: '8px',
  fontSize: '14px',
  marginBottom: '16px',
  border: '1px solid #fecaca',
};
