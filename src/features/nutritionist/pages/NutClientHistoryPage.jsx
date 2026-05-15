import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Apple, Flame, Drumstick, Wheat, ArrowLeft } from 'lucide-react';
import { getNutClientNutritionHistory7Days } from '../../../shared/api/index.js';
import { Toast, useToast } from '../../../shared/ui/helpers.jsx';
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

const kcalColor = (pctVal) => pctVal >= 80 && pctVal <= 110 ? '#15803D' : pctVal >= 50 ? '#B8ED00' : pctVal >= 1 ? '#FF4422' : 'var(--c-border2)';
const macroColor = { protein: '#1A52FF', carbs: '#B8ED00', fat: '#FF4422' };

const MEAL_TYPE_ICONS = {
  'Mic dejun': '🍳',
  'Pranz': '🍝',
  'Prânz': '🍝',
  'Cina': '🥗',
  'Cină': '🥗',
  'Gustare': '🍎',
};

export default function NutClientHistoryPage() {
  const navigate = useNavigate();
  const { id: clientId } = useParams();
  const [payload, setPayload] = useState(null);
  const { toast, showToast } = useToast();

  useEffect(() => {
    if (!clientId) return;
    getNutClientNutritionHistory7Days(clientId)
      .then((r) => setPayload(r.data || { client: null, targets: {}, days: [] }))
      .catch((err) => {
        showToast(err.response?.data?.error || 'Eroare la încărcare', '❌');
        setPayload({ client: null, targets: {}, days: [] });
      });
  }, [clientId]);

  if (!payload) {
    return (
      <AnimatedPage>
        <div className="forja-skeleton" style={{ height: 200, borderRadius: 20, marginBottom: 24 }} />
        <div className="forja-skeleton" style={{ height: 400, borderRadius: 16 }} />
      </AnimatedPage>
    );
  }

  const days = payload.days || [];
  const targets = payload.targets || { kcal: 2200, protein: 150, carbs: 250, fat: 70 };
  const client = payload.client;

  const totalMeals = days.reduce((sum, d) => sum + (d.meals || 0), 0);
  const totalKcal = days.reduce((sum, d) => sum + (d.kcal || 0), 0);
  const totalProtein = days.reduce((sum, d) => sum + (d.protein || 0), 0);
  const activeDays = days.filter((d) => d.meals > 0).length;
  const weekScore = Math.round((activeDays / 7) * 100);
  const avgKcal = activeDays > 0 ? Math.round(totalKcal / activeDays) : 0;

  return (
    <AnimatedPage>
      <Toast toast={toast} />

      <button
        onClick={() => navigate('/nutritionist/clients')}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'transparent', border: '1px solid var(--c-border)',
          borderRadius: 100, padding: '6px 14px', cursor: 'pointer',
          fontSize: 12, fontFamily: 'var(--fm)', fontWeight: 700,
          color: 'var(--c-ink2)', marginBottom: 14,
        }}
      >
        <ArrowLeft size={14} /> Înapoi la clienți
      </button>

      <HeroSection
        imageSrc="/img/ext/role-nutritionist-demo.jpg"
        accentColor="rgba(255,68,34,0.08)"
        style={{ display: 'flex', alignItems: 'center', gap: 32, minHeight: 180 }}
      >
        <AnimatedRing value={weekScore} size={120} strokeWidth={8} color={weekScore >= 70 ? '#15803D' : weekScore >= 40 ? '#B8ED00' : '#FF4422'}>
          <CountUp to={weekScore} suffix="%" className="score-glow" style={{ fontFamily: 'var(--fd)', fontSize: 26, fontWeight: 900, color: weekScore >= 70 ? '#15803D' : weekScore >= 40 ? '#B8ED00' : '#FF4422', lineHeight: 1 }} />
          <div style={{ fontFamily: 'var(--fm)', fontSize: 8, letterSpacing: 2, color: 'var(--hero-text3)', textTransform: 'uppercase', marginTop: 2 }}>tracking</div>
        </AnimatedRing>

        <div style={{ flex: 1 }}>
          <motion.div initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <div style={{ fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: 3, color: 'var(--c-coral)', textTransform: 'uppercase', fontWeight: 700, marginBottom: 6 }}>
              Client · {client?.name || '—'}
            </div>
            <div style={{ fontFamily: 'var(--fd)', fontSize: 28, fontWeight: 900, color: 'var(--hero-text)', letterSpacing: 0.5, marginBottom: 16 }}>ISTORIC NUTRIȚIE</div>
          </motion.div>

          <StaggerGrid style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
            {[
              { val: totalMeals, lbl: 'Mese', icon: <Apple size={14} />, color: 'var(--c-coral)' },
              { val: avgKcal, lbl: 'Media kcal', icon: <Flame size={14} />, color: 'var(--c-amber)' },
              { val: Math.round(totalProtein), lbl: 'Proteine (g)', icon: <Drumstick size={14} />, color: 'var(--c-blue)' },
              { val: activeDays, lbl: 'Zile active', icon: <Wheat size={14} />, color: 'var(--c-lime-d)' },
            ].map((stat) => (
              <div key={stat.lbl} style={{ background: 'var(--hero-card-bg)', border: '1px solid var(--hero-card-bd)', borderRadius: 10, padding: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 8, letterSpacing: 1.5, color: 'var(--hero-text3)', textTransform: 'uppercase', fontFamily: 'var(--fm)', fontWeight: 700, marginBottom: 4 }}>
                  <span style={{ color: stat.color }}>{stat.icon}</span>
                  {stat.lbl}
                </div>
                <div style={{ fontFamily: 'var(--fd)', fontSize: 20, fontWeight: 900, color: 'var(--hero-text)', lineHeight: 1 }}>
                  <CountUp to={stat.val} />
                </div>
              </div>
            ))}
          </StaggerGrid>
        </div>
      </HeroSection>

      <ScrollReveal direction="up">
        <div className="card" style={{ marginTop: 18, padding: '18px 22px' }}>
          <div style={{ fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: 2, color: 'var(--c-ink3)', textTransform: 'uppercase', fontWeight: 700, marginBottom: 14 }}>
            Istoricul nutriției (7 zile)
          </div>

          {days.every((d) => d.meals === 0) ? (
            <div style={{ padding: '40px 12px', textAlign: 'center' }}>
              <div style={{ fontSize: 42, marginBottom: 8 }}>🍽️</div>
              <div style={{ fontFamily: 'var(--fd)', fontSize: 16, fontWeight: 800, color: 'var(--c-ink)', marginBottom: 4 }}>
                Niciun aliment înregistrat în ultimele 7 zile
              </div>
              <div style={{ fontSize: 12, color: 'var(--c-ink3)', fontFamily: 'var(--fm)' }}>
                {client?.name || 'Clientul'} nu a logat nicio masă în această perioadă.
              </div>
            </div>
          ) : (
            <div>
              {days.map((d, i) => {
                const dayPct = targets.kcal > 0 ? Math.round((d.kcal / targets.kcal) * 100) : 0;
                const isEmpty = d.meals === 0;
                return (
                  <motion.div key={d.date}
                    className="hist-row"
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 + i * 0.05 }}
                    style={{ opacity: isEmpty ? 0.45 : 1 }}>
                    <div className="hr-date">{dayLabel(d.iso)}</div>
                    <div className="hr-score" style={{
                      background: isEmpty ? 'var(--c-bg)' : kcalColor(dayPct) + '20',
                      color: isEmpty ? 'var(--c-ink3)' : kcalColor(dayPct),
                    }}>
                      {isEmpty ? '—' : d.meals}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, minWidth: 0 }}>
                      {isEmpty ? (
                        <div style={{ fontSize: 11, color: 'var(--c-ink3)', fontFamily: 'var(--fm)' }}>Fără înregistrări</div>
                      ) : (
                        <>
                          <div style={{ display: 'flex', gap: 10, fontSize: 10, fontFamily: 'var(--fm)', color: 'var(--c-ink3)', letterSpacing: 0.5, flexWrap: 'wrap' }}>
                            <span><strong style={{ color: 'var(--c-ink2)' }}>{Math.round(d.kcal)}</strong>/{targets.kcal} kcal</span>
                            <span><strong style={{ color: macroColor.protein }}>{Math.round(d.protein)}g</strong> P</span>
                            <span><strong style={{ color: macroColor.carbs }}>{Math.round(d.carbs)}g</strong> C</span>
                            <span><strong style={{ color: macroColor.fat }}>{Math.round(d.fat)}g</strong> G</span>
                          </div>
                          <div style={{ height: 4, background: 'var(--c-border)', borderRadius: 2, overflow: 'hidden' }}>
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(100, dayPct)}%` }}
                              transition={{ duration: 0.8, delay: 0.15 + i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                              style={{ height: '100%', background: kcalColor(dayPct), borderRadius: 2 }}
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

      {days.some((d) => d.meals > 0) && (
        <ScrollReveal direction="up">
          <div style={{ marginTop: 18 }}>
            <div style={{ fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: 2, color: 'var(--c-ink3)', textTransform: 'uppercase', fontWeight: 700, marginBottom: 10, paddingLeft: 4 }}>
              Detalii mese
            </div>
            {days.slice().reverse().filter((d) => d.meals > 0).map((d, i) => {
              const byType = {};
              for (const m of (d.mealList || [])) {
                const t = m.mealType || 'Masă';
                if (!byType[t]) byType[t] = [];
                byType[t].push(m);
              }
              return (
                <motion.div key={d.date} className="card"
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 + i * 0.05 }}
                  style={{ padding: '14px 18px', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <div style={{ fontFamily: 'var(--fd)', fontSize: 14, fontWeight: 800, color: 'var(--c-ink)' }}>
                      {dayLabel(d.iso)}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--c-ink3)', fontFamily: 'var(--fm)' }}>
                      {d.meals} {d.meals === 1 ? 'aliment' : 'alimente'} · {Math.round(d.kcal)} kcal
                    </div>
                  </div>
                  {Object.entries(byType).map(([type, items]) => {
                    const typeKcal = items.reduce((s, m) => s + m.kcal, 0);
                    return (
                      <div key={type} style={{ background: 'var(--c-bg)', borderRadius: 10, padding: '10px 12px', marginBottom: 6 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--c-ink)' }}>
                            <span style={{ marginRight: 6 }}>{MEAL_TYPE_ICONS[type] || '🍴'}</span>
                            {type}
                          </div>
                          <span style={{ fontSize: 10, fontFamily: 'var(--fm)', color: 'var(--c-coral)', fontWeight: 700 }}>
                            {typeKcal} kcal
                          </span>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {items.map((m, idx) => (
                            <span key={idx} style={{
                              fontSize: 10, fontFamily: 'var(--fm)', padding: '3px 8px', borderRadius: 100,
                              background: 'var(--c-border)', color: 'var(--c-ink2)', fontWeight: 600,
                            }}>
                              {m.foodName} · {m.kcal}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </motion.div>
              );
            })}
          </div>
        </ScrollReveal>
      )}
    </AnimatedPage>
  );
}
