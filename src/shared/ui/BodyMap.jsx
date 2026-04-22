import { useState } from 'react';

const MUSCLE_PATHS = {
  Piept: {
    front: [
      'M 85,95 C 85,85 95,78 110,80 L 115,82 L 120,90 L 120,105 L 110,108 L 95,105 Z',
      'M 155,95 C 155,85 145,78 130,80 L 125,82 L 120,90 L 120,105 L 130,108 L 145,105 Z',
    ],
    color: '#c5f135',
  },
  Spate: {
    back: [
      'M 85,88 C 85,80 95,75 110,78 L 118,82 L 120,95 L 120,110 L 105,112 L 90,108 Z',
      'M 155,88 C 155,80 145,75 130,78 L 122,82 L 120,95 L 120,110 L 135,112 L 150,108 Z',
    ],
    color: '#1a56ff',
  },
  Umeri: {
    front: [
      'M 78,78 C 72,72 70,80 75,90 L 85,92 L 88,82 L 82,75 Z',
      'M 162,78 C 168,72 170,80 165,90 L 155,92 L 152,82 L 158,75 Z',
    ],
    color: '#ff4d1c',
  },
  'Brațe': {
    front: [
      'M 72,95 L 68,130 L 62,138 L 58,140 L 64,148 L 72,140 L 78,132 L 82,105 Z',
      'M 168,95 L 172,130 L 178,138 L 182,140 L 176,148 L 168,140 L 162,132 L 158,105 Z',
    ],
    color: '#f5c518',
  },
  Picioare: {
    front: [
      'M 95,170 L 92,210 L 88,250 L 92,270 L 100,275 L 108,270 L 112,250 L 108,210 L 108,170 Z',
      'M 145,170 L 148,210 L 152,250 L 148,270 L 140,275 L 132,270 L 128,250 L 132,210 L 132,170 Z',
    ],
    color: '#a78bfa',
  },
  Core: {
    front: [
      'M 105,110 L 100,140 L 98,160 L 100,170 L 110,172 L 120,173 L 130,172 L 140,170 L 142,160 L 140,140 L 135,110 Z',
    ],
    color: '#4ecdc4',
  },
};

const BODY_OUTLINE_FRONT = `
  M 120,12 C 108,12 100,20 100,30 C 100,38 105,46 110,50
  L 105,55 L 98,58 L 85,62 L 75,68 L 70,75 L 68,85 L 66,95
  L 62,115 L 58,135 L 56,142 L 60,150 L 68,148 L 74,138
  L 82,118 L 88,105 L 92,110 L 95,140 L 94,160 L 92,170
  L 88,200 L 86,230 L 84,255 L 88,272 L 95,280 L 105,282
  L 112,278 L 115,270 L 114,250 L 112,220 L 110,195 L 110,180
  L 112,175 L 118,173 L 120,173
  L 122,173 L 128,175 L 130,180
  L 130,195 L 128,220 L 126,250 L 125,270 L 128,278 L 135,282
  L 145,280 L 152,272 L 156,255 L 154,230 L 152,200 L 148,170
  L 146,160 L 145,140 L 148,110 L 152,105 L 158,118 L 166,138
  L 172,148 L 180,150 L 184,142 L 182,135 L 178,115 L 174,95
  L 172,85 L 170,75 L 165,68 L 155,62 L 142,58 L 135,55
  L 130,50 C 135,46 140,38 140,30 C 140,20 132,12 120,12 Z
`;

export default function BodyMap({ selected, onSelect, muscles }) {
  const [hoveredMuscle, setHoveredMuscle] = useState(null);
  const muscleList = muscles || Object.keys(MUSCLE_PATHS);

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: 280, margin: '0 auto' }}>
      {/* Label */}
      <div style={{
        textAlign: 'center', fontFamily: 'var(--fm)', fontSize: 9,
        letterSpacing: 2, textTransform: 'uppercase', color: 'var(--c-ink3)',
        marginBottom: 8,
      }}>
        {hoveredMuscle || selected || 'selectează grupă musculară'}
      </div>

      <svg viewBox="40 5 200 290" style={{ width: '100%', height: 'auto', filter: 'drop-shadow(0 0 20px rgba(197,241,53,0.1))' }}>
        {/* Glow background */}
        <defs>
          <radialGradient id="bodyGlow" cx="50%" cy="40%" r="50%">
            <stop offset="0%" stopColor="rgba(197,241,53,0.05)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          <filter id="muscleGlow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <ellipse cx="120" cy="150" rx="70" ry="130" fill="url(#bodyGlow)" />

        {/* Body outline */}
        <path d={BODY_OUTLINE_FRONT} fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />

        {/* Muscle groups */}
        {muscleList.map(name => {
          const muscle = MUSCLE_PATHS[name];
          if (!muscle) return null;
          const paths = muscle.front || muscle.back || [];
          const isSelected = selected === name;
          const isHovered = hoveredMuscle === name;
          const active = isSelected || isHovered;

          return paths.map((d, i) => (
            <path
              key={`${name}-${i}`}
              d={d}
              fill={active ? muscle.color + 'CC' : muscle.color + '30'}
              stroke={active ? muscle.color : muscle.color + '60'}
              strokeWidth={active ? 2 : 1}
              style={{
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                filter: active ? 'url(#muscleGlow)' : 'none',
              }}
              onMouseEnter={() => setHoveredMuscle(name)}
              onMouseLeave={() => setHoveredMuscle(null)}
              onClick={() => onSelect?.(name === selected ? null : name)}
            />
          ));
        })}

        {/* Head detail */}
        <circle cx="120" cy="28" r="15" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        <circle cx="115" cy="26" r="1.5" fill="rgba(255,255,255,0.2)" />
        <circle cx="125" cy="26" r="1.5" fill="rgba(255,255,255,0.2)" />
      </svg>

      {/* Legend */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', justifyContent: 'center',
        gap: '6px 12px', marginTop: 12,
      }}>
        {muscleList.map(name => {
          const muscle = MUSCLE_PATHS[name];
          if (!muscle) return null;
          const isActive = selected === name;
          return (
            <button
              key={name}
              onClick={() => onSelect?.(name === selected ? null : name)}
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '4px 10px', borderRadius: 100, border: 'none',
                background: isActive ? muscle.color + '25' : 'transparent',
                color: isActive ? muscle.color : 'var(--c-ink3)',
                fontFamily: 'var(--fm)', fontSize: 10, fontWeight: 700,
                letterSpacing: 0.5, cursor: 'pointer', transition: 'all 0.2s',
              }}
            >
              <span style={{
                width: 8, height: 8, borderRadius: '50%',
                background: muscle.color,
                boxShadow: isActive ? `0 0 8px ${muscle.color}60` : 'none',
              }} />
              {name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
