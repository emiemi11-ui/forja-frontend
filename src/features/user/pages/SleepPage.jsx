import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getSleep, logSleep } from '../../../shared/api/index.js';
import { pct, Toast, useToast } from '../../../shared/ui/helpers.jsx';
import { AnimatedPage, HeroSection, AnimatedRing, AnimatedBar, ScrollReveal, CountUp, StaggerGrid } from '../../../shared/ui/animations/index.jsx';

const scoreColor = s => s >= 80 ? '#15803D' : s >= 60 ? '#7B2FBE' : '#FF4422';

export default function SleepPage() {
  const [data, setData] = useState(null);
  const [bed, setBed] = useState('23:00');
  const [wake, setWake] = useState('07:00');
  const [quality, setQuality] = useState(4);
  const { toast, showToast } = useToast();

  const load = async () => {
    const r = await getSleep();
    setData(r.data);
    if (r.data.bedTime) setBed(r.data.bedTime);
    if (r.data.wakeTime) setWake(r.data.wakeTime);
  };
  useEffect(() => { load(); }, []);

  const handleLog = async () => {
    try { await logSleep(bed, wake, quality); showToast('Somn inregistrat!'); load(); }
    catch { showToast('Eroare la salvare'); }
  };

  if (!data) return (
    <AnimatedPage>
      <div className="forja-skeleton" style={{ height: 200, borderRadius: 20, marginBottom: 24 }} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="forja-skeleton" style={{ height: 300, borderRadius: 16 }} />
        <div className="forja-skeleton" style={{ height: 300, borderRadius: 16 }} />
      </div>
    </AnimatedPage>
  );

  return (
    <AnimatedPage>
      <Toast toast={toast} />

      {/* HERO */}
      <HeroSection
        imageSrc="/img/ext/u-c7f16a1548.jpg"
        accentColor="rgba(123,47,190,0.1)"
        style={{ display: 'flex', alignItems: 'center', gap: 32, minHeight: 180 }}
      >
        <AnimatedRing value={data.score} size={120} strokeWidth={8} color={scoreColor(data.score)}>
          <CountUp to={data.score} className="score-glow" style={{ fontFamily: 'var(--fd)', fontSize: 28, fontWeight: 900, color: scoreColor(data.score), lineHeight: 1 }} />
          <div style={{ fontFamily: 'var(--fm)', fontSize: 8, letterSpacing: 2, color: 'var(--hero-text3)', textTransform: 'uppercase', marginTop: 2 }}>scor</div>
        </AnimatedRing>

        <div style={{ flex: 1 }}>
          <motion.div initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <div style={{ fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: 3, color: 'var(--c-purple)', textTransform: 'uppercase', fontWeight: 700, marginBottom: 6 }}>recovery</div>
            <div style={{ fontFamily: 'var(--fd)', fontSize: 32, fontWeight: 900, color: 'var(--hero-text)', letterSpacing: 0.5, marginBottom: 16 }}>ANALIZA SOMN</div>
          </motion.div>

          <StaggerGrid style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
            {[
              { val: `${data.hours}h`, lbl: 'Durata' },
              { val: data.score >= 80 ? 'Excelent' : data.score >= 60 ? 'Moderat' : 'Slab', lbl: 'Calitate' },
              { val: data.bedTime || bed, lbl: 'Culcare' },
              { val: data.wakeTime || wake, lbl: 'Trezire' },
            ].map(s => (
              <div key={s.lbl} style={{ background: 'var(--hero-card-bg)', border: '1px solid var(--hero-card-bd)', borderRadius: 9, padding: 12 }}>
                <div style={{ fontFamily: 'var(--fd)', fontSize: 20, fontWeight: 900, color: 'var(--hero-text)', lineHeight: 1 }}>{s.val}</div>
                <div style={{ fontSize: 8, color: 'var(--hero-text3)', fontFamily: 'var(--fm)', letterSpacing: 1.5, textTransform: 'uppercase', marginTop: 3 }}>{s.lbl}</div>
              </div>
            ))}
          </StaggerGrid>
        </div>

        {/* Decorative moon */}
        <motion.img src="/img/sleep-moon.svg" alt=""
          animate={{ y: [0, -6, 0], rotate: [0, 3, -3, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          style={{ position: 'absolute', top: -10, right: 20, width: 100, height: 100, opacity: 0.3, pointerEvents: 'none' }} />
      </HeroSection>

      {data.score === 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          style={{ padding: '12px 16px', background: 'rgba(255,140,0,0.06)', border: '1px solid rgba(255,140,0,0.15)', borderRadius: 12, marginBottom: 18, fontSize: 12, color: 'var(--c-amber)', fontFamily: 'var(--fm)' }}>
          Nu ai inregistrat somn azi. Completeaza formularul de mai jos.
        </motion.div>
      )}

      <div className="sleep-layout">
        <ScrollReveal direction="left">
          <div className="card card-glow card-inner-glow" style={{ padding: 22 }}>
            <div style={{ fontFamily: 'var(--fd)', fontSize: 18, fontWeight: 800, marginBottom: 4 }}>Inregistreaza somn</div>
            <div style={{ fontSize: 12, color: 'var(--c-ink3)', marginBottom: 14 }}>Adauga noaptea trecuta</div>
            <div className="time-grid">
              <div className="time-field"><label>Culcare</label><input className="time-inp" type="time" value={bed} onChange={e => setBed(e.target.value)} /></div>
              <div className="time-field"><label>Trezire</label><input className="time-inp" type="time" value={wake} onChange={e => setWake(e.target.value)} /></div>
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--c-ink2)', marginBottom: 8 }}>Calitate perceputa</div>
            <div className="quality-stars">
              {[1,2,3,4,5].map(i => (
                <motion.span key={i} className={`qstar${i <= quality ? ' on' : ''}`}
                  whileHover={{ scale: 1.25 }} whileTap={{ scale: 0.85 }}
                  onClick={() => setQuality(i)}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill={i <= quality ? '#f5c518' : 'none'} stroke={i <= quality ? '#f5c518' : 'var(--c-border2)'} strokeWidth="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </motion.span>
              ))}
            </div>
            {data.hours > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                style={{ marginTop: 12, padding: '10px 12px', background: 'rgba(184,237,0,0.06)', border: '1px solid rgba(184,237,0,0.15)', borderRadius: 8, fontSize: 11, color: 'var(--c-lime-d)', fontFamily: 'var(--fm)' }}>
                {data.hours >= 7 ? 'Somn optim! Continua.' : data.hours >= 6 ? 'Aproape de target. Incearca 30-60 min mai mult.' : 'Somn insuficient. Prioritizeaza odihna.'}
              </motion.div>
            )}
            <motion.button className="btn btn-black btn-ripple" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              style={{ width: '100%', justifyContent: 'center', marginTop: 18 }} onClick={handleLog}>
              Salveaza somn
            </motion.button>
          </div>
        </ScrollReveal>

        <ScrollReveal direction="right">
          <div className="card card-glow card-inner-glow" style={{ padding: 18 }}>
            <div className="sec-lbl">Istoricul somnului (7 zile)</div>
            {data.history?.length === 0 ? (
              <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 3, repeat: Infinity }}
                style={{ padding: '20px 0', textAlign: 'center', color: 'var(--c-ink3)', fontSize: 13 }}>
                Nicio inregistrare. Incepe azi!
              </motion.div>
            ) : (data.history || []).map((h, i) => {
              // Safe date formatting
              let dateLabel = '';
              if (h.date) {
                try {
                  const d = new Date(h.date);
                  if (!isNaN(d.getTime())) {
                    dateLabel = d.toLocaleDateString('ro-RO', { weekday: 'short', day: 'numeric', month: 'short' });
                  } else {
                    dateLabel = String(h.date).slice(0, 10);
                  }
                } catch {
                  dateLabel = String(h.date).slice(0, 10);
                }
              } else if (h.bedTime) {
                dateLabel = h.bedTime;
              } else {
                dateLabel = `Zi ${i + 1}`;
              }
              return (
              <motion.div key={i} className="hist-row"
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.06 }}>
                <div className="hr-date">{dateLabel}</div>
                <div className="hr-score" style={{ background: scoreColor(h.score) + '20', color: scoreColor(h.score) }}>{h.score}</div>
                <div className="hr-hrs">{h.hours}h</div>
                <div className="hr-bar">
                  <motion.div className="hr-fill"
                    initial={{ width: 0 }}
                    animate={{ width: pct(h.hours, 10) + '%' }}
                    transition={{ duration: 0.8, delay: 0.2 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                    style={{ background: scoreColor(h.score) }} />
                </div>
              </motion.div>
              );
            })}
          </div>
        </ScrollReveal>
      </div>
    </AnimatedPage>
  );
}
