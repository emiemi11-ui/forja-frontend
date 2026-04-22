import { useEffect, useState } from 'react';
import { getAdminInbox } from '../../../shared/api/index.js';

function normalizeInboxResponse(payload) {
  if (Array.isArray(payload)) return payload.map(normalizeInboxItem);
  if (!payload || typeof payload !== 'object') return [];
  const contacts = Array.isArray(payload.contacts) ? payload.contacts : [];
  const waitlist = Array.isArray(payload.waitlist) ? payload.waitlist : [];
  return [
    ...contacts.map((item, index) => normalizeInboxItem({
      id: item.id || `contact-${index + 1}`,
      type: 'contact',
      name: item.name,
      email: item.email,
      subject: item.topic || item.subject || 'Contact',
      message: item.message,
      createdAt: item.createdAt,
      date: item.createdAt ? new Date(item.createdAt).toLocaleString('ro-RO', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '',
      status: item.status || 'nou',
    })),
    ...waitlist.map((item, index) => normalizeInboxItem({
      id: item.id || `wait-${index + 1}`,
      type: 'early-access',
      name: '—',
      email: item.email,
      subject: item.type || 'Early Access',
      message: item.message || 'Înscris pe lista de așteptare.',
      createdAt: item.createdAt,
      date: item.createdAt ? new Date(item.createdAt).toLocaleString('ro-RO', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '',
      status: item.status || 'nou',
    })),
  ];
}

function normalizeInboxItem(item) {
  const rawType = String(item?.type || '').toLowerCase();
  const rawStatus = String(item?.status || '').toLowerCase();
  return {
    id: item?.id,
    type: rawType === 'contact' ? 'contact' : (rawType.includes('early') || rawType.includes('wait') || rawType.includes('app') ? 'early-access' : 'contact'),
    name: item?.name || '—',
    email: item?.email || '',
    subject: item?.subject || 'Mesaj',
    message: item?.message || '',
    date: item?.date || '',
    status: rawStatus.includes('read') || rawStatus.includes('citit') ? 'citit' : 'nou',
    createdAt: item?.createdAt || null,
  };
}

export default function AdminInboxPage() {
  const [inbox, setInbox] = useState([]);
  const [filter, setFilter] = useState('toate');
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminInbox()
.then((response) => setInbox(normalizeInboxResponse(response.data)))
      .catch(() => setInbox([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'toate' ? inbox : inbox.filter((message) => message.type === filter);
  const contactCount = inbox.filter((message) => message.type === 'contact').length;
  const earlyCount = inbox.filter((message) => message.type === 'early-access').length;
  const newCount = inbox.filter((message) => message.status === 'nou').length;

  const openMessage = (message) => {
    setSelected(message);
    setInbox((current) => current.map((entry) => entry.id === message.id ? { ...entry, status: 'citit' } : entry));
  };

  return (
    <div className="adm-page">
      <h2 style={{ fontFamily: 'var(--fd)', fontSize: 28, fontWeight: 900, marginBottom: 20 }}>Inbox</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 24 }}>
        <div className="card" style={{ padding: '16px', textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--fd)', fontSize: 28, fontWeight: 900, color: newCount > 0 ? 'var(--c-coral)' : 'var(--c-lime-d)' }}>{newCount}</div>
          <div style={{ fontFamily: 'var(--fm)', fontSize: 9, letterSpacing: 1, color: 'var(--c-ink3)' }}>MESAJE NOI</div>
        </div>
        <div className="card" style={{ padding: '16px', textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--fd)', fontSize: 28, fontWeight: 900, color: 'var(--c-blue)' }}>{contactCount}</div>
          <div style={{ fontFamily: 'var(--fm)', fontSize: 9, letterSpacing: 1, color: 'var(--c-ink3)' }}>DIN CONTACT</div>
        </div>
        <div className="card" style={{ padding: '16px', textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--fd)', fontSize: 28, fontWeight: 900, color: '#7B2FBE' }}>{earlyCount}</div>
          <div style={{ fontFamily: 'var(--fm)', fontSize: 9, letterSpacing: 1, color: 'var(--c-ink3)' }}>EARLY ACCESS</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {[['toate', 'Toate'], ['contact', '📩 Contact'], ['early-access', '📱 Early Access']].map(([key, label]) => (
          <button key={key} onClick={() => setFilter(key)}
            style={{ padding: '6px 14px', borderRadius: 8, border: filter === key ? '2px solid var(--c-lime)' : '1px solid var(--c-border)', background: filter === key ? 'var(--c-lime-bg)' : 'transparent', fontSize: 12, fontWeight: 600, cursor: 'pointer', color: 'var(--c-ink)' }}>
            {label}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gap: 6 }}>
        {loading ? (
          <div className="card" style={{ padding: 24, textAlign: 'center' }}><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="card" style={{ padding: 24, fontSize: 12, color: 'var(--c-ink3)' }}>Nu există mesaje pentru filtrul curent.</div>
        ) : filtered.map((message) => (
          <div key={message.id} className="card" onClick={() => openMessage(message)}
            style={{ padding: '14px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14, borderLeft: message.status === 'nou' ? '3px solid var(--c-coral)' : '3px solid transparent' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: message.type === 'contact' ? 'var(--c-blue-bg)' : 'rgba(123,47,190,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
              {message.type === 'contact' ? '📩' : '📱'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 13 }}>{message.type === 'contact' ? message.name : message.email}</div>
              <div style={{ fontSize: 11, color: 'var(--c-ink3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{message.subject} — {message.message}</div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: 10, color: 'var(--c-ink3)', fontFamily: 'var(--fm)' }}>{message.date}</div>
              {message.status === 'nou' && <span style={{ fontSize: 9, padding: '2px 8px', borderRadius: 4, background: 'var(--c-coral)', color: '#fff', fontWeight: 700 }}>NOU</span>}
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setSelected(null)}>
          <div className="card" style={{ padding: 28, maxWidth: 500, width: '90%' }} onClick={(event) => event.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <div style={{ fontFamily: 'var(--fd)', fontSize: 20, fontWeight: 900 }}>{selected.type === 'contact' ? selected.name : 'Early Access'}</div>
                <div style={{ fontSize: 12, color: 'var(--c-ink3)' }}>{selected.email} · {selected.date}</div>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--c-ink3)' }}>✕</button>
            </div>
            <div style={{ fontSize: 10, fontFamily: 'var(--fm)', color: 'var(--c-ink3)', letterSpacing: 1, marginBottom: 8 }}>{selected.subject.toUpperCase()}</div>
            <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--c-ink2)' }}>{selected.message}</p>
            {selected.type === 'contact' && (
              <a href={`mailto:${selected.email}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 16, padding: '8px 16px', borderRadius: 8, background: 'var(--c-lime)', color: '#000', fontSize: 12, fontWeight: 700, textDecoration: 'none' }}>✉️ Răspunde</a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
