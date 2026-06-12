import { useEffect, useState, FormEvent } from 'react';
import { UserProfile } from '../types';
import { useAuth } from '../contexts/AuthContext';
import * as userService from '../services/user.service';

function getInitials(firstName: string, lastName: string, email: string): string {
  if (firstName && lastName) return (firstName[0] + lastName[0]).toUpperCase();
  if (firstName) return firstName.slice(0, 2).toUpperCase();
  return email.slice(0, 2).toUpperCase();
}

export function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [form, setForm] = useState({ firstName: '', lastName: '', bio: '', phone: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    userService.getProfile().then((p) => {
      setProfile(p);
      setForm({ firstName: p.firstName || '', lastName: p.lastName || '', bio: p.bio || '', phone: p.phone || '' });
      setLoading(false);
    }).catch(() => {
      setError('Failed to load profile');
      setLoading(false);
    });
  }, []);

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');
    try {
      const updated = await userService.updateProfile(form);
      setProfile(updated);
      setMessage('Profile updated successfully');
    } catch {
      setError('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div style={{ maxWidth: '600px' }}>
      <div style={{ height: '32px', width: '120px', borderRadius: '8px', marginBottom: '32px' }} className="skeleton" />
      <div style={{ height: '300px', borderRadius: '12px' }} className="skeleton" />
    </div>
  );

  const initials = getInitials(form.firstName, form.lastName, user?.email || '');

  return (
    <div style={{ maxWidth: '600px' }}>
      <h1 style={{ margin: '0 0 4px', fontSize: '26px', fontWeight: 700, color: '#1e293b' }}>Profile</h1>
      <p style={{ color: '#64748b', marginBottom: '28px', fontSize: '14px' }}>Manage your personal information and account details</p>

      {/* Avatar section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '28px', padding: '20px 24px', background: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.07)' }}>
        <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #818cf8)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '24px', fontWeight: 700, flexShrink: 0 }}>
          {initials}
        </div>
        <div>
          <div style={{ fontSize: '16px', fontWeight: 600, color: '#1e293b', marginBottom: '2px' }}>
            {form.firstName || form.lastName ? `${form.firstName} ${form.lastName}`.trim() : user?.email}
          </div>
          <div style={{ fontSize: '13px', color: '#64748b' }}>{user?.email}</div>
          {profile && (
            <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
              Member since {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </div>
          )}
        </div>
      </div>

      {message && <div style={successStyle}>✓ {message}</div>}
      {error && <div style={errorStyle}>{error}</div>}

      <div style={cardStyle}>
        <h2 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: 600, color: '#1e293b' }}>Edit Profile</h2>
        <p style={{ margin: '0 0 24px', fontSize: '13px', color: '#64748b' }}>Update your personal information below</p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Email (read-only) */}
          <div>
            <label style={labelStyle}>Email address <span style={{ color: '#94a3b8', fontWeight: 400 }}>(cannot be changed)</span></label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              style={{ ...inputStyle, background: '#f8fafc', color: '#64748b', cursor: 'not-allowed' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={labelStyle}>First name</label>
              <input type="text" value={form.firstName} onChange={set('firstName')} style={inputStyle} placeholder="John" />
            </div>
            <div>
              <label style={labelStyle}>Last name</label>
              <input type="text" value={form.lastName} onChange={set('lastName')} style={inputStyle} placeholder="Doe" />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Phone number</label>
            <input type="tel" value={form.phone} onChange={set('phone')} style={inputStyle} placeholder="+91 98765 43210" />
          </div>

          <div>
            <label style={labelStyle}>Bio</label>
            <textarea
              value={form.bio}
              onChange={set('bio')}
              rows={4}
              style={{ ...inputStyle, resize: 'vertical' }}
              placeholder="Tell us a bit about yourself..."
            />
          </div>

          <div style={{ paddingTop: '4px' }}>
            <button type="submit" disabled={saving} className="btn-primary" style={btnStyle}>
              {saving ? 'Saving changes...' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const cardStyle: React.CSSProperties = { background: '#fff', borderRadius: '12px', padding: '28px', boxShadow: '0 1px 3px rgba(0,0,0,0.07)' };
const labelStyle: React.CSSProperties = { display: 'block', marginBottom: '6px', fontSize: '13px', color: '#374151', fontWeight: 500 };
const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box', color: '#1e293b' };
const btnStyle: React.CSSProperties = { background: '#6366f1', color: '#fff', border: 'none', borderRadius: '8px', padding: '11px 24px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' };
const successStyle: React.CSSProperties = { background: '#dcfce7', color: '#16a34a', padding: '10px 14px', borderRadius: '8px', fontSize: '14px', marginBottom: '16px', border: '1px solid #bbf7d0' };
const errorStyle: React.CSSProperties = { background: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: '8px', fontSize: '14px', marginBottom: '16px', border: '1px solid #fecaca' };
