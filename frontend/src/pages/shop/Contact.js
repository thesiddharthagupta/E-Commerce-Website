// Contact.js
import React, { useState } from 'react';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import API from '../../utils/api';
import { toast } from 'react-toastify';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await API.post('/messages', form);
      toast.success('Message sent! We\'ll get back to you soon.');
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch { toast.error('Failed to send message'); } finally { setSending(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <main style={{ flex: 1 }}>
        <div style={{ background: 'linear-gradient(135deg, var(--primary-dark), var(--primary))', padding: '3rem 1.5rem', textAlign: 'center' }}>
          <h1 style={{ color: 'white', fontSize: '2rem', marginBottom: 8 }}>Contact Us</h1>
          <p style={{ color: 'rgba(255,255,255,0.8)' }}>We'd love to hear from you. Send us a message!</p>
        </div>
        <div style={{ maxWidth: 1000, margin: '3rem auto', padding: '0 1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem', alignItems: 'start' }}>
            {/* Info */}
            <div>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Get in Touch</h2>
              {[
                ['📍', 'Address', 'New Road, Kathmandu, Nepal'],
                ['📞', 'Phone', '+977-01-4567890'],
                ['✉️', 'Email', 'info@techmart.com'],
                ['🕒', 'Hours', 'Sun–Fri: 10am–7pm'],
              ].map(([icon, label, value]) => (
                <div key={label} style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div style={{ width: 44, height: 44, background: 'var(--primary-light)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{icon}</div>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{label}</p>
                    <p style={{ color: 'var(--text-mid)', fontSize: 14 }}>{value}</p>
                  </div>
                </div>
              ))}
            </div>
            {/* Form */}
            <div className="card card-body">
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: '1.25rem' }}>Send a Message</h3>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-2">
                  <div className="form-group"><label className="form-label">Name *</label><input className="form-control" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
                  <div className="form-group"><label className="form-label">Email *</label><input className="form-control" type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
                </div>
                <div className="grid grid-2">
                  <div className="form-group"><label className="form-label">Phone</label><input className="form-control" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
                  <div className="form-group"><label className="form-label">Subject</label><input className="form-control" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} /></div>
                </div>
                <div className="form-group"><label className="form-label">Message *</label><textarea className="form-control" required rows={5} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} /></div>
                <button type="submit" disabled={sending} className="btn btn-primary btn-block">{sending ? 'Sending...' : '✉️ Send Message'}</button>
              </form>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
