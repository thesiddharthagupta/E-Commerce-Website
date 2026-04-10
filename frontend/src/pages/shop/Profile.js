import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import API from '../../utils/api';
import {
  User, Mail, Phone, MapPin, Lock, Trash2,
  Save, Eye, EyeOff, AlertCircle, CheckCircle2, ShieldAlert
} from 'lucide-react';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';

export default function Profile() {
  const { user, refreshUser, logout } = useAuth();
  const navigate = require('react-router-dom').useNavigate();

  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: { street: user?.address?.street || '', city: user?.address?.city || '', state: user?.address?.state || '', zip: user?.address?.zip || '', country: user?.address?.country || '' },
  });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState('');
  const [activeTab, setActiveTab] = useState('profile');

  // Account deletion state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      await API.put('/auth/profile', profileForm);
      await refreshUser();
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm) { setPwError('Passwords do not match'); return; }
    if (pwForm.newPassword.length < 6) { setPwError('New password must be at least 6 characters'); return; }
    setPwLoading(true); setPwError('');
    try {
      await API.put('/auth/change-password', { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Password changed!');
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      setPwError(err.response?.data?.message || 'Password change failed');
    } finally {
      setPwLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) { setDeleteError('Please enter your password to confirm.'); return; }
    setDeleteLoading(true); setDeleteError('');
    try {
      await API.delete('/auth/account', { data: { password: deletePassword } });
      toast.success('Account deleted. We\'re sorry to see you go.');
      logout();
      navigate('/', { replace: true });
    } catch (err) {
      setDeleteError(err.response?.data?.message || 'Deletion failed. Check your password.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'danger', label: 'Account', icon: ShieldAlert },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <main style={{ flex: 1, background: 'var(--bg-page)', padding: '2.5rem 1.5rem' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: '2rem' }}>
            <div style={{ width: 56, height: 56, background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <User size={26} color="white" />
            </div>
            <div>
              <h1 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-heading)', fontWeight: 700, marginBottom: 2 }}>{user?.name}</h1>
              <p style={{ color: 'var(--text-mid)', fontSize: 13 }}>{user?.email}</p>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4, marginBottom: '1.5rem', background: 'white', borderRadius: 12, padding: 4, border: '1px solid var(--border)' }}>
            {tabs.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setActiveTab(id)}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '9px 12px', borderRadius: 9, border: 'none', cursor: 'pointer', fontSize: 13.5, fontWeight: activeTab === id ? 700 : 500, background: activeTab === id ? (id === 'danger' ? '#fee2e2' : 'var(--primary)') : 'transparent', color: activeTab === id ? (id === 'danger' ? '#dc2626' : 'white') : 'var(--text-mid)', transition: 'all 0.18s' }}>
                <Icon size={15} />
                {label}
              </button>
            ))}
          </div>

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSave}>
              <div className="card" style={{ marginBottom: '1.25rem' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <User size={16} color="var(--primary)" />
                  <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>Personal Information</h2>
                </div>
                <div style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Full Name</label>
                    <div style={{ position: 'relative' }}>
                      <User size={14} color="var(--text-mid)" style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                      <input className="form-control" value={profileForm.name} onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))} required style={{ paddingLeft: 34 }} />
                    </div>
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Email Address</label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={14} color="var(--text-light)" style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                      <input className="form-control" value={user?.email} disabled style={{ paddingLeft: 34, background: 'var(--bg-page)', color: 'var(--text-mid)' }} />
                    </div>
                  </div>
                  <div className="form-group" style={{ margin: 0, gridColumn: '1 / -1' }}>
                    <label className="form-label">Phone Number</label>
                    <div style={{ position: 'relative' }}>
                      <Phone size={14} color="var(--text-mid)" style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                      <input className="form-control" value={profileForm.phone} onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))} placeholder="+977-9800000000" style={{ paddingLeft: 34 }} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="card" style={{ marginBottom: '1.25rem' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <MapPin size={16} color="var(--primary)" />
                  <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>Shipping Address</h2>
                </div>
                <div style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  {[
                    { key: 'street', label: 'Street Address', span: true },
                    { key: 'city', label: 'City' },
                    { key: 'state', label: 'State / Province' },
                    { key: 'zip', label: 'ZIP / Postal Code' },
                    { key: 'country', label: 'Country' },
                  ].map(({ key, label, span }) => (
                    <div key={key} className="form-group" style={{ margin: 0, gridColumn: span ? '1 / -1' : undefined }}>
                      <label className="form-label">{label}</label>
                      <input className="form-control" value={profileForm.address[key] || ''} onChange={e => setProfileForm(f => ({ ...f, address: { ...f.address, [key]: e.target.value } }))} placeholder={label} />
                    </div>
                  ))}
                </div>
              </div>

              <button type="submit" disabled={profileLoading} className="btn btn-primary" style={{ gap: 8, padding: '11px 24px' }}>
                <Save size={16} />
                {profileLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <form onSubmit={handlePasswordChange}>
              <div className="card" style={{ marginBottom: '1.25rem' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <ShieldCheck size={16} color="var(--primary)" />
                    <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>Login Security (2FA)</h2>
                  </div>
                  <button type="button" 
                    onClick={async () => {
                      try {
                        const currentStatus = user.twoFactorEnabled !== false;
                        const next = !currentStatus;
                        await API.put('/auth/profile', { twoFactorEnabled: next });
                        await refreshUser();
                        toast.success(`2FA ${next ? 'Enabled' : 'Disabled'}`);
                      } catch { toast.error('Failed to update 2FA status'); }
                    }}
                    style={{ 
                      width: 48, height: 26, background: user?.twoFactorEnabled !== false ? 'var(--primary)' : '#d1d5db', 
                      borderRadius: 13, position: 'relative', transition: 'background 0.2s', border: 'none', cursor: 'pointer' 
                    }}>
                    <div style={{ position: 'absolute', top: 3, left: user?.twoFactorEnabled !== false ? 24 : 3, width: 20, height: 20, background: '#fff', borderRadius: '50%', transition: 'left 0.2s' }} />
                  </button>
                </div>
                <div style={{ padding: '1rem 1.5rem' }}>
                  <p style={{ fontSize: 13, color: 'var(--text-mid)', margin: 0 }}>
                    When enabled, we will send a 6-digit verification code to your email every time you log in.
                  </p>
                </div>
              </div>

              <div className="card">
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Lock size={16} color="var(--primary)" />
                  <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>Change Password</h2>
                </div>
                <div style={{ padding: '1.5rem' }}>
                  {pwError && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '0.875rem 1rem', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
                      <AlertCircle size={16} color="#dc2626" style={{ flexShrink: 0, marginTop: 1 }} />
                      <span style={{ color: '#991b1b', fontSize: 13 }}>{pwError}</span>
                    </div>
                  )}
                  {[
                    { key: 'currentPassword', label: 'Current Password', show: showCurrentPw, toggle: () => setShowCurrentPw(s => !s), placeholder: '••••••••' },
                    { key: 'newPassword', label: 'New Password', show: showNewPw, toggle: () => setShowNewPw(s => !s), placeholder: 'Min. 6 characters' },
                    { key: 'confirm', label: 'Confirm New Password', show: showNewPw, toggle: () => setShowNewPw(s => !s), placeholder: 'Repeat password' },
                  ].map(({ key, label, show, toggle, placeholder }) => (
                    <div key={key} className="form-group">
                      <label className="form-label">{label}</label>
                      <div style={{ position: 'relative' }}>
                        <Lock size={14} color="var(--text-mid)" style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                        <input className="form-control" type={show ? 'text' : 'password'} required placeholder={placeholder}
                          value={pwForm[key]} onChange={e => setPwForm(f => ({ ...f, [key]: e.target.value }))}
                          style={{ paddingLeft: 34, paddingRight: 44 }} />
                        <button type="button" onClick={toggle} style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-mid)', display: 'flex' }}>
                          {show ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </div>
                  ))}
                  <button type="submit" disabled={pwLoading} className="btn btn-primary" style={{ gap: 8 }}>
                    <Lock size={15} />
                    {pwLoading ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Danger Zone Tab */}
          {activeTab === 'danger' && (
            <div className="card" style={{ border: '1.5px solid #fca5a5' }}>
              <div style={{ padding: '1.5rem', borderBottom: '1px solid #fee2e2', display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShieldAlert size={16} color="#dc2626" />
                <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#dc2626' }}>Danger Zone</h2>
              </div>
              <div style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: '#fef2f2', borderRadius: 10, border: '1px solid #fecaca' }}>
                  <div>
                    <p style={{ fontWeight: 700, color: '#991b1b', marginBottom: 4 }}>Delete Account</p>
                    <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.5 }}>Permanently delete your account and all associated data.<br />This action cannot be undone.</p>
                  </div>
                  <button onClick={() => setShowDeleteModal(true)} className="btn btn-danger" style={{ flexShrink: 0, marginLeft: 16, gap: 7 }}>
                    <Trash2 size={15} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backdropFilter: 'blur(3px)' }}
          onClick={e => { if (e.target === e.currentTarget) { setShowDeleteModal(false); setDeletePassword(''); setDeleteError(''); } }}>
          <div className="card" style={{ width: '100%', maxWidth: 420, border: '1.5px solid #fca5a5' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 40, height: 40, background: '#fee2e2', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Trash2 size={20} color="#dc2626" />
              </div>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827' }}>Delete your account?</h3>
                <p style={{ fontSize: 12, color: 'var(--text-mid)' }}>This is permanent and cannot be undone.</p>
              </div>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <p style={{ fontSize: 13, color: 'var(--text-mid)', marginBottom: '1rem', lineHeight: 1.6 }}>
                All your data — order history, wishlist, and profile information — will be permanently deleted.
              </p>
              {deleteError && (
                <div style={{ display: 'flex', gap: 8, padding: '0.75rem', background: '#fee2e2', borderRadius: 8, marginBottom: '1rem' }}>
                  <AlertCircle size={15} color="#dc2626" style={{ flexShrink: 0, marginTop: 1 }} />
                  <span style={{ fontSize: 13, color: '#991b1b' }}>{deleteError}</span>
                </div>
              )}
              <div className="form-group">
                <label className="form-label">Enter your password to confirm</label>
                <input className="form-control" type="password" value={deletePassword} onChange={e => setDeletePassword(e.target.value)} placeholder="Your current password" autoFocus />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => { setShowDeleteModal(false); setDeletePassword(''); setDeleteError(''); }}
                  className="btn btn-ghost" style={{ flex: 1 }}>Cancel</button>
                <button onClick={handleDeleteAccount} disabled={deleteLoading || !deletePassword}
                  className="btn btn-danger" style={{ flex: 1, gap: 7 }}>
                  <Trash2 size={14} />
                  {deleteLoading ? 'Deleting...' : 'Yes, Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
