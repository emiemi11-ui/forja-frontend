import { useEffect, useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getExercises, getExLib, addExercise, toggleExercise, updateExercise, deleteExercise, bulkDoneExercises, clearExercises, getWorkoutCurrent, startWorkout, completeSet, finishWorkout, abandonWorkout, getCoachPlan, getSelfPlanStatus } from '../../../shared/api/index.js';
import { Toast, useToast } from '../../../shared/ui/helpers.jsx';
import { useConfirm } from '../../../shared/ui/ConfirmModal.jsx';
import BodyMap from '../../../shared/ui/BodyMap.jsx';
import { AnimatedPage, HeroSection, ScrollReveal, CountUp, AnimatedBar, ConfettiBurst } from '../../../shared/ui/animations/index.jsx';

const MUSCLES = ['Toate', 'Piept', 'Spate', 'Umeri', 'Brațe', 'Picioare', 'Core'];
const REST_DURATION = 90;

function formatTime(s) {
  const m = Math.floor(s / 60);
  const ss = s % 60;
  return `${String(m).padStart(2,'0')}:${String(ss).padStart(2,'0')}`;
}

export default function Workout() {
  const navigate = useNavigate();
  const [plan, setPlan]         = useState([]);
  const [lib, setLib]           = useState([]);
  const [muscle, setMuscle]     = useState('Toate');
  const [query, setQuery]       = useState('');
  const [timerSec, setTimerSec] = useState(0);
  const [running, setRunning]   = useState(false);
  const timerRef                = useRef(null);
  const { toast, showToast }    = useToast();
  const confirm = useConfirm();

  const [sessionMode, setSessionMode] = useState('idle');
  const [session, setSession] = useState(null);
  const [activeExIdx, setActiveExIdx] = useState(0);
  const [restTimer, setRestTimer] = useState(0);
  const [resting, setResting] = useState(false);
  const [finishData, setFinishData] = useState(null);
  const restRef = useRef(null);

  const loadPlan = useCallback(async () => { const r = await getExercises(); setPlan(r.data); }, []);
  const loadLib = useCallback(async () => { const r = await getExLib(query || undefined, muscle !== 'Toate' ? muscle : undefined); setLib(r.data); }, [query, muscle]);

  // Plan atribuit de coach (separat de planul propriu)
  const [coachPlan, setCoachPlan] = useState(null);
  const [selfPlanActive, setSelfPlanActive] = useState(true);  // implicit activ
  const loadCoachPlan = useCallback(async () => {
    try {
      const r = await getCoachPlan();
      setCoachPlan(r.data?.plan || null);
    } catch {
      setCoachPlan(null);
    }
  }, []);
  const loadSelfStatus = useCallback(async () => {
    try {
      const r = await getSelfPlanStatus();
      setSelfPlanActive(r.data?.active !== false);
    } catch {
      setSelfPlanActive(true);
    }
  }, []);

  useEffect(() => { loadPlan(); loadCoachPlan(); loadSelfStatus(); }, []);
  useEffect(() => { loadLib(); }, [query, muscle]);

  useEffect(() => {
    getWorkoutCurrent().then(({ data }) => {
      if (data.session) {
        setSession(data.session);
        setSessionMode('active');
        setTimerSec(data.session.elapsedSeconds || 0);
        setRunning(true);
        const exercises = data.session.exercises || [];
        const progress = data.session.progress || {};
        const idx = exercises.findIndex(ex => { const p = progress[ex.id]; return !p || p.setsCompleted < ex.setsTotal; });
        setActiveExIdx(idx >= 0 ? idx : 0);
      }
    }).catch(() => {});
  }, []);

  // Asculta evenimentul cand coach-ul atribuie un plan nou — refresh imediat
  useEffect(() => {
    let socket = null;
    (async () => {
      try {
        const { io } = await import('socket.io-client');
        const { getStoredToken } = await import('../../auth/model/authStorage.js');
        const token = getStoredToken();
        if (!token) return;
        const socketUrl = import.meta.env.VITE_API_URL || window.location.origin;
        socket = io(socketUrl, { auth: { token }, transports: ['websocket', 'polling'] });
        socket.on('coach:plan:assigned', ({ planName, coachName }) => {
          showToast(`📋 ${coachName} ți-a atribuit planul „${planName}"!`);
          loadCoachPlan();
        });
      } catch {}
    })();
    return () => { socket?.disconnect?.(); };
  }, [loadCoachPlan, showToast]);

  useEffect(() => {
    if (running) { timerRef.current = setInterval(() => setTimerSec(s => s + 1), 1000); }
    else { clearInterval(timerRef.current); }
    return () => clearInterval(timerRef.current);
  }, [running]);

  useEffect(() => {
    if (resting && restTimer > 0) {
      restRef.current = setInterval(() => {
        setRestTimer(t => { if (t <= 1) { setResting(false); clearInterval(restRef.current); return 0; } return t - 1; });
      }, 1000);
    }
    return () => clearInterval(restRef.current);
  }, [resting]);

  const handleAdd = async id => { try { await addExercise(id); showToast('✅ Exercițiu adăugat în plan!'); loadPlan(); } catch (e) { if (e.response?.status === 409) showToast('⚠️ Deja în plan', '⚠️'); } };
  const handleToggle = async id => { await toggleExercise(id); loadPlan(); };
  const handleDelete = async id => { await deleteExercise(id); showToast('🗑 Exercițiu eliminat'); loadPlan(); };
  const handleBulkDone = async () => { try { await bulkDoneExercises(); loadPlan(); showToast('✅ Toate completate!'); } catch { showToast('❌ Eroare', '❌'); } };
  const handleClearAll = async () => { try { await clearExercises(); loadPlan(); showToast('🗑 Plan șters'); } catch { showToast('❌ Eroare', '❌'); } };

  // === EDIT EXERCITIU ===
  const [editingEx, setEditingEx] = useState(null); // { id, sets, reps, weight, restSec }
  const [savingEdit, setSavingEdit] = useState(false);
  const handleEditClick = (ex, event) => {
    console.log('[WorkoutPage] handleEditClick fired', ex);
    // ex.sets este string formatat "4×8" — folosim ex.setsTotal (numarul brut)
    const rawSets = Number(ex.setsTotal) || Number(ex.sets) || 3;
    const rawReps = Number(ex.reps) || 10;
    // Pe mobil: forteaza modal centrat (anchor positioning iese din ecran).
    // Pe desktop: foloseste anchor pentru popover langa buton.
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 600;
    let anchor = null;
    if (!isMobile && event?.currentTarget?.getBoundingClientRect) {
      const rect = event.currentTarget.getBoundingClientRect();
      anchor = { top: rect.top + rect.height + 8, left: Math.max(10, rect.right - 380), bottom: rect.top };
    }
    const next = {
      id: ex.id,
      name: ex.name,
      muscle: ex.muscle || 'General',
      sets: rawSets,
      reps: rawReps,
      weight: Number(ex.weight) || 0,
      restSec: Number(ex.restSec) || 90,
      anchor,
    };
    console.log('[WorkoutPage] setting editingEx to', next);
    setEditingEx(next);
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
      showToast('✅ Modificări salvate');
      setEditingEx(null);
      loadPlan();
    } catch (e) {
      showToast(e.response?.data?.error || '❌ Eroare la salvare', '❌');
    } finally {
      setSavingEdit(false);
    }
  };


  const handleStartWorkout = async (source = 'self') => {
    try { const { data } = await startWorkout(source); setSession(data.session); setSessionMode('active'); setActiveExIdx(0); setTimerSec(0); setRunning(true); }
    catch (e) { showToast(e.response?.data?.error || '❌ Eroare la pornire', '❌'); }
  };

  const handleCompleteSet = async () => {
    if (!session) return;
    const exercise = session.exercises[activeExIdx];
    if (!exercise) return;
    try {
      const { data } = await completeSet(exercise.id);
      const newProgress = { ...session.progress };
      newProgress[exercise.id] = { setsCompleted: data.setsCompleted };
      setSession(s => ({ ...s, progress: newProgress, completedSets: data.totalCompletedSets, completedExercises: data.totalCompletedExercises }));
      if (data.allDone) { handleFinishWorkout(); return; }
      if (data.exerciseDone) { setActiveExIdx(i => i + 1); showToast(`✅ ${exercise.name} complet!`); }
      else {
        setResting(true);
        // FIX: foloseste pauza setata in exercitiu, nu valoarea hardcoded de 90s
        setRestTimer(Number(exercise.restSec) || 90);
      }
    } catch (e) { showToast(e.response?.data?.error || '❌ Eroare', '❌'); }
  };

  const handleSkipRest = () => { setResting(false); setRestTimer(0); clearInterval(restRef.current); };

  const handleFinishWorkout = async () => {
    try { const { data } = await finishWorkout(); setFinishData(data); setSessionMode('finished'); setRunning(false); showToast(`🏆 +${data.xpEarned} XP!`); loadPlan(); }
    catch { showToast('❌ Eroare la finalizare', '❌'); }
  };

  const handleAbandonWorkout = () => {
    confirm('Sigur abandonezi antrenamentul?', async () => {
      try { await abandonWorkout(); } catch {}
      setSession(null); setSessionMode('idle'); setRunning(false); setTimerSec(0);
    });
  };

  const handleBackToIdle = () => { setSession(null); setSessionMode('idle'); setFinishData(null); setTimerSec(0); };

  // ── ACTIVE MODE ───────────────────────────────────────
  if (sessionMode === 'active' && session) {
    const exercises = session.exercises || [];
    const progress = session.progress || {};
    const currentEx = exercises[activeExIdx];
    const currentProgress = progress[currentEx?.id] || { setsCompleted: 0 };
    const totalCompletedSets = Object.values(progress).reduce((s, p) => s + p.setsCompleted, 0);
    const totalSets = exercises.reduce((s, ex) => s + ex.setsTotal, 0);

    return (
      <AnimatedPage>
        <Toast toast={toast} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <div style={{ fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--c-lime-d)', fontWeight: 700 }}>antrenament activ</div>
            <div style={{ fontFamily: 'var(--fd)', fontSize: 32, fontWeight: 900, letterSpacing: .5, color: 'var(--c-ink)', lineHeight: 1 }}>{formatTime(timerSec)}</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <div className="tag tag-lime">{totalCompletedSets}/{totalSets} seturi</div>
            <div className="tag tag-blue">{activeExIdx + 1}/{exercises.length} ex</div>
          </div>
        </div>
        <div className="prog" style={{ height: 6, marginBottom: 24 }}>
          <div className="prog-fill" style={{ width: `${totalSets > 0 ? (totalCompletedSets / totalSets * 100) : 0}%`, background: 'var(--c-lime)' }} />
        </div>

        {currentEx && !resting && (
          <div className="card" style={{ marginBottom: 20, padding: 0, overflow: 'hidden' }}>
            {/* Exercise Animation */}
            {currentEx.anim && (
              <div style={{ background: 'var(--c-ink)', padding: 0, display: 'flex', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                {currentEx.img && <img src={currentEx.img} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.08, filter: 'grayscale(1)' }} />}
                <img src={currentEx.anim} alt={currentEx.name} style={{ width: '100%', maxWidth: 360, height: 'auto', display: 'block', position: 'relative', zIndex: 1 }} />
              </div>
            )}
            <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--c-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                {currentEx.img ? (
                  <div style={{ width: 52, height: 52, borderRadius: 12, overflow: 'hidden', flexShrink: 0, border: '2px solid var(--c-lime)', boxShadow: '0 0 12px rgba(184,237,0,0.15)' }}>
                    <img src={currentEx.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ) : <div style={{ fontSize: 36 }}>{currentEx.icon}</div>}
                <div>
                  <div style={{ fontFamily: 'var(--fd)', fontSize: 24, fontWeight: 900 }}>{currentEx.name}</div>
                </div>
              </div>
            </div>
            <div style={{ padding: '20px 24px' }}>
              <div style={{ fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--c-ink3)', marginBottom: 12 }}>
                SET {currentProgress.setsCompleted + 1} / {currentEx.setsTotal} — {currentEx.reps} {String(currentEx.reps).includes('s') ? '' : 'reps'}{currentEx.weight ? ` · ${currentEx.weight} kg` : ''} · pauză {currentEx.restSec}s
              </div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                {Array.from({ length: currentEx.setsTotal }, (_, i) => (
                  <div key={i} style={{ flex: 1, height: 8, borderRadius: 4, background: i < currentProgress.setsCompleted ? 'var(--c-lime)' : i === currentProgress.setsCompleted ? 'var(--c-blue)' : 'var(--c-border)', transition: 'background 0.3s' }} />
                ))}
              </div>
              <button className="btn btn-black" style={{ width: '100%', justifyContent: 'center', padding: '14px 20px', fontSize: 15 }} onClick={handleCompleteSet}>✓ SET COMPLET</button>
            </div>
          </div>
        )}

        {resting && (
          <div className="card" style={{ marginBottom: 20, padding: '32px 24px', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--c-ink3)', marginBottom: 8 }}>pauză</div>
            <div style={{ fontFamily: 'var(--fd)', fontSize: 56, fontWeight: 900, color: restTimer <= 10 ? 'var(--c-coral)' : 'var(--c-ink)', lineHeight: 1 }}>{formatTime(restTimer)}</div>
            <div style={{ marginTop: 16 }}><button className="btn btn-outline" onClick={handleSkipRest}>Skip → Următorul set</button></div>
          </div>
        )}

        <div className="card" style={{ padding: 0 }}>
          <div className="card-hd"><span className="card-hd-title">Exerciții</span></div>
          {exercises.map((ex, i) => {
            const p = progress[ex.id] || { setsCompleted: 0 };
            const isDone = p.setsCompleted >= ex.setsTotal;
            const isCurrent = i === activeExIdx;
            return (
              <div key={ex.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderBottom: '1px solid var(--c-border)', background: isCurrent ? 'var(--c-lime-bg)' : isDone ? 'rgba(21,128,61,0.04)' : 'transparent', opacity: isDone && !isCurrent ? 0.5 : 1, transition: 'all 0.3s' }}>
                {ex.img ? <img src={ex.img} alt="" style={{ width: 32, height: 32, borderRadius: 8, objectFit: 'cover', flexShrink: 0, border: isCurrent ? '2px solid var(--c-lime)' : '1px solid var(--c-border)' }} /> : <span style={{ fontSize: 18 }}>{ex.icon}</span>}
                <div style={{ flex: 1 }}><div style={{ fontWeight: 700, fontSize: 13, textDecoration: isDone ? 'line-through' : 'none' }}>{ex.name}</div></div>
                <div style={{ fontFamily: 'var(--fm)', fontSize: 11, color: isDone ? 'var(--c-green)' : 'var(--c-ink3)' }}>{p.setsCompleted}/{ex.setsTotal}</div>
              </div>
            );
          })}
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <button className="btn btn-lime" style={{ flex: 1, justifyContent: 'center' }} onClick={handleFinishWorkout}>🏁 Finalizează</button>
          <button className="btn btn-outline" style={{ color: 'var(--c-coral)' }} onClick={handleAbandonWorkout}>✕ Abandonează</button>
        </div>
      </AnimatedPage>
    );
  }

  // ── FINISHED MODE ─────────────────────────────────────
  if (sessionMode === 'finished' && finishData) {
    return (
      <AnimatedPage style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 500 }}>
        <Toast toast={toast} />
        <ConfettiBurst active={true} count={50} />
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          style={{ textAlign: 'center', maxWidth: 400, width: '100%', position: 'relative' }}
        >
          <motion.img src="/img/trophy.svg" alt=""
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.2 }}
            style={{ width: 100, height: 100, margin: '0 auto 16px', display: 'block' }} />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            style={{ fontFamily: 'var(--fd)', fontSize: 36, fontWeight: 900, color: 'var(--c-ink)', lineHeight: 1, marginBottom: 8 }}>
            ANTRENAMENT COMPLET!
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            style={{ fontFamily: 'var(--fm)', fontSize: 11, color: 'var(--c-ink3)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 32 }}>
            {finishData.allDone ? 'Toate exercitiile bifate' : `${finishData.completedExercises}/${finishData.totalExercises} exercitii completate`}
          </motion.div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 32 }}>
            {[
              { val: finishData.durationFormatted, lbl: 'Durata', color: 'var(--c-ink)' },
              { val: `${finishData.completedSets}/${finishData.totalSets}`, lbl: 'Seturi', color: 'var(--c-blue)' },
              { val: `${finishData.completedExercises}/${finishData.totalExercises}`, lbl: 'Exercitii', color: 'var(--c-lime-d)' },
              { val: `+${finishData.xpEarned}`, lbl: 'XP castigat', color: 'var(--c-coral)' },
            ].map((s, i) => (
              <motion.div key={s.lbl} className="card card-inner-glow"
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.7 + i * 0.1, type: 'spring', stiffness: 300, damping: 20 }}
                style={{ padding: '16px 12px', textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--fd)', fontSize: 28, fontWeight: 900, color: s.color }}>{s.val}</div>
                <div style={{ fontFamily: 'var(--fm)', fontSize: 9, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--c-ink3)', marginTop: 4 }}>{s.lbl}</div>
              </motion.div>
            ))}
          </div>
          <motion.button className="btn btn-black btn-ripple"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{ width: '100%', justifyContent: 'center', padding: '14px 20px' }} onClick={handleBackToIdle}>Inapoi la plan</motion.button>
        </motion.div>
      </AnimatedPage>
    );
  }

  // ── IDLE MODE ─────────────────────────────────────────
  const done = plan.filter(e => e.done).length;
  const inPlanIds = new Set(plan.map(e => e.libId));

  return (
    <AnimatedPage>
      <Toast toast={toast} />
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 0 40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 8 }}>
          <div>
            <div style={{ fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: 1.5, color: 'var(--c-ink3)', textTransform: 'uppercase' }}>ANTRENAMENTE</div>
            <h1 style={{ fontFamily: 'var(--fd)', fontSize: 32, fontWeight: 900, margin: 0 }}>Alege planul</h1>
          </div>
          <button className="btn btn-outline btn-sm" onClick={() => navigate('/app/workout/edit')}>
            ✏️ Editează planul meu
          </button>
        </div>

        {/* === Planul meu (propriu) - doar dacă activ === */}
        {selfPlanActive && (
        <div className="plan-panel" style={{ marginBottom: 18 }}>
          <div className="plan-banner">
            <span className="plan-title">📓 Planul meu</span>
            <span className="plan-prog">{plan.length} ex. · {done}/{plan.length} done</span>
          </div>
          {plan.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--c-ink3)', fontSize: 13 }}>
              Niciun exercițiu în plan.<br />
              <button className="btn btn-lime btn-sm" style={{ marginTop: 12 }} onClick={() => navigate('/app/workout/edit')}>
                ✏️ Editează plan
              </button>
            </div>
          ) : (
            <>
              {plan.map((ex) => (
                <div key={ex.id} className="pex-row" style={{ position: 'relative' }}>
                  {ex.img && <img src={ex.img} alt="" style={{ width:32, height:32, borderRadius:8, objectFit:'cover', flexShrink:0 }} />}
                  <div style={{ flex: 1 }}>
                    <div className="pex-nm" style={{ textDecoration: ex.done ? 'line-through' : 'none', opacity: ex.done ? .5 : 1 }}>{ex.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--c-ink3)', fontFamily: 'var(--fm)', marginTop: 2 }}>
                      {ex.setsTotal || 3}×{ex.reps || 10}{ex.weight ? ` · ${ex.weight}kg` : ''} · pauză {ex.restSec || 90}s
                    </div>
                  </div>
                </div>
              ))}
              <div style={{ padding: '11px 16px', background: 'var(--c-bg)', borderTop: '1px solid var(--c-border)' }}>
                <motion.button
                  className="btn btn-lime"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{ width: '100%', justifyContent: 'center', padding: '14px 20px', fontSize: 16, fontWeight: 900 }}
                  onClick={() => handleStartWorkout('self')}
                  disabled={done === plan.length}>
                  {done === plan.length ? '✓ Plan complet' : '🏋️ START ANTRENAMENT'}
                </motion.button>
              </div>
            </>
          )}
        </div>
        )}

        {/* === Planul de la coach (separat) — doar dacă activ === */}
        {coachPlan && coachPlan.exercises?.length > 0 && coachPlan.active !== false && (
          <div className="plan-panel" style={{ marginBottom: 18, border: '2px solid var(--c-lime)', background: 'linear-gradient(135deg, rgba(184,237,0,0.04), rgba(26,82,255,0.04))' }}>
            <div className="plan-banner">
              <span className="plan-title">📋 Plan de la coach — {coachPlan.coachName}</span>
              <span className="plan-prog">{coachPlan.exercises.length} ex.</span>
            </div>
            {coachPlan.exercises.map((ex) => (
              <div key={ex.id} className="pex-row" style={{ position: 'relative' }}>
                {ex.img && <img src={ex.img} alt="" style={{ width:32, height:32, borderRadius:8, objectFit:'cover', flexShrink:0 }} />}
                <div style={{ flex: 1 }}>
                  <div className="pex-nm">{ex.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--c-ink3)', fontFamily: 'var(--fm)', marginTop: 2 }}>
                    {ex.setsTotal || 3}×{ex.reps || 10}{ex.weight ? ` · ${ex.weight}kg` : ''} · pauză {ex.restSec || 90}s
                  </div>
                </div>
              </div>
            ))}
            <div style={{ padding: '11px 16px', background: 'var(--c-bg)', borderTop: '1px solid var(--c-border)' }}>
              <motion.button
                className="btn btn-lime"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{ width: '100%', justifyContent: 'center', padding: '14px 20px', fontSize: 16, fontWeight: 900 }}
                onClick={() => handleStartWorkout('coach')}>
                🏋️ START ANTRENAMENT COACH
              </motion.button>
            </div>
          </div>
        )}

        {/* Empty state: niciun plan activ */}
        {!selfPlanActive && (!coachPlan || coachPlan.active === false || !coachPlan.exercises?.length) && (
          <div className="card" style={{ padding: 30, textAlign: 'center', marginTop: 16 }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>😴</div>
            <div style={{ fontFamily: 'var(--fd)', fontSize: 18, fontWeight: 900, marginBottom: 6 }}>Niciun plan activ</div>
            <div style={{ fontSize: 13, color: 'var(--c-ink3)', marginBottom: 16 }}>
              Activează un plan din <strong>Planurile mele</strong> sau editează planul propriu.
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn btn-lime btn-sm" onClick={() => navigate('/app/my-plans')}>📋 Planurile mele</button>
              <button className="btn btn-outline btn-sm" onClick={() => navigate('/app/workout/edit')}>✏️ Editor</button>
            </div>
          </div>
        )}
      </div>
    </AnimatedPage>
  );
}
