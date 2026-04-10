// AdminNewsletter.js
import React, { useEffect, useState } from 'react';
import API from '../../utils/api';

export default function AdminNewsletter() {
  const [data, setData] = useState({ subscribers: [], count: 0 });
  const [loading, setLoading] = useState(true);
  useEffect(() => { API.get('/newsletter').then(({ data }) => { setData(data); setLoading(false); }); }, []);

  return (
    <div>
      <div className="page-header"><h1>Newsletter Subscribers</h1></div>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="stat-card"><div className="stat-icon primary">📧</div><div><div className="stat-value">{data.count}</div><div className="stat-label">Total Subscribers</div></div></div>
      </div>
      <div className="card">
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700 }}>Subscribers List</h3>
          <button onClick={() => {
            const emails = data.subscribers.map(s => s.email).join('\n');
            navigator.clipboard.writeText(emails).then(() => alert('Emails copied to clipboard!'));
          }} className="btn btn-outline btn-sm">📋 Copy All Emails</button>
        </div>
        <div className="table-wrapper">
          <table>
            <thead><tr><th>#</th><th>Email</th><th>Subscribed On</th><th>Status</th></tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={4} style={{ textAlign: 'center', padding: '2rem' }}><div className="spinner" style={{ margin: 'auto' }} /></td></tr>
                : data.subscribers.length === 0 ? <tr><td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-mid)' }}>No subscribers yet</td></tr>
                : data.subscribers.map((s, i) => (
                <tr key={s._id}>
                  <td style={{ color: 'var(--text-light)' }}>{i + 1}</td>
                  <td style={{ fontWeight: 500 }}>{s.email}</td>
                  <td style={{ fontSize: 13, color: 'var(--text-mid)' }}>{new Date(s.subscribedAt).toLocaleDateString()}</td>
                  <td><span className="badge badge-success">Active</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
