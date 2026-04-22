import { useEffect, useState } from 'react';
import { getAdminOverview, getAdminAudit } from '../../../shared/api/index.js';
import { useNavigate } from 'react-router-dom';

export default function AdminOverviewPage() {
  const [overview, setOverview] = useState(null);
  const [audit, setAudit] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([getAdminOverview(), getAdminAudit({ limit: 5 })])
      .then(([overviewResponse, auditResponse]) => {
        setOverview(overviewResponse.data);
        const auditData = Array.isArray(auditResponse.data) ? auditResponse.data : (Array.isArray(auditResponse.data?.events) ? auditResponse.data.events : []);
        setAudit(auditData);
      })
      .catch(() => {
        setOverview({
          kpis: {},
          roles: {},
          plans: {},
          finance: {
            month: 0,
            year: 0,
            profit: 0,
            subs: { free: 0, pro: 0, team: 0 },
            history: [0],
            professionals: [],
            commission: 15,
          },
        });
        setAudit([]);
      });
  }, []);

  if (!overview) return <div style={{ padding: 40 }}><div className="spinner" /></div>;

  const finance = overview.finance || {
    month: 0,
    year: 0,
    profit: 0,
    subs: { free: 0, pro: 0, team: 0 },
    history: [0],
    professionals: [],
    commission: 15,
  };
  const months = ['Nov', 'Dec', 'Ian', 'Feb', 'Mar', 'Apr'];

  return (
    <div className="adm-page">
      <h2 style={{ fontFamily: 'var(--fd)', fontSize: 28, fontWeight: 900, marginBottom: 4 }}>Dashboard Admin</h2>
      <p style={{ fontSize: 13, color: 'var(--c-ink3)', marginBottom: 24 }}>FORJA · {new Date().toLocaleDateString('ro-RO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'VENIT LUNA ACEASTA', val: `${finance?.month || 0} lei`, icon: '💰', color: 'var(--c-lime-d)' },
          { label: 'VENIT ANUL ACESTA', val: `${finance?.year || 0} lei`, icon: '📊', color: 'var(--c-blue)' },
          { label: 'PROFIT NET', val: `${finance?.profit || 0} lei`, icon: '🏦', color: '#15803D' },
          { label: 'ABONAMENTE ACTIVE', val: `${(finance?.subs?.pro || 0) + (finance?.subs?.team || 0)}`, icon: '👥', color: 'var(--c-coral)' },
        ].map((s) => (
          <div key={s.label} className="card" style={{ padding: '20px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 20 }}>{s.icon}</span>
              <span style={{ fontFamily: 'var(--fm)', fontSize: 8, letterSpacing: 1, color: 'var(--c-ink3)' }}>{s.label}</span>
            </div>
            <div style={{ fontFamily: 'var(--fd)', fontSize: 28, fontWeight: 900, color: s.color }}>{s.val}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'FREE', val: finance?.subs?.free || 0, color: 'var(--c-ink3)' },
          { label: 'PRO', val: finance?.subs?.pro || 0, color: 'var(--c-lime-d)' },
          { label: 'TEAM', val: finance?.subs?.team || 0, color: 'var(--c-blue)' },
        ].map((s) => (
          <div key={s.label} className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontFamily: 'var(--fd)', fontSize: 24, fontWeight: 900, color: s.color }}>{s.val}</div>
            <div style={{ fontFamily: 'var(--fm)', fontSize: 9, letterSpacing: 1, color: 'var(--c-ink3)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 20 }}>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: 1.5, color: 'var(--c-ink3)', marginBottom: 14 }}>TREND VENITURI</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 120 }}>
            {(finance?.history || [0]).map((v, i) => {
              const max = Math.max(...(finance?.history || [1]), 1);
              const h = (v / max) * 100;
              return (
                <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ height: h, background: i === (finance?.history || []).length - 1 ? 'var(--c-lime)' : 'var(--c-border)', borderRadius: '4px 4px 0 0', transition: 'height 0.5s', minHeight: 4 }} />
                  <div style={{ fontSize: 9, color: 'var(--c-ink3)', fontFamily: 'var(--fm)', marginTop: 4 }}>{months[i] || 'Acum'}</div>
                  <div style={{ fontSize: 8, color: 'var(--c-ink3)', fontFamily: 'var(--fm)' }}>{v}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: 1.5, color: 'var(--c-ink3)', marginBottom: 14 }}>VENITURI PER PROFESIONIST</div>
          {(finance?.professionals || []).length === 0 ? (
            <div style={{ fontSize: 12, color: 'var(--c-ink3)', padding: '12px 0' }}>Nu există încă profesioniști activi cu clienți acceptați.</div>
          ) : (finance?.professionals || []).map((professional) => (
            <div key={professional.id || professional.name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--c-border)' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: professional.role === 'COACH' ? 'var(--c-blue-bg)' : 'rgba(123,47,190,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: professional.role === 'COACH' ? 'var(--c-blue)' : '#7B2FBE', fontFamily: 'var(--fd)', flexShrink: 0 }}>
                {(professional.name || 'P')[0]}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 12 }}>{professional.name}</div>
                <div style={{ fontSize: 10, color: 'var(--c-ink3)' }}>{professional.clients} clienți · {professional.role === 'COACH' ? '🏋️' : '🥗'}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'var(--fd)', fontSize: 16, fontWeight: 900, color: 'var(--c-lime-d)' }}>{professional.revenue} lei</div>
                <div style={{ fontSize: 9, color: 'var(--c-ink3)' }}>comision: {professional.commission} lei</div>
              </div>
            </div>
          ))}
          <div style={{ marginTop: 10, padding: '8px 12px', borderRadius: 8, background: 'var(--c-lime-bg)', fontSize: 12, fontWeight: 700 }}>
            Total comisioane: <span style={{ color: 'var(--c-lime-d)' }}>{(finance?.professionals || []).reduce((sum, professional) => sum + Number(professional.commission || 0), 0)} lei</span> ({finance?.commission || 15}%)
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: 1.5, color: 'var(--c-ink3)', marginBottom: 14 }}>ACȚIUNI RAPIDE</div>
          {[
            { label: 'Gestionează utilizatori', icon: '👥', to: '/admin/users' },
            { label: 'Inbox & mesaje', icon: '📩', to: '/admin/inbox' },
            { label: 'Setări platformă', icon: '⚙️', to: '/admin/settings' },
            { label: 'Audit log & securitate', icon: '🔒', to: '/admin/security' },
          ].map((action) => (
            <div key={action.label} onClick={() => navigate(action.to)} className="card"
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', cursor: 'pointer', marginBottom: 4 }}>
              <span style={{ fontSize: 18 }}>{action.icon}</span>
              <span style={{ fontWeight: 600, fontSize: 12, flex: 1 }}>{action.label}</span>
              <span style={{ color: 'var(--c-ink3)', fontSize: 12 }}>→</span>
            </div>
          ))}
        </div>

        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: 1.5, color: 'var(--c-ink3)', marginBottom: 14 }}>ACTIVITATE RECENTĂ</div>
          {audit.length === 0 ? (
            <div style={{ fontSize: 12, color: 'var(--c-ink3)' }}>Nu există încă evenimente de audit.</div>
          ) : audit.slice(0, 5).map((event) => (
            <div key={event.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid var(--c-border)', fontSize: 12 }}>
              <span style={{ fontSize: 14 }}>{event.type === 'auth' ? '🔑' : event.type === 'moderare' ? '🛡️' : event.type === 'finante' ? '💳' : '⚙️'}</span>
              <div style={{ flex: 1 }}>
                <span style={{ fontWeight: 600 }}>{event.action}</span>
                <span style={{ color: 'var(--c-ink3)', marginLeft: 6 }}>{String(event.detail || '').slice(0, 40)}{String(event.detail || '').length > 40 ? '...' : ''}</span>
              </div>
              <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 4, fontWeight: 700, fontFamily: 'var(--fm)', background: event.status === 'SUCCESS' ? 'rgba(21,128,61,0.1)' : event.status === 'WARNING' ? 'rgba(255,68,34,0.1)' : 'rgba(26,82,255,0.1)', color: event.status === 'SUCCESS' ? '#15803D' : event.status === 'WARNING' ? 'var(--c-coral)' : 'var(--c-blue)' }}>
                {event.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
