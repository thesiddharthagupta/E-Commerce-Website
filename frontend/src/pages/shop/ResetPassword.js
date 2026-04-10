import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, KeyRound } from 'lucide-react';
import API from '../../utils/api';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get('token');
  const email = params.get('email');

  const [form, setForm] = useState({ newPassword: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const passwordStrength = (p) => {
    if (!p) return null;
    if (p.length < 6) return { label: 'Too short', color: '#dc2626', width: '20%' };
    if (p.length < 8 || !/[0-9]/.test(p)) return { label: 'Weak', color: '#d97706', width: '45%' };
    if (!/[!@#$%^&*]/.test(p)) return { label: 'Medium', color: '#ca8a04', width: '65%' };
    return { label: 'Strong', color: '#16a34a', width: '100%' };
  };
  const strength = passwordStrength(form.newPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirm) { setError('Passwords do not match'); return; }
    if (form.newPassword.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (!token || !email) { setError('Invalid reset link. Please request a new one.'); return; }
    setLoading(true); setError('');
    try {
      const { data } = await API.post('/auth/reset-password', {
        email: decodeURIComponent(email),
        token,
        newPassword: form.newPassword,
      });
      if (!data.success) throw new Error(data.message);
      setDone(true);
      toast.success('Password reset successfully!');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Reset failed. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  const isInvalid = !token || !email;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1.5rem', background: 'var(--bg-page)' }}>
        <div style={{ width: '100%', maxWidth: 420 }}>

          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{ width: 60, height: 60, background: done ? 'linear-gradient(135deg, #16a34a, #15803d)' : 'linear-gradient(135deg, var(--primary), var(--primary-dark))', borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', transition: 'background 0.4s' }}>
              {done ? <CheckCircle2 size={30} color="white" /> : <KeyRound size={28} color="white" />}
            </div>
            <h1 style={{ fontSize: '1.6rem', fontFamily: 'var(--font-heading)', marginBottom: 6 }}>
              {done ? 'Password reset!' : 'Set new password'}
            </h1>
            <p style={{ color: 'var(--text-mid)', fontSize: 14 }}>
              {done ? 'Your password has been changed successfully.' : 'Must be at least 6 characters.'}
            </p>
          </div>

          <div className="card">
            <div style={{ padding: '2rem' }}>
              {done ? (
                <div style={{ textAlign: 'center' }}>
                  <p style={{ color: 'var(--text-mid)', fontSize: 14, marginBottom: '1.5rem', lineHeight: 1.7 }}>
                    You can now sign in with your new password.
                  </p>
                  <button onClick={() => navigate('/login', { replace: true })} className="btn btn-primary btn-block" style={{ padding: '12px 24px', fontSize: 15, borderRadius: 10 }}>
                    Go to Login
                  </button>
                </div>
              ) : isInvalid ? (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: 56, height: 56, background: '#fee2e2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                    <AlertCircle size={28} color="#dc2626" />
                  </div>
                  <p style={{ color: 'var(--text-mid)', fontSize: 14, marginBottom: '1.5rem' }}>
                    This reset link is invalid or missing required parameters.
                  </p>
                  <Link to="/forgot-password" className="btn btn-primary btn-block">
                    Request a new link
                  </Link>
                </div>
              ) : (
                <>
                  {error && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '0.875rem 1rem', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
                      <AlertCircle size={16} color="#dc2626" style={{ flexShrink: 0, marginTop: 1 }} />
                      <span style={{ color: '#991b1b', fontSize: 13 }}>{error}</span>
                    </div>
                  )}
                  <form onSubmit={handleSubmit}>
                    <div className="form-group">
                      <label className="form-label">New Password</label>
                      <div style={{ position: 'relative' }}>
                        <Lock size={15} color="var(--text-mid)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                        <input
                          className="form-control" type={showPass ? 'text' : 'password'} required autoFocus
                          placeholder="Min. 6 characters" value={form.newPassword}
                          onChange={e => setForm(f => ({ ...f, newPassword: e.target.value }))}
                          style={{ paddingLeft: 38, paddingRight: 44 }}
                        />
                        <button type="button" onClick={() => setShowPass(s => !s)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-mid)', display: 'flex' }}>
                          {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                      {strength && (
                        <div style={{ marginTop: 8 }}>
                          <div style={{ height: 3, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: strength.width, background: strength.color, transition: 'width 0.3s', borderRadius: 2 }} />
                          </div>
                          <span style={{ fontSize: 11, color: strength.color, fontWeight: 600, marginTop: 3, display: 'block' }}>{strength.label}</span>
                        </div>
                      )}
                    </div>

                    <div className="form-group">
                      <label className="form-label">Confirm New Password</label>
                      <div style={{ position: 'relative' }}>
                        <Lock size={15} color="var(--text-mid)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                        <input
                          className="form-control" type={showConfirm ? 'text' : 'password'} required
                          placeholder="Repeat password" value={form.confirm}
                          onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
                          style={{ paddingLeft: 38, paddingRight: 44, borderColor: form.confirm && form.confirm !== form.newPassword ? '#dc2626' : undefined }}
                        />
                        <button type="button" onClick={() => setShowConfirm(s => !s)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-mid)', display: 'flex' }}>
                          {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </div>

                    <button type="submit" disabled={loading} className="btn btn-primary btn-block" style={{ padding: '12px 24px', fontSize: 15, borderRadius: 10, gap: 8 }}>
                      <Lock size={16} />
                      {loading ? 'Resetting...' : 'Reset Password'}
                    </button>
                  </form>
                  <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
                    <Link to="/login" style={{ fontSize: 13, color: 'var(--text-mid)' }}>Back to login</Link>
                  </div>
                </>
              )}
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}
