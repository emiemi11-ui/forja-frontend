import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getDashboard, setWater, toggleExercise } from '../../../shared/api/index.js';
import { Avatar, pct, Toast, useToast } from '../../../shared/ui/helpers.jsx';
import {
  AnimatedPage, HeroSection, StaggerGrid, ScrollReveal, CountUp,
  AnimatedRing, AnimatedBar, Sparkline, ConfettiBurst, SkeletonGrid,
  TiltCard,
} from '../../../shared/ui/animations/index.jsx';

const sparkCalories = [1200, 1800, 1600, 2100, 1900, 2200, 1750];
const sparkWater    = [4, 6, 5, 8, 7, 6, 8];
const sparkSteps    = [5200, 7800, 6400, 9100, 8500, 10200, 7600];
const sparkSleep    = [62, 78, 85, 71, 88, 92, 76];

function HeroCard({ data }) {
  const dateStr = new Date().toLocaleDateString('ro-RO', { weekday: 'long', day: 'numeric', month: 'long' });
  const firstName = data?.user?.name?.split(' ')[0] || 'Atlet';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Buna dimineata' : hour < 18 ? 'Buna ziua' : 'Buna seara';
  const score = Math.min(100, Math.round(
    ((data?.today?.water_cups || 0) / 8 * 25) +
    ((data?.today?.sleep_score || 0) / 100 * 25) +
    ((data?.workout?.progress_pct || 0) / 100 * 25) +
    (Math.min((data?.macros?.kcal || 0) / (data?.goals?.kcal || 2000), 1) * 25)
  ));
  const color = score >= 75 ? '#B8ED00' : score >= 45 ? '#1A52FF' : '#FF4422';

  return (
    <HeroSection
      
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: 160 }}
    >
      <div>
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          style={{ fontFamily: 'var(--fm)', fontSize: 10, fontWeight: 700, letterSpacing: 3, color: 'var(--c-lime)', textTransform: 'uppercase', marginBottom: 8, opacity: 0.8 }}
        >{dateStr}</motion.div>
        <motion.div
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.35, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{ fontFamily: 'var(--fd)', fontSize: 38, fontWeight: 900, color: 'var(--hero-text)', lineHeight: 1.1, marginBottom: 14, letterSpacing: 0.5 }}
        >{greeting}, {firstName}!</motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.5 }}
          style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ background: 'rgba(184,237,0,0.1)', border: '1px solid rgba(184,237,0,0.22)', borderRadius: 100, padding: '4px 12px', fontSize: 11, fontWeight: 700, color: 'var(--c-lime)', fontFamily: 'var(--fm)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <img src="/img/fire-streak.svg" alt="" className="fire-anim" style={{ width: 18, height: 22 }} />
            {data?.user?.streak || 0} zile streak
          </span>
          <span style={{ background: 'var(--hero-card-bg)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 100, padding: '4px 12px', fontSize: 11, fontWeight: 700, color: 'var(--hero-text2)', fontFamily: 'var(--fm)' }}>Level {data?.user?.level || 1}</span>
          <span style={{ background: 'rgba(26,82,255,0.1)', border: '1px solid rgba(26,82,255,0.22)', borderRadius: 100, padding: '4px 12px', fontSize: 11, fontWeight: 700, color: 'var(--c-blue)', fontFamily: 'var(--fm)' }}>{data?.user?.plan || 'FREE'}</span>
        </motion.div>
      </div>
      <AnimatedRing value={score} size={128} strokeWidth={7} color={color}>
        <CountUp to={score} className="score-glow" style={{ fontFamily: 'var(--fd)', fontSize: 30, fontWeight: 900, color, lineHeight: 1 }} />
        <div style={{ fontFamily: 'var(--fm)', fontSize: 8, letterSpacing: 2, color: 'var(--hero-text3)', textTransform: 'uppercase', marginTop: 2 }}>scor zi</div>
      </AnimatedRing>
    </HeroSection>
  );
}

function KpiCards({ data, onWaterClick, onNavNutrition, onNavSleep }) {
  const today = data.today || { water_cups: 0, steps: 0, sleep_score: 0 };
  const macros = data.macros || { kcal: 0 };
  const goals = data.goals || { kcal: 2000, water: 3, steps: 10000, sleep: 8 };
  const waterTargetLiters = today.waterTargetLiters || today.water_target_liters || goals.water || 3;
  const waterTargetCups = today.waterTargetCups || today.water_target_cups || Math.max(4, Math.round(waterTargetLiters * 4));
  const cups = Math.min(today.water_cups || 0, waterTargetCups);
  const waterLiters = today.waterLiters || today.water_liters || Number((cups / 4).toFixed(1));
  const kcalPct = pct(macros.kcal, goals.kcal);
  const waterPct = pct(cups, waterTargetCups);
  const stepsPct = pct(today.steps, goals.steps);
  const sleep = today.sleep_score;

  const kpis = [
    { label: 'Calorii azi', color: 'var(--c-coral)', rawColor: '#FF4422', val: macros.kcal || 0, suffix: '', decimals: 0, sub: `din ${goals.kcal?.toLocaleString('ro')} kcal`, progPct: kcalPct, trend: `${kcalPct}%`, trendClass: kcalPct >= 90 ? 'kt-up' : kcalPct >= 60 ? 'kt-warn' : 'kt-dn', onClick: onNavNutrition, borderColor: 'var(--c-coral)', sparkData: sparkCalories },
    { label: 'Hidratare', color: 'var(--c-blue)', rawColor: '#1A52FF', val: waterLiters, suffix: 'L', decimals: 1, sub: `din ${waterTargetLiters}L`, progPct: null, trend: `${waterPct}%`, trendClass: waterPct >= 80 ? 'kt-up' : 'kt-warn', isWater: true, cups, waterTargetCups, onClick: onNavNutrition, borderColor: 'var(--c-blue)', sparkData: sparkWater, onWaterClick },
    { label: 'Pasi azi', color: 'var(--c-green)', rawColor: '#15803D', val: ((today.steps || 0) / 1000), suffix: 'K', decimals: 1, sub: `din ${((goals.steps || 10000) / 1000).toFixed(0)}K`, progPct: stepsPct, trend: `${stepsPct}%`, trendClass: 'kt-up', borderColor: 'var(--c-green)', sparkData: sparkSteps },
    { label: 'Scor somn', color: 'var(--c-purple)', rawColor: '#7B2FBE', val: sleep || 0, suffix: '', decimals: 0, sub: `${today.sleep_hours?.toFixed(1) || 0}h`, progPct: sleep, trend: sleep >= 80 ? 'Excelent' : sleep >= 60 ? 'Moderat' : 'Insuficient', trendClass: sleep >= 80 ? 'kt-up' : sleep >= 60 ? 'kt-warn' : 'kt-dn', onClick: onNavSleep, borderColor: 'var(--c-purple)', sparkData: sparkSleep },
  ];

  return (
    <StaggerGrid className="ov-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 20 }}>
      {kpis.map((k, i) => (
        <TiltCard key={i} intensity={4}>
          <div className="kpi card-inner-glow" style={{ cursor: k.onClick ? 'pointer' : 'default', borderTop: `3px solid ${k.borderColor}` }} onClick={k.onClick}>
            <div className="kpi-lbl">{k.label}</div>
            <div className="kpi-val kpi-value-animate" style={{ color: k.color }}>
              <CountUp to={k.val} decimals={k.decimals} suffix={k.suffix} />
            </div>
            <div className="kpi-sub">{k.sub}</div>
            {k.progPct !== null && k.progPct !== undefined && (
              <div style={{ margin: '8px 0' }}><AnimatedBar value={k.progPct} color={k.rawColor} /></div>
            )}
            {k.isWater && (
              <div className="wcups" style={{ marginTop: 8, flexWrap: 'wrap', gap: 4 }}>
                {Array.from({ length: k.waterTargetCups || 12 }, (_, j) => (
                  <motion.div key={j} className={`wcup${j < k.cups ? ' f' : ''}`}
                    whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}
                    onClick={e => { e.stopPropagation(); k.onWaterClick(j + 1); }}>
                    <img src="/img/water-drop.svg" alt="" style={{ width: 22, height: 28, opacity: j < k.cups ? 1 : 0.2, filter: j < k.cups ? 'none' : 'grayscale(1)', transition: 'all 0.3s' }} />
                  </motion.div>
                ))}
              </div>
            )}
            <div className={`kpi-trend ${k.trendClass}`}>{k.trend}</div>
            <div className="sparkline-wrap"><Sparkline data={k.sparkData} color={k.rawColor} height={24} width={70} /></div>
          </div>
        </TiltCard>
      ))}
    </StaggerGrid>
  );
}

function MacrosDonut({ macros, goals }) {
  const total = (macros.p || 0) * 4 + (macros.c || 0) * 4 + (macros.f || 0) * 9;
  const segments = [
    { key: 'p', label: 'Proteina', val: macros.p || 0, kcal: (macros.p || 0) * 4, color: '#1A52FF' },
    { key: 'c', label: 'Carbohidrati', val: macros.c || 0, kcal: (macros.c || 0) * 4, color: '#B45309' },
    { key: 'f', label: 'Grasimi', val: macros.f || 0, kcal: (macros.f || 0) * 9, color: '#FF4422' },
    { key: 'fib', label: 'Fibre', val: macros.fib || 0, kcal: (macros.fib || 0) * 2, color: '#15803D' },
  ];
  const r = 56, cx = 70, cy = 70, circ = 2 * Math.PI * r;
  let cumulative = 0;

  return (
    <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <svg width="140" height="140">
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--c-border)" strokeWidth="14" />
          {total > 0 && segments.map((seg, i) => {
            const pctSeg = seg.kcal / total;
            const dash = pctSeg * circ;
            const offset = -cumulative * circ - circ / 4;
            cumulative += pctSeg;
            return (
              <motion.circle key={seg.key} cx={cx} cy={cy} r={r} fill="none" stroke={seg.color} strokeWidth="14" strokeLinecap="butt"
                initial={{ strokeDasharray: `0 ${circ}` }}
                animate={{ strokeDasharray: `${dash} ${circ}` }}
                transition={{ duration: 1, delay: 0.3 + i * 0.15, ease: [0.16, 1, 0.3, 1] }}
                strokeDashoffset={offset} />
            );
          })}
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <CountUp to={macros.kcal || 0} style={{ fontFamily: 'var(--fd)', fontSize: 22, fontWeight: 900, color: 'var(--c-ink)', lineHeight: 1 }} />
          <div style={{ fontFamily: 'var(--fm)', fontSize: 8, color: 'var(--c-ink3)', letterSpacing: 1 }}>kcal / {goals?.kcal || 2000}</div>
        </div>
      </div>
      <div style={{ flex: 1, minWidth: 120, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {segments.map((seg, i) => (
          <motion.div key={seg.key} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.1, duration: 0.4 }}
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: seg.color, flexShrink: 0 }} />
            <div style={{ flex: 1, fontSize: 11, color: 'var(--c-ink2)', fontWeight: 500 }}>{seg.label}</div>
            <div style={{ fontFamily: 'var(--fm)', fontSize: 11, fontWeight: 700, color: 'var(--c-ink)' }}><CountUp to={seg.val} suffix="g" /></div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default function Overview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confetti, setConfetti] = useState(false);
  const { toast, showToast } = useToast();
  const navigate = useNavigate();

  const load = useCallback(async () => {
    try {
      const r = await getDashboard();
      setData(r.data);
      if (r.data?.workout?.progress_pct >= 100) {
        setConfetti(true);
        setTimeout(() => setConfetti(false), 2500);
      }
    } catch { showToast('Eroare la incarcarea datelor', '???'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleWater = async (cups) => { try { await setWater(cups); load(); } catch {} };
  const handleToggle = async (id) => { try { await toggleExercise(id); load(); } catch {} };

  if (loading) return (
    <AnimatedPage>
      <div className="forja-skeleton" style={{ height: 160, borderRadius: 20, marginBottom: 24 }} />
      <SkeletonGrid count={4} columns={4} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14, marginTop: 20 }}>
        <div className="forja-skeleton" style={{ height: 300, borderRadius: 16 }} />
        <div className="forja-skeleton" style={{ height: 300, borderRadius: 16 }} />
      </div>
    </AnimatedPage>
  );
  if (!data) return null;

  const { workout, exercises } = data;
  const goals = data.goals || { kcal: 2000, protein: 200, carbs: 250, fat: 70, water: 3, steps: 10000, sleep: 8 };
  const macros = data.macros || { kcal: 0, protein: 0, carbs: 0, fat: 0, p: 0, c: 0, f: 0 };

  return (
    <AnimatedPage>
      <Toast toast={toast} />
      <ConfettiBurst active={confetti} />
      <HeroCard data={data} />
      <KpiCards data={data} onWaterClick={handleWater}
        onNavNutrition={() => navigate('/app/nutrition')}
        onNavSleep={() => navigate('/app/sleep')} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14, marginBottom: 18, alignItems: 'start' }}>
        <ScrollReveal direction="left">
          <div className="card card-glow card-inner-glow">
            <div className="card-hd">
              <span className="card-hd-title">Antrenament</span>
              <div className="card-hd-right">
                <span style={{ background: (workout?.progressPct||0) >= 100 ? 'var(--c-lime-bg)' : (workout?.progressPct||0) >= 60 ? 'rgba(26,82,255,0.1)' : 'var(--c-coral-bg)', color: (workout?.progressPct||0) >= 100 ? 'var(--c-lime-d)' : (workout?.progressPct||0) >= 60 ? 'var(--c-blue)' : 'var(--c-coral)', border: '1px solid currentColor', borderRadius: 100, padding: '2px 10px', fontFamily: 'var(--fm)', fontSize: 9, fontWeight: 700, letterSpacing: 1 }}>
                  {(workout?.progressPct||0) >= 100 ? 'A+' : (workout?.progressPct||0) >= 75 ? 'A' : (workout?.progressPct||0) >= 50 ? 'B' : 'C'}
                </span>
                <button className="btn btn-sm btn-ripple" onClick={() => navigate('/app/workout')}>Ver tot</button>
              </div>
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div>
                  <div style={{ fontFamily: 'var(--fd)', fontSize: 17, fontWeight: 800 }}>{workout?.name || 'Push Day'}</div>
                  <div style={{ fontSize: 11, color: 'var(--c-ink3)', fontFamily: 'var(--fm)' }}>Ziua {workout?.day||1} / Sapt. {workout?.week||1}</div>
                </div>
                <CountUp to={workout?.progressPct || 0} suffix="%" style={{ fontFamily: 'var(--fd)', fontSize: 32, fontWeight: 900, color: 'var(--c-lime-d)' }} />
              </div>
              <AnimatedBar value={workout?.progressPct || 0} color="var(--c-lime)" glow />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 14 }}>
                {(exercises || []).slice(0, 4).map((ex, idx) => {
                  const mc = { 'Piept': 'var(--c-coral)', 'Spate': 'var(--c-blue)', 'Umeri': 'var(--c-purple)', 'Brate': 'var(--c-lime-d)', 'Picioare': 'var(--c-amber)' }[ex.muscle] || 'var(--c-ink3)';
                  return (
                    <motion.div key={ex.id}
                      initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + idx * 0.08, duration: 0.4 }}
                      whileHover={{ scale: 1.01, x: 4 }} whileTap={{ scale: 0.98 }}
                      onClick={() => handleToggle(ex.id)}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, background: ex.done ? 'var(--c-lime-bg)' : 'var(--c-bg)', border: `1px solid ${ex.done ? 'rgba(184,237,0,0.2)' : 'var(--c-border)'}`, cursor: 'pointer', borderLeft: `3px solid ${mc}` }}>
                      <span style={{ width: 40, height: 40, borderRadius: 10, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: 'var(--c-border)' }}>
                        {ex.img
                          ? <img src={ex.img} alt="" onError={e => { e.target.style.display = 'none'; }} style={{ width: '100%', height: '100%', objectFit: ex.img?.endsWith('.svg') ? 'contain' : 'cover', padding: ex.img?.endsWith('.svg') ? '4px' : '0' }} />
                          : <span style={{ fontSize: 18 }}>{ex.icon}</span>
                        }
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, textDecoration: ex.done ? 'line-through' : 'none', color: ex.done ? 'var(--c-ink3)' : 'var(--c-ink)' }}>{ex.name}</div>
                        <div style={{ fontSize: 10, color: 'var(--c-ink3)', fontFamily: 'var(--fm)' }}>{ex.sets} / {ex.detail}</div>
                      </div>
                      <motion.div
                        animate={{ scale: ex.done ? 1 : 0.85, background: ex.done ? 'var(--c-green)' : 'transparent', borderColor: ex.done ? 'var(--c-green)' : 'var(--c-border2)' }}
                        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                        style={{ width: 22, height: 22, borderRadius: '50%', border: '2px solid', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#fff', flexShrink: 0 }}>
                        {ex.done && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 12 }}>✓</motion.span>}
                      </motion.div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal direction="right">
          <div className="card card-glow card-inner-glow">
            <div className="card-hd">
              <span className="card-hd-title">Macronutrienti</span>
              <button className="btn btn-sm btn-ripple" onClick={() => navigate('/app/nutrition')}>Detalii</button>
            </div>
            <div className="card-body"><MacrosDonut macros={macros} goals={goals} /></div>
          </div>
        </ScrollReveal>
      </div>
    </AnimatedPage>
  );
}
