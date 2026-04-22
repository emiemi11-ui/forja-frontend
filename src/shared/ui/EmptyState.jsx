import { motion } from 'framer-motion';

const ILLUSTRATIONS = {
  workout: (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
      <motion.circle cx="40" cy="40" r="36" stroke="var(--c-lime)" strokeWidth="2" strokeDasharray="6 4" opacity="0.3"
        animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }} />
      <motion.path d="M24 40h32M28 32v16M52 32v16M32 36v8M48 36v8" stroke="var(--c-lime)" strokeWidth="3" strokeLinecap="round"
        animate={{ scale: [1, 1.03, 1] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }} />
    </svg>
  ),
  nutrition: (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
      <motion.circle cx="40" cy="40" r="36" stroke="var(--c-coral)" strokeWidth="2" strokeDasharray="6 4" opacity="0.3"
        animate={{ rotate: -360 }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }} />
      <motion.path d="M40 20v12M36 24h8M30 38c0-6 4-10 10-10s10 4 10 10v16c0 2-2 4-4 4H34c-2 0-4-2-4-4V38z" stroke="var(--c-coral)" strokeWidth="2.5" strokeLinecap="round"
        animate={{ y: [0, -2, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }} />
    </svg>
  ),
  sleep: (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
      <motion.circle cx="40" cy="40" r="36" stroke="var(--c-purple)" strokeWidth="2" strokeDasharray="6 4" opacity="0.3"
        animate={{ rotate: 360 }} transition={{ duration: 25, repeat: Infinity, ease: 'linear' }} />
      <motion.path d="M50 30A15 15 0 1 1 30 50 12 12 0 0 0 50 30z" stroke="var(--c-purple)" strokeWidth="2.5" strokeLinecap="round"
        animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }} />
      {[{x:55,y:25,d:0.2},{x:60,y:35,d:0.5},{x:52,y:42,d:0.8}].map((s,i) => (
        <motion.circle key={i} cx={s.x} cy={s.y} r="2" fill="var(--c-purple)" opacity="0.4"
          animate={{ opacity: [0.2, 0.6, 0.2], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 2, delay: s.d, repeat: Infinity, ease: 'easeInOut' }} />
      ))}
    </svg>
  ),
  chat: (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
      <motion.circle cx="40" cy="40" r="36" stroke="var(--c-blue)" strokeWidth="2" strokeDasharray="6 4" opacity="0.3"
        animate={{ rotate: -360 }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }} />
      <motion.path d="M24 30c0-2 2-4 4-4h24c2 0 4 2 4 4v16c0 2-2 4-4 4H38l-8 6v-6h-2c-2 0-4-2-4-4V30z" stroke="var(--c-blue)" strokeWidth="2.5" strokeLinecap="round"
        animate={{ y: [0, -3, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }} />
      <motion.g animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}>
        <circle cx="33" cy="38" r="2" fill="var(--c-blue)" opacity="0.5" />
        <circle cx="40" cy="38" r="2" fill="var(--c-blue)" opacity="0.5" />
        <circle cx="47" cy="38" r="2" fill="var(--c-blue)" opacity="0.5" />
      </motion.g>
    </svg>
  ),
  feed: (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
      <motion.circle cx="40" cy="40" r="36" stroke="var(--c-lime-d)" strokeWidth="2" strokeDasharray="6 4" opacity="0.3"
        animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }} />
      <motion.path d="M30 28h20M30 36h14M30 44h18M30 52h10" stroke="var(--c-lime-d)" strokeWidth="2.5" strokeLinecap="round"
        animate={{ x: [0, 2, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }} />
    </svg>
  ),
  generic: (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
      <motion.circle cx="40" cy="40" r="36" stroke="var(--c-ink3)" strokeWidth="2" strokeDasharray="6 4" opacity="0.3"
        animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }} />
      <motion.path d="M40 24v10M36 44h8M30 52c0-6 4-10 10-10s10 4 10 10" stroke="var(--c-ink3)" strokeWidth="2.5" strokeLinecap="round"
        animate={{ y: [0, -2, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }} />
    </svg>
  ),
};

export default function EmptyState({
  type = 'generic',
  title = 'Nimic aici',
  description = 'Nu sunt date de afișat.',
  action,
  actionLabel,
}) {
  const illustration = ILLUSTRATIONS[type] || ILLUSTRATIONS.generic;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      style={{
        textAlign: 'center',
        padding: '60px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
      }}
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        style={{ marginBottom: 12 }}
      >
        {illustration}
      </motion.div>

      <div style={{
        fontFamily: 'var(--fd)',
        fontSize: 22,
        fontWeight: 900,
        color: 'var(--c-ink)',
        letterSpacing: 0.3,
      }}>
        {title}
      </div>

      <div style={{
        fontSize: 13,
        color: 'var(--c-ink3)',
        maxWidth: 300,
        lineHeight: 1.6,
      }}>
        {description}
      </div>

      {action && (
        <motion.button
          className="btn btn-black btn-ripple"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={action}
          style={{ marginTop: 16 }}
        >
          {actionLabel || 'Incepe'}
        </motion.button>
      )}
    </motion.div>
  );
}
