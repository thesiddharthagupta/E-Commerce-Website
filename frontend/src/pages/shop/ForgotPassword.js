import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Mail, ArrowLeft, SendHorizonal, CheckCircle2, AlertCircle } from 'lucide-react';
import API from '../../utils/api';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await API.post('/auth/forgot-password', { email });
      setSent(true);
      toast.success('Reset link sent!');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1.5rem', background: 'var(--bg-page)' }}>
        <div style={{ width: '100%', maxWidth: 420 }}>

          {/* Icon */}
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{ width: 60, height: 60, background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              <Mail size={28} color="white" />
            </div>
            <h1 style={{ fontSize: '1.6rem', fontFamily: 'var(--font-heading)', marginBottom: 6 }}>
              {sent ? 'Check your email' : 'Forgot password?'}
            </h1>
            <p style={{ color: 'var(--text-mid)', fontSize: 14, lineHeight: 1.6 }}>
              {sent
                ? <>We sent a password reset link to<br /><strong style={{ color: 'var(--text-dark)' }}>{email}</strong></>
                : "No worries — enter your email and we'll send you a reset link."
              }
            </p>
          </div>

          <div className="card">
            <div style={{ padding: '2rem' }}>
              {sent ? (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: 64, height: 64, background: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                    <CheckCircle2 size={32} color="#16a34a" />
                  </div>
                  <p style={{ color: 'var(--text-mid)', fontSize: 14, marginBottom: '1.5rem', lineHeight: 1.7 }}>
                    The reset link expires in <strong>15 minutes</strong>.<br />
                    Didn't get it? Check your spam folder.
                  </p>
                  <button
                    onClick={() => { setSent(false); setEmail(''); }}
                    className="btn btn-outline btn-block"
                    style={{ marginBottom: '0.75rem' }}
                  >
                    Try a different email
                  </button>
                  <Link to="/login" className="btn btn-ghost btn-block" style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
                    <ArrowLeft size={15} /> Back to login
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
                      <label className="form-label">Email Address</label>
                      <div style={{ position: 'relative' }}>
                        <Mail size={15} color="var(--text-mid)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                        <input
                          className="form-control"
                          type="email"
                          required
                          autoFocus
                          placeholder="you@example.com"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          style={{ paddingLeft: 38 }}
                        />
                      </div>
                    </div>
                    <button type="submit" disabled={loading} className="btn btn-primary btn-block" style={{ padding: '12px 24px', fontSize: 15, borderRadius: 10, gap: 8 }}>
                      <SendHorizonal size={16} />
                      {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                  </form>
                  <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
                    <Link to="/login" style={{ fontSize: 13, color: 'var(--text-mid)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <ArrowLeft size={13} /> Back to login
                    </Link>
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
