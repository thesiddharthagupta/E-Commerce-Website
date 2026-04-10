import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Mail, ShieldCheck, AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import API from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';

export default function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginWithToken } = useAuth();
  const [email, setEmail] = useState(location.state?.email || '');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(60);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [countdown]);

  const handleOtpChange = (i, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[i] = val;
    setOtp(next);
    if (val && i < 5) inputRefs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) {
      inputRefs.current[i - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) { setError('Please enter all 6 digits'); return; }
    if (!email) { setError('Email address is missing'); return; }
    setLoading(true); setError('');
    try {
      const { data } = await API.post('/auth/verify-email', { email, otp: code });
      if (!data.success) throw new Error(data.message);
      // FIX: use token from verification response
      if (data.token) {
        loginWithToken(data.token, data.user);
        toast.success('Email verified! Welcome to TechMart!');
        navigate('/profile', { replace: true });
      } else {
        toast.success('Email verified! Please log in.');
        navigate('/login', { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Verification failed');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || !email) return;
    setResending(true); setError('');
    try {
      await API.post('/auth/resend-otp', { email });
      toast.success('New verification code sent!');
      setCountdown(60);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend code');
    } finally {
      setResending(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1.5rem', background: 'var(--bg-page)' }}>
        <div style={{ width: '100%', maxWidth: 420 }}>

          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{ width: 60, height: 60, background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              <ShieldCheck size={30} color="white" />
            </div>
            <h1 style={{ fontSize: '1.6rem', fontFamily: 'var(--font-heading)', marginBottom: 6 }}>Verify your email</h1>
            <p style={{ color: 'var(--text-mid)', fontSize: 14, lineHeight: 1.6 }}>
              We sent a 6-digit code to<br />
              <strong style={{ color: 'var(--text-dark)' }}>{email || 'your email address'}</strong>
            </p>
          </div>

          <div className="card">
            <div style={{ padding: '2rem' }}>
              {error && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '0.875rem 1rem', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
                  <AlertCircle size={16} color="#dc2626" style={{ flexShrink: 0, marginTop: 1 }} />
                  <span style={{ color: '#991b1b', fontSize: 13 }}>{error}</span>
                </div>
              )}

              {/* Email input if missing */}
              {!location.state?.email && (
                <div className="form-group">
                  <label className="form-label">Your Email</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={15} color="var(--text-mid)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    <input className="form-control" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" style={{ paddingLeft: 38 }} />
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: '1.5rem' }}>
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={el => inputRefs.current[i] = el}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={e => handleOtpChange(i, e.target.value)}
                      onKeyDown={e => handleKeyDown(i, e)}
                      onPaste={handlePaste}
                      style={{
                        width: 48, height: 56, textAlign: 'center', fontSize: 22, fontWeight: 700,
                        border: `2px solid ${digit ? 'var(--primary)' : 'var(--border)'}`,
                        borderRadius: 10, outline: 'none', color: 'var(--text-dark)', background: '#fff',
                        transition: 'border-color 0.2s',
                        boxShadow: digit ? '0 0 0 3px rgba(29,141,172,0.12)' : 'none'
                      }}
                    />
                  ))}
                </div>

                <button type="submit" disabled={loading || otp.join('').length !== 6} className="btn btn-primary btn-block" style={{ padding: '12px 24px', fontSize: 15, borderRadius: 10, gap: 8 }}>
                  <ShieldCheck size={17} />
                  {loading ? 'Verifying...' : 'Verify Email'}
                </button>
              </form>

              <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
                <p style={{ fontSize: 13, color: 'var(--text-mid)', marginBottom: 10 }}>Didn't receive the code?</p>
                <button
                  onClick={handleResend}
                  disabled={countdown > 0 || resending}
                  style={{ background: 'none', border: 'none', cursor: countdown > 0 ? 'not-allowed' : 'pointer', color: countdown > 0 ? 'var(--text-light)' : 'var(--primary)', fontSize: 14, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  <RefreshCw size={14} />
                  {resending ? 'Sending...' : countdown > 0 ? `Resend in ${countdown}s` : 'Resend code'}
                </button>
              </div>

              <div style={{ textAlign: 'center', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                <Link to="/login" style={{ fontSize: 13, color: 'var(--text-mid)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <ArrowLeft size={13} /> Back to login
                </Link>
              </div>
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}
