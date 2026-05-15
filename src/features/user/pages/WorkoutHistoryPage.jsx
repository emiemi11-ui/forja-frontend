import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Dumbbell, TrendingUp, Clock, Flame } from 'lucide-react';
import { getWorkoutHistory7Days } from '../../../shared/api/index.js';
import { pct, Toast, useToast } from '../../../shared/ui/helpers.jsx';
import { AnimatedPage, HeroSection, AnimatedRing, ScrollReveal, CountUp, StaggerGrid } from '../../../shared/ui/animations/index.jsx';

const dayLabel = (iso) => {
  try {
    const d = new Date(iso);
    const days = ['dum', 'lun', 'mar', 'mie', 'joi', 'vin', 'sâm'];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(d);
    target.setHours(0, 0, 0, 0);
    if (target.getTime() === today.getTime()) return 'Astăzi';
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (target.getTime() === yesterday.getTime()) return 'Ieri';
    return `${days[d.getDay()]}, ${d.getDate()} ${d.toLocaleDateString('ro-RO', { month: 'short' })}`;
  } catch {
    return iso;
  }
};

const formatDuration = (sec) => {
  if (!sec || sec < 1) return '—';
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  if (m < 60) return `${m}:${String(s).padStart(2, '0')}`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m`;
};

const scoreColor = (pctVal) => pctVal >= 80 ? '#15803D' : pctVal >= 50 ? '#B8ED00' : pctVal >= 1 ? '#FF4422' : 'var(--c-border2)';

export default function WorkoutHistoryPage() {
  const navigate = useNavigate();
  const [days, setDays] = useState(null);
  const { toast, showToast } = useToast();

  useEffect(() => {
    getWorkoutHistory7Days()
      .then((r) => setDays(Array.isArray(r.data) ? r.data : []))
      .catch(() => {
        showToast('Eroare la încărcare', '❌');
        setDays([]);
      });
  }, []);

  if (!days) {
    return (
      <AnimatedPage>
        <div className="forja-skeleton" style={{ height: 200, borderRadius: 20, marginBottom: 24 }} />
        <div className="forja-skeleton" style={{ height: 400, borderRadius: 16 }} />
      </AnimatedPage>
    );
  }

  // Statistici agregate pe 7 zile
  const totalWorkouts = days.reduce((sum, d) => sum + (d.workouts || 0), 0);
  const totalCompletedSets = days.reduce((sum, d) => sum + (d.completedSets || 0), 0);
  const totalCompletedExercises = days.reduce((sum, d) => sum + (d.completedExercises || 0), 0);
  const totalDuration = days.reduce((sum, d) => sum + (d.durationSeconds || 0), 0);
  const activeDays = days.filter((d) => d.workouts > 0).length;
  const weekScore = Math.round((activeDays / 7) * 100);

  return (
    <AnimatedPage>
      <Toast toast={toast} />

      {/* HERO */}
      <HeroSection
        imageSrc="/img/ext/role-coach-demo.jpg"
        accentColor="rgba(184,237,0,0.1)"
        style={{ display: 'flex', alignItems: 'center', gap: 32, minHeight: 180 }}
      >
        <AnimatedRing value={weekScore} size={120} strokeWidth={8} color={scoreColor(weekScore)}>
          <CountUp to={weekScore} suffix="%" className="score-glow" style={{ fontFamily: 'var(--fd)', fontSize: 26, fontWeight: 900, color: scoreColor(weekScore), lineHeight: 1 }} />
          <div style={{ fontFamily: 'var(--fm)', fontSize: 8, letterSpacing: 2, color: 'var(--hero-text3)', textTransform: 'uppercase', marginTop: 2 }}>activ</div>
        </AnimatedRing>

        <div style={{ flex: 1 }}>
          <motion.div initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <div style={{ fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: 3, color: 'var(--c-lime-d)', textTransform: 'uppercase', fontWeight: 700, marginBottom: 6 }}>performance</div>
            <div style={{ fontFamily: 'var(--fd)', fontSize: 32, fontWeight: 900, color: 'var(--hero-text)', letterSpacing: 0.5, marginBottom: 16 }}>ISTORIC ANTRENAMENTE</div>
          </motion.div>

          <StaggerGrid style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
            {[
              { val: totalWorkouts, lbl: 'Sesiuni', icon: <Dumbbell size={14} />, color: 'var(--c-lime-d)' },
              { val: totalCompletedExercises, lbl: 'Exerciții', icon: <TrendingUp size={14} />, color: 'var(--c-blue)' },
              { val: totalCompletedSets, lbl: 'Seturi', icon: <Flame size={14} />, color: 'var(--c-coral)' },
              { val: formatDuration(totalDuration), lbl: 'Timp total', icon: <Clock size={14} />, color: 'var(--c-purple)', isString: true },
            ].map((stat) => (
              <div key={stat.lbl} style={{ background: 'var(--hero-card-bg)', border: '1px solid var(--hero-card-bd)', borderRadius: 10, padding: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 8, letterSpacing: 1.5, color: 'var(--hero-text3)', textTransform: 'uppercase', fontFamily: 'var(--fm)', fontWeight: 700, marginBottom: 4 }}>
                  <span style={{ color: stat.color }}>{stat.icon}</span>
                  {stat.lbl}
                </div>
                <div style={{ fontFamily: 'var(--fd)', fontSize: 20, fontWeight: 900, color: 'var(--hero-text)', lineHeight: 1 }}>
                  {stat.isString ? stat.val : <CountUp to={stat.val} />}
                </div>
              </div>
            ))}
          </StaggerGrid>
        </div>
      </HeroSection>

      {/* === Istoricul antrenamentelor (7 zile) === */}
      <ScrollReveal direction="up">
        <div className="card" style={{ marginTop: 18, padding: '18px 22px' }}>
          <div style={{ fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: 2, color: 'var(--c-ink3)', textTransform: 'uppercase', fontWeight: 700, marginBottom: 14 }}>
            Istoricul antrenamentelor (7 zile)
          </div>

          {days.every((d) => d.workouts === 0) ? (
            <div style={{ padding: '40px 12px', textAlign: 'center' }}>
              <div style={{ fontSize: 42, marginBottom: 8 }}>📅</div>
              <div style={{ fontFamily: 'var(--fd)', fontSize: 16, fontWeight: 800, color: 'var(--c-ink)', marginBottom: 4 }}>
                Niciun antrenament în ultimele 7 zile
              </div>
              <div style={{ fontSize: 12, color: 'var(--c-ink3)', fontFamily: 'var(--fm)', marginBottom: 14 }}>
                Pornește un antrenament pentru a începe să-ți construiești istoricul.
              </div>
              <button className="btn btn-lime btn-sm" onClick={() => navigate('/app/workout')}>
                🏋️ Începe antrenamentul
              </button>
            </div>
          ) : (
            <div>
              {days.map((d, i) => {
                const exercisesTotal = d.totalExercises || 0;
                const exercisesDone = d.completedExercises || 0;
                const dayPct = exercisesTotal > 0 ? Math.round((exercisesDone / exercisesTotal) * 100) : 0;
                const isEmpty = d.workouts === 0;
                return (
                  <motion.div key={d.date}
                    className="hist-row"
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 + i * 0.05 }}
                    style={{ opacity: isEmpty ? 0.45 : 1 }}>
                    <div className="hr-date">{dayLabel(d.iso)}</div>
                    <div className="hr-score" style={{
                      background: isEmpty ? 'var(--c-bg)' : scoreColor(dayPct) + '20',
                      color: isEmpty ? 'var(--c-ink3)' : scoreColor(dayPct),
                    }}>
                      {isEmpty ? '—' : d.workouts}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, minWidth: 0 }}>
                      {isEmpty ? (
                        <div style={{ fontSize: 11, color: 'var(--c-ink3)', fontFamily: 'var(--fm)' }}>Zi de repaus</div>
                      ) : (
                        <>
                          <div style={{ display: 'flex', gap: 10, fontSize: 10, fontFamily: 'var(--fm)', color: 'var(--c-ink3)', letterSpacing: 0.5 }}>
                            <span><strong style={{ color: 'var(--c-ink2)' }}>{exercisesDone}/{exercisesTotal}</strong> ex.</span>
                            <span><strong style={{ color: 'var(--c-ink2)' }}>{d.completedSets || 0}/{d.totalSets || 0}</strong> seturi</span>
                            {d.durationSeconds > 0 && <span><strong style={{ color: 'var(--c-ink2)' }}>{formatDuration(d.durationSeconds)}</strong></span>}
                          </div>
                          <div style={{ height: 4, background: 'var(--c-border)', borderRadius: 2, overflow: 'hidden' }}>
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${dayPct}%` }}
                              transition={{ duration: 0.8, delay: 0.15 + i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                              style={{ height: '100%', background: scoreColor(dayPct), borderRadius: 2 }}
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </ScrollReveal>

      {/* === Detalii pe zi cu workout-uri === */}
      {days.some((d) => d.workouts > 0) && (
        <ScrollReveal direction="up">
          <div style={{ marginTop: 18 }}>
            <div style={{ fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: 2, color: 'var(--c-ink3)', textTransform: 'uppercase', fontWeight: 700, marginBottom: 10, paddingLeft: 4 }}>
              Detalii sesiuni
            </div>
            {days.slice().reverse().filter((d) => d.workouts > 0).map((d, i) => (
              <motion.div key={d.date} className="card"
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 + i * 0.05 }}
                style={{ padding: '14px 18px', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div style={{ fontFamily: 'var(--fd)', fontSize: 14, fontWeight: 800, color: 'var(--c-ink)' }}>
                    {dayLabel(d.iso)}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--c-ink3)', fontFamily: 'var(--fm)' }}>
                    {d.workouts} {d.workouts === 1 ? 'sesiune' : 'sesiuni'} · {formatDuration(d.durationSeconds)}
                  </div>
                </div>
                {(d.details || []).map((w) => (
                  <div key={w.id} style={{ background: 'var(--c-bg)', borderRadius: 10, padding: '10px 12px', marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--c-ink)' }}>{w.name}</div>
                      <span style={{
                        fontSize: 8, fontFamily: 'var(--fm)', fontWeight: 800, letterSpacing: 1,
                        padding: '2px 8px', borderRadius: 100,
                        background: w.status === 'COMPLETED' ? 'var(--c-lime-bg)' : 'rgba(255,68,34,0.1)',
                        color: w.status === 'COMPLETED' ? 'var(--c-lime-d)' : 'var(--c-coral)',
                      }}>
                        {w.status === 'COMPLETED' ? 'COMPLETAT' : 'ABANDONAT'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {(w.exercises || []).map((ex, idx) => {
                        const isComplete = ex.setsTotal > 0 && ex.setsCompleted >= ex.setsTotal;
                        return (
                          <span key={idx} style={{
                            fontSize: 10, fontFamily: 'var(--fm)', padding: '3px 8px', borderRadius: 100,
                            background: isComplete ? 'var(--c-lime-bg)' : 'var(--c-border)',
                            color: isComplete ? 'var(--c-lime-d)' : 'var(--c-ink2)',
                            fontWeight: 600,
                          }}>
                            {ex.name} {ex.setsCompleted}/{ex.setsTotal}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </motion.div>
            ))}
          </div>
        </ScrollReveal>
      )}
    </AnimatedPage>
  );
}
