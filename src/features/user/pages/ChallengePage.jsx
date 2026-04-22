import { useCallback, useEffect, useState } from 'react';
import { getChallenges, createChallenge, joinChallenge, updateProgress } from '../../../shared/api/index.js';
import { Trophy } from 'lucide-react';
import { AnimatedPage } from '../../../shared/ui/animations/index.jsx';

const CAT_IMG = {
  fitness: '/img/ext/u-088bb3cd4a.jpg',
  running: '/img/ext/u-a9d8452066.jpg',
  nutrition: '/img/ext/u-6691f23897.jpg',
  hidratare: '/img/ext/u-5ce50f7a07.jpg',
  somn: '/img/ext/u-755b06eeae.jpg',
  general: '/img/ext/u-e2d14a26de.jpg',
};
const CAT_CLR = { fitness: '#B8ED00', running: '#1A52FF', nutrition: '#15803D', hidratare: '#1A52FF', somn: '#7B2FBE', general: '#B45309' };

export default function ChallengePage() {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list');
  const [form, setForm] = useState({ title: '', description: '', category: 'fitness', targetValue: 30, targetUnit: 'zile', durationDays: 30 });
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => { getChallenges().then(({ data }) => { setChallenges(data); setLoading(false); }).catch(() => setLoading(false)); }, []);
  useEffect(() => { load(); }, [load]);

  const handleCreate = async () => { if (!form.title.trim()) return; setBusy(true); try { await createChallenge(form); setView('list'); load(); } catch {} setBusy(false); };
  const handleJoin = async (id) => { setBusy(true); try { await joinChallenge(id); load(); } catch {} setBusy(false); };
  const handleProgress = async (id, cur, max) => { const v = prompt('Progres:', String(Math.min(cur + 1, max))); if (v === null) return; try { await updateProgress(id, Number(v)); load(); } catch {} };

  const inputBase = { width: '100%', padding: '12px 14px', borderRadius: 'var(--r)', border: '1.5px solid var(--c-border)', fontSize: 15, fontFamily: 'var(--fb)', background: 'var(--c-bg)', boxSizing: 'border-box', marginBottom: 12 };

  if (view === 'create') return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '24px 20px' }}>
      <button onClick={() => setView('list')} style={{ background: 'none', border: 0, color: 'var(--c-ink3)', cursor: 'pointer', fontFamily: 'var(--fb)', fontSize: 14, marginBottom: 20 }}>← Înapoi</button>
      <h1 style={{ fontFamily: 'var(--fd)', fontSize: 36, fontWeight: 900, color: 'var(--c-ink)', marginBottom: 24 }}>CHALLENGE NOU</h1>
      <div style={{ background: 'var(--c-surface)', borderRadius: 'var(--r-lg)', padding: 24, boxShadow: 'var(--shadow)' }}>
        <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Titlu challenge" style={inputBase} />
        <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Descriere" style={{ ...inputBase, minHeight: 70, resize: 'vertical' }} />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
          {Object.keys(CAT_CLR).map(c => (
            <button key={c} onClick={() => setForm(f => ({ ...f, category: c }))} style={{ padding: '7px 14px', borderRadius: 16, border: form.category === c ? `2px solid ${CAT_CLR[c]}` : '1.5px solid var(--c-border)', background: form.category === c ? `${CAT_CLR[c]}18` : 'transparent', fontWeight: 700, fontSize: 12, cursor: 'pointer', color: form.category === c ? CAT_CLR[c] : 'var(--c-ink2)', fontFamily: 'var(--fb)', textTransform: 'capitalize' }}>{c}</button>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          <input type="number" value={form.targetValue} onChange={e => setForm(f => ({ ...f, targetValue: +e.target.value }))} placeholder="Target" style={inputBase} />
          <input value={form.targetUnit} onChange={e => setForm(f => ({ ...f, targetUnit: e.target.value }))} placeholder="Unitate" style={inputBase} />
          <input type="number" value={form.durationDays} onChange={e => setForm(f => ({ ...f, durationDays: +e.target.value }))} placeholder="Zile" style={inputBase} />
        </div>
        <button onClick={handleCreate} disabled={busy} style={{ width: '100%', padding: '14px', borderRadius: 'var(--r)', border: 0, background: 'var(--c-ink)', color: '#fff', fontFamily: 'var(--fd)', fontSize: 18, fontWeight: 800, cursor: 'pointer', opacity: busy ? .5 : 1 }}>LANSEAZĂ CHALLENGE →</button>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontFamily: 'var(--fm)', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--c-coral)', fontWeight: 700 }}>competiție</div>
          <h1 style={{ fontFamily: 'var(--fd)', fontSize: 42, fontWeight: 900, color: 'var(--c-ink)', lineHeight: .95, marginTop: 4 }}>CHALLENGES</h1>
        </div>
        <button onClick={() => setView('create')} style={{ padding: '12px 24px', borderRadius: 'var(--r)', border: 0, background: 'var(--c-ink)', color: '#fff', fontFamily: 'var(--fd)', fontSize: 16, fontWeight: 800, cursor: 'pointer' }}>+ NOU</button>
      </div>

      {loading ? <div style={{ textAlign: 'center', padding: 60, color: 'var(--c-ink3)' }}>Se încarcă...</div> : challenges.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <div style={{ marginBottom: 12, color: 'var(--c-ink3)' }}><Trophy size={40} strokeWidth={1.5} /></div>
          <div style={{ fontFamily: 'var(--fd)', fontSize: 22, fontWeight: 800 }}>Niciun challenge</div>
          <div style={{ fontSize: 14, color: 'var(--c-ink3)', marginTop: 6 }}>Creează primul challenge!</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: 16 }}>
          {challenges.map(c => {
            const pct = c.targetValue > 0 ? Math.min(100, Math.round((c.myProgress / c.targetValue) * 100)) : 0;
            return (
              <div key={c.id} style={{ borderRadius: 'var(--r-lg)', overflow: 'hidden', background: 'var(--c-surface)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--c-border)' }}>
                <div style={{ height: 120, background: `url(${CAT_IMG[c.category] || CAT_IMG.general}) center/cover`, position: 'relative' }}>
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(transparent 20%, rgba(0,0,0,.6))' }} />
                  <div style={{ position: 'absolute', top: 10, right: 10, padding: '4px 10px', borderRadius: 6, fontSize: 10, fontWeight: 800, textTransform: 'uppercase', fontFamily: 'var(--fm)', background: CAT_CLR[c.category] || '#666', color: '#fff', letterSpacing: .5 }}>{c.category}</div>
                  <div style={{ position: 'absolute', bottom: 10, left: 14, color: '#fff' }}>
                    <div style={{ fontFamily: 'var(--fd)', fontSize: 20, fontWeight: 900, textShadow: '0 1px 4px rgba(0,0,0,.4)' }}>{c.title}</div>
                  </div>
                </div>
                <div style={{ padding: '14px 16px 16px' }}>
                  <div style={{ fontSize: 12, color: 'var(--c-ink3)', fontFamily: 'var(--fm)', marginBottom: 6 }}>{c.durationDays} zile · {c.participantsCount} participanți</div>
                  {c.description && <div style={{ fontSize: 13, color: 'var(--c-ink2)', lineHeight: 1.5, marginBottom: 10 }}>{c.description.slice(0, 90)}{c.description.length > 90 ? '...' : ''}</div>}
                  {c.joined && (
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, marginBottom: 4, fontFamily: 'var(--fm)' }}>
                        <span style={{ color: 'var(--c-ink2)' }}>{c.myProgress}/{c.targetValue} {c.targetUnit}</span>
                        <span style={{ color: pct >= 100 ? 'var(--c-green)' : 'var(--c-ink3)' }}>{pct}%</span>
                      </div>
                      <div style={{ height: 6, borderRadius: 3, background: 'var(--c-border)' }}>
                        <div style={{ height: '100%', borderRadius: 3, background: pct >= 100 ? 'var(--c-green)' : `linear-gradient(90deg, ${CAT_CLR[c.category] || 'var(--c-lime)'}, var(--c-blue))`, width: `${pct}%`, transition: '.3s ease' }} />
                      </div>
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    {c.myCompleted ? (
                      <span style={{ padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 800, background: 'rgba(21,128,61,.1)', color: 'var(--c-green)', fontFamily: 'var(--fm)' }}>✓ COMPLETAT</span>
                    ) : c.joined ? (
                      <button onClick={() => handleProgress(c.id, c.myProgress, c.targetValue)} style={{ padding: '6px 16px', borderRadius: 8, border: 0, background: 'var(--c-ink)', color: '#fff', fontWeight: 800, fontSize: 12, cursor: 'pointer', fontFamily: 'var(--fd)' }}>+ PROGRES</button>
                    ) : (
                      <button onClick={() => handleJoin(c.id)} disabled={busy} style={{ padding: '6px 16px', borderRadius: 8, border: 0, background: CAT_CLR[c.category] || 'var(--c-lime)', color: '#000', fontWeight: 800, fontSize: 12, cursor: 'pointer', fontFamily: 'var(--fd)' }}>PARTICIPĂ →</button>
                    )}
                    {c.creator && <span style={{ fontSize: 11, color: 'var(--c-ink3)', marginLeft: 'auto', fontFamily: 'var(--fm)' }}>de {c.creator.name}</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
