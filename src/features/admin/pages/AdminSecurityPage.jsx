import { useEffect, useState } from 'react';
import { getAdminAudit } from '../../../shared/api/index.js';

export default function AdminSecurityPage() {
  const [audit, setAudit] = useState([]);
  const [filter, setFilter] = useState('toate');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminAudit()
      .then((response) => setAudit(Array.isArray(response.data) ? response.data : []))
      .catch(() => setAudit([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'toate' ? audit : audit.filter((event) => event.type === filter);
  const statusColor = (status) => status === 'SUCCESS' ? '#15803D' : status === 'WARNING' ? 'var(--c-coral)' : status === 'ACTION' ? 'var(--c-blue)' : 'var(--c-ink3)';
  const statusBg = (status) => status === 'SUCCESS' ? 'rgba(21,128,61,0.1)' : status === 'WARNING' ? 'rgba(255,68,34,0.1)' : status === 'ACTION' ? 'rgba(26,82,255,0.1)' : 'rgba(0,0,0,0.05)';
  const typeIcon = (type) => type === 'auth' ? '🔑' : type === 'finante' ? '💳' : '⚙️';

  return (
    <div className="adm-page">
      <h2 style={{ fontFamily: 'var(--fd)', fontSize: 28, fontWeight: 900, marginBottom: 4 }}>Audit Log</h2>
      <p style={{ fontSize: 13, color: 'var(--c-ink3)', marginBottom: 20 }}>Toate acțiunile de pe platformă</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total events', val: audit.length, color: 'var(--c-ink)' },
          { label: 'Auth', val: audit.filter((event) => event.type === 'auth').length, color: '#15803D' },
          { label: 'Finanțe', val: audit.filter((event) => event.type === 'finante').length, color: 'var(--c-coral)' },
          { label: 'Setări', val: audit.filter((event) => event.type === 'setari').length, color: 'var(--c-ink3)' },
        ].map((stat) => (
          <div key={stat.label} className="card" style={{ padding: '14px 16px', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--fd)', fontSize: 28, fontWeight: 900, color: stat.color }}>{stat.val}</div>
            <div style={{ fontFamily: 'var(--fm)', fontSize: 9, letterSpacing: 1, color: 'var(--c-ink3)' }}>{stat.label.toUpperCase()}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {[['toate', 'Toate'], ['auth', '🔑 Auth'], ['finante', '💳 Finanțe'], ['setari', '⚙️ Setări']].map(([key, label]) => (
          <button key={key} onClick={() => setFilter(key)}
            style={{ padding: '6px 14px', borderRadius: 8, border: filter === key ? '2px solid var(--c-lime)' : '1px solid var(--c-border)', background: filter === key ? 'var(--c-lime-bg)' : 'transparent', fontSize: 12, fontWeight: 600, cursor: 'pointer', color: 'var(--c-ink)' }}>
            {label}
          </button>
        ))}
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 24, textAlign: 'center' }}><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 24, fontSize: 12, color: 'var(--c-ink3)' }}>Nu există evenimente pentru filtrul selectat.</div>
        ) : filtered.map((event) => (
          <div key={event.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', borderBottom: '1px solid var(--c-border)' }}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>{typeIcon(event.type)}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontWeight: 700, fontSize: 13 }}>{event.action}</span>
                <span style={{ fontSize: 11, color: 'var(--c-ink3)' }}>· {event.user}</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--c-ink3)', marginTop: 2 }}>{event.detail}</div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <span style={{ fontSize: 9, padding: '2px 8px', borderRadius: 4, fontWeight: 700, fontFamily: 'var(--fm)', background: statusBg(event.status), color: statusColor(event.status) }}>{event.status}</span>
              <div style={{ fontSize: 10, color: 'var(--c-ink3)', fontFamily: 'var(--fm)', marginTop: 4 }}>{event.date}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
