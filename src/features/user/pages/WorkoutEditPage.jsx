import { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { getExercises, getExLib, addExercise, toggleExercise, updateExercise, deleteExercise, bulkDoneExercises, clearExercises } from '../../../shared/api/index.js';
import { Toast, useToast } from '../../../shared/ui/helpers.jsx';
import { useConfirm } from '../../../shared/ui/ConfirmModal.jsx';
import BodyMap from '../../../shared/ui/BodyMap.jsx';
import { AnimatedPage } from '../../../shared/ui/animations/index.jsx';

const MUSCLES = ['Toate', 'Piept', 'Spate', 'Umeri', 'Brațe', 'Picioare', 'Core'];

export default function WorkoutEdit() {
  const navigate = useNavigate();
  const { toast, showToast } = useToast();
  const confirm = useConfirm();

  const [plan, setPlan] = useState([]);
  const [lib, setLib] = useState([]);
  const [muscle, setMuscle] = useState('Toate');
  const [query, setQuery] = useState('');
  const [done, setDone] = useState(0);

  const [editingEx, setEditingEx] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const loadPlan = useCallback(async () => {
    const r = await getExercises();
    setPlan(r.data);
    setDone(r.data.filter(e => e.done).length);
  }, []);

  const loadLib = useCallback(async () => {
    const r = await getExLib(query || undefined, muscle !== 'Toate' ? muscle : undefined);
    setLib(r.data);
  }, [query, muscle]);

  useEffect(() => { loadPlan(); }, [loadPlan]);
  useEffect(() => { loadLib(); }, [loadLib]);

  const handleAdd = async (id) => {
    try {
      await addExercise(id);
      showToast('✅ Adăugat în plan');
      loadPlan();
    } catch (e) {
      showToast(e.response?.data?.error || '❌ Eroare', '❌');
    }
  };

  const handleToggle = async (id) => {
    try { await toggleExercise(id); loadPlan(); }
    catch (e) { showToast('❌ Eroare', '❌'); }
  };

  const handleDelete = async (id) => {
    confirm('Sigur vrei să ștergi exercițiul?', async () => {
      try { await deleteExercise(id); loadPlan(); showToast('🗑️ Șters'); }
      catch (e) { showToast('❌ Eroare', '❌'); }
    });
  };

  const handleBulkDone = async () => {
    try { await bulkDoneExercises(); loadPlan(); showToast('✓ Toate marcate'); }
    catch (e) { showToast('❌ Eroare', '❌'); }
  };

  const handleClearAll = () => {
    confirm('Sigur vrei să ștergi tot planul?', async () => {
      try { await clearExercises(); loadPlan(); showToast('🗑️ Plan curățat'); }
      catch (e) { showToast('❌ Eroare', '❌'); }
    });
  };

  const handleEditClick = (ex, event) => {
    const rawSets = Number(ex.setsTotal || ex.sets) || 4;
    const rawReps = Number(ex.reps) || 8;
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 600;
    let anchor = null;
    if (!isMobile && event?.currentTarget?.getBoundingClientRect) {
      const rect = event.currentTarget.getBoundingClientRect();
      anchor = { top: rect.top + rect.height + 8, left: Math.max(10, rect.right - 380), bottom: rect.top };
    }
    setEditingEx({
      id: ex.id,
      name: ex.name,
      muscle: ex.muscle || 'General',
      sets: rawSets,
      reps: rawReps,
      weight: Number(ex.weight) || 0,
      restSec: Number(ex.restSec) || 90,
      anchor,
    });
  };

  const handleEditSave = async () => {
    if (!editingEx || savingEdit) return;
    setSavingEdit(true);
    try {
      await updateExercise(editingEx.id, {
        sets: editingEx.sets,
        reps: editingEx.reps,
        weight: editingEx.weight,
        restSec: editingEx.restSec,
      });
      showToast('✅ Salvat');
      setEditingEx(null);
      loadPlan();
    } catch (e) {
      showToast(e.response?.data?.error || '❌ Eroare la salvare', '❌');
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <AnimatedPage>
      <header className="page-header">
        <button className="btn btn-outline btn-sm" onClick={() => navigate('/app/workout')}>← Înapoi la antrenament</button>
        <h1 className="page-title">✏️ Editor plan</h1>
      </header>
      <Toast toast={toast} />

      <div className="wk-grid" style={{ marginTop: 16 }}>
        {/* Library section */}
        <div className="wk-col-lib">
          <div style={{ marginBottom: 16 }}>
            <input
              type="text"
              placeholder="🔍 Caută exercițiu (ex: squat, bench, plank)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="inp"
              style={{ width: '100%', padding: '12px 16px', fontSize: 14 }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <BodyMap selected={muscle} onSelect={(m) => setMuscle(m === muscle ? 'Toate' : m)} />
          </div>

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
            {MUSCLES.map((m) => (
              <button key={m} onClick={() => setMuscle(m)}
                style={{
                  padding: '5px 12px', borderRadius: 6,
                  border: muscle === m ? '2px solid var(--c-lime)' : '1px solid var(--c-border)',
                  background: muscle === m ? 'var(--c-lime-bg)' : 'transparent',
                  fontSize: 11, fontWeight: 700, cursor: 'pointer', color: 'var(--c-ink)'
                }}>{m}</button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {lib.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', color: 'var(--c-ink3)' }}>Niciun exercițiu găsit.</div>
            ) : lib.map((ex) => {
              const alreadyAdded = plan.some((p) => p.libId === ex.id || p.name === ex.name);
              return (
                <div key={ex.id} className="card" style={{
                  padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 12,
                  background: alreadyAdded ? 'var(--c-lime-bg)' : undefined,
                }}>
                  {ex.img && <img src={ex.img} alt="" style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{ex.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--c-ink3)', fontFamily: 'var(--fm)' }}>
                      {ex.muscle} · {ex.equip} · {ex.sets}{ex.detail ? ` · ${ex.detail}` : ''}
                    </div>
                  </div>
                  <button
                    className={alreadyAdded ? 'btn btn-outline btn-sm' : 'btn btn-lime btn-sm'}
                    onClick={() => !alreadyAdded && handleAdd(ex.id)}
                    disabled={alreadyAdded}
                    style={{ flexShrink: 0 }}
                  >
                    {alreadyAdded ? '✓' : '+ Adaugă'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Plan panel - own plan editing */}
        <div className="wk-col-plan">
          <div className="plan-panel">
            <div className="plan-banner">
              <span className="plan-title">📓 Planul meu</span>
              <span className="plan-prog">{plan.length} ex.</span>
            </div>
            {plan.length === 0 ? (
              <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--c-ink3)', fontSize: 13 }}>
                Niciun exercițiu în plan.<br />Adaugă din librărie (stânga)
              </div>
            ) : plan.map((ex) => (
              <div key={ex.id} className="pex-row" style={{ position: 'relative', zIndex: 1 }}>
                <div className={`pex-cb${ex.done ? ' on' : ' off'}`}
                  onClick={() => handleToggle(ex.id)}
                  role="button"
                  tabIndex={0}
                  style={{ cursor: 'pointer' }}>{ex.done ? '✓' : ''}</div>
                {ex.img && <img src={ex.img} alt="" style={{ width:32, height:32, borderRadius:8, objectFit:'cover', flexShrink:0 }} />}
                <div style={{ flex: 1 }}>
                  <div className="pex-nm" style={{ textDecoration: ex.done ? 'line-through' : 'none', opacity: ex.done ? .5 : 1 }}>{ex.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--c-ink3)', fontFamily: 'var(--fm)', marginTop: 2 }}>
                    {ex.setsTotal || 3}×{ex.reps || 10}{ex.weight ? ` · ${ex.weight}kg` : ''} · pauză {ex.restSec || 90}s
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleEditClick(ex, e); }}
                  style={{ background: 'rgba(184,237,0,0.15)', border: '1.5px solid var(--c-lime)', cursor: 'pointer', padding: '6px 12px', fontSize: 14, color: 'var(--c-lime-d, #4d7a00)', borderRadius: 8, fontWeight: 700 }}
                  title="Editează"
                >
                  ✏️ Edit
                </button>
                <button type="button" className="pex-rm" onClick={(e) => { e.stopPropagation(); handleDelete(ex.id); }}>✕</button>
              </div>
            ))}
            <div style={{ padding: '11px 16px', display: 'flex', gap: 7, background: 'var(--c-bg)', borderTop: '1px solid var(--c-border)' }}>
              <button className="btn btn-black btn-sm" style={{ flex: 1 }} onClick={handleBulkDone} disabled={plan.length === 0 || done === plan.length}>✓ Toate done</button>
              <button className="btn btn-outline btn-sm" onClick={handleClearAll} disabled={plan.length === 0}>🗑 Șterge tot</button>
            </div>
          </div>

          <div style={{ marginTop: 16, padding: 12, textAlign: 'center', background: 'var(--c-lime-bg)', border: '1px dashed var(--c-lime)', borderRadius: 10, fontSize: 12, color: 'var(--c-ink2)' }}>
            💡 Plan modificat? Mergi la <strong>Antrenament</strong> ca să-l pornești.
          </div>
        </div>
      </div>

      {/* Edit modal */}
      {editingEx && createPortal(
        (() => {
          const useAnchor = editingEx.anchor && window.innerWidth >= 1024;
          return (
            <div
              onClick={() => setEditingEx(null)}
              style={{
                position: 'fixed', inset: 0, zIndex: 99999,
                background: useAnchor ? 'transparent' : 'rgba(0,0,0,0.7)',
                display: useAnchor ? 'block' : 'flex',
                alignItems: 'center', justifyContent: 'center', padding: useAnchor ? 0 : 20,
              }}>
              <div onClick={(e) => e.stopPropagation()}
                style={{
                  background: 'var(--c-surface, #fff)', borderRadius: 18, padding: 22,
                  maxWidth: 380, width: useAnchor ? 380 : 'min(95vw, 380px)',
                  maxHeight: '90vh', overflow: 'auto',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.4)', border: '2px solid var(--c-lime)',
                  ...(useAnchor ? {
                    position: 'absolute',
                    top: Math.min(window.innerHeight - 380, editingEx.anchor.top) + 'px',
                    left: Math.max(10, Math.min(window.innerWidth - 390, editingEx.anchor.left)) + 'px',
                  } : {}),
                }}>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontFamily: 'var(--fd)', fontSize: 18, fontWeight: 900 }}>✏️ Editează exercițiu</div>
                  <div style={{ fontSize: 13, color: 'var(--c-ink3)', marginTop: 2 }}>{editingEx.name}</div>
                </div>
                {(() => {
                  const isCardio = editingEx.muscle === 'Cardio';
                  return (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div style={{ gridColumn: 'span 2' }}>
                        <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--c-ink3)', textTransform: 'uppercase', letterSpacing: 1, fontFamily: 'var(--fm)' }}>{isCardio ? 'Sesiuni' : 'Seturi'}</label>
                        <input className="inp" type="number" value={editingEx.sets} min={1} max={20} onChange={(e) => setEditingEx({ ...editingEx, sets: Number(e.target.value) || 1 })} />
                      </div>
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--c-ink3)', textTransform: 'uppercase', letterSpacing: 1, fontFamily: 'var(--fm)' }}>{isCardio ? 'Minute / sesiune' : 'Repetări'}</label>
                        <input className="inp" type="number" value={editingEx.reps} min={1} max={100} onChange={(e) => setEditingEx({ ...editingEx, reps: Number(e.target.value) || 1 })} />
                      </div>
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--c-ink3)', textTransform: 'uppercase', letterSpacing: 1, fontFamily: 'var(--fm)' }}>{isCardio ? 'Distanță (km)' : 'Greutate (kg)'}</label>
                        <input className="inp" type="number" value={editingEx.weight} min={0} step={0.5} onChange={(e) => setEditingEx({ ...editingEx, weight: parseFloat(e.target.value) || 0 })} />
                      </div>
                      <div style={{ gridColumn: 'span 2' }}>
                        <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--c-ink3)', textTransform: 'uppercase', letterSpacing: 1, fontFamily: 'var(--fm)' }}>Pauză (sec)</label>
                        <input className="inp" type="number" value={editingEx.restSec} min={0} step={15} onChange={(e) => setEditingEx({ ...editingEx, restSec: Number(e.target.value) || 0 })} />
                      </div>
                    </div>
                  );
                })()}
                <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => setEditingEx(null)} style={{ flex: 1 }}>Anulează</button>
                  <button type="button" className="btn btn-lime btn-sm" onClick={handleEditSave} disabled={savingEdit} style={{ flex: 1 }}>
                    {savingEdit ? 'Se salvează...' : '✓ Salvează'}
                  </button>
                </div>
              </div>
            </div>
          );
        })(),
        document.body
      )}
    </AnimatedPage>
  );
}
