import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import '../styles/modal.css';

export default function Modal({ open, onClose, title, children, maxWidth = 480 }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    if (open) { document.addEventListener('keydown', onKey); document.body.style.overflow = 'hidden'; }
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [open, onClose]);

  if (!open) return null;

  // CRITICAL: render via createPortal direct in <body> ca sa scapam de orice parent transformat
  // (framer-motion's AnimatedPage rupea position: fixed la modal-uri imbricate)
  return createPortal(
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(6px)',
        zIndex: 99999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: '#131312',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 20,
        width: '100%', maxWidth,
        maxHeight: '90vh',
        overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        animation: 'modalIn 0.2s cubic-bezier(0.16,1,0.3,1)',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{ fontFamily: 'var(--fd)', fontSize: 22, fontWeight: 900 }}>{title}</div>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)',
              cursor: 'pointer', color: 'rgba(255,255,255,0.5)', fontSize: 16,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >✕</button>
        </div>
        {/* Body */}
        <div style={{ overflowY: 'auto', padding: '20px 24px' }}>
          {children}
        </div>
      </div>
      
    </div>,
    document.body
  );
}

// Shared form field style helpers
export function ModalField({ label, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{
        fontSize: 10, fontWeight: 700, letterSpacing: 1,
        color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--fm)',
        textTransform: 'uppercase', marginBottom: 6,
      }}>{label}</div>
      {children}
    </div>
  );
}

export function ModalInput({ ...props }) {
  return (
    <input
      style={{
        width: '100%', background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10,
        padding: '11px 14px', color: '#fff',
        fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 13,
        outline: 'none', boxSizing: 'border-box',
        transition: 'border-color 0.2s',
      }}
      onFocus={e => e.target.style.borderColor = 'rgba(255,255,255,0.3)'}
      onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
      {...props}
    />
  );
}

export function ModalSelect({ children, ...props }) {
  return (
    <select
      style={{
        width: '100%', background: '#1a1a18',
        border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10,
        padding: '11px 14px', color: '#fff',
        fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 13,
        outline: 'none', boxSizing: 'border-box', cursor: 'pointer',
      }}
      {...props}
    >
      {children}
    </select>
  );
}

export function ModalActions({ children }) {
  return (
    <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 24, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      {children}
    </div>
  );
}
