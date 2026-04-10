import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { ShieldCheck, Mail, Lock, Eye, EyeOff, AlertCircle, LogIn, LayoutDashboard } from 'lucide-react';

export default function AdminLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const user = await login(form.email, form.password);
      if (user.role !== 'admin') {
        setError('Access denied. This portal is for administrators only.');
        return;
      }
      toast.success(`Welcome, ${user.name}!`);
      navigate('/admin', { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message;
      if (!err.response) setError('Cannot connect to server. Make sure the backend is running.');
      else setError(msg || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#0a1628' }}>

      {/* Left brand panel */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '4rem', background: 'linear-gradient(135deg, #0f2744 0%, #0a1628 100%)', position: 'relative', overflow: 'hidden' }}>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: -80, right: -80, width: 320, height: 320, borderRadius: '50%', border: '1px solid rgba(29,141,172,0.12)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: -30, right: -30, width: 200, height: 200, borderRadius: '50%', border: '1px solid rgba(29,141,172,0.18)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -100, left: -100, width: 400, height: 400, borderRadius: '50%', border: '1px solid rgba(34,168,204,0.08)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '3rem' }}>
            <div style={{ width: 44, height: 44, background: 'linear-gradient(135deg, #1d8dac, #22a8cc)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <LayoutDashboard size={22} color="white" />
            </div>
            <div>
              <div style={{ color: 'white', fontWeight: 800, fontSize: 18, fontFamily: 'var(--font-heading, sans-serif)', letterSpacing: '-0.3px' }}>TechMart</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>Admin Portal</div>
            </div>
          </div>

          <h2 style={{ color: 'white', fontSize: '2rem', fontWeight: 700, marginBottom: '1rem', lineHeight: 1.2, fontFamily: 'var(--font-heading, sans-serif)' }}>
            Manage your<br />store with ease
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, lineHeight: 1.8, maxWidth: 320 }}>
            Full control over products, orders, customers, and analytics — all in one place.
          </p>

          <div style={{ marginTop: '3rem', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { icon: '📦', label: 'Manage 1000+ products' },
              { icon: '📊', label: 'Real-time dashboard analytics' },
              { icon: '🚚', label: 'Track and update orders' },
            ].map(({ icon, label }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 18 }}>{icon}</span>
                <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right login panel */}
      <div style={{ width: 460, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '4rem 3rem', background: '#fff' }}>
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ width: 52, height: 52, background: 'linear-gradient(135deg, #1d8dac, #22a8cc)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <ShieldCheck size={26} color="white" />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-heading, sans-serif)', fontWeight: 700, color: '#111827', marginBottom: 6 }}>Admin Sign In</h1>
          <p style={{ color: '#6b7280', fontSize: 14 }}>Restricted to authorized administrators only.</p>
        </div>

        {error && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '0.875rem 1rem', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 10, marginBottom: '1.25rem' }}>
            <AlertCircle size={16} color="#dc2626" style={{ flexShrink: 0, marginTop: 1 }} />
            <span style={{ color: '#991b1b', fontSize: 13, lineHeight: 1.5 }}>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.1rem' }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Admin Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={15} color="#9ca3af" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <input
                className="form-control" type="email" required autoFocus
                placeholder="admin@techmart.com" value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                style={{ paddingLeft: 38 }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Password</label>
              <Link to="/forgot-password" style={{ fontSize: 12, color: '#1d8dac', fontWeight: 600 }}>Forgot?</Link>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={15} color="#9ca3af" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <input
                className="form-control" type={showPass ? 'text' : 'password'} required
                placeholder="••••••••" value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                style={{ paddingLeft: 38, paddingRight: 44 }}
              />
              <button type="button" onClick={() => setShowPass(s => !s)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex' }}>
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary btn-block" style={{ padding: '13px 24px', fontSize: 15, borderRadius: 10, gap: 8, background: 'linear-gradient(135deg, #1d8dac, #22a8cc)', border: 'none' }}>
            <LogIn size={17} />
            {loading ? 'Signing in...' : 'Sign In to Admin'}
          </button>
        </form>

        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #f3f4f6', textAlign: 'center' }}>
          <Link to="/" style={{ fontSize: 13, color: '#9ca3af' }}>← Back to store</Link>
        </div>

        {process.env.REACT_APP_SHOW_DEMO_CREDS === 'true' && (
          <div style={{ marginTop: '1.25rem', padding: '0.75rem 1rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, fontSize: 12 }}>
            <p style={{ fontWeight: 700, color: '#15803d', marginBottom: 4 }}>Demo Admin Credentials</p>
            <p style={{ color: '#374151', marginBottom: 2 }}>Email: <strong>admin@techmart.com</strong></p>
            <p style={{ color: '#374151', marginBottom: 8 }}>Password: <strong>admin123</strong></p>
            <button type="button" onClick={() => setForm({ email: 'admin@techmart.com', password: 'admin123' })}
              style={{ background: '#dcfce7', border: '1px solid #86efac', borderRadius: 6, padding: '5px 12px', cursor: 'pointer', fontSize: 12, color: '#15803d', fontWeight: 600 }}>
              Auto-fill
            </button>
          </div>
        )}
      </div>

      {/* Responsive collapse of left panel */}
      <style>{`
        @media (max-width: 768px) {
          .admin-login-brand { display: none !important; }
          .admin-login-form { width: 100% !important; padding: 2rem 1.5rem !important; }
        }
      `}</style>
    </div>
  );
}
