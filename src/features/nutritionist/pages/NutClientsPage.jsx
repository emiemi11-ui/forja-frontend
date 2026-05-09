import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNutClients, getNutClient, nutInviteClient, nutApplyTemplate, getNutTemplates, startConversation } from '../../../shared/api/index.js';
import { pct, Toast, useToast } from '../../../shared/ui/helpers.jsx';
import Drawer from '../../../shared/ui/Drawer.jsx';
import Modal, { ModalField, ModalInput, ModalActions } from '../../../shared/ui/Modal.jsx';
import { AnimatedPage } from '../../../shared/ui/animations/index.jsx';


function NutAv({ av, col, size = 36 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: col || '#FF4422', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: size * 0.4, color: '#fff', fontFamily: 'var(--fd)', flexShrink: 0 }}>
      {av}
    </div>
  );
}

const CLIENT_PHOTOS = {
  'M': '/img/ext/u-e6435306b1.jpg',
  'B': '/img/ext/u-919eb92866.jpg',
  'A': '/img/ext/u-cfef1843fc.jpg',
  'C': '/img/ext/u-4d5d61a2b3.jpg',
  'D': '/img/ext/u-a3a1d9fa30.jpg',
};

export default function NutClientsPage() {
  const navigate = useNavigate();
  const [clients, setClients]   = useState([]);
  const [selected, setSelected] = useState(null);
  const [drawerData, setDrawerData] = useState(null);
  const [showJournal, setShowJournal] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm]         = useState({ email: '' });
  const [loading, setLoading]   = useState(false);
  const { toast, showToast }    = useToast();

  const load = () => getNutClients().then(r => setClients(r.data));
  useEffect(() => { load(); }, []);

  const openDrawer = async (c) => {
    setSelected(c);
    try {
      const r = await getNutClient(c.id);
      setDrawerData(r.data);
    } catch { setDrawerData(c); }
  };

  const handleCreate = async () => {
    if (!form.email) { showToast('Introdu emailul clientului', '⚠️'); return; }
    setLoading(true);
    try {
      const r = await nutInviteClient({ email: form.email });
      showToast(r.data.message || '✅ Invitație trimisă!');
      setShowCreate(false);
      setForm({ email: '' });
      load();
    } catch (e) {
      showToast(e.response?.data?.error || '❌ Eroare', '❌');
    } finally { setLoading(false); }
  };

  return (
    <AnimatedPage>
      <Toast toast={toast} />

      {/* Create Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="✉️ Invită client">
        <div style={{ fontSize: 12, color: 'var(--c-ink3)', marginBottom: 12 }}>
          Clientul trebuie să aibă deja cont pe FORJA. Introdu emailul lui — primește invitația direct în aplicație și o poate accepta sau refuza.
        </div>
        <ModalField label="Email client *">
          <ModalInput type="email" placeholder="maria@exemplu.ro" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} autoFocus />
        </ModalField>
        <ModalActions>
          <button className="btn btn-outline btn-sm" onClick={() => setShowCreate(false)}>Anulează</button>
          <button className="btn btn-black" onClick={handleCreate} disabled={loading}>
            {loading ? 'Se trimite...' : '✉️ Trimite invitație'}
          </button>
        </ModalActions>
      </Modal>

      {/* Client Drawer */}
      <Drawer open={!!selected} onClose={() => { setSelected(null); setDrawerData(null); }} title={selected?.name || ''}>
        {selected && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, padding: '0 0 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <NutAv av={selected.av} col={selected.col} size={52} />
              <div>
                <div style={{ fontFamily: 'var(--fd)', fontSize: 20, fontWeight: 900, color: '#fff' }}>{selected.name}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 3 }}>{selected.notes || 'Fără notițe'}</div>

              </div>
            </div>
            {/* Calorie progress */}
            {/* JURNAL CLIENT — collapsible */}
            <div style={{ marginBottom: 20 }}>
              <button onClick={() => setShowJournal(!showJournal)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', cursor: 'pointer', color: 'rgba(255,255,255,0.6)', fontSize: 11, fontFamily: 'var(--fm)', letterSpacing: 0.5 }}>
                📝 JURNAL ({selected.journal?.length || 0} notițe)
                <span style={{ marginLeft: 'auto', transform: showJournal ? 'rotate(180deg)' : '', transition: 'transform 0.2s' }}>▼</span>
              </button>
              {showJournal && (
                <div style={{ marginTop: 10 }}>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                    <input id="nutJournalInput" placeholder="Notița nouă..."
                      style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#fff', fontSize: 12, fontFamily: 'var(--fb)' }} />
                    <button className="btn btn-lime btn-sm" onClick={() => {
                      const input = document.getElementById('nutJournalInput');
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
                    <div key={i} style={{ padding: '6px 10px', borderRadius: 6, background: i === 0 ? 'rgba(123,47,190,0.06)' : 'transparent', borderLeft: '2px solid ' + (i === 0 ? 'rgba(123,47,190,0.4)' : 'rgba(255,255,255,0.06)'), marginBottom: 4 }}>
                      <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--fm)' }}>{entry.date}</div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', lineHeight: 1.4 }}>{entry.text}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--c-ink3)', marginBottom: 6, fontFamily: 'var(--fm)' }}>
                <span>Calorii azi</span>
                <span>{drawerData?.realData?.kcalToday || selected.kcal_today} / {selected.kcal_target} kcal</span>
              </div>
              <div className="prog">
                <div className="prog-fill" style={{ width: Math.min(pct(drawerData?.realData?.kcalToday || selected.kcal_today, selected.kcal_target), 100) + '%', background: pct(drawerData?.realData?.kcalToday || selected.kcal_today, selected.kcal_target) > 105 ? 'var(--c-coral)' : pct(drawerData?.realData?.kcalToday || selected.kcal_today, selected.kcal_target) >= 90 ? 'var(--c-green)' : 'var(--c-lime)' }} />
              </div>
            </div>
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
              {[
                { lbl: 'Greutate', val: (drawerData?.realData?.weight || 78) + ' kg', color: 'var(--c-ink)' },
              ].map(s => (
                <div key={s.lbl} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '12px 14px', textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--fd)', fontSize: 20, fontWeight: 900, color: s.color }}>{s.val}</div>
                  <div style={{ fontSize: 10, color: 'var(--c-ink3)', marginTop: 4, fontFamily: 'var(--fm)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{s.lbl}</div>
                </div>
              ))}
            </div>
            {/* Meals today - LIVE from athlete */}
            {drawerData?.meals && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 11, color: 'var(--c-ink3)', fontFamily: 'var(--fm)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>Mese azi — {drawerData.meals.length} înregistrate</div>
                {drawerData.meals.map((m, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    {m.img && <img src={m.img} alt="" onError={e => { e.target.style.display = "none"; }} style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover' }} />}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>{m.type || 'Masă'}: {typeof m.items === 'string' ? m.items : Array.isArray(m.items) ? m.items.join(', ') : m.name || ''}</div>
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--c-ink3)', fontFamily: 'var(--fm)', flexShrink: 0 }}>{m.kcal} kcal</span>
                  </div>
                ))}
              </div>
            )}
            {/* Live macros */}
            {drawerData?.realData?.macros && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 11, color: 'var(--c-ink3)', fontFamily: 'var(--fm)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Macros azi · 💧 {drawerData.realData.waterCups || 0} cupe apă
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[['Proteine', drawerData.realData.macros.p, 'var(--c-blue)'], ['Carbs', drawerData.realData.macros.c, 'var(--c-lime-d)'], ['Grăsimi', drawerData.realData.macros.f, 'var(--c-coral)']].map(([l,v,c]) => (
                    <div key={l} style={{ flex: 1, textAlign: 'center', background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '8px 4px' }}>
                      <div style={{ fontFamily: 'var(--fd)', fontSize: 18, fontWeight: 900, color: c }}>{v}g</div>
                      <div style={{ fontSize: 8, color: 'var(--c-ink3)', fontFamily: 'var(--fm)', letterSpacing: 0.5 }}>{l}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 8 }}>

              <button className="btn btn-lime btn-sm" style={{ flex: 1 }}
                onClick={async () => {
                  try { await startConversation(selected.id); navigate('/nutritionist/dm'); } catch { showToast('💬 Conversație deschisă'); navigate('/nutritionist/dm'); }
                }}>
                💬 Trimite mesaj
              </button>
            </div>
          </div>
        )}
      </Drawer>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <div style={{ fontFamily: 'var(--fd)', fontSize: 28, fontWeight: 900 }}>Clienții mei</div>
          <div style={{ fontSize: 13, color: 'var(--c-ink2)', marginTop: 2 }}>{clients.length} clienți activi</div>
        </div>
        <button className="btn btn-black" onClick={() => setShowCreate(true)}>✉️ Invită client</button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {clients.map(c => {
          const p = pct(c.kcal_today, c.kcal_target);
          return (
            <div key={c.id} className="card" style={{ padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer', transition: 'border-color 0.2s' }}
              onClick={() => openDrawer(c)}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--c-border)'}>
              <NutAv av={c.av} col={c.col} size={48} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--c-ink)' }}>{c.name}</div>
                <div style={{ fontSize: 11, color: "var(--c-ink3)", marginTop: 2 }}>{c.notes ? c.notes.slice(0, 60) + (c.notes.length > 60 ? "..." : "") : c.goal}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--c-ink3)', marginTop: 8, marginBottom: 4 }}>
                  <span>Calorii azi</span>
                  <span style={{ fontFamily: 'var(--fm)' }}>{c.kcal_today} / {c.kcal_target} kcal</span>
                </div>
                <div className="prog">
                  <div className="prog-fill" style={{ width: Math.min(p, 100) + '%', background: p > 105 ? 'var(--c-coral)' : p >= 90 ? 'var(--c-green)' : 'var(--c-lime)' }} />
                </div>
              </div>
              <div style={{ textAlign: 'center', minWidth: 70 }}>
                <div style={{ fontFamily: 'var(--fd)', fontSize: 28, fontWeight: 900, color: c.compliance >= 80 ? 'var(--c-green)' : 'var(--c-coral)', lineHeight: 1 }}>{c.compliance}%</div>
                <div style={{ fontSize: 10, color: 'var(--c-ink3)' }}>compliance</div>
              </div>
              <div style={{ textAlign: 'right', minWidth: 60 }}>
                <div style={{ fontSize: 11, color: 'var(--c-ink3)', fontFamily: 'var(--fm)' }}>{c.last}</div>

              </div>
            </div>
          );
        })}
      </div>
    </AnimatedPage>
  );
}

