import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Flame, Award, Zap } from 'lucide-react';
import { getAchievements } from '../../../shared/api/index.js';
import { AnimatedPage, StaggerGrid, ScrollReveal, CountUp, AnimatedBar, ConfettiBurst, TiltCard } from '../../../shared/ui/animations/index.jsx';

const BADGE_CATALOG = [
  { id: 'b1', name: '7 Zile Streak', img: '/img/badge-streak-7.svg', desc: 'Antrenament 7 zile consecutive' },
  { id: 'b2', name: '30 Zile Streak', img: '/img/badge-streak-30.svg', desc: 'Antrenament 30 zile consecutive' },
  { id: 'b3', name: 'Primul Antrenament', img: '/img/badge-first-workout.svg', desc: 'Ai completat primul antrenament' },
  { id: 'b4', name: '100 Exercitii', img: '/img/badge-100-exercises.svg', desc: '100 exercitii completate total' },
  { id: 'b5', name: 'Lider Echipa', img: '/img/badge-team-leader.svg', desc: 'Fii #1 in clasamentul echipei' },
  { id: 'b6', name: 'Nutritie Master', img: '/img/badge-nutrition-master.svg', desc: '30 zile de logging complet' },
  { id: 'b7', name: 'Somn Pro', img: '/img/badge-sleep-pro.svg', desc: 'Scor somn >85 timp de 14 zile' },
  { id: 'b8', name: 'Maratonist', img: '/img/badge-marathon.svg', desc: '42.195 pasi intr-o singura zi' },
  { id: 'b9', name: 'Consistenta', img: '/img/badge-consistency.svg', desc: 'Antrenament regulat 3 luni' },
  { id: 'b10', name: 'Early Bird', img: '/img/badge-early-bird.svg', desc: '10 antrenamente inainte de 7:00' },
].map((badge) => ({ ...badge, earned: false, date: null }));

export default function AchievementsPage() {
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('all');
  const [showConfetti, setShowConfetti] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [badges, setBadges] = useState(BADGE_CATALOG);
  const [stats, setStats] = useState({ workouts: 0, streak: 0, earned: 0, xp: 0 });

  useEffect(() => {
    let mounted = true;
    getAchievements()
      .then(({ data }) => {
        if (!mounted) return;
        const apiMap = new Map((data?.badges || []).map((badge) => [badge.id, badge]));
        setBadges(BADGE_CATALOG.map((badge) => ({ ...badge, ...(apiMap.get(badge.id) || {}) })));
        setStats({
          workouts: Number(data?.stats?.workouts || 0),
          streak: Number(data?.stats?.streak || 0),
          earned: Number(data?.stats?.earned || 0),
          xp: Number(data?.stats?.xp || 0),
        });
        setError('');
      })
      .catch((err) => {
        if (!mounted) return;
        setBadges(BADGE_CATALOG);
        setStats({ workouts: 0, streak: 0, earned: 0, xp: 0 });
        setError(err.response?.data?.error || 'Nu am putut încărca realizările.');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  const earned = useMemo(() => badges.filter((badge) => badge.earned).length, [badges]);
  const filtered = useMemo(() => (
    filter === 'all' ? badges : filter === 'earned' ? badges.filter((badge) => badge.earned) : badges.filter((badge) => !badge.earned)
  ), [badges, filter]);

  const statsCards = [
    { val: stats.workouts, label: 'Antrenamente', icon: <Zap size={20} />, color: '#c5f135' },
    { val: stats.streak, label: 'Streak curent', icon: <Flame size={20} />, color: '#ff4d1c' },
    { val: stats.earned, label: 'Badge-uri', icon: <Award size={20} />, color: '#f5c518', suffix: `/${badges.length}` },
    { val: stats.xp, label: 'XP Total', icon: <Star size={20} />, color: '#1a56ff' },
  ];

  const handleBadgeClick = (badge) => {
    setSelected(badge);
    if (badge.earned) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
    }
  };

  return (
    <AnimatedPage>
      <ConfettiBurst active={showConfetti} count={25} />

      <motion.img
        src="/img/confetti.svg" alt=""
        initial={{ opacity: 0 }} animate={{ opacity: 0.3 }}
        transition={{ duration: 1 }}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, width: '100%', height: 200, objectFit: 'cover', pointerEvents: 'none' }}
      />

      <motion.div
        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        style={{ position: 'relative', zIndex: 1, marginBottom: 24 }}
      >
        <div style={{ fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--c-lime-d)', fontWeight: 700 }}>realizari</div>
        <h1 style={{ fontFamily: 'var(--fd)', fontSize: 32, fontWeight: 900, letterSpacing: 0.5, color: 'var(--c-ink)', lineHeight: 1, margin: '4px 0 0' }}>BADGE-URI & PROGRES</h1>
      </motion.div>

      {error && (
        <div className="card" style={{ padding: 16, marginBottom: 18, color: 'var(--c-coral)', fontSize: 13 }}>
          {error}
        </div>
      )}

      <StaggerGrid style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 24 }}>
        {statsCards.map((s) => (
          <TiltCard key={s.label} intensity={5}>
            <div className="card card-inner-glow" style={{ padding: '16px 14px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: -20, right: -20, width: 60, height: 60, borderRadius: '50%', background: `${s.color}10` }} />
              <motion.div
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: Math.random() }}
                style={{ color: s.color, marginBottom: 6, opacity: 0.8 }}
              >{s.icon}</motion.div>
              <div style={{ fontFamily: 'var(--fd)', fontSize: 28, fontWeight: 900, color: 'var(--c-ink)' }}>
                {loading ? '...' : <><CountUp to={s.val} />{s.suffix || ''}</>}
              </div>
              <div style={{ fontFamily: 'var(--fm)', fontSize: 9, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--c-ink3)', marginTop: 2 }}>{s.label}</div>
            </div>
          </TiltCard>
        ))}
      </StaggerGrid>

      <ScrollReveal>
        <div className="card card-glow" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 }}>
          <motion.img
            src="/img/trophy.svg" alt=""
            animate={{ rotate: [0, -5, 5, 0], scale: [1, 1.05, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            style={{ width: 70, height: 70 }}
          />
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--fd)', fontSize: 20, fontWeight: 800, marginBottom: 4 }}>Progres Badge-uri</div>
            <div style={{ fontFamily: 'var(--fm)', fontSize: 12, color: 'var(--c-ink3)', marginBottom: 8 }}>
              {loading ? 'Se încarcă...' : `${earned} din ${badges.length} obținute / ${Math.round((earned / Math.max(1, badges.length)) * 100)}% completat`}
            </div>
            <AnimatedBar value={earned} max={badges.length} height={8} color="linear-gradient(90deg, #c5f135, #f5c518)" />
          </div>
        </div>
      </ScrollReveal>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {[['all', 'Toate'], ['earned', 'Obtinute'], ['locked', 'De obtinut']].map(([key, label]) => (
          <motion.button key={key} className={`chip${filter === key ? ' on' : ''}`}
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => setFilter(key)}>{label}</motion.button>
        ))}
      </motion.div>

      {loading ? (
        <div className="card" style={{ padding: 28, textAlign: 'center' }}><div className="spinner" /></div>
      ) : (
        <StaggerGrid style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 14 }}>
          {filtered.map((badge) => (
            <motion.div key={badge.id}
              className={`card ${badge.earned ? 'badge-glow earned' : ''}`}
              onClick={() => handleBadgeClick(badge)}
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.95 }}
              style={{
                padding: 0, textAlign: 'center', cursor: 'pointer',
                opacity: badge.earned ? 1 : 0.4,
                filter: badge.earned ? 'none' : 'grayscale(0.8)',
              }}>
              <img src={badge.img} alt={badge.name} style={{ width: '100%', height: 'auto', display: 'block' }} />
            </motion.div>
          ))}
        </StaggerGrid>
      )}

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}
            onClick={() => setSelected(null)}
          >
            <motion.div
              className="card"
              initial={{ scale: 0.8, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 30 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              style={{ maxWidth: 320, width: '90%', padding: 32, textAlign: 'center' }}
              onClick={(e) => e.stopPropagation()}
            >
              <motion.img
                src={selected.img} alt=""
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
                style={{ width: 120, height: 'auto', margin: '0 auto 16px' }}
              />
              <div style={{ fontFamily: 'var(--fd)', fontSize: 22, fontWeight: 900, marginBottom: 4 }}>{selected.name}</div>
              <div style={{ fontFamily: 'var(--fb)', fontSize: 13, color: 'var(--c-ink3)', marginBottom: 12 }}>{selected.desc}</div>
              {selected.earned ? (
                <div className="tag tag-lime" style={{ display: 'inline-flex' }}>Obținut / {selected.date}</div>
              ) : (
                <div className="tag" style={{ display: 'inline-flex', background: 'var(--c-border)', color: 'var(--c-ink3)' }}>De obținut</div>
              )}
              <motion.button className="btn btn-outline btn-ripple"
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                style={{ width: '100%', marginTop: 16, justifyContent: 'center' }}
                onClick={() => setSelected(null)}>Inchide</motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatedPage>
  );
}
