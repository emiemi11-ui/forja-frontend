import { useEffect, useState } from 'react';

export default function MaintenanceOverlay() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handler = (e) => {
      setMessage(e.detail?.message || 'Platforma este în mentenanță. Revenim curând!');
      setOpen(true);
    };
    window.addEventListener('forja:maintenance', handler);
    return () => window.removeEventListener('forja:maintenance', handler);
  }, []);

  if (!open) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 99999,
      background: 'rgba(0, 0, 0, 0.92)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
    }}>
      <div style={{
        maxWidth: 480,
        textAlign: 'center',
        color: '#fff',
        fontFamily: 'var(--fb, "Plus Jakarta Sans", sans-serif)',
      }}>
        <div style={{ fontSize: 80, marginBottom: 20 }}>🚧</div>
        <h1 style={{
          fontFamily: 'var(--fd, "Barlow Condensed", sans-serif)',
          fontSize: 48,
          fontWeight: 900,
          letterSpacing: 1,
          marginBottom: 16,
          textTransform: 'uppercase',
        }}>
          Mentenanță
        </h1>
        <p style={{
          fontSize: 16,
          lineHeight: 1.6,
          color: 'rgba(255,255,255,0.8)',
          marginBottom: 32,
        }}>
          {message}
        </p>
        <button
          onClick={() => {
            setOpen(false);
            window.location.reload();
          }}
          style={{
            padding: '12px 32px',
            background: 'var(--c-lime, #B8ED00)',
            color: '#000',
            border: 'none',
            borderRadius: 12,
            fontSize: 14,
            fontWeight: 800,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          🔄 Reîncearcă
        </button>
      </div>
    </div>
  );
}
