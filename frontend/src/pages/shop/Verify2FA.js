import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ShieldCheck, AlertCircle, RefreshCw, ArrowLeft, Lock } from 'lucide-react';
import API from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';

export default function Verify2FA() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginWithToken } = useAuth();
  
  const from = location.state?.from || '/';
  const [email, setEmail] = useState(location.state?.email || '');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(60);
  const inputRefs = useRef([]);

  useEffect(() => {
    // If no email in state, user shouldn't be here
    if (!email) {
      toast.error('Session expired. Please log in again.');
      navigate('/login');
    }
  }, [email, navigate]);

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
    
    setLoading(true); setError('');
    try {
      const { data } = await API.post('/auth/verify-2fa', { email, otp: code });
      if (!data.success) throw new Error(data.message);
      
      loginWithToken(data.token, data.user);
      toast.success(`Welcome back, ${data.user.name.split(' ')[0]}!`);
      
      // Admin users are redirected to dash, others to 'from'
      navigate(data.user.role === 'admin' ? '/admin' : from, { replace: true });
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
      // Re-trigger the login to get a new OTP
      // NOTE: In a more complex app, we'd have a specific /resend-2fa-otp
      // For now, we'll reuse the logic or suggest relogging if it fails.
      toast.info('Please re-enter your password to get a new code.');
      navigate('/login');
    } catch (err) {
      setError('Failed to resend code. Please try logging in again.');
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
            <div style={{ width: 64, height: 64, background: 'linear-gradient(135deg, #0d1b2a, #1d3557)', borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }}>
              <Lock size={28} color="white" />
            </div>
            <h1 style={{ fontSize: '1.6rem', fontFamily: 'var(--font-heading)', marginBottom: 6 }}>Two-Factor Authentication</h1>
            <p style={{ color: 'var(--text-mid)', fontSize: 14, lineHeight: 1.6 }}>
              Enhanced security is enabled for your account.<br />
              Enter the 6-digit code sent to <strong style={{ color: 'var(--text-dark)' }}>{email}</strong>
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

                <button type="submit" disabled={loading || otp.join('').length !== 6} className="btn btn-primary btn-block btn-lg" style={{ gap: 8 }}>
                  <ShieldCheck size={18} />
                  {loading ? 'Verifying...' : 'Verify & Login'}
                </button>
              </form>

              <div style={{ textAlign: 'center', marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)' }}>
                <Link to="/login" style={{ fontSize: 13, color: 'var(--text-mid)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <ArrowLeft size={13} /> Back to standard login
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
