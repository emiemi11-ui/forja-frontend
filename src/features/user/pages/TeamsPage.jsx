import { useCallback, useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';
import { getTeams, createTeam, getTeamDetail, joinTeam, leaveTeam, createPost, likePost, commentPost, deletePost, deleteComment, deleteTeam, patchTeam, updateTeamMember, acceptJoinRequest, rejectJoinRequest } from '../../../shared/api/index.js';
import { getStoredToken } from '../../auth/model/authStorage.js';
import { Search, Dumbbell } from 'lucide-react';
import { useAuth } from '../../auth/context/AuthContext.jsx';
import { useConfirm } from '../../../shared/ui/ConfirmModal.jsx';
import { Toast, useToast } from '../../../shared/ui/helpers.jsx';
import { AnimatedPage, ScrollReveal, StaggerGrid } from '../../../shared/ui/animations/index.jsx';
import EmptyState from '../../../shared/ui/EmptyState.jsx';
import ImageUploadButton from '../../../shared/ui/ImageUploadButton.jsx';

const COVERS = [
  '/img/ext/u-ef4a8e3869.jpg',
  '/img/ext/u-b785e74a20.jpg',
  '/img/ext/u-bb6fa29aef.jpg',
  '/img/ext/u-560a5612a1.jpg',
  '/img/ext/u-302049a2cb.jpg',
  '/img/ext/u-1e317f1c29.jpg',
];
const CAT_COLORS = { Fitness: '#B8ED00', Running: '#1A52FF', CrossFit: '#FF4422', Yoga: '#7B2FBE', 'Nutriție': '#15803D', General: '#B45309' };

function coverFor(id) { let h = 0; for (let i = 0; i < (id||'').length; i++) h = ((h << 5) - h + id.charCodeAt(i)) | 0; return COVERS[Math.abs(h) % COVERS.length]; }

export default function TeamsPage() {
  const { updateUser } = useAuth();
  const confirm = useConfirm();
  const { toast, showToast } = useToast();
  const [teams, setTeams] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list');
  const [detail, setDetail] = useState(null);
  const [form, setForm] = useState({ name: '', category: 'Fitness', description: '', isPublic: true });
  const [busy, setBusy] = useState(false);
  const [posting, setPosting] = useState(false);          // anti double-submit
  const [showMembers, setShowMembers] = useState(false);
  const [commentTexts, setCommentTexts] = useState({});
  const [teamDetailPostImg, setTeamDetailPostImg] = useState(null);
  const [postContent, setPostContent] = useState('');
  const socketRef = useRef(null);

  const syncTeamState = useCallback((data) => {
    updateUser({ teamName: data?.activeTeam || '' });
    if (data?.refreshSocket) {
      window.dispatchEvent(new CustomEvent('forja:team_changed'));
    }
  }, [updateUser]);

  const load = useCallback(() => {
    setLoading(true);
    getTeams({ filter, q: search }).then(({ data }) => { setTeams(data); setLoading(false); }).catch(() => setLoading(false));
  }, [filter, search]);
  useEffect(() => { load(); }, [load]);

  // === Persist active team in URL — survives refresh ===
  const openDetail = useCallback(async (id) => {
    try {
      const { data } = await getTeamDetail(id);
      setDetail(data);
      setView('detail');
      // pune ID în URL ca să supraviețuim refresh-ului
      const url = new URL(window.location.href);
      url.searchParams.set('team', id);
      window.history.replaceState({}, '', url.pathname + '?' + url.searchParams.toString());
    } catch (e) {
      showToast('❌ Echipa nu a putut fi încărcată', '❌');
    }
  }, [showToast]);

  // La montare: dacă URL are ?team=ID, deschide automat detaliul
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const teamId = params.get('team');
    if (teamId) openDetail(teamId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // === Socket.IO listener for live feed updates on the open team ===
  useEffect(() => {
    if (!detail?.id) return;
    const token = getStoredToken();
    if (!token) return;
    const socketUrl = import.meta.env.VITE_API_URL || window.location.origin;
    const socket = io(socketUrl, { auth: { token }, transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('feed:new', ({ teamId, post }) => {
      if (teamId !== detail.id) return;
      setDetail((cur) => {
        if (!cur || cur.id !== teamId) return cur;
        if ((cur.posts || []).some((p) => p.id === post.id)) return cur; // dedup
        return { ...cur, posts: [post, ...(cur.posts || [])] };
      });
    });
    socket.on('feed:like', ({ postId, likes }) => {
      setDetail((cur) => {
        if (!cur) return cur;
        return { ...cur, posts: (cur.posts || []).map(p => p.id === postId ? { ...p, likes } : p) };
      });
    });
    socket.on('feed:comment', ({ postId, comment }) => {
      setDetail((cur) => {
        if (!cur) return cur;
        return {
          ...cur,
          posts: (cur.posts || []).map((p) => {
            if (p.id !== postId) return p;
            const existing = p.comments || [];
            if (existing.some((c) => c.id === comment.id)) return p; // dedup
            return { ...p, comments: [...existing, comment] };
          }),
        };
      });
    });
    socket.on('feed:comment:deleted', ({ postId, commentId }) => {
      setDetail((cur) => {
        if (!cur) return cur;
        return {
          ...cur,
          posts: (cur.posts || []).map((p) => p.id === postId
            ? { ...p, comments: (p.comments || []).filter(c => c.id !== commentId) }
            : p),
        };
      });
    });
    socket.on('feed:deleted', ({ postId, teamId }) => {
      if (teamId !== detail.id) return;
      setDetail((cur) => {
        if (!cur) return cur;
        return { ...cur, posts: (cur.posts || []).filter(p => p.id !== postId) };
      });
    });

    return () => { socket.disconnect(); socketRef.current = null; };
  }, [detail?.id]);

  // Când părăsim detail view, curățăm URL-ul
  const closeDetail = () => {
    setDetail(null);
    setView('list');
    const url = new URL(window.location.href);
    url.searchParams.delete('team');
    window.history.replaceState({}, '', url.pathname + (url.searchParams.toString() ? '?' + url.searchParams.toString() : ''));
  };

  const handleJoin = async (id) => {
    setBusy(true);
    try {
      const { data } = await joinTeam(id);
      syncTeamState(data);
      // Pentru echipe private, backend răspunde cu message='Cerere trimisă' și activeTeamId=null
      if (data?.message === 'Cerere trimisă') {
        showToast('🔒 Cerere trimisă către owner. Aștepți acceptarea.');
      }
      load();
      if (detail) openDetail(id);
    } catch (error) {
      showToast(error.response?.data?.error || '❌ Nu am putut trimite cererea', '❌');
    }
    setBusy(false);
  };
  const handleLeave = (id) => { confirm('Sigur vrei să părăsești echipa?', async () => { setBusy(true); try { const { data } = await leaveTeam(id); syncTeamState(data); load(); closeDetail(); } catch {} setBusy(false); }); };
  const handleCreate = async () => { if (!form.name.trim()) return; setBusy(true); try { const { data } = await createTeam(form); syncTeamState(data || { activeTeam: form.name.trim(), refreshSocket: true }); setForm({ name: '', category: 'Fitness', description: '', isPublic: true }); load(); if (data?.id) { openDetail(data.id); } else { setView('list'); }  } catch {} setBusy(false); };

  // === Real handlers using API ===
  const handlePublish = async () => {
    if (!postContent.trim() || posting) return; // anti double-submit
    setPosting(true);
    try {
      const { data } = await createPost({
        content: postContent.trim(),
        teamId: detail.id,
        imageUrl: teamDetailPostImg || undefined,
      });
      setDetail((cur) => {
        if (!cur) return cur;
        if ((cur.posts || []).some((p) => p.id === data.id)) return cur;
        return { ...cur, posts: [data, ...(cur.posts || [])] };
      });
      setPostContent('');
      setTeamDetailPostImg(null);
      showToast('✅ Postare publicată');
    } catch (e) {
      showToast(e.response?.data?.error || '❌ Eroare la publicare', '❌');
    } finally {
      setPosting(false);
    }
  };

  const handleToggleLike = async (postId) => {
    try {
      const { data } = await likePost(postId);
      setDetail((cur) => {
        if (!cur) return cur;
        return { ...cur, posts: (cur.posts || []).map(p => p.id === postId ? { ...p, likes: data.likes, liked: data.liked } : p) };
      });
    } catch (e) {
      showToast(e.response?.data?.error || '❌ Eroare', '❌');
    }
  };

  const handleAddComment = async (postId) => {
    const text = (commentTexts[postId] || '').trim();
    if (!text) return;
    try {
      const { data } = await commentPost(postId, text);
      setDetail((cur) => {
        if (!cur) return cur;
        return {
          ...cur,
          posts: (cur.posts || []).map((p) => {
            if (p.id !== postId) return p;
            const existing = p.comments || [];
            if (existing.some((c) => c.id === data.id)) return p;
            return { ...p, comments: [...existing, data] };
          }),
        };
      });
      setCommentTexts((prev) => ({ ...prev, [postId]: '' }));
    } catch (e) {
      showToast(e.response?.data?.error || '❌ Eroare la comentariu', '❌');
    }
  };

  const handleDeletePost = async (postId) => {
    confirm('Sigur vrei să ștergi postarea?', async () => {
      try {
        await deletePost(postId);
        setDetail((cur) => {
          if (!cur) return cur;
          return { ...cur, posts: (cur.posts || []).filter(p => p.id !== postId) };
        });
        showToast('✅ Postare ștearsă');
      } catch (e) {
        showToast(e.response?.data?.error || '❌ Eroare la ștergere', '❌');
      }
    });
  };

  // === OWNER ACTIONS ===
  const handleDeleteTeam = () => {
    if (!detail) return;
    confirm(`Sigur vrei să ȘTERGI echipa "${detail.name}"? Acțiune ireversibilă.`, async () => {
      try {
        await deleteTeam(detail.id);
        showToast('✅ Echipă ștearsă');
        closeDetail();
        load();
      } catch (e) {
        showToast(e.response?.data?.error || '❌ Eroare', '❌');
      }
    });
  };

  const handleKickMember = (member) => {
    if (!detail || member.teamRole === 'OWNER') return;
    confirm(`Scoți "${member.name}" din echipă?`, async () => {
      try {
        await updateTeamMember(detail.id, member.userId || member.id, 'remove');
        showToast('✅ Membru scos');
        // Reload team detail
        const { data } = await getTeamDetail(detail.id);
        setDetail(data);
      } catch (e) {
        showToast(e.response?.data?.error || '❌ Eroare', '❌');
      }
    });
  };

  const handleAcceptRequest = async (reqId) => {
    if (!detail) return;
    try {
      await acceptJoinRequest(detail.id, reqId);
      showToast('✅ Cerere acceptată');
      const { data } = await getTeamDetail(detail.id);
      setDetail(data);
    } catch (e) {
      showToast(e.response?.data?.error || '❌ Eroare', '❌');
    }
  };

  const handleRejectRequest = async (reqId) => {
    if (!detail) return;
    try {
      await rejectJoinRequest(detail.id, reqId);
      showToast('✅ Cerere respinsă');
      const { data } = await getTeamDetail(detail.id);
      setDetail(data);
    } catch (e) {
      showToast(e.response?.data?.error || '❌ Eroare', '❌');
    }
  };


  // === CREATE ===
  if (view === 'create') return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '24px 20px' }}>
      <button onClick={() => setView('list')} style={{ background: 'none', border: 0, color: 'var(--c-ink3)', cursor: 'pointer', fontFamily: 'var(--fb)', fontSize: 14, marginBottom: 20 }}>← Înapoi</button>
      <h1 style={{ fontFamily: 'var(--fd)', fontSize: 36, fontWeight: 900, letterSpacing: .5, color: 'var(--c-ink)', marginBottom: 24 }}>CREEAZĂ ECHIPĂ</h1>
      <div style={{ background: 'var(--c-surface)', borderRadius: 'var(--r-lg)', padding: 24, boxShadow: 'var(--shadow)' }}>
        {[
          { label: 'Nume echipă', val: form.name, key: 'name', ph: 'ex. Iron Squad' },
          { label: 'Descriere', val: form.description, key: 'description', ph: 'Despre ce e echipa ta...', area: true },
        ].map(f => (
          <div key={f.key} style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2, color: 'var(--c-ink3)', marginBottom: 6, fontFamily: 'var(--fm)' }}>{f.label}</label>
            {f.area ? (
              <textarea value={f.val} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.ph} style={{ width: '100%', padding: '12px 14px', borderRadius: 'var(--r)', border: '1.5px solid var(--c-border)', fontSize: 15, fontFamily: 'var(--fb)', resize: 'vertical', minHeight: 80, background: 'var(--c-bg)', boxSizing: 'border-box' }} />
            ) : (
              <input value={f.val} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.ph} style={{ width: '100%', padding: '12px 14px', borderRadius: 'var(--r)', border: '1.5px solid var(--c-border)', fontSize: 15, fontFamily: 'var(--fb)', background: 'var(--c-bg)', boxSizing: 'border-box' }} />
            )}
          </div>
        ))}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2, color: 'var(--c-ink3)', marginBottom: 6, fontFamily: 'var(--fm)' }}>Categorie</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {Object.keys(CAT_COLORS).map(c => (
              <button key={c} onClick={() => setForm(p => ({ ...p, category: c }))} style={{ padding: '8px 16px', borderRadius: 20, border: form.category === c ? `2px solid ${CAT_COLORS[c]}` : '1.5px solid var(--c-border)', background: form.category === c ? `${CAT_COLORS[c]}18` : 'var(--c-bg)', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'var(--fb)', color: form.category === c ? CAT_COLORS[c] : 'var(--c-ink2)' }}>{c}</button>
            ))}
          </div>
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'var(--c-ink2)', cursor: 'pointer', marginBottom: 20 }}>
          <input type="checkbox" checked={form.isPublic} onChange={e => setForm(p => ({ ...p, isPublic: e.target.checked }))} style={{ width: 18, height: 18, accentColor: '#B8ED00' }} /> Echipă publică
        </label>
        <button onClick={handleCreate} disabled={busy} style={{ width: '100%', padding: '14px 0', borderRadius: 'var(--r)', border: 0, background: 'var(--c-ink)', color: '#fff', fontFamily: 'var(--fd)', fontSize: 18, fontWeight: 800, letterSpacing: .5, cursor: 'pointer', opacity: busy ? .5 : 1 }}>{busy ? 'SE CREEAZĂ...' : 'CREEAZĂ →'}</button>
      </div>
    </div>
  );

  // === DETAIL ===
  if (view === 'detail' && detail) {
    const isAdmin = detail.myRole === 'OWNER' || detail.myRole === 'ADMIN';
    const currentUserId = JSON.parse(localStorage.getItem('forja:user') || '{}')?.id;
    return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 20px 40px' }}>
      <Toast toast={toast} />
      <button onClick={closeDetail} style={{ background: 'none', border: 0, color: 'var(--c-ink3)', cursor: 'pointer', fontFamily: 'var(--fb)', fontSize: 14, margin: '20px 0' }}>← Înapoi</button>
      <div style={{ borderRadius: 20, overflow: 'hidden', boxShadow: 'var(--shadow)', background: 'var(--c-surface)' }}>
        <div style={{ position: 'relative', height: 200, background: `url(${detail.avatarUrl || coverFor(detail.id)}) center/cover` }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(transparent 30%, rgba(0,0,0,.7))' }} />
          <div style={{ position: 'absolute', bottom: 20, left: 24, right: 24, color: '#fff' }}>
            <div style={{ fontFamily: 'var(--fd)', fontSize: 34, fontWeight: 900, letterSpacing: .5, textShadow: '0 2px 8px rgba(0,0,0,.3)' }}>{detail.name}</div>
            <div style={{ fontSize: 13, opacity: .85, marginTop: 4 }}>{detail.category} · {detail.coach} · {detail.members?.length || 0} membri</div>
          </div>
        </div>
        <div style={{ padding: 24 }}>
          {detail.description && <p style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--c-ink2)', marginBottom: 16 }}>{detail.description}</p>}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 24 }}>
            <span style={{ padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, background: 'var(--c-lime-bg)', color: 'var(--c-lime-d)', fontFamily: 'var(--fm)' }}>{detail.postsCount || 0} postări</span>
            <span style={{ padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, background: 'var(--c-blue-bg)', color: 'var(--c-blue)', fontFamily: 'var(--fm)' }}>{detail.challengesCount || 0} challenges</span>
            <span style={{ padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, background: detail.isPublic ? 'var(--c-lime-bg)' : 'var(--c-coral-bg)', color: detail.isPublic ? 'var(--c-lime-d)' : 'var(--c-coral)', fontFamily: 'var(--fm)' }}>{detail.isPublic ? 'Publică' : 'Privată'}</span>
            {detail.isMember ? (
              <button onClick={() => handleLeave(detail.id)} disabled={busy} style={{ marginLeft: 'auto', padding: '6px 18px', borderRadius: 8, border: '1.5px solid var(--c-border)', background: 'transparent', fontWeight: 700, fontSize: 12, cursor: 'pointer', color: 'var(--c-coral)' }}>Părăsește</button>
            ) : detail.teamType === 'private' ? (
              <button
                onClick={() => handleJoin(detail.id)}
                disabled={busy || !!detail.myPendingRequestId}
                style={{ marginLeft: 'auto', padding: '6px 18px', borderRadius: 8, border: 0, background: detail.myPendingRequestId ? 'var(--c-amber-bg)' : 'var(--c-amber)', color: detail.myPendingRequestId ? 'var(--c-amber)' : '#fff', fontWeight: 700, fontSize: 12, cursor: detail.myPendingRequestId ? 'default' : 'pointer', opacity: detail.myPendingRequestId ? 0.85 : 1 }}>
                {detail.myPendingRequestId ? '⏳ Cerere trimisă' : '🔒 Cere intrare'}
              </button>
            ) : (
              <button onClick={() => handleJoin(detail.id)} disabled={busy} style={{ marginLeft: 'auto', padding: '6px 18px', borderRadius: 8, border: 0, background: 'var(--c-ink)', color: '#fff', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>Alătură-te</button>
            )}
          </div>
          <button onClick={() => setShowMembers(!showMembers)} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '12px 16px', borderRadius: 10, border: '1px solid var(--c-border)', background: 'var(--c-bg)', cursor: 'pointer', fontFamily: 'var(--fd)', fontSize: 14, fontWeight: 800, color: 'var(--c-ink)', marginBottom: showMembers ? 10 : 0 }}>
            👥 {showMembers ? 'Ascunde' : 'Vezi'} membri ({(detail.members||[]).length})
            <span style={{ marginLeft: 'auto', transition: 'transform 0.2s', transform: showMembers ? 'rotate(180deg)' : '' }}>▼</span>
          </button>
          {showMembers && <div style={{ display: 'grid', gap: 2 }}>
            {(detail.members || []).map(m => (
              <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--c-border)' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--c-lime-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, color: 'var(--c-lime-d)', fontFamily: 'var(--fd)', flexShrink: 0 }}>
                  {(m.name||'U')[0]}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--c-ink)' }}>{m.name}</div>
                </div>
                <span style={{ padding: '3px 8px', borderRadius: 5, fontSize: 9, fontWeight: 700, fontFamily: 'var(--fm)', background: m.teamRole === 'OWNER' ? 'var(--c-ink)' : 'var(--c-bg)', color: m.teamRole === 'OWNER' ? '#fff' : 'var(--c-ink3)' }}>{m.teamRole}</span>
                {detail.myRole === 'OWNER' && m.teamRole !== 'OWNER' && (
                  <button onClick={() => handleKickMember(m)}
                    style={{ background: 'none', border: 'none', color: 'var(--c-coral)', fontSize: 11, cursor: 'pointer', padding: '4px 8px' }}>
                    🚫 Scoate
                  </button>
                )}
              </div>
            ))}
          </div>}

          {/* === OWNER: Pending join requests === */}
          {detail.myRole === 'OWNER' && (detail.pendingRequests || []).length > 0 && (
            <div style={{ marginTop: 16, padding: 14, borderRadius: 12, background: 'var(--c-amber-bg)', border: '1.5px solid var(--c-amber)' }}>
              <div style={{ fontFamily: 'var(--fd)', fontSize: 14, fontWeight: 800, marginBottom: 10, color: 'var(--c-amber-d, #B45309)' }}>
                ⏳ Cereri în așteptare ({detail.pendingRequests.length})
              </div>
              {detail.pendingRequests.map((r) => (
                <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderTop: '1px solid rgba(180,88,9,0.15)' }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: r.avatarUrl ? `url(${r.avatarUrl}) center/cover` : 'rgba(180,88,9,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 12, color: 'var(--c-amber-d, #B45309)', overflow: 'hidden' }}>
                    {!r.avatarUrl && (r.userName || '?')[0]}
                  </div>
                  <div style={{ flex: 1, fontSize: 13 }}>
                    <strong>{r.userName || 'Utilizator'}</strong>
                    {r.date && <div style={{ fontSize: 10, color: 'var(--c-ink3)', fontFamily: 'var(--fm)' }}>{new Date(r.date).toLocaleDateString('ro-RO')}</div>}
                  </div>
                  <button onClick={() => handleAcceptRequest(r.id)}
                    style={{ padding: '6px 12px', borderRadius: 8, border: 0, background: 'var(--c-lime)', color: '#000', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                    ✅ Accept
                  </button>
                  <button onClick={() => handleRejectRequest(r.id)}
                    style={{ padding: '6px 12px', borderRadius: 8, border: '1.5px solid var(--c-coral)', background: 'transparent', color: 'var(--c-coral)', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                    ✖
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* === OWNER: Delete team button === */}
          {detail.myRole === 'OWNER' && (
            <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px dashed var(--c-border)' }}>
              <button onClick={handleDeleteTeam}
                style={{ width: '100%', padding: '10px', borderRadius: 10, border: '1.5px solid var(--c-coral)', background: 'transparent', color: 'var(--c-coral)', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--fb)' }}>
                🗑 Șterge echipa (acțiune ireversibilă)
              </button>
            </div>
          )}



          {/* POST CREATION - only for admin/owner */}
          {(detail.myRole === 'OWNER' || detail.myRole === 'ADMIN') && (
            <div style={{ marginTop: 24, marginBottom: 16 }}>
              <div style={{ fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--c-lime-d)', marginBottom: 8 }}>
                📢 POSTEAZĂ ÎN ECHIPĂ ({detail.myRole})
              </div>
              <textarea
                id="teamPostInput"
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                placeholder="Scrie o postare pentru echipă... (antrenamente, motivație, anunțuri)"
                rows={3}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid var(--c-border)', fontFamily: 'var(--fb)', fontSize: 14, boxSizing: 'border-box', resize: 'vertical' }}
              />
              <ImageUploadButton
                onImageSelect={setTeamDetailPostImg}
                currentImage={teamDetailPostImg}
                onRemove={() => setTeamDetailPostImg(null)}
                label="Imagine postare"
                compact
              />
              <div style={{ marginTop: 8 }}>
                <button className="btn btn-lime" style={{ whiteSpace: 'nowrap' }}
                  onClick={handlePublish}
                  disabled={posting || !postContent.trim()}>
                  {posting ? '⏳ Se publică...' : '📢 Publică'}
                </button>
              </div>
            </div>
          )}

          {/* POSTS FEED */}
          {!detail.isMember && detail.teamType === 'private' ? (
            <div style={{ marginTop: 24, padding: '40px 20px', textAlign: 'center', background: 'var(--c-bg)', borderRadius: 14, border: '1.5px dashed var(--c-border)' }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>🔒</div>
              <div style={{ fontFamily: 'var(--fd)', fontSize: 18, fontWeight: 800, color: 'var(--c-ink)', marginBottom: 6 }}>Echipă privată</div>
              <div style={{ fontSize: 13, color: 'var(--c-ink3)', lineHeight: 1.6 }}>Postările sunt vizibile doar pentru membrii echipei.<br/>Trimite o cerere de alăturare pentru acces.</div>
            </div>
          ) : detail.posts && detail.posts.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <div style={{ fontFamily: 'var(--fd)', fontSize: 18, fontWeight: 800, marginBottom: 14, color: 'var(--c-ink)' }}>POSTĂRI</div>
              {detail.posts.map(post => (
                <div key={post.id} style={{ padding: '16px 0', borderBottom: '1px solid var(--c-border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--c-lime-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, color: 'var(--c-lime-d)', fontFamily: 'var(--fd)' }}>{(post.author || '?')[0]}</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>{post.author}</div>
                      <div style={{ fontSize: 11, color: 'var(--c-ink3)' }}>{new Date(post.createdAt).toLocaleDateString('ro-RO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                    {(isAdmin || post.authorId === currentUserId) && (
                      <button onClick={(e) => { e.stopPropagation(); handleDeletePost(post.id); }}
                        style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: 'var(--c-coral)', padding: '2px 6px' }}>🗑️ Șterge</button>
                    )}
                  </div>
                  <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--c-ink2)', margin: 0 }}>{post.content}</p>
                  {post.img && <img src={post.img} alt="" style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 12, marginTop: 10 }} />}
                  <div style={{ display: 'flex', gap: 16, marginTop: 10, alignItems: 'center' }}>
                    <button onClick={() => handleToggleLike(post.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: post.liked ? 'var(--c-coral)' : 'var(--c-ink3)', display: 'flex', alignItems: 'center', gap: 4, padding: 0 }}>
                      {post.liked ? '❤️' : '🤍'} {post.likes || 0}
                    </button>
                    <span style={{ fontSize: 12, color: 'var(--c-ink3)' }}>💬 {(post.comments||[]).length}</span>
                  </div>
                  {/* Comments */}
                  {(post.comments||[]).map((c) => (
                    <div key={c.id} style={{ display: 'flex', gap: 8, padding: '6px 0 6px 46px', fontSize: 12 }}>
                      <span style={{ fontWeight: 700, color: 'var(--c-ink)' }}>{c.author}:</span>
                      <span style={{ color: 'var(--c-ink2)' }}>{c.content || c.text}</span>
                    </div>
                  ))}
                  <div style={{ display: 'flex', gap: 6, marginTop: 6, paddingLeft: 46 }}>
                    <input value={commentTexts[post.id]||''} onChange={e => setCommentTexts(prev => ({...prev, [post.id]: e.target.value}))}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                      placeholder="Scrie un comentariu..." style={{ flex: 1, padding: '6px 10px', borderRadius: 8, border: '1px solid var(--c-border)', fontSize: 12, fontFamily: 'var(--fb)', background: 'var(--c-surface)' }} />
                    <button onClick={() => handleAddComment(post.id)}
                      style={{ padding: '6px 12px', borderRadius: 8, border: 'none', background: 'var(--c-lime)', color: '#000', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>→</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
  }

  // === LIST ===
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontFamily: 'var(--fm)', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--c-lime-d)', fontWeight: 700 }}>comunitate</div>
          <h1 style={{ fontFamily: 'var(--fd)', fontSize: 42, fontWeight: 900, letterSpacing: .5, color: 'var(--c-ink)', lineHeight: .95, marginTop: 4 }}>ECHIPE</h1>
        </div>
        <button onClick={() => setView('create')} style={{ padding: '12px 24px', borderRadius: 'var(--r)', border: 0, background: 'var(--c-ink)', color: '#fff', fontFamily: 'var(--fd)', fontSize: 16, fontWeight: 800, cursor: 'pointer', letterSpacing: .5 }}>+ CREEAZĂ</button>
      </div>

      <div style={{ position: 'relative', marginBottom: 16 }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Caută echipe, coachi, categorii..." style={{ width: '100%', padding: '14px 16px 14px 42px', borderRadius: 'var(--r)', border: '1.5px solid var(--c-border)', fontSize: 15, fontFamily: 'var(--fb)', background: 'var(--c-surface)', boxSizing: 'border-box' }} />
        <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--c-ink3)', display: 'flex' }}><Search size={16} /></span>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {[['all','Toate'],['mine','Echipele mele'],['public','Publice']].map(([k,l]) => (
          <button key={k} onClick={() => setFilter(k)} style={{ padding: '8px 18px', borderRadius: 20, border: filter===k ? '2px solid var(--c-ink)' : '1.5px solid var(--c-border)', background: filter===k ? 'var(--c-ink)' : 'transparent', color: filter===k ? '#fff' : 'var(--c-ink2)', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'var(--fb)' }}>{l}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: 16 }}>
          {[1,2,3,4,5,6].map(i => <div key={i} className="forja-skeleton" style={{ height: 240, borderRadius: 16 }} />)}
        </div>
      ) : teams.length === 0 ? (
        <EmptyState type="generic" title="Nicio echipa gasita" description="Creeaza prima echipa sau schimba filtrele." action={() => setView('create')} actionLabel="+ Creeaza echipa" />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: 16 }}>
          {teams.map((team, idx) => (
            <motion.div key={team.id}
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: idx * 0.05, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
              whileHover={{ y: -5, boxShadow: '0 16px 40px rgba(0,0,0,0.12)' }}
              onClick={() => openDetail(team.id)}
              style={{ borderRadius: 'var(--r-lg)', overflow: 'hidden', background: 'var(--c-surface)', boxShadow: 'var(--shadow-sm)', cursor: 'pointer', border: '1px solid var(--c-border)' }}>
              <div style={{ height: 140, background: `url(${team.avatarUrl || coverFor(team.id)}) center/cover`, position: 'relative' }}>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(transparent 40%, rgba(0,0,0,.55))' }} />
                <div style={{ position: 'absolute', top: 10, right: 10, padding: '4px 10px', borderRadius: 6, fontSize: 10, fontWeight: 800, letterSpacing: .5, textTransform: 'uppercase', fontFamily: 'var(--fm)', background: CAT_COLORS[team.category] || '#666', color: '#fff' }}>{team.category}</div>
                {team.isMember && <div style={{ position: 'absolute', top: 10, left: 10, padding: '4px 8px', borderRadius: 6, fontSize: 9, fontWeight: 800, textTransform: 'uppercase', background: 'rgba(184,237,0,.9)', color: '#000', fontFamily: 'var(--fm)', letterSpacing: .5 }}>membru</div>}
              </div>
              <div style={{ padding: '14px 16px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                  <div style={{ fontFamily: 'var(--fd)', fontSize: 19, fontWeight: 800, color: 'var(--c-ink)', letterSpacing: .3, flex: 1 }}>{team.name}</div>
                  {team.teamType === 'private' && <span style={{ padding: '3px 8px', borderRadius: 5, fontSize: 9, fontWeight: 800, background: 'var(--c-amber-bg)', color: 'var(--c-amber)', fontFamily: 'var(--fm)' }}>PRIVATĂ</span>}
                </div>
                <div style={{ fontSize: 12, color: 'var(--c-ink3)', marginTop: 2, fontFamily: 'var(--fm)' }}>
                  {team.membersCount} membri · {team.postsCount || 0} postări
                  {team.teamType === 'private' && <span style={{ marginLeft: 6, color: 'var(--c-amber)', fontWeight: 700 }}>· Privată</span>}
                </div>
                {team.description && <div style={{ fontSize: 13, color: 'var(--c-ink2)', marginTop: 8, lineHeight: 1.5 }}>{team.description.slice(0, 80)}{team.description.length > 80 ? '...' : ''}</div>}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
