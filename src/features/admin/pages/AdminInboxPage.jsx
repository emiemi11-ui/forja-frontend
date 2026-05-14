import { useEffect, useState } from 'react';
import { getAdminInbox, getPasswordResetRequests, generateTempPassword, adminListUpgrades, adminListDowngrades, adminApproveUpgrade, adminRejectUpgrade } from '../../../shared/api/index.js';
import { useConfirm } from '../../../shared/ui/ConfirmModal.jsx';
import { Toast, useToast } from '../../../shared/ui/helpers.jsx';

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

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('ro-RO', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function AdminInboxPage() {
  const [inbox, setInbox] = useState([]);
  const [resetRequests, setResetRequests] = useState([]);
  const [upgradeRequests, setUpgradeRequests] = useState([]);
  const [downgrades, setDowngrades] = useState([]);
  const [filter, setFilter] = useState('toate');
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [generatingFor, setGeneratingFor] = useState('');
  const [generatedPassword, setGeneratedPassword] = useState(null);
  const confirm = useConfirm();
  const { toast, showToast } = useToast();

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.all([
      getAdminInbox().catch(() => ({ data: [] })),
      getPasswordResetRequests().catch(() => ({ data: [] })),
      adminListUpgrades().catch(() => ({ data: { requests: [] } })),
      adminListDowngrades().catch(() => ({ data: { downgrades: [] } })),
    ]).then(([inboxRes, resetRes, upgRes, dowRes]) => {
      if (!mounted) return;
      setInbox(normalizeInboxResponse(inboxRes.data));
      setResetRequests(resetRes.data || []);
      setUpgradeRequests(upgRes.data?.requests || []);
      setDowngrades(dowRes.data?.downgrades || []);
    }).finally(() => {
      if (mounted) setLoading(false);
    });
    return () => { mounted = false; };
  }, [refreshKey]);

  const handleApproveUpgrade = (req) => {
    confirm(
      `Aprobi cererea ${req.requestId} pentru ${req.user?.name || '?'} (${req.toPlan} - ${req.amount} lei)?`,
      async () => {
        try {
          await adminApproveUpgrade(req.id);
          showToast('✅ Cerere aprobată');
          setRefreshKey((c) => c + 1);
        } catch (e) {
          showToast(e.response?.data?.error || '❌ Eroare', '❌');
        }
      }
    );
  };

  const handleRejectUpgrade = (req) => {
    const reason = prompt('Motiv respingere (opțional):');
    if (reason === null) return;
    confirm(
      `Respingi cererea ${req.requestId}?${req.type === 'REGISTER' ? ' Contul rămâne FREE.' : ''}`,
      async () => {
        try {
          await adminRejectUpgrade(req.id, reason);
          showToast('🚫 Cerere respinsă');
          setRefreshKey((c) => c + 1);
        } catch (e) {
          showToast(e.response?.data?.error || '❌ Eroare', '❌');
        }
      }
    );
  };

  const handleGenerateTempPassword = (userId, userName) => {
    confirm(`Generezi o parolă temporară pentru "${userName}"? Parola va fi afișată o singură dată.`, async () => {
      setGeneratingFor(userId);
      try {
        const { data } = await generateTempPassword(userId);
        setGeneratedPassword({
          email: data.user?.email,
          name: data.user?.name,
          tempPassword: data.tempPassword,
        });
        setRefreshKey((c) => c + 1);
      } catch (err) {
        alert(err.response?.data?.error || 'Eroare la generare.');
      } finally {
        setGeneratingFor('');
      }
    });
  };

  const filtered = filter === 'toate' ? inbox : (filter === 'reset' || filter === 'upgrade' || filter === 'downgrade') ? [] : inbox.filter((message) => message.type === filter);
  const contactCount = inbox.filter((message) => message.type === 'contact').length;
  const earlyCount = inbox.filter((message) => message.type === 'early-access').length;
  const newCount = inbox.filter((message) => message.status === 'nou').length;
  const pendingResets = resetRequests.filter((r) => r.status === 'PENDING').length;
  const pendingUpgrades = upgradeRequests.filter((r) => r.status === 'PENDING').length;
  const downgradeCount = downgrades.length;

  const openMessage = (message) => {
    setSelected(message);
    setInbox((current) => current.map((entry) => entry.id === message.id ? { ...entry, status: 'citit' } : entry));
  };

  return (
    <div className="adm-page">
      <Toast toast={toast} />
      <h2 style={{ fontFamily: 'var(--fd)', fontSize: 28, fontWeight: 900, marginBottom: 20 }}>Inbox</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 24 }}>
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
        <div className="card" style={{ padding: '16px', textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--fd)', fontSize: 28, fontWeight: 900, color: pendingResets > 0 ? 'var(--c-coral)' : 'var(--c-ink2)' }}>{pendingResets}</div>
          <div style={{ fontFamily: 'var(--fm)', fontSize: 9, letterSpacing: 1, color: 'var(--c-ink3)' }}>CERERI PAROLĂ</div>
        </div>
        <div className="card" style={{ padding: '16px', textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--fd)', fontSize: 28, fontWeight: 900, color: pendingUpgrades > 0 ? 'var(--c-coral)' : 'var(--c-ink2)' }}>{pendingUpgrades}</div>
          <div style={{ fontFamily: 'var(--fm)', fontSize: 9, letterSpacing: 1, color: 'var(--c-ink3)' }}>UPGRADE-URI</div>
        </div>
        <div className="card" style={{ padding: '16px', textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--fd)', fontSize: 28, fontWeight: 900, color: 'var(--c-ink2)' }}>{downgradeCount}</div>
          <div style={{ fontFamily: 'var(--fm)', fontSize: 9, letterSpacing: 1, color: 'var(--c-ink3)' }}>DOWNGRADE-URI</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {[
          ['toate', 'Toate'],
          ['contact', '📩 Contact'],
          ['early-access', '📱 Early Access'],
          ['reset', `🔑 Cereri parolă${pendingResets ? ` (${pendingResets})` : ''}`],
          ['upgrade', `💎 Cereri upgrade${pendingUpgrades ? ` (${pendingUpgrades})` : ''}`],
          ['downgrade', `⬇️ Downgrade-uri${downgradeCount ? ` (${downgradeCount})` : ''}`],
        ].map(([key, label]) => (
          <button key={key} onClick={() => setFilter(key)}
            style={{ padding: '6px 14px', borderRadius: 8, border: filter === key ? '2px solid var(--c-lime)' : '1px solid var(--c-border)', background: filter === key ? 'var(--c-lime-bg)' : 'transparent', fontSize: 12, fontWeight: 600, cursor: 'pointer', color: 'var(--c-ink)' }}>
            {label}
          </button>
        ))}
      </div>

      {/* === UPGRADE REQUESTS TAB === */}
      {filter === 'upgrade' && (
        <div style={{ display: 'grid', gap: 10 }}>
          {loading ? (
            <div className="card" style={{ padding: 24, textAlign: 'center' }}><div className="spinner" /></div>
          ) : upgradeRequests.length === 0 ? (
            <div className="card" style={{ padding: 32, textAlign: 'center' }}>
              <div style={{ fontSize: 42, opacity: 0.3, marginBottom: 6 }}>💎</div>
              <div style={{ fontFamily: 'var(--fd)', fontSize: 16, fontWeight: 700 }}>Nicio cerere de upgrade</div>
              <div style={{ fontSize: 12, color: 'var(--c-ink3)', marginTop: 4 }}>Cererile vor apărea aici când utilizatorii fac upgrade plan.</div>
            </div>
          ) : (
            upgradeRequests.map(req => (
              <div key={req.id} className="card" style={{ padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 10, color: 'var(--c-ink3)', fontFamily: 'var(--fm)', letterSpacing: 1 }}>{req.requestId || req.id}</div>
                    <div style={{ fontFamily: 'var(--fd)', fontSize: 16, fontWeight: 800, marginTop: 2 }}>
                      {req.user?.name || '(user șters)'}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--c-ink3)' }}>{req.user?.email || req.email}</div>
                  </div>
                  <span style={{
                    padding: '4px 10px', borderRadius: 12, fontSize: 10, fontWeight: 800, alignSelf: 'flex-start',
                    background: req.status === 'PENDING' ? 'rgba(26,82,255,0.1)' : req.status === 'APPROVED' ? 'rgba(184,237,0,0.15)' : 'rgba(255,68,34,0.1)',
                    color: req.status === 'PENDING' ? 'var(--c-blue)' : req.status === 'APPROVED' ? 'var(--c-lime-d)' : 'var(--c-coral)',
                  }}>
                    {req.status}
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 8, fontSize: 12, marginBottom: 10 }}>
                  <div><div style={{ fontSize: 9, color: 'var(--c-ink3)', fontFamily: 'var(--fm)', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700 }}>Plan</div><strong>{req.fromPlan} → {req.toPlan}</strong></div>
                  <div><div style={{ fontSize: 9, color: 'var(--c-ink3)', fontFamily: 'var(--fm)', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700 }}>Sumă</div><strong style={{ color: 'var(--c-lime-d)' }}>{req.amount} lei</strong></div>
                  <div><div style={{ fontSize: 9, color: 'var(--c-ink3)', fontFamily: 'var(--fm)', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700 }}>Tip</div>{req.type === 'REGISTER' ? 'La register' : 'Upgrade'}</div>
                  <div><div style={{ fontSize: 9, color: 'var(--c-ink3)', fontFamily: 'var(--fm)', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700 }}>Data</div>{formatDate(req.createdAt)}</div>
                </div>
                {req.status === 'PENDING' && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-lime" onClick={() => handleApproveUpgrade(req)} style={{ flex: 1, fontWeight: 800 }}>✅ Confirm plata</button>
                    <button onClick={() => handleRejectUpgrade(req)} style={{ flex: 1, padding: 10, borderRadius: 10, border: '1.5px solid var(--c-coral)', background: 'transparent', color: 'var(--c-coral)', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>❌ Respinge</button>
                  </div>
                )}
                {req.status === 'REJECTED' && req.reason && (
                  <div style={{ fontSize: 12, color: 'var(--c-coral)', padding: 8, background: 'rgba(255,68,34,0.05)', borderRadius: 6 }}>
                    Motiv: {req.reason}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* === DOWNGRADE HISTORY TAB === */}
      {filter === 'downgrade' && (
        <div style={{ display: 'grid', gap: 10 }}>
          {loading ? (
            <div className="card" style={{ padding: 24, textAlign: 'center' }}><div className="spinner" /></div>
          ) : downgrades.length === 0 ? (
            <div className="card" style={{ padding: 32, textAlign: 'center' }}>
              <div style={{ fontSize: 42, opacity: 0.3, marginBottom: 6 }}>⬇️</div>
              <div style={{ fontFamily: 'var(--fd)', fontSize: 16, fontWeight: 700 }}>Niciun downgrade</div>
              <div style={{ fontSize: 12, color: 'var(--c-ink3)', marginTop: 4 }}>Downgrade-urile sunt instant — vor apărea aici ca istoric.</div>
            </div>
          ) : (
            downgrades.map(d => (
              <div key={d.id} className="card" style={{ padding: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <div style={{ fontFamily: 'var(--fd)', fontSize: 15, fontWeight: 800 }}>{d.user?.name || '(user șters)'}</div>
                    <div style={{ fontSize: 12, color: 'var(--c-ink3)' }}>{d.user?.email || '—'}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{d.from} → {d.to}</div>
                    <div style={{ fontSize: 11, color: 'var(--c-ink3)' }}>{formatDate(d.createdAt)}</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* === PASSWORD RESET TAB === */}
      {filter === 'reset' && (
        <div style={{ display: 'grid', gap: 6 }}>
          {loading ? (
            <div className="card" style={{ padding: 24, textAlign: 'center' }}><div className="spinner" /></div>
          ) : resetRequests.length === 0 ? (
            <div className="card" style={{ padding: 24, fontSize: 12, color: 'var(--c-ink3)', textAlign: 'center' }}>Nicio cerere de resetare parolă încă.</div>
          ) : (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--c-border)', background: 'var(--c-bg)', display: 'grid', gridTemplateColumns: '2fr 1.3fr 1fr 1.4fr', gap: 12, fontFamily: 'var(--fm)', fontSize: 9, letterSpacing: 1, color: 'var(--c-ink3)', textTransform: 'uppercase', fontWeight: 700 }}>
                <div>Utilizator</div>
                <div>Cerută</div>
                <div>Status</div>
                <div>Acțiune</div>
              </div>
              {resetRequests.slice(0, 50).map((req) => (
                <div key={req.id} style={{ padding: '14px 20px', borderBottom: '1px solid var(--c-border)', display: 'grid', gridTemplateColumns: '2fr 1.3fr 1fr 1.4fr', gap: 12, alignItems: 'center', fontSize: 12 }}>
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--c-ink)' }}>{req.user?.name || '—'}</div>
                    <div style={{ fontSize: 11, color: 'var(--c-ink3)' }}>{req.user?.email || 'utilizator șters'}</div>
                  </div>
                  <div style={{ fontFamily: 'var(--fm)', fontSize: 11, color: 'var(--c-ink2)' }}>{formatDate(req.requestedAt)}</div>
                  <div>
                    {req.status === 'PENDING' ? (
                      <span style={{ fontSize: 9, padding: '3px 10px', borderRadius: 4, background: 'rgba(255,68,34,0.12)', color: 'var(--c-coral)', fontWeight: 700, fontFamily: 'var(--fm)', letterSpacing: 1 }}>PENDING</span>
                    ) : (
                      <span style={{ fontSize: 9, padding: '3px 10px', borderRadius: 4, background: 'var(--c-lime-bg)', color: 'var(--c-lime-d)', fontWeight: 700, fontFamily: 'var(--fm)', letterSpacing: 1 }}>REZOLVAT</span>
                    )}
                  </div>
                  <div>
                    {req.status === 'PENDING' && req.userId && (
                      <button
                        style={{ fontSize: 11, padding: '6px 12px', borderRadius: 6, border: '1px solid var(--c-blue)', background: 'rgba(26,82,255,0.1)', cursor: 'pointer', fontWeight: 700, color: 'var(--c-blue)' }}
                        onClick={() => handleGenerateTempPassword(req.userId, req.user?.name || req.user?.email)}
                        disabled={generatingFor === req.userId}
                      >
                        {generatingFor === req.userId ? '...' : '🔑 Generează parolă'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* === REGULAR INBOX === */}
      {filter !== 'reset' && (
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
      )}

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

      {/* Generated password modal */}
      {generatedPassword && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1001 }} onClick={() => setGeneratedPassword(null)}>
          <div className="card" style={{ padding: 28, maxWidth: 460, width: '90%', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔑</div>
            <div style={{ fontFamily: 'var(--fd)', fontSize: 22, fontWeight: 900, marginBottom: 8 }}>Parolă temporară generată</div>
            <div style={{ fontSize: 13, color: 'var(--c-ink3)', marginBottom: 16 }}>Pentru <strong>{generatedPassword.name}</strong> ({generatedPassword.email})</div>
            <div style={{ padding: '14px', background: 'var(--c-bg)', border: '2px dashed var(--c-lime)', borderRadius: 12, fontFamily: 'var(--fm)', fontSize: 18, fontWeight: 800, letterSpacing: 1, color: 'var(--c-ink)', userSelect: 'all', marginBottom: 16 }}>
              {generatedPassword.tempPassword}
            </div>
            <div style={{ fontSize: 11, color: 'var(--c-ink3)', marginBottom: 16, lineHeight: 1.5 }}>
              ⚠️ Trimite această parolă manual utilizatorului (e.g. pe email separat). Va fi afișată DOAR aici, ACUM. După închidere nu o mai poți recupera.
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(generatedPassword.tempPassword)}
              style={{ padding: '10px 24px', borderRadius: 10, border: '1.5px solid var(--c-border)', background: 'transparent', fontWeight: 700, fontSize: 13, cursor: 'pointer', marginRight: 8 }}>
              📋 Copiază
            </button>
            <button
              onClick={() => setGeneratedPassword(null)}
              style={{ padding: '10px 24px', borderRadius: 10, border: 'none', background: 'var(--c-ink)', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
              Închide
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
