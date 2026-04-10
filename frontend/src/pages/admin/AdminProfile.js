import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import API from '../../utils/api';
import { 
  User, Mail, Phone, Lock, Save, Eye, EyeOff, 
  ShieldCheck, AlertCircle, Key, UserCheck 
} from 'lucide-react';

export default function AdminProfile() {
  const { user, refreshUser } = useAuth();
  
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  });
  
  const [pwForm, setPwForm] = useState({ 
    currentPassword: '', 
    newPassword: '', 
    confirm: '' 
  });
  
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  
  const [profileLoading, setProfileLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState('');
  const [activeTab, setActiveTab] = useState('profile');

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      await API.put('/auth/profile', profileForm);
      await refreshUser();
      toast.success('Admin profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm) { 
      setPwError('Passwords do not match'); 
      return; 
    }
    if (pwForm.newPassword.length < 6) { 
      setPwError('New password must be at least 6 characters'); 
      return; 
    }
    
    setPwLoading(true); setPwError('');
    try {
      await API.put('/auth/change-password', { 
        currentPassword: pwForm.currentPassword, 
        newPassword: pwForm.newPassword 
      });
      toast.success('Password updated successfully!');
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      setPwError(err.response?.data?.message || 'Password update failed');
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 800 }}>
      {/* Header */}
      <div className="page-header">
        <h1>Admin Account & Security</h1>
        <p>Manage your administrative profile and password</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* Tab Sidebar */}
        <div className="card" style={{ overflow: 'hidden' }}>
          {[
            { id: 'profile', label: 'My Profile', icon: User },
            { id: 'security', label: 'Security', icon: ShieldCheck },
          ].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              style={{ 
                width: '100%', padding: '12px 16px', border: 'none', 
                background: activeTab === t.id ? 'var(--primary-light)' : 'transparent', 
                color: activeTab === t.id ? 'var(--primary-dark)' : 'var(--text-mid)', 
                textAlign: 'left', cursor: 'pointer', fontSize: 13.5, 
                fontWeight: activeTab === t.id ? 700 : 400, 
                borderLeft: `3px solid ${activeTab === t.id ? 'var(--primary)' : 'transparent'}`, 
                display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid var(--border)' 
              }}>
              <t.icon size={16} /> {t.label}
            </button>
          ))}
        </div>

        {/* Form Area */}
        <div className="card">
          {activeTab === 'profile' ? (
            <form onSubmit={handleProfileSave} style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                 <UserCheck size={18} color="var(--primary)" /> Profile Information
              </h3>
              
              <div style={{ display: 'grid', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Administrative Name</label>
                  <div style={{ position: 'relative' }}>
                    <User size={15} color="var(--text-light)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    <input className="form-control" value={profileForm.name} onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))} required style={{ paddingLeft: 38 }} />
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Email Address (Read-only)</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={15} color="var(--text-light)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    <input className="form-control" value={user?.email} disabled style={{ paddingLeft: 38, background: '#f8fafc', color: 'var(--text-light)' }} />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Contact Phone</label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={15} color="var(--text-light)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    <input className="form-control" value={profileForm.phone} onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))} placeholder="+977-..." style={{ paddingLeft: 38 }} />
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)' }}>
                <button type="submit" disabled={profileLoading} className="btn btn-primary btn-lg" style={{ gap: 8 }}>
                  <Save size={16} />
                  {profileLoading ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handlePasswordChange} style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                 <Key size={18} color="var(--primary)" /> Change Credentials
              </h3>

              <div className="form-group" style={{ background: '#f8fafc', padding: '1rem', borderRadius: 10, border: '1px solid var(--border)', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Two-Factor Authentication (2FA)</h4>
                    <p style={{ fontSize: 12, color: 'var(--text-mid)', margin: 0 }}>Protect your account with an email verification code on every login.</p>
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
              </div>

              {pwError && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '0.75rem 1rem', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 8, marginBottom: '1.25rem' }}>
                  <AlertCircle size={16} color="#dc2626" style={{ marginTop: 2 }} />
                  <span style={{ color: '#991b1b', fontSize: 13 }}>{pwError}</span>
                </div>
              )}

              <div style={{ display: 'grid', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Current Admin Password</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={15} color="var(--text-light)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    <input className="form-control" type={showCurrentPw ? 'text' : 'password'} value={pwForm.currentPassword} onChange={e => setPwForm(f => ({ ...f, currentPassword: e.target.value }))} required placeholder="••••••••" style={{ paddingLeft: 38, paddingRight: 40 }} />
                    <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-mid)' }}>
                      {showCurrentPw ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={15} color="var(--text-light)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    <input className="form-control" type={showNewPw ? 'text' : 'password'} value={pwForm.newPassword} onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))} required placeholder="Min. 6 characters" style={{ paddingLeft: 38, paddingRight: 40 }} />
                    <button type="button" onClick={() => setShowNewPw(!showNewPw)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-mid)' }}>
                      {showNewPw ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Confirm New Password</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={15} color="var(--text-light)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    <input className="form-control" type={showNewPw ? 'text' : 'password'} value={pwForm.confirm} onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))} required placeholder="Repeat new password" style={{ paddingLeft: 38 }} />
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)' }}>
                <button type="submit" disabled={pwLoading} className="btn btn-primary btn-lg" style={{ gap: 8 }}>
                  <ShieldCheck size={16} />
                  {pwLoading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
