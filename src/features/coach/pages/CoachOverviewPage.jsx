import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { getCoachTeam, getCoachAthletes, getCoachWorkouts } from '../../../shared/api/index.js';
import { useNavigate } from 'react-router-dom';
import { AnimatedPage, HeroSection, StaggerGrid, ScrollReveal, CountUp, TiltCard, AnimatedBar } from '../../../shared/ui/animations/index.jsx';
import { Users, Dumbbell, TrendingUp, DollarSign } from 'lucide-react';

// Mock weekly data for charts
const weeklyCompliance = [
  { day: 'Lun', val: 72 }, { day: 'Mar', val: 85 }, { day: 'Mie', val: 68 },
  { day: 'Joi', val: 91 }, { day: 'Vin', val: 78 }, { day: 'Sam', val: 55 }, { day: 'Dum', val: 42 },
];
const monthlyRevenue = [
  { month: 'Ian', val: 1200 }, { month: 'Feb', val: 1450 }, { month: 'Mar', val: 1680 },
  { month: 'Apr', val: 1960 }, { month: 'Mai', val: 1820 }, { month: 'Iun', val: 2100 },
];

export default function CoachOverviewPage() {
  const [team, setTeam] = useState(null);
  const [athletes, setAthletes] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getCoachTeam().then(r => setTeam(r.data));
    getCoachAthletes().then(r => setAthletes(r.data));
    getCoachWorkouts().then(r => setWorkouts(r.data));
  }, []);

  const accepted = athletes.filter(a => a.inviteStatus === 'ACCEPTED');
  const pending = athletes.filter(a => a.inviteStatus === 'PENDING');
  const avgCompliance = accepted.length
    ? Math.round(accepted.reduce((sum, athlete) => sum + Number(athlete.compliance || 0), 0) / accepted.length)
    : Math.round(Number(team?.compliance_week || 0));
  const coachRevenue = Number(team?.revenue || accepted.length * 149 || 0);
  const complianceSeries = accepted.length
    ? accepted.slice(0, 7).map((athlete, index) => ({
        day: (athlete.name || `A${index + 1}`).split(' ')[0],
        val: Number(athlete.compliance || 0),
      }))
    : [{ day: 'Acum', val: avgCompliance }];
  const revenueSeries = [{ month: 'Acum', val: coachRevenue }];

  return (
    <AnimatedPage>
      {/* HERO */}
      <HeroSection
        imageSrc="/img/ext/role-coach-demo.jpg"
        accentColor="rgba(26,82,255,0.08)"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: 140 }}
      >
        <div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            style={{ fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: 3, color: 'var(--hero-text2)', textTransform: 'uppercase', marginBottom: 6 }}>
            coach dashboard
          </motion.div>
          <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
            style={{ fontFamily: 'var(--fd)', fontSize: 34, fontWeight: 900, color: 'var(--hero-text)', lineHeight: 1.05, marginBottom: 10 }}>
            Bun venit, {team?.coachName || 'Coach'}!
          </motion.h1>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            style={{ fontSize: 13, color: 'var(--hero-text2)' }}>
            {new Date().toLocaleDateString('ro-RO', { weekday: 'long', day: 'numeric', month: 'long' })}
          </motion.div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ background: 'var(--hero-card-bg)', borderRadius: 12, padding: '14px 18px', textAlign: 'center', border: '1px solid var(--hero-card-bd)' }}>
            <div style={{ fontFamily: 'var(--fd)', fontSize: 28, fontWeight: 900, color: 'var(--c-lime)' }}><CountUp to={avgCompliance} suffix="%" /></div>
            <div style={{ fontFamily: 'var(--fm)', fontSize: 8, letterSpacing: 1.5, color: 'var(--hero-text3)', textTransform: 'uppercase' }}>compliance</div>
          </div>
        </div>
      </HeroSection>

      {/* KPI CARDS */}
      <StaggerGrid style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 24 }}>
        {[
          { icon: <Users size={20} />, val: accepted.length, label: 'Atleti activi', color: 'var(--c-lime-d)', extra: pending.length > 0 ? `+${pending.length} pending` : null, onClick: () => navigate('/coach/athletes') },
          { icon: <Dumbbell size={20} />, val: workouts.length, label: 'Planuri create', color: 'var(--c-blue)', onClick: () => navigate('/coach/workouts') },
          { icon: <TrendingUp size={20} />, val: avgCompliance, label: 'Compliance mediu', color: 'var(--c-green)', suffix: '%' },
          { icon: <DollarSign size={20} />, val: coachRevenue, label: 'Venit luna', color: 'var(--c-coral)', suffix: ' lei' },
        ].map((k, i) => (
          <TiltCard key={i} intensity={4}>
            <div className="card card-inner-glow" style={{ padding: '18px 16px', cursor: k.onClick ? 'pointer' : 'default', position: 'relative', overflow: 'hidden' }}
              onClick={k.onClick}>
              <div style={{ position: 'absolute', top: -15, right: -15, width: 50, height: 50, borderRadius: '50%', background: `${k.color}15` }} />
              <div style={{ color: k.color, marginBottom: 8, opacity: 0.7 }}>{k.icon}</div>
              <div style={{ fontFamily: 'var(--fd)', fontSize: 32, fontWeight: 900, color: k.color }}>
                <CountUp to={k.val} suffix={k.suffix || ''} />
              </div>
              <div style={{ fontFamily: 'var(--fm)', fontSize: 9, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--c-ink3)', marginTop: 2 }}>{k.label}</div>
              {k.extra && <div style={{ fontSize: 10, color: 'var(--c-amber)', marginTop: 4 }}>{k.extra}</div>}
            </div>
          </TiltCard>
        ))}
      </StaggerGrid>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 20 }}>
        {/* COMPLIANCE CHART */}
        <ScrollReveal direction="left">
          <div className="card card-glow" style={{ padding: 20 }}>
            <div style={{ fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--c-ink3)', marginBottom: 16 }}>Compliance atleți activi</div>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={complianceSeries}>
                <defs>
                  <linearGradient id="compGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#B8ED00" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#B8ED00" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: 'var(--c-ink3)' }} axisLine={false} tickLine={false} />
                <YAxis hide domain={[0, 100]} />
                <Tooltip contentStyle={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)', borderRadius: 8, fontSize: 12 }}
                  formatter={(v) => [`${v}%`, 'Compliance']} />
                <Area type="monotone" dataKey="val" stroke="#B8ED00" strokeWidth={2.5} fill="url(#compGrad)"
                  animationDuration={1200} animationEasing="ease-out" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ScrollReveal>

        {/* REVENUE CHART */}
        <ScrollReveal direction="right">
          <div className="card card-glow" style={{ padding: 20 }}>
            <div style={{ fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--c-ink3)', marginBottom: 16 }}>Venit curent (lei)</div>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={revenueSeries}>
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'var(--c-ink3)' }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip contentStyle={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)', borderRadius: 8, fontSize: 12 }}
                  formatter={(v) => [`${v} lei`, 'Venit']} />
                <Bar dataKey="val" fill="var(--c-blue)" radius={[4, 4, 0, 0]}
                  animationDuration={1200} animationEasing="ease-out" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ScrollReveal>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        {/* Recent athlete activity */}
        <ScrollReveal>
          <div className="card card-glow card-inner-glow" style={{ padding: 20 }}>
            <div style={{ fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--c-ink3)', marginBottom: 14 }}>Atletii tai azi</div>
            {accepted.slice(0, 4).map((a, i) => (
              <motion.div key={a.id}
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.06 }}
                whileHover={{ x: 4, background: 'var(--c-bg)' }}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 4px', borderBottom: '1px solid var(--c-border)', cursor: 'pointer', borderRadius: 6, transition: 'background 0.2s' }}
                onClick={() => navigate('/coach/athletes')}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: a.col, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, color: 'var(--hero-text)', fontFamily: 'var(--fd)', flexShrink: 0 }}>{a.av}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{a.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--c-ink3)' }}>{a.plan} / {a.weight}kg</div>
                </div>
                <div style={{ fontSize: 16 }}>{a.trend === 'up' ? '📈' : (a.trend === 'down' || a.trend === 'dn') ? '📉' : '➡️'}</div>
              </motion.div>
            ))}
          </div>
        </ScrollReveal>

        {/* Workout plans */}
        <ScrollReveal delay={0.1}>
          <div className="card card-glow card-inner-glow" style={{ padding: 20 }}>
            <div style={{ fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--c-ink3)', marginBottom: 14 }}>Planuri antrenament</div>
            {workouts.slice(0, 4).map((w, i) => (
              <motion.div key={w.id}
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.06 }}
                whileHover={{ x: 4 }}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 4px', borderBottom: '1px solid var(--c-border)', cursor: 'pointer', borderRadius: 6 }}
                onClick={() => navigate('/coach/workouts')}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--c-lime-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>
                  <Dumbbell size={16} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{w.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--c-ink3)' }}>{w.exercises} exercitii / {w.assigned} atleti</div>
                </div>
                <span className="tag tag-lime" style={{ fontSize: 9 }}>{w.category}</span>
              </motion.div>
            ))}
            <motion.button className="btn btn-lime btn-ripple" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              style={{ width: '100%', justifyContent: 'center', marginTop: 12 }}
              onClick={() => navigate('/coach/workouts')}>
              + Creeaza plan nou
            </motion.button>
          </div>
        </ScrollReveal>
      </div>
    </AnimatedPage>
  );
}
