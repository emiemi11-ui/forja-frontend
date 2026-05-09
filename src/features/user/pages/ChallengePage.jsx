import { useCallback, useEffect, useState } from 'react';
import {
  getChallenges,
  createChallenge,
  joinChallenge,
  updateProgress,
  getLeaderboard,
  toggleChallengeActivity,
  deleteChallenge,
  getTeams,
} from '../../../shared/api/index.js';
import { Trophy } from 'lucide-react';
import { AnimatedPage } from '../../../shared/ui/animations/index.jsx';
import { Toast, useToast } from '../../../shared/ui/helpers.jsx';
import { useConfirm } from '../../../shared/ui/ConfirmModal.jsx';

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
  const [filter, setFilter] = useState('all'); // all | mine | team:<teamId>
  const [myTeams, setMyTeams] = useState([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'fitness',
    durationDays: 30,
    teamId: '',
    activities: [], // { id: temp, name, points }
  });
  const [busy, setBusy] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [leaderboardFor, setLeaderboardFor] = useState(null);
  const { toast, showToast } = useToast();
  const confirm = useConfirm();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const teamFilter = filter.startsWith('team:') ? filter.split(':')[1] : null;
      const params = teamFilter ? { teamId: teamFilter } : {};
      const [challengesRes, teamsRes] = await Promise.all([
        getChallenges(params),
        getTeams({ filter: 'mine' }).catch(() => ({ data: [] })),
      ]);
      let list = challengesRes.data || [];
      if (filter === 'mine') {
        list = list.filter((c) => c.joined);
      }
      setChallenges(list);
      setMyTeams((teamsRes.data || []).filter((t) => t.isMember));
    } catch {
      setChallenges([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);
  useEffect(() => { load(); }, [load]);

  const handleCreate = async () => {
    if (!form.title.trim()) {
      showToast('Titlul este obligatoriu', '⚠️');
      return;
    }
    setBusy(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        durationDays: Number(form.durationDays) || 30,
        teamId: form.teamId || null,
        activities: form.activities.filter((act) => act.name.trim().length > 0).map((act) => ({
          id: act.id,
          name: act.name.trim(),
          points: Math.max(1, Number(act.points) || 10),
        })),
      };
      // Daca nu sunt activitati, foloseste modul legacy (target numeric)
      if (payload.activities.length === 0) {
        payload.targetValue = 30;
        payload.targetUnit = 'zile';
      }
      await createChallenge(payload);
      showToast('🎉 Challenge creat!');
      setForm({ title: '', description: '', category: 'fitness', durationDays: 30, teamId: '', activities: [] });
      setView('list');
      load();
    } catch (error) {
      showToast(error.response?.data?.error || '❌ Eroare', '❌');
    } finally {
      setBusy(false);
    }
  };

  const handleJoin = async (id) => {
    setBusy(true);
    try {
      await joinChallenge(id);
      load();
    } catch (error) {
      showToast(error.response?.data?.error || '❌ Eroare', '❌');
    }
    setBusy(false);
  };

  const handleProgress = async (id, cur, max) => {
    const v = prompt('Progres:', String(Math.min(cur + 1, max)));
    if (v === null) return;
    try {
      await updateProgress(id, Number(v));
      load();
    } catch {}
  };

  const handleToggleActivity = async (challengeId, activityId) => {
    try {
      const { data } = await toggleChallengeActivity(challengeId, activityId);
      if (data.xpDelta > 0) {
        showToast(`+${data.xpDelta} XP! 🔥`);
      } else if (data.xpDelta < 0) {
        showToast(`${data.xpDelta} XP`);
      }
      load();
    } catch (error) {
      showToast(error.response?.data?.error || '❌ Eroare', '❌');
    }
  };

  const handleDelete = async (challenge) => {
    const ok = await confirm({
      title: 'Șterge challenge?',
      message: `"${challenge.title}" va fi șters definitiv pentru toți participanții.`,
      confirmText: 'Șterge',
      tone: 'danger',
    });
    if (!ok) return;
    try {
      await deleteChallenge(challenge.id);
      showToast('🗑️ Challenge șters');
      load();
    } catch (error) {
      showToast(error.response?.data?.error || '❌ Eroare', '❌');
    }
  };

  const handleLeaderboard = async (challenge) => {
    try {
      const { data } = await getLeaderboard(challenge.id);
      setLeaderboardFor({ challenge, data });
    } catch {
      setLeaderboardFor({ challenge, data: { leaderboard: [], totalXp: 0, isActivitiesMode: false } });
    }
  };

  // === ACTIVITY BUILDER (in create form) ===
  const addActivity = () => {
    setForm((f) => ({
      ...f,
      activities: [...f.activities, { id: `tmp_${Date.now()}_${f.activities.length}`, name: '', points: 10 }],
    }));
  };
  const updateActivity = (idx, patch) => {
    setForm((f) => ({
      ...f,
      activities: f.activities.map((act, i) => (i === idx ? { ...act, ...patch } : act)),
    }));
  };
  const removeActivity = (idx) => {
    setForm((f) => ({ ...f, activities: f.activities.filter((_, i) => i !== idx) }));
  };

  const inputBase = { width: '100%', padding: '12px 14px', borderRadius: 'var(--r)', border: '1.5px solid var(--c-border)', fontSize: 15, fontFamily: 'var(--fb)', background: 'var(--c-bg)', boxSizing: 'border-box', marginBottom: 12 };

  // === CREATE VIEW ===
  if (view === 'create') {
    const totalXp = form.activities.reduce((sum, act) => sum + (Number(act.points) || 0), 0);
    return (
      <AnimatedPage>
        <Toast toast={toast} />
        <div style={{ maxWidth: 620, margin: '0 auto', padding: '24px 20px' }}>
          <button onClick={() => setView('list')} style={{ background: 'none', border: 0, color: 'var(--c-ink3)', cursor: 'pointer', fontFamily: 'var(--fb)', fontSize: 14, marginBottom: 20 }}>← Înapoi</button>
          <h1 style={{ fontFamily: 'var(--fd)', fontSize: 36, fontWeight: 900, color: 'var(--c-ink)', marginBottom: 24 }}>CHALLENGE NOU</h1>
          <div style={{ background: 'var(--c-surface)', borderRadius: 'var(--r-lg)', padding: 24, boxShadow: 'var(--shadow)' }}>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Titlu challenge" style={inputBase} />
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Descriere (opțional)" style={{ ...inputBase, minHeight: 70, resize: 'vertical' }} />

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
              {Object.keys(CAT_CLR).map(c => (
                <button type="button" key={c} onClick={() => setForm(f => ({ ...f, category: c }))} style={{ padding: '7px 14px', borderRadius: 16, border: form.category === c ? `2px solid ${CAT_CLR[c]}` : '1.5px solid var(--c-border)', background: form.category === c ? `${CAT_CLR[c]}18` : 'transparent', fontWeight: 700, fontSize: 12, cursor: 'pointer', color: form.category === c ? CAT_CLR[c] : 'var(--c-ink2)', fontFamily: 'var(--fb)', textTransform: 'capitalize' }}>{c}</button>
              ))}
            </div>

            {/* Echipa selector */}
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 11, fontFamily: 'var(--fm)', color: 'var(--c-ink3)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6, fontWeight: 700 }}>Echipa (opțional)</label>
              <select value={form.teamId} onChange={(e) => setForm((f) => ({ ...f, teamId: e.target.value }))} style={{ ...inputBase, marginBottom: 0 }}>
                <option value="">— Public (oricine poate participa) —</option>
                {myTeams
                  .filter((t) => t.myRole === 'OWNER' || t.myRole === 'ADMIN')
                  .map((team) => (
                    <option key={team.id} value={team.id}>🏆 {team.name} (doar membri)</option>
                  ))}
              </select>
              {myTeams.filter((t) => t.myRole === 'OWNER' || t.myRole === 'ADMIN').length === 0 && (
                <div style={{ fontSize: 11, color: 'var(--c-ink3)', marginTop: 4, fontStyle: 'italic' }}>Doar OWNER/ADMIN al unei echipe poate face challenges în echipă.</div>
              )}
            </div>

            <input type="number" value={form.durationDays} onChange={e => setForm(f => ({ ...f, durationDays: +e.target.value }))} placeholder="Durată (zile)" style={inputBase} />

            {/* Activities builder */}
            <div style={{ marginTop: 8, marginBottom: 16, padding: 14, borderRadius: 12, background: 'var(--c-bg)', border: '1.5px solid var(--c-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ fontFamily: 'var(--fm)', fontSize: 11, fontWeight: 800, letterSpacing: 1, color: 'var(--c-ink2)', textTransform: 'uppercase' }}>
                  Activități ({form.activities.length}) · Total {totalXp} XP
                </div>
                <button type="button" onClick={addActivity} style={{ padding: '5px 12px', borderRadius: 8, border: '1.5px solid var(--c-lime)', background: 'var(--c-lime-bg)', color: 'var(--c-lime-d)', fontSize: 11, fontWeight: 800, cursor: 'pointer' }}>+ Adaugă</button>
              </div>
              {form.activities.length === 0 && (
                <div style={{ fontSize: 12, color: 'var(--c-ink3)', fontStyle: 'italic', textAlign: 'center', padding: 8 }}>
                  Nicio activitate. Fără activități, challenge-ul folosește un counter numeric simplu (mod legacy).
                </div>
              )}
              {form.activities.map((act, idx) => (
                <div key={act.id} style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 8 }}>
                  <input
                    placeholder="Nume activitate (ex: 30 min cardio)"
                    value={act.name}
                    onChange={(e) => updateActivity(idx, { name: e.target.value })}
                    style={{ flex: 1, padding: '8px 10px', borderRadius: 8, border: '1px solid var(--c-border)', fontSize: 13, fontFamily: 'var(--fb)', background: 'var(--c-surface)' }}
                  />
                  <input
                    type="number"
                    placeholder="XP"
                    value={act.points}
                    min={1}
                    max={1000}
                    onChange={(e) => updateActivity(idx, { points: e.target.value })}
                    style={{ width: 80, padding: '8px 10px', borderRadius: 8, border: '1px solid var(--c-border)', fontSize: 13, fontFamily: 'var(--fm)', background: 'var(--c-surface)', textAlign: 'center' }}
                  />
                  <button type="button" onClick={() => removeActivity(idx)} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid var(--c-coral)', background: 'transparent', color: 'var(--c-coral)', cursor: 'pointer', fontSize: 14 }}>✕</button>
                </div>
              ))}
            </div>

            <button onClick={handleCreate} disabled={busy} style={{ width: '100%', padding: '14px', borderRadius: 'var(--r)', border: 0, background: 'var(--c-ink)', color: '#fff', fontFamily: 'var(--fd)', fontSize: 18, fontWeight: 800, cursor: 'pointer', opacity: busy ? .5 : 1 }}>
              {busy ? '⏳' : 'LANSEAZĂ CHALLENGE →'}
            </button>
          </div>
        </div>
      </AnimatedPage>
    );
  }

  // === LIST VIEW ===
  return (
    <AnimatedPage>
      <Toast toast={toast} />
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontFamily: 'var(--fm)', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--c-coral)', fontWeight: 700 }}>competiție</div>
            <h1 style={{ fontFamily: 'var(--fd)', fontSize: 42, fontWeight: 900, color: 'var(--c-ink)', lineHeight: .95, marginTop: 4 }}>CHALLENGES</h1>
          </div>
          <button onClick={() => setView('create')} style={{ padding: '12px 24px', borderRadius: 'var(--r)', border: 0, background: 'var(--c-ink)', color: '#fff', fontFamily: 'var(--fd)', fontSize: 16, fontWeight: 800, cursor: 'pointer' }}>+ NOU</button>
        </div>

        {/* Filter bar */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
          <button onClick={() => setFilter('all')} style={pillStyle(filter === 'all')}>Toate</button>
          <button onClick={() => setFilter('mine')} style={pillStyle(filter === 'mine')}>În care particip</button>
          {myTeams.map((team) => (
            <button key={team.id} onClick={() => setFilter(`team:${team.id}`)} style={pillStyle(filter === `team:${team.id}`)}>
              🏆 {team.name}
            </button>
          ))}
        </div>

        {loading ? <div style={{ textAlign: 'center', padding: 60, color: 'var(--c-ink3)' }}>Se încarcă...</div> : challenges.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <div style={{ marginBottom: 12, color: 'var(--c-ink3)' }}><Trophy size={40} strokeWidth={1.5} /></div>
            <div style={{ fontFamily: 'var(--fd)', fontSize: 22, fontWeight: 800 }}>Niciun challenge</div>
            <div style={{ fontSize: 14, color: 'var(--c-ink3)', marginTop: 6 }}>{filter === 'all' ? 'Creează primul challenge!' : 'Nimic în această categorie.'}</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 16 }}>
            {challenges.map(c => (
              <ChallengeCard
                key={c.id}
                challenge={c}
                myTeams={myTeams}
                isExpanded={expandedId === c.id}
                onToggleExpand={() => setExpandedId(expandedId === c.id ? null : c.id)}
                onJoin={() => handleJoin(c.id)}
                onProgress={() => handleProgress(c.id, c.myProgress, c.targetValue)}
                onToggleActivity={(actId) => handleToggleActivity(c.id, actId)}
                onLeaderboard={() => handleLeaderboard(c)}
                onDelete={() => handleDelete(c)}
                busy={busy}
              />
            ))}
          </div>
        )}

        {/* === LEADERBOARD MODAL === */}
        {leaderboardFor && (
          <LeaderboardModal data={leaderboardFor} onClose={() => setLeaderboardFor(null)} />
        )}
      </div>
    </AnimatedPage>
  );
}

function pillStyle(active) {
  return {
    padding: '7px 14px',
    borderRadius: 16,
    border: active ? '2px solid var(--c-ink)' : '1.5px solid var(--c-border)',
    background: active ? 'var(--c-ink)' : 'var(--c-surface)',
    fontWeight: 700,
    fontSize: 12,
    cursor: 'pointer',
    color: active ? '#fff' : 'var(--c-ink2)',
    fontFamily: 'var(--fb)',
  };
}

function ChallengeCard({ challenge: c, myTeams, isExpanded, onToggleExpand, onJoin, onProgress, onToggleActivity, onLeaderboard, onDelete, busy }) {
  const pct = c.targetValue > 0 ? Math.min(100, Math.round((c.myProgress / c.targetValue) * 100)) : 0;
  const team = c.teamId ? myTeams.find((t) => t.id === c.teamId) : null;
  const completedSet = new Set(c.myCompletedActivityIds || []);
  const isMyChallenge = !!c.creator?.id;

  return (
    <div style={{ borderRadius: 'var(--r-lg)', overflow: 'hidden', background: 'var(--c-surface)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--c-border)' }}>
      <div style={{ height: 120, background: `url(${CAT_IMG[c.category] || CAT_IMG.general}) center/cover`, position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(transparent 20%, rgba(0,0,0,.6))' }} />
        <div style={{ position: 'absolute', top: 10, right: 10, padding: '4px 10px', borderRadius: 6, fontSize: 10, fontWeight: 800, textTransform: 'uppercase', fontFamily: 'var(--fm)', background: CAT_CLR[c.category] || '#666', color: '#fff', letterSpacing: .5 }}>{c.category}</div>
        {team && (
          <div style={{ position: 'absolute', top: 10, left: 10, padding: '4px 10px', borderRadius: 6, fontSize: 10, fontWeight: 800, fontFamily: 'var(--fm)', background: 'rgba(0,0,0,0.65)', color: '#fff', letterSpacing: .5 }}>
            🏆 {team.name}
          </div>
        )}
        <div style={{ position: 'absolute', bottom: 10, left: 14, color: '#fff' }}>
          <div style={{ fontFamily: 'var(--fd)', fontSize: 20, fontWeight: 900, textShadow: '0 1px 4px rgba(0,0,0,.4)' }}>{c.title}</div>
        </div>
      </div>
      <div style={{ padding: '14px 16px 16px' }}>
        <div style={{ fontSize: 12, color: 'var(--c-ink3)', fontFamily: 'var(--fm)', marginBottom: 6 }}>
          {c.durationDays} zile · {c.participantsCount} participanți
          {c.hasActivities && ` · ${c.activities.length} activități · ${c.totalXp} XP`}
        </div>
        {c.description && <div style={{ fontSize: 13, color: 'var(--c-ink2)', lineHeight: 1.5, marginBottom: 10 }}>{c.description.slice(0, 90)}{c.description.length > 90 ? '...' : ''}</div>}

        {/* Progress bar (if joined) */}
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

        {/* Activities expand */}
        {c.hasActivities && c.joined && (
          <button onClick={onToggleExpand} style={{ width: '100%', padding: '8px 12px', marginBottom: 10, borderRadius: 8, border: '1px solid var(--c-border)', background: 'var(--c-bg)', cursor: 'pointer', fontSize: 12, fontWeight: 700, color: 'var(--c-ink2)', textAlign: 'left', fontFamily: 'var(--fm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>📋 {isExpanded ? 'Ascunde' : 'Vezi'} activitățile ({completedSet.size}/{c.activities.length} completate)</span>
            <span style={{ transform: isExpanded ? 'rotate(180deg)' : '', transition: '.2s' }}>▼</span>
          </button>
        )}
        {isExpanded && c.hasActivities && c.joined && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>
            {c.activities.map((act) => {
              const checked = completedSet.has(act.id);
              return (
                <label key={act.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: checked ? 'var(--c-lime-bg)' : 'var(--c-bg)', borderRadius: 10, border: `1px solid ${checked ? 'var(--c-lime)' : 'var(--c-border)'}`, cursor: 'pointer', transition: '.15s' }}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggleActivity(act.id)}
                    style={{ width: 18, height: 18, accentColor: '#B8ED00', cursor: 'pointer', flexShrink: 0 }}
                  />
                  <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: checked ? 'var(--c-lime-d)' : 'var(--c-ink2)', textDecoration: checked ? 'line-through' : 'none' }}>{act.name}</span>
                  <span style={{ fontSize: 11, fontFamily: 'var(--fm)', fontWeight: 800, color: 'var(--c-ink2)' }}>+{act.points} XP</span>
                </label>
              );
            })}
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          {c.myCompleted ? (
            <span style={{ padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 800, background: 'rgba(21,128,61,.1)', color: 'var(--c-green)', fontFamily: 'var(--fm)' }}>✓ COMPLETAT</span>
          ) : c.joined && !c.hasActivities ? (
            <button onClick={onProgress} style={{ padding: '6px 16px', borderRadius: 8, border: 0, background: 'var(--c-ink)', color: '#fff', fontWeight: 800, fontSize: 12, cursor: 'pointer', fontFamily: 'var(--fd)' }}>+ PROGRES</button>
          ) : !c.joined ? (
            <button onClick={onJoin} disabled={busy} style={{ padding: '6px 16px', borderRadius: 8, border: 0, background: CAT_CLR[c.category] || 'var(--c-lime)', color: '#000', fontWeight: 800, fontSize: 12, cursor: 'pointer', fontFamily: 'var(--fd)' }}>PARTICIPĂ →</button>
          ) : null}
          <button onClick={onLeaderboard} style={{ padding: '6px 12px', borderRadius: 8, border: '1.5px solid var(--c-border)', background: 'var(--c-bg)', color: 'var(--c-ink2)', fontWeight: 700, fontSize: 11, cursor: 'pointer', fontFamily: 'var(--fb)' }}>
            🏆
          </button>
          {isMyChallenge && (
            <button onClick={onDelete} title="Șterge challenge" style={{ padding: '6px 12px', borderRadius: 8, border: '1.5px solid var(--c-coral)', background: 'transparent', color: 'var(--c-coral)', fontWeight: 700, fontSize: 11, cursor: 'pointer' }}>
              🗑️
            </button>
          )}
          {c.creator && <span style={{ fontSize: 11, color: 'var(--c-ink3)', marginLeft: 'auto', fontFamily: 'var(--fm)' }}>de {c.creator.name}</span>}
        </div>
      </div>
    </div>
  );
}

function LeaderboardModal({ data, onClose }) {
  const { challenge, data: lbResp } = data;
  const entries = lbResp?.leaderboard || [];
  const totalXp = lbResp?.totalXp || challenge.totalXp || challenge.targetValue || 0;
  const isXp = lbResp?.isActivitiesMode;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={onClose}>
      <div style={{ background: 'var(--c-surface)', borderRadius: 18, padding: 24, maxWidth: 480, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.4)', maxHeight: '80vh', overflow: 'auto' }} onClick={(e) => e.stopPropagation()}>
        <h3 style={{ fontFamily: 'var(--fd)', fontSize: 22, fontWeight: 900, marginTop: 0, marginBottom: 4 }}>
          🏆 Leaderboard
        </h3>
        <div style={{ fontSize: 13, color: 'var(--c-ink3)', marginBottom: 16 }}>
          {challenge.title}
          {isXp && <span style={{ marginLeft: 8, padding: '2px 8px', borderRadius: 4, fontSize: 10, fontFamily: 'var(--fm)', fontWeight: 800, background: 'var(--c-lime-bg)', color: 'var(--c-lime-d)' }}>{totalXp} XP TOTAL</span>}
        </div>
        {entries.length === 0 ? (
          <div style={{ padding: 30, textAlign: 'center', color: 'var(--c-ink3)' }}>
            Niciun participant încă. Fii primul!
          </div>
        ) : (
          entries.map((entry, idx) => (
            <div key={entry.userId || idx} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 10, background: idx < 3 ? 'var(--c-lime-bg)' : 'transparent', marginBottom: 4 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: idx === 0 ? '#FFD700' : idx === 1 ? '#C0C0C0' : idx === 2 ? '#CD7F32' : 'var(--c-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--fd)', fontSize: 14, fontWeight: 900, color: idx < 3 ? '#000' : 'var(--c-ink2)' }}>
                {entry.rank || idx + 1}
              </div>
              <div style={{ flex: 1, fontSize: 14, fontWeight: 700 }}>
                {entry.name || 'Utilizator'}
                {isXp && entry.completedActivities !== null && entry.completedActivities !== undefined && (
                  <div style={{ fontSize: 10, color: 'var(--c-ink3)', fontFamily: 'var(--fm)', fontWeight: 600 }}>
                    {entry.completedActivities} activități completate
                  </div>
                )}
              </div>
              <div style={{ fontSize: 13, color: 'var(--c-ink2)', fontFamily: 'var(--fm)', fontWeight: 700 }}>
                {entry.progress || 0}{isXp ? ' XP' : ''}
              </div>
            </div>
          ))
        )}
        <button onClick={onClose} style={{ width: '100%', marginTop: 16, padding: '12px', borderRadius: 10, border: '1.5px solid var(--c-border)', background: 'transparent', cursor: 'pointer', fontWeight: 700, fontFamily: 'inherit' }}>
          Închide
        </button>
      </div>
    </div>
  );
}
