import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MESSAGES = [
  'Initializare sistem...',
  'Incarcare module...',
  'Conectare servicii...',
  'Pregatire dashboard...',
  'Aproape gata...',
];

export default function SplashScreen({ onDone }) {
  const [progress, setProgress] = useState(0);
  const [show, setShow] = useState(true);
  const [msgIdx, setMsgIdx] = useState(0);

  useEffect(() => {
    const dur = 2200;
    const start = Date.now();
    const frame = () => {
      const p = Math.min((Date.now() - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setProgress(Math.round(eased * 100));
      setMsgIdx(Math.min(Math.floor(eased * MESSAGES.length), MESSAGES.length - 1));
      if (p < 1) requestAnimationFrame(frame);
      else setTimeout(() => { setShow(false); onDone?.(); }, 500);
    };
    requestAnimationFrame(frame);
  }, []);

  if (!show) return null;

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: progress >= 100 ? 0 : 1 }}
      transition={{ duration: 0.5 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 99999,
        background: 'var(--c-ink)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}
    >
      {/* Ambient gradient mesh */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        <motion.div
          animate={{ x: [0, 30, -20, 0], y: [0, -20, 30, 0], scale: [1, 1.1, 0.9, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          style={{ position: 'absolute', top: '20%', left: '30%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(197,241,53,0.06), transparent 70%)', filter: 'blur(60px)' }}
        />
        <motion.div
          animate={{ x: [0, -25, 15, 0], y: [0, 25, -15, 0], scale: [1, 0.95, 1.05, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          style={{ position: 'absolute', bottom: '20%', right: '30%', width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle, rgba(26,86,255,0.05), transparent 70%)', filter: 'blur(60px)' }}
        />
      </div>

      {/* Animated rings */}
      <div style={{ position: 'relative', width: 160, height: 160, marginBottom: 40 }}>
        {/* Outer ring */}
        <motion.svg viewBox="0 0 160 160" style={{ position: 'absolute', inset: 0 }}
          animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}>
          <circle cx="80" cy="80" r="70" fill="none" stroke="rgba(197,241,53,0.08)" strokeWidth="2" />
          <motion.circle cx="80" cy="80" r="70" fill="none" stroke="#c5f135" strokeWidth="2.5"
            strokeLinecap="round"
            initial={{ strokeDasharray: '0 440' }}
            animate={{ strokeDasharray: `${progress * 4.4} 440` }}
            style={{ filter: 'drop-shadow(0 0 10px rgba(197,241,53,0.5))' }} />
        </motion.svg>

        {/* Middle ring */}
        <motion.svg viewBox="0 0 160 160" style={{ position: 'absolute', inset: 0 }}
          animate={{ rotate: -360 }} transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}>
          <circle cx="80" cy="80" r="55" fill="none" stroke="rgba(26,82,255,0.06)" strokeWidth="1.5" />
          <motion.circle cx="80" cy="80" r="55" fill="none" stroke="#1a56ff" strokeWidth="1.5"
            strokeLinecap="round" opacity="0.6"
            initial={{ strokeDasharray: '0 350' }}
            animate={{ strokeDasharray: `${progress * 3.5} 350` }} />
        </motion.svg>

        {/* Inner ring */}
        <motion.svg viewBox="0 0 160 160" style={{ position: 'absolute', inset: 0 }}
          animate={{ rotate: 360 }} transition={{ duration: 7, repeat: Infinity, ease: 'linear' }}>
          <circle cx="80" cy="80" r="40" fill="none" stroke="rgba(255,77,28,0.05)" strokeWidth="1" />
          <motion.circle cx="80" cy="80" r="40" fill="none" stroke="#ff4d1c" strokeWidth="1"
            strokeLinecap="round" opacity="0.4"
            initial={{ strokeDasharray: '0 250' }}
            animate={{ strokeDasharray: `${progress * 2.5} 250` }} />
        </motion.svg>

        {/* Center icon */}
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <img src="/img/dumbbell-anim.svg" alt="" style={{ width: 50, height: 50 }} />
        </motion.div>
      </div>

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: 48, fontWeight: 900, letterSpacing: 8,
          background: 'linear-gradient(135deg, #c5f135, #1a56ff)',
          WebkitBackgroundClip: 'text', backgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: 20,
        }}
      >
        FORJA
      </motion.div>

      {/* Progress bar */}
      <div style={{ width: 220, height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden', marginBottom: 14 }}>
        <motion.div style={{
          height: '100%', borderRadius: 2,
          background: 'linear-gradient(90deg, #c5f135, #1a56ff)',
          boxShadow: '0 0 12px rgba(197,241,53,0.4)',
        }}
          initial={{ width: '0%' }}
          animate={{ width: `${progress}%` }}
        />
      </div>

      {/* Animated message */}
      <AnimatePresence mode="wait">
        <motion.div
          key={msgIdx}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 11, letterSpacing: 3, color: 'rgba(255,255,255,0.25)',
            textTransform: 'uppercase',
          }}
        >
          {MESSAGES[msgIdx]}
        </motion.div>
      </AnimatePresence>

      {/* Percentage */}
      <motion.div style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 10, color: 'rgba(255,255,255,0.15)',
        marginTop: 8, letterSpacing: 2,
      }}>
        {progress}%
      </motion.div>
    </motion.div>
  );
}
