import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCoachAthletes, getCoachAthlete, coachInviteAthlete, startConversation, getCoachRequests, acceptCoachRequest, rejectCoachRequest } from '../../../shared/api/index.js';
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
                    <input id="coachJournalInput" placeholder="Notița nouă..."
                      style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#fff', fontSize: 12, fontFamily: 'var(--fb)' }} />
                    <button className="btn btn-lime btn-sm" onClick={() => {
                      const input = document.getElementById('coachJournalInput');
                      if (!input?.value.trim()) return;
                      if (!selected.journal) selected.journal = [];
                      selected.journal.push({ text: input.value.trim(), date: new Date().toISOString().slice(0,10) });
                      selected.notes = input.value.trim();
                      input.value = '';
                      showToast('💾 Salvat!');
                      setDrawerData({ ...drawerData });
                    }}>💾</button>
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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 20 }}>
              {[
                { lbl: 'Greutate', val: selected.weight + ' kg', color: 'var(--c-ink)' },
              ].map(s => (
                <div key={s.lbl} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '12px 14px', textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--fd)', fontSize: 22, fontWeight: 900, color: s.color }}>{s.val}</div>
                  <div style={{ fontSize: 10, color: 'var(--c-ink3)', marginTop: 4, fontFamily: 'var(--fm)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{s.lbl}</div>
                </div>
              ))}
            </div>
            {/* Trend */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: 'var(--c-ink3)', fontFamily: 'var(--fm)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Trend</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 24, color: selected.trend === 'up' ? 'var(--c-green)' : selected.trend === 'dn' ? 'var(--c-coral)' : 'var(--c-ink3)' }}>
                  {selected.trend === 'up' ? '↑' : selected.trend === 'dn' ? '↓' : '→'}
                </span>
                <span style={{ fontSize: 13, color: 'var(--c-ink2)' }}>
                  {selected.trend === 'up' ? 'Progres pozitiv' : selected.trend === 'dn' ? 'În scădere — necesită atenție' : 'Stabil'}
                </span>
              </div>
            </div>
            {/* Weekly history */}
            {drawerData?.history && (
              <div>
                <div style={{ fontSize: 11, color: 'var(--c-ink3)', fontFamily: 'var(--fm)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>Activitate 7 zile</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {drawerData.history.map((h, i) => (
                    <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                      <div style={{ width: '100%', height: 32, borderRadius: 6, background: h.done ? 'rgba(184,237,0,0.2)' : typeof h === 'number' ? `rgba(184,237,0,${h/100*0.3})` : 'rgba(255,255,255,0.04)', border: `1px solid ${h.done || (typeof h === 'number' && h > 50) ? 'rgba(184,237,0,0.3)' : 'rgba(255,255,255,0.06)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>
                        {typeof h === 'number' ? `${h}%` : h.done ? '✓' : '–'}
                      </div>
                      <div style={{ fontSize: 9, color: 'var(--c-ink3)', marginTop: 4, fontFamily: 'var(--fm)' }}>{typeof h === 'number' ? ['L','Ma','Mi','J','V','S','D'][i] : h.day}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── LIVE EXERCISE PROGRESS ── */}
            {drawerData?.realData?.exercises && (
              <div style={{ marginTop: 20 }}>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--fm)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Exerciții azi — {drawerData.realData.exercisesDone}/{drawerData.realData.exercisesTotal} completate
                </div>
                <div className="prog" style={{ height: 6, marginBottom: 12 }}>
                  <div className="prog-fill" style={{ width: `${drawerData.realData.exercisesTotal ? Math.round(drawerData.realData.exercisesDone/drawerData.realData.exercisesTotal*100) : 0}%`, background: 'var(--c-lime)' }} />
                </div>
                {drawerData.realData.exercises.map((ex, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', opacity: ex.done ? 0.5 : 1 }}>
                    {ex.img ? <img src={ex.img} alt="" onError={e => { e.target.style.display = "none"; }} style={{ width: 32, height: 32, borderRadius: 8, objectFit: 'cover', border: ex.done ? '2px solid rgba(184,237,0,0.4)' : '1px solid rgba(255,255,255,0.08)' }} /> : null}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, textDecoration: ex.done ? 'line-through' : 'none', color: ex.done ? 'rgba(255,255,255,0.4)' : '#fff' }}>{ex.name}</div>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>{ex.sets}</div>
                    </div>
                    {ex.anim && <img src={ex.anim} alt="" onError={e => { e.target.style.display = "none"; }} style={{ width: 36, height: 27, borderRadius: 5, background: 'var(--c-ink)' }} />}
                    <span style={{ fontSize: 16, color: ex.done ? 'var(--c-green)' : 'var(--c-ink3)' }}>{ex.done ? '✓' : '○'}</span>
                  </div>
                ))}
              </div>
            )}

            {/* ── LIVE NUTRITION ── */}
            {drawerData?.realData?.meals && (
              <div style={{ marginTop: 20 }}>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--fm)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Nutriție azi — {drawerData.realData.kcalToday} / {drawerData.realData.kcalTarget} kcal · 💧 {drawerData.realData.waterCups} cupe
                </div>
                <div className="prog" style={{ height: 6, marginBottom: 8 }}>
                  <div className="prog-fill" style={{ width: `${Math.min(100, Math.round(drawerData.realData.kcalToday/drawerData.realData.kcalTarget*100))}%`, background: 'var(--c-blue)' }} />
                </div>
                <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                  {[['P', drawerData.realData.macros.p, 'var(--c-blue)'], ['C', drawerData.realData.macros.c, 'var(--c-lime-d)'], ['F', drawerData.realData.macros.f, 'var(--c-coral)']].map(([l,v,c]) => (
                    <div key={l} style={{ flex: 1, textAlign: 'center', background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '6px' }}>
                      <div style={{ fontFamily: 'var(--fd)', fontSize: 16, fontWeight: 900, color: c }}>{v}g</div>
                      <div style={{ fontSize: 8, color: 'var(--c-ink3)', fontFamily: 'var(--fm)' }}>{l}</div>
                    </div>
                  ))}
                </div>
                {drawerData.realData.meals.map((ml, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    {ml.img && <img src={ml.img} alt="" onError={e => { e.target.style.display = "none"; }} style={{ width: 28, height: 28, borderRadius: 6, objectFit: 'cover' }} />}
                    <div style={{ flex: 1, fontSize: 12, color: '#fff' }}>{ml.name}</div>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{ml.kcal} kcal · {ml.time}</span>
                  </div>
                ))}
              </div>
            )}
            <div style={{ marginTop: 24, display: 'flex', gap: 8 }}>
              <button className="btn btn-black btn-sm" style={{ flex: 1 }}
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

