import { useEffect, useMemo, useState } from 'react';
import { Dumbbell, Apple, CheckCircle, Clock, ChevronRight } from 'lucide-react';
import { getDashboard, toggleExercise } from '../../../shared/api/index.js';
import { AnimatedPage } from '../../../shared/ui/animations/index.jsx';

export default function MyPlansPage() {
  const [tab, setTab] = useState('workout');
  const [expandedPlan, setExpandedPlan] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    getDashboard()
      .then((response) => setDashboard(response.data))
      .catch(() => setDashboard(null))
      .finally(() => setLoading(false));
  }, []);

  const workoutPlans = useMemo(() => {
    if (!dashboard?.assignedWorkoutPlan) return [];
    return [dashboard.assignedWorkoutPlan];
  }, [dashboard]);

  const nutritionPlans = useMemo(() => {
    if (!dashboard?.assignedNutritionPlan) return [];
    return [dashboard.assignedNutritionPlan];
  }, [dashboard]);

  useEffect(() => {
    if (workoutPlans.length > 0) {
      setExpandedPlan((current) => current || workoutPlans[0].id);
      return;
    }
    if (nutritionPlans.length > 0) {
      setTab('nutrition');
      setExpandedPlan((current) => current || nutritionPlans[0].id);
      return;
    }
    setExpandedPlan(null);
  }, [workoutPlans, nutritionPlans]);

  const plans = tab === 'workout' ? workoutPlans : nutritionPlans;

  const toggleDone = async (exerciseId) => {
    if (!exerciseId || busyId === exerciseId) return;
    setBusyId(exerciseId);
    try {
      await toggleExercise(exerciseId);
      setDashboard((current) => {
        if (!current?.assignedWorkoutPlan) return current;
        const nextItems = current.assignedWorkoutPlan.items.map((item) => (
          item.id === exerciseId ? { ...item, done: !item.done } : item
        ));
        const doneCount = nextItems.filter((item) => item.done).length;
        const totalCount = nextItems.length;
        return {
          ...current,
          assignedWorkoutPlan: {
            ...current.assignedWorkoutPlan,
            items: nextItems,
          },
          exercises: nextItems,
          workout: {
            ...current.workout,
            exercisesDone: doneCount,
            exercises_done: doneCount,
            exercisesTotal: totalCount,
            exercises_total: totalCount,
            progressPct: totalCount ? Math.round((doneCount / totalCount) * 100) : 0,
            progress_pct: totalCount ? Math.round((doneCount / totalCount) * 100) : 0,
          },
        };
      });
    } catch {
      // keep UI unchanged when backend rejects
    } finally {
      setBusyId(null);
    }
  };

  return (
    <AnimatedPage>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--c-lime-d)', fontWeight: 700 }}>planuri asignate</div>
        <h1 style={{ fontFamily: 'var(--fd)', fontSize: 32, fontWeight: 900, letterSpacing: .5, color: 'var(--c-ink)', lineHeight: 1, margin: '4px 0 0' }}>PLANURILE MELE</h1>
        <p style={{ fontFamily: 'var(--fb)', fontSize: 13, color: 'var(--c-ink3)', marginTop: 4 }}>Planuri reale venite din contul tău, de la coach-ul și nutriționistul tău.</p>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <button className={`chip${tab === 'workout' ? ' on' : ''}`} onClick={() => setTab('workout')} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Dumbbell size={14} /> Antrenament ({workoutPlans.length})
        </button>
        <button className={`chip${tab === 'nutrition' ? ' on' : ''}`} onClick={() => setTab('nutrition')} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Apple size={14} /> Nutriție ({nutritionPlans.length})
        </button>
      </div>

      {loading ? (
        <div className="card" style={{ padding: 24, textAlign: 'center' }}><div className="spinner" /></div>
      ) : plans.length === 0 ? (
        <div className="card" style={{ padding: 24, textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--fd)', fontSize: 20, fontWeight: 900, marginBottom: 6 }}>{tab === 'workout' ? 'Niciun plan de antrenament' : 'Niciun plan de nutriție'}</div>
          <div style={{ fontSize: 13, color: 'var(--c-ink3)' }}>
            {tab === 'workout'
              ? 'Când un coach îți atribuie un plan sau îți creezi unul real, îl vei vedea aici.'
              : 'Când un nutriționist îți aplică un template real, îl vei vedea aici.'}
          </div>
        </div>
      ) : plans.map((plan) => {
        const isExpanded = expandedPlan === plan.id;
        return (
          <div key={plan.id} className="card" style={{ marginBottom: 16, padding: 0, overflow: 'hidden' }}>
            <div onClick={() => setExpandedPlan(isExpanded ? null : plan.id)}
              style={{ padding: '16px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14, borderBottom: isExpanded ? '1px solid var(--c-border)' : 'none' }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: tab === 'workout' ? 'var(--c-lime-bg)' : 'var(--c-blue-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {tab === 'workout' ? <Dumbbell size={22} color="var(--c-lime-d)" /> : <Apple size={22} color="var(--c-blue)" />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--fd)', fontSize: 18, fontWeight: 800 }}>{plan.name}</div>
                <div style={{ fontFamily: 'var(--fm)', fontSize: 11, color: 'var(--c-ink3)', marginTop: 2 }}>
                  {tab === 'workout'
                    ? `Coach: ${plan.coachName || 'Plan personal'} · ${plan.category || 'Plan'} · ${plan.exercises || plan.items?.length || 0} exerciții`
                    : `Nutriționist: ${plan.nutritionist || '—'} · ${plan.kcal || 0} kcal/zi`}
                </div>
              </div>
              <div className="tag tag-lime" style={{ fontSize: 9 }}>{plan.status === 'pending' ? 'PENDING' : 'ACTIV'}</div>
              <ChevronRight size={18} color="var(--c-ink3)" style={{ transform: isExpanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
            </div>

            {isExpanded && tab === 'workout' && (
              <div style={{ padding: '0' }}>
                {(plan.items || []).map((item) => (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', borderBottom: '1px solid var(--c-border)', background: item.done ? 'rgba(21,128,61,0.04)' : 'transparent', transition: 'all 0.3s' }}>
                    {item.img && <img src={item.img} alt="" onError={(event) => { event.target.style.display = 'none'; }} style={{ width: 40, height: 40, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 13, textDecoration: item.done ? 'line-through' : 'none', color: item.done ? 'var(--c-ink3)' : 'var(--c-ink)' }}>{item.name}</div>
                      <div style={{ fontFamily: 'var(--fm)', fontSize: 10, color: 'var(--c-ink3)' }}>{item.sets} · {item.detail}</div>
                    </div>
                    {item.anim && <img src={item.anim} alt="" onError={(event) => { event.target.style.display = 'none'; }} style={{ width: 44, height: 33, borderRadius: 6, background: 'var(--c-ink)' }} />}
                    <button onClick={() => toggleDone(item.id)} disabled={busyId === item.id} style={{
                      width: 32, height: 32, borderRadius: 8, border: 'none', cursor: 'pointer',
                      background: item.done ? 'var(--c-green)' : 'var(--c-border)', color: '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', opacity: busyId === item.id ? 0.6 : 1,
                    }}>
                      {item.done ? <CheckCircle size={16} /> : ''}
                    </button>
                  </div>
                ))}
                <div style={{ padding: '12px 20px', background: 'var(--c-bg)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Clock size={14} color="var(--c-ink3)" />
                  <span style={{ fontFamily: 'var(--fm)', fontSize: 11, color: 'var(--c-ink3)' }}>
                    {(plan.items || []).filter((item) => item.done).length}/{(plan.items || []).length} completate
                  </span>
                </div>
              </div>
            )}

            {isExpanded && tab === 'nutrition' && (
              <div style={{ padding: '0' }}>
                {(plan.meals || []).length === 0 ? (
                  <div style={{ padding: '18px 20px', fontSize: 12, color: 'var(--c-ink3)' }}>Template-ul există, dar încă nu are mesele salvate în planul aplicat.</div>
                ) : (plan.meals || []).map((meal, idx) => (
                  <div key={`${plan.id}-${idx}`} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', borderBottom: '1px solid var(--c-border)' }}>
                    {meal.img && <img src={meal.img} alt="" onError={(event) => { event.target.style.display = 'none'; }} style={{ width: 48, height: 48, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>{meal.type}</div>
                      <div style={{ fontFamily: 'var(--fb)', fontSize: 12, color: 'var(--c-ink3)', marginTop: 2 }}>{meal.items || meal.name || ''}</div>
                    </div>
                    <div style={{ fontFamily: 'var(--fd)', fontSize: 16, fontWeight: 800, color: 'var(--c-ink)' }}>{meal.kcal || 0}</div>
                    <div style={{ fontFamily: 'var(--fm)', fontSize: 9, color: 'var(--c-ink3)' }}>kcal</div>
                  </div>
                ))}
                <div style={{ padding: '12px 20px', background: 'var(--c-bg)', textAlign: 'center' }}>
                  <span style={{ fontFamily: 'var(--fd)', fontSize: 18, fontWeight: 800, color: 'var(--c-lime-d)' }}>{plan.kcal || 0} kcal</span>
                  <span style={{ fontFamily: 'var(--fm)', fontSize: 11, color: 'var(--c-ink3)', marginLeft: 8 }}>total zilnic</span>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </AnimatedPage>
  );
}
