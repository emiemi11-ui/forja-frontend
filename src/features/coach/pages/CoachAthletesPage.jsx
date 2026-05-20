import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCoachAthletes, getCoachAthlete, coachInviteAthlete, startConversation, getCoachRequests, acceptCoachRequest, rejectCoachRequest, addCoachAthleteJournal } from '../../../shared/api/index.js';
import { Toast, useToast } from '../../../shared/ui/helpers.jsx';
import Drawer from '../../../shared/ui/Drawer.jsx';
import Modal, { ModalField, ModalInput, ModalSelect, ModalActions } from '../../../shared/ui/Modal.jsx';
import { AnimatedPage } from '../../../shared/ui/animations/index.jsx';


function CoachAv({ av, col, size = 36 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: col || '#1A52FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: size * 0.4, color: '#fff', fontFamily: 'var(--fd)', flexShrink: 0 }}>
      {av}
    </div>
  );
}

const ATHLETE_PHOTOS = {
  'A': '/img/ext/u-115d3c5430.jpg',
  'R': '/img/ext/u-919eb92866.jpg',
  'C': '/img/ext/u-cfef1843fc.jpg',
  'M': '/img/ext/u-4d5d61a2b3.jpg',
  'D': '/img/ext/u-a3a1d9fa30.jpg',
};

export default function CoachAthletesPage() {
  const [athletes, setAthletes]   = useState([]);
  const [selected, setSelected]   = useState(null);
  const [drawerData, setDrawerData] = useState(null);
  const [showJournal, setShowJournal] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [form, setForm]           = useState({ email: '' });
  const [loading, setLoading]     = useState(false);
  const { toast, showToast }      = useToast();
  const navigate = useNavigate();

  const [loadingPage, setLoadingPage] = useState(true);
  const [requests, setRequests] = useState([]);
  const [savingJournal, setSavingJournal] = useState(false);
  const load = () => {
    setLoadingPage(true);
    Promise.all([getCoachAthletes(), getCoachRequests().catch(() => ({ data: [] }))])
      .then(([a, r]) => {
        setAthletes(a.data);
        setRequests(r.data || []);
        setLoadingPage(false);
      })
      .catch(() => setLoadingPage(false));
  };
  useEffect(() => { load(); }, []);

  const handleAcceptRequest = async (linkId, athleteName) => {
    try {
      await acceptCoachRequest(linkId);
      showToast(`✅ ${athleteName} este acum atletul tău!`);
      load();
    } catch (e) {
      showToast(e.response?.data?.error || '❌ Eroare', '❌');
    }
  };

  const handleRejectRequest = async (linkId, athleteName) => {
    if (!confirm(`Sigur respingi cererea de la ${athleteName}?`)) return;
    try {
      await rejectCoachRequest(linkId);
      showToast('✅ Cerere respinsă');
      load();
    } catch (e) {
      showToast(e.response?.data?.error || '❌ Eroare', '❌');
    }
  };

  const openDrawer = async (a) => {
    setSelected(a);
    try {
      const r = await getCoachAthlete(a.id); // string cuid
      setDrawerData(r.data);
    } catch { setDrawerData(a); }
  };

  const handleInvite = async () => {
    if (!form.email) { showToast('Introdu email-ul atletului', '⚠️'); return; }
    setLoading(true);
    try {
      await coachInviteAthlete({ email: form.email });
      showToast(`✅ Invitație trimisă la ${form.email}`);
      setShowInvite(false);
      setForm({ email: '' });
      load();
    } catch (e) {
      showToast(e.response?.data?.error || '❌ Eroare', '❌');
    } finally { setLoading(false); }
  };

  return (
    <AnimatedPage>
      <Toast toast={toast} />
      {loadingPage && <div style={{ padding: 40, display: 'flex', justifyContent: 'center' }}><div className="spinner" /></div>}

      {/* Cereri primite (sus de tot) */}
      {!loadingPage && requests.length > 0 && (
        <div className="card" style={{ marginBottom: 16, border: '2px solid var(--c-lime)' }}>
          <div className="card-hd">
            <span className="card-hd-title">📥 Cereri noi ({requests.length})</span>
          </div>
          <div className="card-body">
            {requests.map((r) => (
              <div key={r.linkId} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--c-bg)' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--c-blue, #3b82f6)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontFamily: 'var(--fd)', fontSize: 16, flexShrink: 0 }}>
                  {(r.athlete.name?.[0] || '?').toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--fd)', fontWeight: 700, fontSize: 14 }}>{r.athlete.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--c-ink3)' }}>{r.athlete.goal || r.athlete.email}</div>
                </div>
                <button className="btn btn-black btn-sm" onClick={() => handleAcceptRequest(r.linkId, r.athlete.name)}>✓ Acceptă</button>
                <button className="btn btn-outline btn-sm" onClick={() => handleRejectRequest(r.linkId, r.athlete.name)} style={{ color: '#dc2626' }}>✕</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loadingPage && athletes.length === 0 && requests.length === 0 && (
        <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--c-ink3)' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>👥</div>
          <div style={{ fontFamily: 'var(--fd)', fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Niciun atlet încă</div>
          <div style={{ fontSize: 13 }}>Invită primul tău atlet →</div>
        </div>
      )}

      {/* Invite Modal */}
      <Modal open={showInvite} onClose={() => setShowInvite(false)} title="👥 Invită atlet">
        <div style={{ fontSize: 12, color: 'var(--c-ink3)', marginBottom: 12 }}>
          Atletul trebuie să aibă deja cont pe FORJA. Introdu emailul lui — primește invitația direct în aplicație și o poate accepta sau refuza.
        </div>
        <ModalField label="Email atlet *">
          <ModalInput type="email" placeholder="andrei@exemplu.ro" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} autoFocus />
        </ModalField>
        <ModalActions>
          <button className="btn btn-outline btn-sm" onClick={() => setShowInvite(false)}>Anulează</button>
          <button className="btn btn-black" onClick={handleInvite} disabled={loading}>
            {loading ? 'Se trimite...' : '📧 Trimite invitație'}
          </button>
        </ModalActions>
      </Modal>

      {/* Athlete Drawer */}
      <Drawer open={!!selected} onClose={() => { setSelected(null); setDrawerData(null); }} title={selected?.name || ''}>
        {selected && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, padding: '0 0 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <CoachAv av={selected.av} col={selected.col} size={56} />
              <div>
                <div style={{ fontFamily: 'var(--fd)', fontSize: 22, fontWeight: 900, color: '#fff' }}>{selected.name}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 3 }}>{selected.notes || "Fără notițe"}</div>
              </div>
            </div>
            {/* JURNAL ATLET — collapsible */}
            <div style={{ marginBottom: 20 }}>
              <button onClick={() => setShowJournal(!showJournal)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', cursor: 'pointer', color: 'rgba(255,255,255,0.6)', fontSize: 11, fontFamily: 'var(--fm)', letterSpacing: 0.5 }}>
                📝 JURNAL ({selected.journal?.length || 0} notițe)
                <span style={{ marginLeft: 'auto', transform: showJournal ? 'rotate(180deg)' : '', transition: 'transform 0.2s' }}>▼</span>
              </button>
              {showJournal && (
                <div style={{ marginTop: 10 }}>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                    <input id="coachJournalInput" placeholder="Notița nouă..." disabled={savingJournal}
                      style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#fff', fontSize: 12, fontFamily: 'var(--fb)', opacity: savingJournal ? 0.5 : 1 }} />
                    <button className="btn btn-lime btn-sm" disabled={savingJournal} onClick={async () => {
                      const input = document.getElementById('coachJournalInput');
                      const text = (input?.value || '').trim();
                      if (!text || savingJournal) return; // anti double-submit
                      setSavingJournal(true);
                      input.value = ''; // clear ASAP — dispare imediat din UI
                      try {
                        const { data } = await addCoachAthleteJournal(selected.id, text);
                        // Update local state cu jurnalul intors de la backend
                        const updatedJournal = data.journal || [];
                        selected.journal = updatedJournal;
                        selected.notes = updatedJournal[updatedJournal.length - 1]?.text || selected.notes;
                        setDrawerData({ ...drawerData, journal: updatedJournal, notes: selected.notes });
                        showToast('💾 Salvat!');
                      } catch (e) {
                        showToast(e.response?.data?.error || '❌ Eroare la salvare', '❌');
                        input.value = text; // restore daca a esuat
                      } finally {
                        setSavingJournal(false);
                      }
                    }}>{savingJournal ? '...' : '💾'}</button>
                  </div>
                  {selected.journal && [...selected.journal].reverse().map((entry, i) => (
                    <div key={i} style={{ padding: '6px 10px', borderRadius: 6, background: i === 0 ? 'rgba(184,237,0,0.06)' : 'transparent', borderLeft: '2px solid ' + (i === 0 ? 'rgba(184,237,0,0.4)' : 'rgba(255,255,255,0.06)'), marginBottom: 4 }}>
                      <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--fm)' }}>{entry.date}</div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', lineHeight: 1.4 }}>{entry.text}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10, marginBottom: 20 }}>
              {[
                { lbl: 'Greutate', val: selected.weight + ' kg', color: 'var(--c-ink)' },
              ].map(s => (
                <div key={s.lbl} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '12px 14px', textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--fd)', fontSize: 22, fontWeight: 900, color: s.color }}>{s.val}</div>
                  <div style={{ fontSize: 10, color: 'var(--c-ink3)', marginTop: 4, fontFamily: 'var(--fm)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{s.lbl}</div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 24, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button className="btn btn-lime btn-sm" style={{ flex: 1, minWidth: 140 }}
                onClick={() => {
                  navigate(`/coach/athletes/${selected.id}/history`);
                }}>
                📊 Vezi istoric antrenamente
              </button>
              <button className="btn btn-black btn-sm" style={{ flex: 1, minWidth: 140 }}
                onClick={async () => {
                  if (!drawerData?.linked) { showToast('Atletul nu e încă conectat (invite pending)', '⚠️'); return; }
                  try {
                    await startConversation(drawerData.realData ? selected.id : null);
                    navigate('/coach/dm');
                  } catch { showToast('❌ Eroare la mesaj', '❌'); }
                }}>
                💬 Trimite mesaj
              </button>

            </div>
          </div>
        )}
      </Drawer>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <div style={{ fontFamily: 'var(--fd)', fontSize: 28, fontWeight: 900 }}>Atleții mei</div>
          <div style={{ fontSize: 13, color: 'var(--c-ink2)', marginTop: 2 }}>{athletes.length} atleți în echipă</div>
        </div>
        <button className="btn btn-black" onClick={() => setShowInvite(true)}>+ Invită atlet</button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {athletes.map(a => (
          <div key={a.id} className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer', transition: 'border-color 0.2s' }}
            onClick={() => openDrawer(a)}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--c-border)'}>
            <CoachAv av={a.av} col={a.col} size={44} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--c-ink)' }}>{a.name}</div>
              <div style={{ fontSize: 11, color: "var(--c-ink3)", marginTop: 2 }}>{a.notes ? a.notes.slice(0, 60) + (a.notes.length > 60 ? "..." : "") : a.plan}</div>
            </div>
            <div style={{ textAlign: 'center', minWidth: 55 }}>
              <div style={{ fontFamily: 'var(--fd)', fontSize: 24, fontWeight: 900, lineHeight: 1 }}>{a.weight} kg</div>
              <div style={{ fontSize: 10, color: 'var(--c-ink3)' }}>greutate</div>
            </div>
            <div style={{ textAlign: 'center', minWidth: 55 }}>
              <div style={{ fontFamily: 'var(--fd)', fontSize: 24, fontWeight: 900, color: a.trend === 'up' ? 'var(--c-green)' : a.trend === 'dn' ? 'var(--c-coral)' : 'var(--c-ink3)', lineHeight: 1 }}>
                {a.trend === 'up' ? '↑' : a.trend === 'dn' ? '↓' : '→'}
              </div>
              <div style={{ fontSize: 10, color: 'var(--c-ink3)' }}>{a.weight}kg</div>
            </div>
            <div className="prog" style={{ width: 80 }}>
              <div className="prog-fill" style={{ width: a.compliance + '%', background: a.compliance >= 80 ? 'var(--c-green)' : 'var(--c-amber)' }} />
            </div>
            <div style={{ fontSize: 10, color: 'var(--c-ink3)', minWidth: 55, textAlign: 'right' }}>{a.last}</div>
          </div>
        ))}
      </div>
    </AnimatedPage>
  );
}

