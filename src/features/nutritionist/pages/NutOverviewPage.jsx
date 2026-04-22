import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { getNutOverview, getNutClients, getNutTemplates } from '../../../shared/api/index.js';
import { useNavigate } from 'react-router-dom';
import { AnimatedPage, HeroSection, StaggerGrid, ScrollReveal, CountUp, TiltCard } from '../../../shared/ui/animations/index.jsx';
import { Users, FileText, TrendingUp, DollarSign } from 'lucide-react';

const clientCompliance = [
  { name: 'Excelent', value: 35, color: '#22C55E' },
  { name: 'Bun', value: 40, color: '#3B6FFF' },
  { name: 'Moderat', value: 18, color: '#D97706' },
  { name: 'Slab', value: 7, color: '#FF5533' },
];
const monthlyRevenue = [
  { month: 'Ian', val: 980 }, { month: 'Feb', val: 1120 }, { month: 'Mar', val: 1350 },
  { month: 'Apr', val: 1680 }, { month: 'Mai', val: 1520 }, { month: 'Iun', val: 1850 },
];

export default function NutOverviewPage() {
  const [overview, setOverview] = useState(null);
  const [clients, setClients] = useState([]);
  const [templates, setTemplates] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getNutOverview().then(r => setOverview(r.data));
    getNutClients().then(r => setClients(r.data));
    getNutTemplates().then(r => setTemplates(r.data));
  }, []);

  if (!overview) return (
    <AnimatedPage>
      <div className="forja-skeleton" style={{ height: 150, borderRadius: 20, marginBottom: 24 }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 24 }}>
        {[1,2,3].map(i => <div key={i} className="forja-skeleton" style={{ height: 100, borderRadius: 16 }} />)}
      </div>
    </AnimatedPage>
  );

  const monthlyIncome = Number(overview.revenue || overview.kpis?.revenue || 0);
  const complianceBuckets = clients.reduce((acc, client) => {
    const compliance = Number(client.compliance || 0);
    if (compliance >= 90) acc.excelent += 1;
    else if (compliance >= 70) acc.bun += 1;
    else if (compliance >= 40) acc.moderat += 1;
    else acc.slab += 1;
    return acc;
  }, { excelent: 0, bun: 0, moderat: 0, slab: 0 });
  const complianceTotal = Math.max(1, clients.length);
  const clientCompliance = [
    { name: 'Excelent', value: Math.round((complianceBuckets.excelent / complianceTotal) * 100), color: '#22C55E' },
    { name: 'Bun', value: Math.round((complianceBuckets.bun / complianceTotal) * 100), color: '#3B6FFF' },
    { name: 'Moderat', value: Math.round((complianceBuckets.moderat / complianceTotal) * 100), color: '#D97706' },
    { name: 'Slab', value: Math.round((complianceBuckets.slab / complianceTotal) * 100), color: '#FF5533' },
  ];
  const revenueSeries = Array.isArray(overview.revenueChart) && overview.revenueChart.length
    ? overview.revenueChart
    : [{ month: 'Acum', val: monthlyIncome }];

  return (
    <AnimatedPage>
      <HeroSection
        imageSrc="/img/ext/role-nutritionist-demo.jpg"
        accentColor="rgba(123,47,190,0.08)"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: 130 }}
      >
        <div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            style={{ fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: 3, color: 'var(--hero-text2)', textTransform: 'uppercase', marginBottom: 6 }}>
            nutrition desk
          </motion.div>
          <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
            style={{ fontFamily: 'var(--fd)', fontSize: 32, fontWeight: 900, color: 'var(--hero-text)', lineHeight: 1.05, marginBottom: 8 }}>
            Bun venit, {overview.nutritionistName}!
          </motion.h1>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            style={{ fontSize: 13, color: 'var(--hero-text2)' }}>
            {new Date().toLocaleDateString('ro-RO', { weekday: 'long', day: 'numeric', month: 'long' })}
          </motion.div>
        </div>
      </HeroSection>

      <StaggerGrid style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { icon: <Users size={20} />, val: overview.total_clients, label: 'Clienti', color: 'var(--c-lime-d)', onClick: () => navigate('/nutritionist/clients') },
          { icon: <FileText size={20} />, val: overview.plans_created, label: 'Template-uri', color: 'var(--c-blue)', onClick: () => navigate('/nutritionist/templates') },
          { icon: <DollarSign size={20} />, val: monthlyIncome, label: 'Venit luna', color: 'var(--c-green)', suffix: ' lei' },
        ].map((k, i) => (
          <TiltCard key={i} intensity={4}>
            <div className="card card-inner-glow" style={{ padding: '18px 16px', cursor: k.onClick ? 'pointer' : 'default', position: 'relative', overflow: 'hidden', textAlign: 'center' }}
              onClick={k.onClick}>
              <div style={{ color: k.color, marginBottom: 8, opacity: 0.7 }}>{k.icon}</div>
              <div style={{ fontFamily: 'var(--fd)', fontSize: 32, fontWeight: 900, color: k.color }}>
                <CountUp to={k.val} suffix={k.suffix || ''} />
              </div>
              <div style={{ fontFamily: 'var(--fm)', fontSize: 9, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--c-ink3)', marginTop: 2 }}>{k.label}</div>
            </div>
          </TiltCard>
        ))}
      </StaggerGrid>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        <ScrollReveal direction="left">
          <div className="card card-glow" style={{ padding: 20 }}>
            <div style={{ fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--c-ink3)', marginBottom: 16 }}>Compliance clienti</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <ResponsiveContainer width={120} height={120}>
                <PieChart>
                  <Pie data={clientCompliance} cx="50%" cy="50%" innerRadius={35} outerRadius={55} paddingAngle={3} dataKey="value"
                    animationDuration={1200} animationEasing="ease-out">
                    {clientCompliance.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                {clientCompliance.map(c => (
                  <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: c.color, flexShrink: 0 }} />
                    <div style={{ flex: 1, fontSize: 11, color: 'var(--c-ink2)' }}>{c.name}</div>
                    <div style={{ fontFamily: 'var(--fm)', fontSize: 11, fontWeight: 700 }}>{c.value}%</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal direction="right">
          <div className="card card-glow" style={{ padding: 20 }}>
            <div style={{ fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--c-ink3)', marginBottom: 16 }}>Venit curent (lei)</div>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={revenueSeries}>
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'var(--c-ink3)' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)', borderRadius: 8, fontSize: 12 }}
                  formatter={(v) => [`${v} lei`, 'Venit']} />
                <Bar dataKey="val" fill="var(--c-purple)" radius={[4, 4, 0, 0]} animationDuration={1200} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ScrollReveal>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <ScrollReveal>
          <div className="card card-glow card-inner-glow" style={{ padding: 20 }}>
            <div style={{ fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--c-ink3)', marginBottom: 14 }}>Clientii tai</div>
            {clients.slice(0, 4).map((c, i) => (
              <motion.div key={c.id}
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.06 }}
                whileHover={{ x: 4 }}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 4px', borderBottom: '1px solid var(--c-border)', cursor: 'pointer', borderRadius: 6 }}
                onClick={() => navigate('/nutritionist/clients')}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: c.col, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, color: 'var(--hero-text)', fontFamily: 'var(--fd)', flexShrink: 0 }}>{c.av}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{c.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--c-ink3)' }}>{c.notes ? c.notes.slice(0, 35) + '...' : ''}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'var(--fd)', fontSize: 16, fontWeight: 900, color: c.kcal_today > 0 ? 'var(--c-lime-d)' : 'var(--c-ink3)' }}>{c.kcal_today}</div>
                  <div style={{ fontSize: 9, color: 'var(--c-ink3)', fontFamily: 'var(--fm)' }}>/{c.kcal_target} kcal</div>
                </div>
              </motion.div>
            ))}
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="card card-glow card-inner-glow" style={{ padding: 20 }}>
            <div style={{ fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--c-ink3)', marginBottom: 14 }}>Template-uri nutritie</div>
            {templates.slice(0, 4).map((t, i) => (
              <motion.div key={t.id}
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.06 }}
                whileHover={{ x: 4 }}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 4px', borderBottom: '1px solid var(--c-border)', cursor: 'pointer', borderRadius: 6 }}
                onClick={() => navigate('/nutritionist/templates')}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--c-blue-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}><FileText size={16} /></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{t.name || t.nm}</div>
                  <div style={{ fontSize: 11, color: 'var(--c-ink3)' }}>{t.kcal} kcal / {t.clients} clienti</div>
                </div>
              </motion.div>
            ))}
            <motion.button className="btn btn-lime btn-ripple" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              style={{ width: '100%', justifyContent: 'center', marginTop: 12 }}
              onClick={() => navigate('/nutritionist/templates')}>
              + Creeaza template nou
            </motion.button>
          </div>
        </ScrollReveal>
      </div>
    </AnimatedPage>
  );
}
