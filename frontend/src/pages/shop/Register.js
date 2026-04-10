import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { UserPlus, Mail, Lock, User, Phone, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
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
  const strength = passwordStrength(form.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { setError('Passwords do not match'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true); setError('');
    try {
      // FIX B03: register returns message + email, NOT token
      await register(form.name, form.email, form.password, form.phone);
      toast.success('Account created! Please check your email for the verification code.');
      // FIX B14: redirect to OTP verification, not homepage
      navigate('/verify-email', { state: { email: form.email } });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { key: 'name', label: 'Full Name', type: 'text', placeholder: 'John Doe', icon: User },
    { key: 'email', label: 'Email Address', type: 'email', placeholder: 'you@example.com', icon: Mail },
    { key: 'phone', label: 'Phone Number', type: 'tel', placeholder: '+977-98XXXXXXXX', icon: Phone, required: false },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1.5rem', background: 'var(--bg-page)' }}>
        <div style={{ width: '100%', maxWidth: 460 }}>

          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{ width: 56, height: 56, background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              <UserPlus size={26} color="white" />
            </div>
            <h1 style={{ fontSize: '1.6rem', fontFamily: 'var(--font-heading)', color: 'var(--text-dark)', marginBottom: 4 }}>Create your account</h1>
            <p style={{ color: 'var(--text-mid)', fontSize: 14 }}>Join TechMart and start shopping</p>
          </div>

          <div className="card">
            <div style={{ padding: '2rem' }}>
              {error && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '0.875rem 1rem', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
                  <AlertCircle size={16} color="#dc2626" style={{ flexShrink: 0, marginTop: 1 }} />
                  <span style={{ color: '#991b1b', fontSize: 13 }}>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {fields.map(({ key, label, type, placeholder, icon: Icon, required = true }) => (
                  <div key={key} className="form-group">
                    <label className="form-label">{label}{!required && <span style={{ color: 'var(--text-light)', fontWeight: 400, marginLeft: 4 }}>(optional)</span>}</label>
                    <div style={{ position: 'relative' }}>
                      <Icon size={15} color="var(--text-mid)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                      <input className="form-control" type={type} required={required} placeholder={placeholder}
                        value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                        style={{ paddingLeft: 38 }} />
                    </div>
                  </div>
                ))}

                {/* Password */}
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={15} color="var(--text-mid)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    <input className="form-control" type={showPass ? 'text' : 'password'} required placeholder="Min. 6 characters"
                      value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                      style={{ paddingLeft: 38, paddingRight: 44 }} />
                    <button type="button" onClick={() => setShowPass(s => !s)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-mid)', display: 'flex' }}>
                      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {strength && (
                    <div style={{ marginTop: 8 }}>
                      <div style={{ height: 3, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: strength.width, background: strength.color, transition: 'width 0.3s, background 0.3s', borderRadius: 2 }} />
                      </div>
                      <span style={{ fontSize: 11, color: strength.color, fontWeight: 600, marginTop: 3, display: 'block' }}>{strength.label}</span>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="form-group">
                  <label className="form-label">Confirm Password</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={15} color="var(--text-mid)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    <input className="form-control" type={showConfirm ? 'text' : 'password'} required placeholder="Repeat password"
                      value={form.confirm} onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
                      style={{ paddingLeft: 38, paddingRight: 44, borderColor: form.confirm && form.confirm !== form.password ? '#dc2626' : undefined }} />
                    <button type="button" onClick={() => setShowConfirm(s => !s)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-mid)', display: 'flex' }}>
                      {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                    {form.confirm && form.confirm === form.password && (
                      <CheckCircle size={15} color="#16a34a" style={{ position: 'absolute', right: 40, top: '50%', transform: 'translateY(-50%)' }} />
                    )}
                  </div>
                </div>

                {/* Terms notice */}
                <p style={{ fontSize: 12, color: 'var(--text-mid)', marginBottom: '1rem', lineHeight: 1.6 }}>
                  By creating an account you agree to our{' '}
                  <Link to="/page/terms" style={{ color: 'var(--primary)' }}>Terms & Conditions</Link> and{' '}
                  <Link to="/page/privacy" style={{ color: 'var(--primary)' }}>Privacy Policy</Link>.
                </p>

                <button type="submit" disabled={loading} className="btn btn-primary btn-block" style={{ padding: '12px 24px', fontSize: 15, gap: 8, borderRadius: 10 }}>
                  <UserPlus size={17} />
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>
              </form>

              <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: 14, color: 'var(--text-mid)' }}>
                Already have an account?{' '}
                <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 700 }}>Sign in</Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
