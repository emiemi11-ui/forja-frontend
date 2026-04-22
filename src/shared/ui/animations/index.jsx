/**
 * FORJA Animation Library
 * Professional micro-interactions, page transitions, and visual effects
 */
import { useEffect, useState, useRef, Children, cloneElement } from 'react';
import { motion, AnimatePresence, useInView, useSpring, useTransform, useScroll } from 'framer-motion';

/* ═══════════════════════════════════════════════════════════════════════
   PAGE TRANSITION — wraps every page for enter/exit animation
   ═══════════════════════════════════════════════════════════════════════ */
export function AnimatedPage({ children, className = '', style = {} }) {
  return (
    <motion.div
      className={`view active ${className}`}
      style={style}
      initial={{ opacity: 0, y: 20, filter: 'blur(6px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
      transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   STAGGER GRID — each child animates in sequence
   ═══════════════════════════════════════════════════════════════════════ */
const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  show: {
    opacity: 1, y: 0, scale: 1,
    transition: { type: 'spring', stiffness: 300, damping: 24 },
  },
};

export function StaggerGrid({ children, className = '', style = {}, as = 'div' }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  const Tag = motion[as] || motion.div;

  return (
    <Tag
      ref={ref}
      className={`forja-hero ${className}`}
      style={style}
      variants={staggerContainer}
      initial="hidden"
      animate={isInView ? 'show' : 'hidden'}
    >
      {Children.map(children, (child, i) =>
        child ? (
          <motion.div key={child.key || i} variants={staggerItem} style={{ display: 'contents' }}>
            {child}
          </motion.div>
        ) : null
      )}
    </Tag>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   SCROLL REVEAL — animate when element enters viewport
   ═══════════════════════════════════════════════════════════════════════ */
export function ScrollReveal({ children, direction = 'up', delay = 0, className = '', style = {} }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  const dirs = {
    up:    { y: 30 },
    down:  { y: -30 },
    left:  { x: 30 },
    right: { x: -30 },
  };

  return (
    <motion.div
      ref={ref}
      className={`forja-hero ${className}`}
      style={style}
      initial={{ opacity: 0, ...dirs[direction], filter: 'blur(4px)' }}
      animate={isInView ? { opacity: 1, y: 0, x: 0, filter: 'blur(0px)' } : {}}
      transition={{ duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   COUNT UP — animated number counter
   ═══════════════════════════════════════════════════════════════════════ */
export function CountUp({ to, duration = 1.5, decimals = 0, prefix = '', suffix = '', className = '', style = {} }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const target = Number(to) || 0;
    let start = null;
    const dur = duration * 1000;

    const animate = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / dur, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Number((eased * target).toFixed(decimals)));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [isInView, to, duration, decimals]);

  return (
    <span ref={ref} className={className} style={style}>
      {prefix}{display}{suffix}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   SKELETON LOADER — shimmer placeholder
   ═══════════════════════════════════════════════════════════════════════ */
export function Skeleton({ width = '100%', height = 16, borderRadius = 8, style = {} }) {
  return (
    <div className="forja-skeleton" style={{ width, height, borderRadius, ...style }} />
  );
}

export function SkeletonCard({ lines = 3, hasImage = false }) {
  return (
    <div className="card" style={{ padding: 18 }}>
      {hasImage && <Skeleton height={120} borderRadius={12} style={{ marginBottom: 14 }} />}
      <Skeleton width="40%" height={10} style={{ marginBottom: 12 }} />
      <Skeleton width="70%" height={20} style={{ marginBottom: 10 }} />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} width={`${85 - i * 15}%`} height={12} style={{ marginBottom: 8 }} />
      ))}
    </div>
  );
}

export function SkeletonGrid({ count = 4, columns = 4 }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: 14 }}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   ANIMATED PROGRESS RING — SVG circle with spring animation
   ═══════════════════════════════════════════════════════════════════════ */
export function AnimatedRing({
  value = 0, max = 100, size = 128, strokeWidth = 7,
  color = '#B8ED00', bgColor = 'rgba(255,255,255,0.07)',
  children, className = '', glow = true,
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const r = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(value / max, 1);

  const spring = useSpring(0, { stiffness: 60, damping: 18 });

  useEffect(() => {
    if (isInView) spring.set(pct);
  }, [isInView, pct]);

  const dashArray = useTransform(spring, (v) => `${v * circ} ${circ}`);

  return (
    <div ref={ref} className={className} style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={bgColor} strokeWidth={strokeWidth} />
        <motion.circle
          cx={cx} cy={cy} r={r} fill="none"
          stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"
          style={{ strokeDasharray: dashArray, filter: glow ? `drop-shadow(0 0 8px ${color}80)` : 'none' }}
          transform={`rotate(-90 ${cx} ${cy})`}
        />
      </svg>
      {children && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          {children}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   ANIMATED PROGRESS BAR — horizontal bar with spring
   ═══════════════════════════════════════════════════════════════════════ */
export function AnimatedBar({ value = 0, max = 100, height = 6, color = 'var(--c-lime)', glow = false }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const pct = Math.min((value / max) * 100, 100);

  return (
    <div ref={ref} className="prog" style={{ height }}>
      <motion.div
        className="prog-fill"
        style={{ background: color, boxShadow: glow ? `0 0 12px ${color}` : 'none' }}
        initial={{ width: 0 }}
        animate={isInView ? { width: `${pct}%` } : { width: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   HERO SECTION — reusable hero with video/image background
   ═══════════════════════════════════════════════════════════════════════ */
export function HeroSection({
  videoSrc, imageSrc, overlayGradient,
  accentColor = 'rgba(184,237,0,0.08)',
  children, className = '', style = {}, minHeight = 160,
}) {
  return (
    <motion.div
      className={`forja-hero ${className}`}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      style={{
        background: 'var(--hero-bg)',
        borderRadius: 20,
        padding: '28px 32px',
        marginBottom: 24,
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid var(--hero-border)',
        minHeight,
        boxShadow: 'var(--hero-shadow)',
        ...style,
      }}
    >
      {/* Video background */}
      {videoSrc && (
        <video autoPlay muted loop playsInline style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          objectFit: 'cover', opacity: 'var(--hero-img-opacity, 0.12)',
          filter: 'saturate(0.5) brightness(0.6)',
        }}>
          <source src={videoSrc} type="video/mp4" />
        </video>
      )}

      {/* Image background */}
      {imageSrc && !videoSrc && (
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url(${imageSrc})`,
          backgroundSize: 'cover', backgroundPosition: 'center',
          opacity: 'var(--hero-img-opacity, 0.15)', filter: 'saturate(0.5) brightness(0.6)',
        }} />
      )}

      {/* Topo SVG pattern */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='400'%3E%3Cg fill='none' stroke='rgba(184,237,0,0.04)' stroke-width='1'%3E%3Cellipse cx='400' cy='200' rx='380' ry='180'/%3E%3Cellipse cx='400' cy='200' rx='300' ry='140'/%3E%3Cellipse cx='400' cy='200' rx='220' ry='100'/%3E%3Cellipse cx='400' cy='200' rx='140' ry='62'/%3E%3C/g%3E%3C/svg%3E")`,
        backgroundSize: 'cover', backgroundPosition: 'center',
        opacity: 0.5,
      }} />

      {/* Gradient overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: overlayGradient || 'var(--hero-overlay)',
      }} />

      {/* Accent glow orb */}
      <div style={{
        position: 'absolute', right: 120, top: -50,
        width: 250, height: 250,
        background: `radial-gradient(circle, ${accentColor} 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   TILT CARD — 3D perspective tilt on hover
   ═══════════════════════════════════════════════════════════════════════ */
export function TiltCard({ children, className = '', style = {}, intensity = 8 }) {
  const ref = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMove = (e) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: y * -intensity, y: x * intensity });
  };

  const handleLeave = () => setTilt({ x: 0, y: 0 });

  return (
    <motion.div
      ref={ref}
      className={`forja-hero ${className}`}
      style={{ perspective: 1000, ...style }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      animate={{ rotateX: tilt.x, rotateY: tilt.y }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
    >
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   CONFETTI BURST — celebration particles
   ═══════════════════════════════════════════════════════════════════════ */
export function ConfettiBurst({ active = false, colors = ['#B8ED00','#FF4422','#1A52FF','#7B2FBE','#f5c518'], count = 40 }) {
  if (!active) return null;

  const particles = Array.from({ length: count }).map((_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * 500,
    y: -(Math.random() * 400 + 100),
    rotation: Math.random() * 720 - 360,
    scale: Math.random() * 0.6 + 0.4,
    color: colors[i % colors.length],
    delay: Math.random() * 0.3,
  }));

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999, overflow: 'hidden' }}>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{
            x: '50vw', y: '60vh',
            scale: 0, rotate: 0, opacity: 1,
          }}
          animate={{
            x: `calc(50vw + ${p.x}px)`,
            y: `calc(60vh + ${p.y}px)`,
            scale: p.scale,
            rotate: p.rotation,
            opacity: 0,
          }}
          transition={{ duration: 1.8, delay: p.delay, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: 'absolute',
            width: Math.random() > 0.5 ? 8 : 12,
            height: Math.random() > 0.5 ? 8 : 4,
            borderRadius: Math.random() > 0.5 ? '50%' : 2,
            background: p.color,
          }}
        />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   GRADIENT MESH — animated background blobs
   ═══════════════════════════════════════════════════════════════════════ */
export function GradientMesh({ colors = ['rgba(184,237,0,0.04)', 'rgba(26,82,255,0.03)', 'rgba(255,68,34,0.02)'] }) {
  return (
    <div className="forja-gradient-mesh" aria-hidden="true">
      {colors.map((color, i) => (
        <div
          key={i}
          className={`forja-mesh-blob forja-mesh-blob-${i + 1}`}
          style={{ background: `radial-gradient(ellipse, ${color} 0%, transparent 70%)` }}
        />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   SPARKLINE — tiny inline chart for KPI cards
   ═══════════════════════════════════════════════════════════════════════ */
export function Sparkline({ data = [], color = 'var(--c-lime)', height = 30, width = 80 }) {
  if (!data.length) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const step = width / (data.length - 1);

  const points = data.map((v, i) => {
    const x = i * step;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  }).join(' ');

  const areaPoints = `0,${height} ${points} ${width},${height}`;

  return (
    <svg width={width} height={height} style={{ display: 'block', overflow: 'visible' }}>
      <defs>
        <linearGradient id={`sp-${color.replace(/[^a-z0-9]/gi,'')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.polygon
        points={areaPoints}
        fill={`url(#sp-${color.replace(/[^a-z0-9]/gi,'')})`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      />
      <motion.polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
      />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   PAGE HEADER — consistent page title with animation
   ═══════════════════════════════════════════════════════════════════════ */
export function PageHeader({ label, title, action, style = {} }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24, ...style }}
    >
      <div>
        <div style={{
          fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: 3,
          textTransform: 'uppercase', color: 'var(--c-lime-d)', fontWeight: 700,
          marginBottom: 4,
        }}>
          {label}
        </div>
        <h1 style={{
          fontFamily: 'var(--fd)', fontSize: 36, fontWeight: 900,
          letterSpacing: 0.5, color: 'var(--c-ink)', lineHeight: 1,
        }}>
          {title}
        </h1>
      </div>
      {action}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   FLOATING ACTION PULSE — animated CTA dot
   ═══════════════════════════════════════════════════════════════════════ */
export function PulseIndicator({ color = 'var(--c-lime)', size = 8 }) {
  return (
    <span style={{ position: 'relative', display: 'inline-flex', width: size, height: size }}>
      <motion.span
        style={{
          position: 'absolute', inset: 0,
          borderRadius: '50%', background: color, opacity: 0.5,
        }}
        animate={{ scale: [1, 2, 1], opacity: [0.5, 0, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />
      <span style={{
        width: size, height: size,
        borderRadius: '50%', background: color,
        position: 'relative',
      }} />
    </span>
  );
}
