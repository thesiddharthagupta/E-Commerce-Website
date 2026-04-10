// AdminMessages.js
import React, { useEffect, useState } from 'react';
import API from '../../utils/api';
import { toast } from 'react-toastify';

export default function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [reply, setReply] = useState('');

  const fetch = () => API.get('/messages').then(({ data }) => { setMessages(data.messages); setLoading(false); });
  useEffect(() => { fetch(); }, []);

  const markRead = async (id) => {
    await API.patch(`/messages/${id}/read`);
    setMessages(prev => prev.map(m => m._id === id ? { ...m, isRead: true } : m));
  };

  const sendReply = async (id) => {
    if (!reply.trim()) return;
    try {
      await API.patch(`/messages/${id}/reply`, { reply });
      toast.success('Reply sent'); setReply('');
      fetch();
      setSelected(prev => prev ? { ...prev, isReplied: true, reply } : prev);
    } catch { toast.error('Failed'); }
  };

  const del = async (id) => {
    if (!window.confirm('Delete this message?')) return;
    await API.delete(`/messages/${id}`); fetch(); setSelected(null); toast.success('Deleted');
  };

  return (
    <div>
      <div className="page-header"><h1>Messages</h1><p>Customer inquiries and contact form submissions</p></div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '1.5rem', alignItems: 'start' }}>
        <div className="card" style={{ maxHeight: 600, overflowY: 'auto' }}>
          {loading ? <div style={{ padding: '2rem', textAlign: 'center' }}><div className="spinner" style={{ margin: 'auto' }} /></div>
            : messages.length === 0 ? <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-mid)' }}>No messages yet</div>
            : messages.map(msg => (
            <div key={msg._id} onClick={() => { setSelected(msg); markRead(msg._id); }}
              style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', cursor: 'pointer', background: selected?._id === msg._id ? 'var(--primary-light)' : msg.isRead ? 'white' : '#f0f9ff', transition: 'background 0.15s' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontWeight: msg.isRead ? 500 : 700, fontSize: 14 }}>{msg.name}</span>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  {!msg.isRead && <span style={{ width: 8, height: 8, background: 'var(--primary)', borderRadius: '50%', display: 'inline-block' }} />}
                  {msg.isReplied && <span className="badge badge-success" style={{ fontSize: 10 }}>Replied</span>}
                </div>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-mid)', marginBottom: 4 }}>{msg.email}</div>
              <div style={{ fontSize: 13, color: 'var(--text-mid)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{msg.subject || msg.message}</div>
              <div style={{ fontSize: 11, color: 'var(--text-light)', marginTop: 4 }}>{new Date(msg.createdAt).toLocaleString()}</div>
            </div>
          ))}
        </div>
        <div>
          {selected ? (
            <div className="card card-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: 16 }}>{selected.subject || 'No Subject'}</h3>
                  <p style={{ fontSize: 13, color: 'var(--text-mid)' }}>From: {selected.name} &lt;{selected.email}&gt; {selected.phone && `· ${selected.phone}`}</p>
                </div>
                <button onClick={() => del(selected._id)} className="btn btn-danger btn-sm">🗑</button>
              </div>
              <div style={{ padding: '1rem', background: 'var(--bg-page)', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: 14, lineHeight: 1.7, color: 'var(--text-mid)' }}>{selected.message}</div>
              {selected.isReplied && selected.reply && (
                <div style={{ padding: '1rem', background: 'var(--primary-light)', borderRadius: 'var(--radius-md)', marginBottom: '1rem', borderLeft: '3px solid var(--primary)' }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)', marginBottom: 4 }}>Your Reply:</p>
                  <p style={{ fontSize: 14, color: 'var(--text-mid)' }}>{selected.reply}</p>
                </div>
              )}
              {!selected.isReplied && (
                <div>
                  <textarea className="form-control" rows={4} placeholder="Type your reply..." value={reply} onChange={e => setReply(e.target.value)} style={{ marginBottom: 8 }} />
                  <button onClick={() => sendReply(selected._id)} className="btn btn-primary">Send Reply</button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-mid)' }}>
              <div style={{ fontSize: 48, marginBottom: '1rem' }}>✉️</div>
              <p>Select a message to view</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
