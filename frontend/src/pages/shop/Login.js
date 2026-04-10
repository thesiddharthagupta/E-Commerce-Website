import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import { MailIcon, UserIcon, SearchIcon } from '../../components/common/Icons';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const result = await login(form.email, form.password);
      
      if (result?.requires2FA) {
        toast.info('🔒 Verification required. Please check your email.');
        navigate('/login/verify-2fa', { state: { email: result.email, from } });
        return;
      }

      toast.success(`Welcome back, ${result.name.split(' ')[0]}!`);
      // Admin users are redirected to /admin/login — never leak admin path here
      navigate(result.role === 'admin' ? '/' : from, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message;
      setError(msg || (!err.response ? 'Cannot connect to server. Is the backend running?' : 'Invalid email or password.'));
    } finally { setLoading(false); }
  };

  return (
    <div className="page-wrap">
      <Header />
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem', background: 'var(--bg-page)' }}>
        <div style={{ width: '100%', maxWidth: 420 }}>

          {/* Card */}
          <div className="card" style={{ overflow: 'hidden' }}>
            {/* Top gradient */}
            <div style={{ background: 'linear-gradient(135deg, var(--nav-bg), var(--primary-dark))', padding: '2rem', textAlign: 'center' }}>
              <div style={{ width: 56, height: 56, background: 'rgba(255,255,255,0.12)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', border: '2px solid rgba(255,255,255,0.2)' }}>
                <UserIcon size={26} stroke="white" />
              </div>
              <h1 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: 4 }}>Welcome Back</h1>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>Sign in to your account</p>
            </div>

            <div style={{ padding: '1.75rem' }}>
              {error && <div className="alert alert-danger" style={{ marginBottom: '1.25rem' }}>⚠️ {error}</div>}

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)', pointerEvents: 'none' }}>
                      <MailIcon size={16} />
                    </div>
                    <input className="form-control" type="email" required autoFocus placeholder="your@email.com"
                      value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      style={{ paddingLeft: 36 }} />
                  </div>
                </div>
                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <label className="form-label" style={{ marginBottom: 0 }}>Password</label>
                    <Link to="/forgot-password" style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 600 }}>Forgot password?</Link>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <input className="form-control" type={showPw ? 'text' : 'password'} required placeholder="••••••••"
                      value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
                    <button type="button" onClick={() => setShowPw(!showPw)}
                      style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)', fontSize: 12, fontFamily: 'var(--font)' }}>
                      {showPw ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={loading} className="btn btn-primary btn-block btn-lg" style={{ marginTop: '0.5rem' }}>
                  {loading ? <><span className="spinner spinner-sm" style={{ borderTopColor: '#fff', borderColor: 'rgba(255,255,255,0.3)' }} />  Signing in...</> : 'Sign In'}
                </button>
              </form>

              <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: 14, color: 'var(--text-mid)', borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
                New to {' '}
                <span style={{ color: 'var(--primary)', fontWeight: 700 }}>TechMart</span>?{' '}
                <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 700 }}>Create account</Link>
              </div>
            </div>
          </div>

          {/* Security note - NO admin credentials shown */}
          <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: 12, color: 'var(--text-light)' }}>
            🔒 Your information is protected with industry-standard encryption
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
