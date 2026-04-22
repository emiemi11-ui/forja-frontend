import { useState } from 'react';

export const PEOPLE_PHOTOS = {
  'M': '/img/ext/u-a3a1d9fa30.jpg',
  'Mihai': '/img/ext/u-e18e47db85.jpg',
  'Coach Mihai': '/img/ext/u-e18e47db85.jpg',
  'A': '/img/ext/u-cfef1843fc.jpg',
  'Andrei': '/img/ext/u-115d3c5430.jpg',
  'I': '/img/ext/u-530d7a583e.jpg',
  'R': '/img/ext/u-919eb92866.jpg',
  'C': '/img/ext/u-cfef1843fc.jpg',
  'D': '/img/ext/u-4d5d61a2b3.jpg',
  'Diana': '/img/ext/u-4d5d61a2b3.jpg',
  'E': '/img/ext/u-4d5d61a2b3.jpg',
  'W': '/img/ext/u-defd88fb97.jpg',
};

export const TEAM_COVERS = {
  'war-ready':    '/img/ext/u-add303a709.jpg',
  'run-club':     '/img/ext/u-2465e247ba.jpg',
  'body-recomp':  '/img/ext/u-eee977745f.jpg',
  'eat-smart':    '/img/ext/u-090ea85f72.jpg',
  'tactical':     '/img/ext/u-2a6e780c10.jpg',
  'mobility':     '/img/ext/u-46fd7fac96.jpg',
  'hiit-squad':   '/img/ext/u-19179f22b1.jpg',
  'strength-lab': '/img/ext/u-fc97feff5a.jpg',
  'keto-team':    '/img/ext/u-090ea85f72.jpg',
};

export function Avatar({ initial, color, size = 28, photo }) {
  const photoUrl = photo || PEOPLE_PHOTOS[initial] || PEOPLE_PHOTOS[initial?.charAt(0)];
  const s = size + 'px';
  const fs = Math.round(size * 0.42) + 'px';
  if (photoUrl) return (
    <div style={{ width: s, height: s, borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
      <img src={photoUrl} alt="Fotografie utilizator" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} loading="lazy" />
    </div>
  );
  return (
    <div style={{ width: s, height: s, borderRadius: '50%', background: color || '#555', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: fs, color: '#fff', flexShrink: 0 }}>
      {initial}
    </div>
  );
}

export function pct(val, max) { return Math.min(Math.round((val / max) * 100), 100); }

export function useToast() {
  const [toast, setToast] = useState(null);
  const showToast = (msg, icon = '✅') => {
    setToast({ msg, icon });
    setTimeout(() => setToast(null), 2500);
  };
  return { toast, showToast };
}

export function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div className={`toast ${toast ? 'show' : ''}`}>
      <span>{toast.icon}</span> {toast.msg}
    </div>
  );
}
