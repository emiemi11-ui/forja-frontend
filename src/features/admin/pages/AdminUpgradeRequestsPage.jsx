import { useEffect, useState, useCallback } from 'react';
import { adminListUpgrades, adminApproveUpgrade, adminRejectUpgrade } from '../../../shared/api/index.js';
import { Toast, useToast } from '../../../shared/ui/helpers.jsx';
import { useConfirm } from '../../../shared/ui/ConfirmModal.jsx';

export default function AdminUpgradeRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('PENDING');
  const { toast, showToast } = useToast();
  const confirm = useConfirm();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await adminListUpgrades();
      setRequests(data.requests || []);
    } catch {
      showToast('❌ Eroare la încărcare', '❌');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { load(); }, [load]);

  const handleApprove = (req) => {
    confirm(
      `Aprobi cererea ${req.requestId} pentru ${req.user?.name || '?'} (${req.toPlan} - ${req.amount} lei)? Asta va activa planul în cont.`,
      async () => {
        try {
          await adminApproveUpgrade(req.id);
          showToast('✅ Cerere aprobată');
          load();
        } catch (e) {
          showToast(e.response?.data?.error || '❌ Eroare', '❌');
        }
      }
    );
  };

  const handleReject = (req) => {
    const reason = prompt('Motiv respingere (opțional):');
    if (reason === null) return; // user a anulat prompt-ul
    confirm(
      `Respingi cererea ${req.requestId}? ${req.type === 'REGISTER' ? 'Contul rămâne FREE.' : ''}`,
      async () => {
        try {
          await adminRejectUpgrade(req.id, reason);
          showToast('🚫 Cerere respinsă');
          load();
        } catch (e) {
          showToast(e.response?.data?.error || '❌ Eroare', '❌');
        }
      }
    );
  };

  const filtered = filter === 'all' ? requests : requests.filter(r => r.status === filter);
  const counts = {
    PENDING: requests.filter(r => r.status === 'PENDING').length,
    APPROVED: requests.filter(r => r.status === 'APPROVED').length,
    REJECTED: requests.filter(r => r.status === 'REJECTED').length,
  };

  const fmtDate = (d) => new Date(d).toLocaleString('ro-RO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="adm-page" style={{ padding: '0 4px' }}>
      <Toast toast={toast} />

      <h2 style={{ fontFamily: 'var(--fd)', fontSize: 28, fontWeight: 900, marginBottom: 4 }}>💎 Cereri upgrade</h2>
      <p style={{ fontSize: 13, color: 'var(--c-ink3)', marginBottom: 24 }}>Aprobă/respinge plățile primite pentru abonamente.</p>

      <div className="admin-kpis-inline" style={{ marginBottom: 16 }}>
        <button onClick={() => setFilter('PENDING')} className={`admin-pill tone-info`} style={{ cursor: 'pointer', border: filter === 'PENDING' ? '2px solid var(--c-blue)' : undefined }}>
          În așteptare: {counts.PENDING}
        </button>
        <button onClick={() => setFilter('APPROVED')} className={`admin-pill tone-success`} style={{ cursor: 'pointer', border: filter === 'APPROVED' ? '2px solid var(--c-lime)' : undefined }}>
          Aprobate: {counts.APPROVED}
        </button>
        <button onClick={() => setFilter('REJECTED')} className={`admin-pill tone-alert`} style={{ cursor: 'pointer', border: filter === 'REJECTED' ? '2px solid var(--c-coral)' : undefined }}>
          Respinse: {counts.REJECTED}
        </button>
        <button onClick={() => setFilter('all')} className="admin-pill" style={{ cursor: 'pointer', border: filter === 'all' ? '2px solid var(--c-ink)' : undefined }}>
          Toate
        </button>
      </div>

      {loading ? <div>Se încarcă...</div> : filtered.length === 0 ? (
        <div className="card" style={{ padding: 32, textAlign: 'center' }}>
          <div style={{ fontSize: 48, opacity: 0.3, marginBottom: 8 }}>💎</div>
          <div style={{ fontFamily: 'var(--fd)', fontSize: 18, fontWeight: 700 }}>Nicio cerere {filter === 'PENDING' ? 'în așteptare' : filter === 'APPROVED' ? 'aprobată' : filter === 'REJECTED' ? 'respinsă' : ''}</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(req => (
            <div key={req.id} className="card" style={{ padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--c-ink3)', fontFamily: 'var(--fm)' }}>{req.requestId}</div>
                  <div style={{ fontFamily: 'var(--fd)', fontSize: 18, fontWeight: 800, marginTop: 2 }}>
                    {req.user?.name || '(user șters)'} <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--c-ink3)' }}>· {req.user?.email || req.email}</span>
                  </div>
                </div>
                <span className={`admin-pill ${req.status === 'PENDING' ? 'tone-info' : req.status === 'APPROVED' ? 'tone-success' : 'tone-alert'}`}>
                  {req.status}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginBottom: 12 }}>
                <Field label="Plan dorit" value={`${req.fromPlan || 'FREE'} → ${req.toPlan}`} accent="var(--c-blue)" />
                <Field label="Sumă" value={`${req.amount} lei`} accent="var(--c-lime-d)" />
                <Field label="Tip" value={req.type === 'REGISTER' ? 'La înregistrare' : 'Upgrade'} />
                <Field label="Data" value={fmtDate(req.createdAt)} />
              </div>

              <div style={{ fontSize: 11, color: 'var(--c-ink3)', fontFamily: 'var(--fm)', marginBottom: 12 }}>
                IBAN: {req.iban} · {req.bank}
              </div>

              {req.status === 'REJECTED' && req.reason && (
                <div style={{ fontSize: 12, color: 'var(--c-coral)', marginBottom: 12, padding: 8, background: 'rgba(255,68,34,0.05)', borderRadius: 6 }}>
                  Motiv respingere: {req.reason}
                </div>
              )}

              {req.status === 'PENDING' && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-lime" onClick={() => handleApprove(req)} style={{ flex: 1, fontWeight: 800 }}>
                    ✅ Confirm plata
                  </button>
                  <button onClick={() => handleReject(req)} style={{ flex: 1, padding: 10, borderRadius: 10, border: '1.5px solid var(--c-coral)', background: 'transparent', color: 'var(--c-coral)', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
                    ❌ Respinge
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Field({ label, value, accent }) {
  return (
    <div>
      <div style={{ fontSize: 9, color: 'var(--c-ink3)', textTransform: 'uppercase', letterSpacing: 1.2, fontFamily: 'var(--fm)', fontWeight: 700, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: accent || 'var(--c-ink)' }}>{value}</div>
    </div>
  );
}
