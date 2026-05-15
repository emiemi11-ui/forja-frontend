import { useEffect, useState, useCallback } from 'react';
import { getCoachWorkouts, getCoachWorkout, coachCreateWorkout, coachUpdateWorkout, coachDeleteWorkout, coachAssignWorkout, getCoachAthletes, getExLib } from '../../../shared/api/index.js';
import { Toast, useToast } from '../../../shared/ui/helpers.jsx';
import Drawer from '../../../shared/ui/Drawer.jsx';
import Modal, { ModalField, ModalInput, ModalSelect, ModalActions } from '../../../shared/ui/Modal.jsx';
import { AnimatedPage } from '../../../shared/ui/animations/index.jsx';
import { useConfirm } from '../../../shared/ui/ConfirmModal.jsx';

function CoachAv({ av, col, size = 36 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: col || "#1A52FF", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: size * 0.4, color: "#fff", fontFamily: "var(--fd)", flexShrink: 0 }}>
      {av}
    </div>
  );
}

export default function CoachWorkoutsPage() {
  const [workouts, setWorkouts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [drawerData, setDrawerData] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [assignTargets, setAssignTargets] = useState([]);
  const [athletes, setAthletes] = useState([]);
  const [loading, setLoading] = useState(false);
  const { toast, showToast } = useToast();
  const confirm = useConfirm();

  // Plan editor state
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState('Forță');
  const [editExercises, setEditExercises] = useState([]);
  const [exSearch, setExSearch] = useState('');
  const [exResults, setExResults] = useState([]);
  const [editMode, setEditMode] = useState(null); // 'create' or plan id
  const [compact, setCompact] = useState(typeof window !== 'undefined' ? window.innerWidth <= 820 : false);

  useEffect(() => {
    const onResize = () => setCompact(window.innerWidth <= 820);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const load = () => Promise.all([getCoachWorkouts(), getCoachAthletes()]).then(([wr, ar]) => { setWorkouts(wr.data); setAthletes(ar.data); });
  useEffect(() => { load(); }, []);

  // Search exercises from library
  const searchExercises = useCallback(async (q) => {
    setExSearch(q);
    if (!q.trim()) { setExResults([]); return; }
    try {
      const { data } = await getExLib(q.trim());
      setExResults(Array.isArray(data) ? data : []);
    } catch {
      setExResults([]);
    }
  }, []);

  const addExToEdit = (ex) => {
    if (editExercises.find(e => e.libId === ex.id)) return;
    setEditExercises(prev => [...prev, {
      id: 'edit-' + Date.now() + '-' + ex.id,
      libId: ex.id, name: ex.name, muscle: ex.muscle, equip: ex.equip,
      sets: 4, reps: 8, rest: 90, weight: 0,
      img: ex.img, anim: ex.anim, icon: ex.icon,
    }]);
    setExSearch(''); setExResults([]);
  };

  const removeExFromEdit = (id) => {
    setEditExercises(prev => prev.filter(e => e.id !== id));
  };

  const updateEx = (id, field, value) => {
    setEditExercises(prev => prev.map(e => e.id === id ? { ...e, [field]: field === 'weight' ? (parseFloat(value) || 0) : (parseInt(value) || 0) } : e));
  };

  const openEditor = (plan) => {
    if (plan) {
      // Edit existing
      setEditName(plan.name);
      setEditCategory(plan.category);
      setEditMode(plan.id);
      // Load detail
      getCoachWorkout(plan.id).then(({ data }) => {
        setEditExercises((data.exercises || []).map((ex, i) => ({
          id: 'ed-' + i, libId: ex.libId || i, name: ex.name, muscle: ex.muscle || '', equip: ex.equip || '',
          sets: ex.sets || 4, reps: ex.reps || 8, rest: ex.rest || 90, weight: ex.weight || 0,
          img: ex.img, anim: ex.anim, icon: ex.icon,
        })));
      }).catch(() => setEditExercises([]));
    } else {
      // Create new
      setEditName(''); setEditCategory('Forță'); setEditExercises([]); setEditMode('create');
    }
    setShowCreate(true);
  };

  const handleSavePlan = async () => {
    if (!editName.trim()) { showToast('Introdu un nume pentru plan', '⚠️'); return; }
    if (editExercises.length === 0) { showToast('Adaugă cel puțin un exercițiu', '⚠️'); return; }
    setLoading(true);
    try {
      const payload = { name: editName, category: editCategory, exercises: editExercises };
      if (editMode === 'create') {
        await coachCreateWorkout(payload);
        showToast('✅ Plan creat cu succes!');
      } else {
        await coachUpdateWorkout(editMode, payload);
        showToast('✅ Plan actualizat!');
      }
      setShowCreate(false);
      load();
    } catch (e) {
      showToast(e.response?.data?.error || '❌ Eroare', '❌');
    } finally { setLoading(false); }
  };

  const handleDeletePlan = (plan) => {
    confirm(
      `Șterge planul "${plan.name}"? Va dispărea definitiv. Atleții care îl au atribuit își vor păstra exercițiile deja făcute, dar nu vor mai vedea planul.`,
      async () => {
        try {
          await coachDeleteWorkout(plan.id);
          showToast('🗑️ Plan șters');
          setSelected(null);
          setDrawerData(null);
          load();
        } catch (e) {
          showToast(e.response?.data?.error || '❌ Eroare la ștergere', '❌');
        }
      },
    );
  };

  const openDrawer = async (w) => {
    setSelected(w);
    try { const r = await getCoachWorkout(w.id); setDrawerData(r.data); } catch { setDrawerData(w); }
  };

  const handleAssign = async () => {
    if (!assignTargets.length) { showToast('Selectează atleți', '⚠️'); return; }
    setLoading(true);
    try {
      await coachAssignWorkout(selected.id, assignTargets);
      showToast(`✅ Plan atribuit la ${assignTargets.length} atlet(i)!`);
      setShowAssign(false); setAssignTargets([]);
    } catch (e) { showToast(e.response?.data?.error || '❌ Eroare', '❌'); }
    finally { setLoading(false); }
  };

  return (
    <AnimatedPage>
      <Toast toast={toast} />

      {/* === PLAN EDITOR MODAL === */}
      {showCreate && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: compact ? 'stretch' : 'center', justifyContent: 'center', padding: compact ? 0 : 20 }}
          onClick={() => setShowCreate(false)}>
          <div style={{ background: 'var(--c-surface)', borderRadius: compact ? 0 : 20, width: '100%', maxWidth: compact ? '100%' : 700, height: compact ? '100%' : 'auto', maxHeight: compact ? '100dvh' : '90vh', overflow: 'auto', boxShadow: compact ? 'none' : '0 40px 100px rgba(0,0,0,0.3)' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ padding: compact ? '18px 18px 14px' : '24px 28px 16px', borderBottom: '1px solid var(--c-border)' }}>
              <div style={{ fontFamily: 'var(--fd)', fontSize: 24, fontWeight: 900 }}>
                {editMode === 'create' ? '🆕 Plan nou' : '✏️ Editează plan'}
              </div>
            </div>
            <div style={{ padding: compact ? '16px 18px' : '20px 28px' }}>
              {/* Name + Category */}
              <div style={{ display: 'grid', gridTemplateColumns: compact ? '1fr' : '2fr 1fr', gap: 12, marginBottom: 20 }}>
                <div>
                  <label style={{ fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--c-ink3)', display: 'block', marginBottom: 4 }}>Nume plan *</label>
                  <input value={editName} onChange={e => setEditName(e.target.value)} placeholder="ex: Push Day A"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid var(--c-border)', fontSize: 16, fontFamily: 'var(--fd)', fontWeight: 800, background: 'var(--c-bg)', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--c-ink3)', display: 'block', marginBottom: 4 }}>Categorie</label>
                  <select value={editCategory} onChange={e => setEditCategory(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid var(--c-border)', fontSize: 14, fontFamily: 'var(--fb)', background: 'var(--c-bg)', boxSizing: 'border-box' }}>
                    {['Forță', 'Hipertrofie', 'Cardio', 'Funcțional', 'Mobilitate', 'Full Body', 'General'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {/* Exercise search */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--c-ink3)', display: 'block', marginBottom: 4 }}>CAUTĂ ȘI ADAUGĂ EXERCIȚII</label>
                <input value={exSearch} onChange={e => searchExercises(e.target.value)} placeholder="🔍 Caută: bench press, squat, deadlift..."
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid var(--c-lime)', fontSize: 14, fontFamily: 'var(--fb)', background: 'var(--c-bg)', boxSizing: 'border-box' }} />
                {exResults.length > 0 && (
                  <div style={{ border: '1px solid var(--c-border)', borderRadius: 10, marginTop: 4, maxHeight: 200, overflow: 'auto', background: 'var(--c-surface)' }}>
                    {exResults.map(ex => (
                      <div key={ex.id} onClick={() => addExToEdit(ex)}
                        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', cursor: 'pointer', borderBottom: '1px solid var(--c-border)', transition: 'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--c-lime-bg)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        {ex.img ? <img src={ex.img} alt="" onError={e => { e.target.style.display = "none"; }} style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover' }} /> :
                          <span style={{ fontSize: 20 }}>{ex.icon}</span>}
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: 13 }}>{ex.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--c-ink3)' }}>{ex.muscle} · {ex.equip} · {ex.sets}</div>
                        </div>
                        <span style={{ color: 'var(--c-lime-d)', fontWeight: 800, fontSize: 18 }}>+</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Added exercises */}
              <div style={{ fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--c-ink3)', marginBottom: 8 }}>
                EXERCIȚII ÎN PLAN ({editExercises.length})
              </div>
              {editExercises.length === 0 ? (
                <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--c-ink3)', fontSize: 13, background: 'var(--c-bg)', borderRadius: 10 }}>
                  Caută și adaugă exerciții mai sus ↑
                </div>
              ) : (
                <div style={{ borderRadius: 12, border: '1px solid var(--c-border)', overflow: 'hidden' }}>
                  {editExercises.map((ex, i) => (
                    <div key={ex.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderBottom: '1px solid var(--c-border)', background: i % 2 === 0 ? 'var(--c-surface)' : 'var(--c-bg)', flexWrap: compact ? 'wrap' : 'nowrap' }}>
                      <span style={{ fontFamily: 'var(--fm)', fontSize: 10, color: 'var(--c-ink3)', width: 20 }}>{i + 1}.</span>
                      {ex.img ? <img src={ex.img} alt="" onError={e => { e.target.style.display = "none"; }} style={{ width: 38, height: 38, borderRadius: 8, objectFit: 'cover' }} /> :
                        <span style={{ fontSize: 18, width: 38, textAlign: 'center' }}>{ex.icon}</span>}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 13 }}>{ex.name}</div>
                        <div style={{ fontSize: 10, color: 'var(--c-ink3)' }}>{ex.muscle}</div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: compact ? 'repeat(2, minmax(0, 1fr))' : 'repeat(4, auto)', gap: 6, alignItems: 'center', width: compact ? '100%' : 'auto' }}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: 8, color: 'var(--c-ink3)', fontFamily: 'var(--fm)' }}>{ex.muscle === 'Cardio' ? 'SESIUNI' : 'SETURI'}</div>
                          <input type="number" value={ex.sets} onChange={e => updateEx(ex.id, 'sets', e.target.value)} min={1} max={10}
                            style={{ width: compact ? '100%' : 50, padding: '4px 6px', borderRadius: 6, border: '1px solid var(--c-border)', textAlign: 'center', fontSize: 14, fontWeight: 800, fontFamily: 'var(--fd)', background: 'var(--c-bg)', boxSizing: 'border-box' }} />
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: 8, color: 'var(--c-ink3)', fontFamily: 'var(--fm)' }}>{ex.muscle === 'Cardio' ? 'MIN' : 'REPS'}</div>
                          <input type="number" value={ex.reps} onChange={e => updateEx(ex.id, 'reps', e.target.value)} min={1} max={100}
                            style={{ width: compact ? '100%' : 50, padding: '4px 6px', borderRadius: 6, border: '1px solid var(--c-border)', textAlign: 'center', fontSize: 14, fontWeight: 800, fontFamily: 'var(--fd)', background: 'var(--c-bg)', boxSizing: 'border-box' }} />
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: 8, color: 'var(--c-ink3)', fontFamily: 'var(--fm)' }}>{ex.muscle === 'Cardio' ? 'KM' : 'KG'}</div>
                          <input type="number" value={ex.weight || 0} onChange={e => updateEx(ex.id, 'weight', e.target.value)} min={0} step={0.5}
                            style={{ width: compact ? '100%' : 55, padding: '4px 6px', borderRadius: 6, border: '1px solid var(--c-border)', textAlign: 'center', fontSize: 14, fontWeight: 800, fontFamily: 'var(--fd)', background: 'var(--c-bg)', boxSizing: 'border-box' }} />
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: 8, color: 'var(--c-ink3)', fontFamily: 'var(--fm)' }}>REST</div>
                          <input type="number" value={ex.rest} onChange={e => updateEx(ex.id, 'rest', e.target.value)} min={0} step={15}
                            style={{ width: compact ? '100%' : 55, padding: '4px 6px', borderRadius: 6, border: '1px solid var(--c-border)', textAlign: 'center', fontSize: 12, fontFamily: 'var(--fm)', background: 'var(--c-bg)', boxSizing: 'border-box' }} />
                        </div>
                      </div>
                      {ex.anim && <img src={ex.anim} alt="" onError={e => { e.target.style.display = "none"; }} style={{ width: 44, height: 33, borderRadius: 6, background: 'var(--c-ink)', flexShrink: 0 }} />}
                      <button onClick={() => removeExFromEdit(ex.id)}
                        style={{ width: 28, height: 28, borderRadius: 6, border: 'none', background: 'var(--c-coral-bg)', color: 'var(--c-coral)', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Actions */}
            <div style={{ padding: compact ? '14px 18px 18px' : '16px 28px 24px', borderTop: '1px solid var(--c-border)', display: 'flex', gap: 8, justifyContent: compact ? 'stretch' : 'flex-end', flexDirection: compact ? 'column-reverse' : 'row' }}>
              <button className="btn btn-outline" onClick={() => setShowCreate(false)}>Anulează</button>
              <button className="btn btn-lime" onClick={handleSavePlan} disabled={loading || !editName.trim() || editExercises.length === 0}
                style={{ padding: '12px 32px', fontSize: 15 }}>
                {loading ? 'Se salvează...' : `✅ Salvează (${editExercises.length} exerciții)`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {showAssign && selected && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: compact ? 'stretch' : 'center', justifyContent: 'center', padding: compact ? 0 : 20 }}
          onClick={() => { setShowAssign(false); setAssignTargets([]); }}>
          <div style={{ background: 'var(--c-surface)', borderRadius: 20, width: '100%', maxWidth: 400, padding: 24 }}
            onClick={e => e.stopPropagation()}>
            <div style={{ fontFamily: 'var(--fd)', fontSize: 20, fontWeight: 900, marginBottom: 16 }}>📤 Atribuie: {selected.name}</div>
            {athletes.map(a => (
              <div key={a.id} onClick={() => setAssignTargets(prev => prev.includes(a.id) ? prev.filter(x => x !== a.id) : [...prev, a.id])}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 10, marginBottom: 6, cursor: 'pointer', background: assignTargets.includes(a.id) ? 'var(--c-lime-bg)' : 'transparent', border: `1px solid ${assignTargets.includes(a.id) ? 'rgba(184,237,0,0.25)' : 'var(--c-border)'}` }}>
                <div style={{ width: 18, height: 18, borderRadius: 4, background: assignTargets.includes(a.id) ? 'var(--c-lime)' : 'transparent', border: `2px solid ${assignTargets.includes(a.id) ? 'var(--c-lime)' : 'var(--c-border2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 }}>
                  {assignTargets.includes(a.id) ? '✓' : ''}
                </div>
                <CoachAv av={a.av} col={a.col} size={32} />
                <div style={{ flex: 1 }}><div style={{ fontWeight: 700, fontSize: 13 }}>{a.name}</div></div>
              </div>
            ))}
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button className="btn btn-outline btn-sm" style={{ flex: 1 }} onClick={() => { setShowAssign(false); setAssignTargets([]); }}>Anulează</button>
              <button className="btn btn-lime btn-sm" style={{ flex: 1 }} onClick={handleAssign} disabled={!assignTargets.length}>
                Atribuie ({assignTargets.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Workout Drawer */}
      <Drawer open={!!selected && !showAssign && !showCreate} onClose={() => { setSelected(null); setDrawerData(null); }} title={selected?.name || ''}>
        {drawerData && (
          <div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <span className="tag tag-lime">{drawerData.category}</span>
              <span className="tag">{(drawerData.exercises?.length || drawerData.exercises || 0)} exerciții</span>
            </div>
            {Array.isArray(drawerData.exercises) ? (
              <div>
                {drawerData.exercises.map((ex, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    {ex.img ? <img src={ex.img} alt="" onError={e => { e.target.style.display = "none"; }} style={{ width: 44, height: 44, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} /> :
                      <span style={{ fontSize: 20 }}>{ex.icon}</span>}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>{ex.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--c-ink3)', marginTop: 2 }}>{ex.muscle} · {ex.sets}×{ex.reps} · rest {ex.rest}s</div>
                    </div>
                    {ex.anim && <img src={ex.anim} alt="" onError={e => { e.target.style.display = "none"; }} style={{ width: 48, height: 36, borderRadius: 6, background: 'var(--c-ink)', flexShrink: 0 }} />}
                  </div>
                ))}
              </div>
            ) : null}
            <div style={{ marginTop: 20, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button className="btn btn-black btn-sm" style={{ flex: 1 }} onClick={() => openEditor(selected)}>✏️ Editează</button>
              <button className="btn btn-outline btn-sm" style={{ flex: 1 }} onClick={() => { setShowAssign(true); setAssignTargets([]); }}>📤 Atribuie</button>
              <button
                className="btn btn-sm"
                style={{ padding: '8px 14px', borderRadius: 8, border: '1.5px solid var(--c-coral)', background: 'transparent', color: 'var(--c-coral)', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}
                onClick={() => handleDeletePlan(selected)}
              >
                🗑️ Șterge
              </button>
            </div>
          </div>
        )}
      </Drawer>

      {/* === PAGE CONTENT === */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, gap: 12, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontFamily: 'var(--fd)', fontSize: 28, fontWeight: 900 }}>Planuri antrenament</div>
          <div style={{ fontSize: 13, color: 'var(--c-ink2)', marginTop: 2 }}>{workouts.length} planuri active</div>
        </div>
        <button className="btn btn-lime" onClick={() => openEditor(null)} style={{ fontWeight: 800, fontSize: 14, padding: '10px 20px' }}>
          + Plan nou
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 14 }}>
        {workouts.map(w => (
          <div key={w.id} className="card" style={{ padding: '18px 20px', cursor: 'pointer' }}
            onClick={() => openDrawer(w)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ fontFamily: 'var(--fd)', fontSize: 18, fontWeight: 800 }}>{w.name}</div>
              <span className="tag" style={{ fontSize: 9 }}>{w.category}</span>
            </div>
            <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--c-ink3)' }}>
              <span>💪 {w.exercises} exerciții</span>
              <span>👥 {w.assigned} atleți</span>
            </div>
            <div className="prog" style={{ height: 4, marginTop: 10 }}>
              <div className="prog-fill" style={{ width: `${Math.min(100, (w.assigned / 5) * 100)}%`, background: w.assigned > 0 ? 'var(--c-coral)' : 'var(--c-border)' }} />
            </div>
          </div>
        ))}
      </div>
    </AnimatedPage>
  );
}
