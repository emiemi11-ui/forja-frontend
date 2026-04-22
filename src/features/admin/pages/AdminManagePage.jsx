import { useEffect, useState } from 'react';
import {
  commentPost,
  deleteComment as deleteFeedComment,
  deletePost,
  deleteTeam,
  getDiscover,
  getTeamDetail,
  getTeams,
} from '../../../shared/api/index.js';
import { AdminPanel, StatusPill } from '../components/AdminUi.jsx';
import { useConfirm } from '../../../shared/ui/ConfirmModal.jsx';
import { Toast, useToast } from '../../../shared/ui/helpers.jsx';
import { Trash2 } from 'lucide-react';

export default function AdminManagePage() {
  const [teams, setTeams] = useState([]);
  const [pros, setPros] = useState([]);
  const [teamDetails, setTeamDetails] = useState({});
  const [tab, setTab] = useState('teams');
  const [expandedTeam, setExpandedTeam] = useState(null);
  const [expandedPro, setExpandedPro] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentDrafts, setCommentDrafts] = useState({});
  const [commentBusy, setCommentBusy] = useState('');
  const confirm = useConfirm();
  const { toast, showToast } = useToast();

  const loadTeams = async () => {
    const { data } = await getTeams();
    const normalized = Array.isArray(data) ? data : [];
    setTeams(normalized);
    return normalized;
  };

  const loadPros = async () => {
    const { data } = await getDiscover();
    const professionals = Array.isArray(data) ? data.filter((person) => person.role !== 'USER') : [];
    setPros(professionals);
    return professionals;
  };

  const loadTeamDetail = async (teamId, force = false) => {
    if (!teamId || (!force && teamDetails[teamId])) return teamDetails[teamId];
    const { data } = await getTeamDetail(teamId);
    setTeamDetails((prev) => ({ ...prev, [teamId]: data }));
    return data;
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        await Promise.all([loadTeams(), loadPros()]);
      } catch (error) {
        showToast(error.response?.data?.error || '❌ Nu am putut încărca moderarea.', '❌');
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (expandedTeam) loadTeamDetail(expandedTeam);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expandedTeam]);

  const setCommentValue = (postId, value) => {
    setCommentDrafts((prev) => ({ ...prev, [postId]: value }));
  };

  const deleteTeamHandler = (teamId) => {
    confirm('Sigur vrei să ștergi complet această echipă? Toate postările și membrii vor fi eliminați.', async () => {
      try {
        await deleteTeam(teamId);
        setTeams((prev) => prev.filter((team) => team.id !== teamId));
        setTeamDetails((prev) => {
          const next = { ...prev };
          delete next[teamId];
          return next;
        });
        showToast('🗑 Echipă ștearsă');
      } catch (error) {
        showToast(error.response?.data?.error || '❌ Nu am putut șterge echipa.', '❌');
      }
    });
  };

  const deleteTeamPost = (teamId, postId) => {
    confirm('Sigur vrei să ștergi această postare?', async () => {
      try {
        await deletePost(postId);
        await loadTeamDetail(teamId, true);
        await loadTeams();
        showToast('🗑 Postare de echipă ștearsă');
      } catch (error) {
        showToast(error.response?.data?.error || '❌ Nu am putut șterge postarea.', '❌');
      }
    });
  };

  const deleteProPost = (professionalId, postId) => {
    confirm('Sigur vrei să ștergi această postare de profil?', async () => {
      try {
        await deletePost(postId);
        await loadPros();
        setExpandedPro(professionalId);
        showToast('🗑 Postare de profil ștearsă');
      } catch (error) {
        showToast(error.response?.data?.error || '❌ Nu am putut șterge postarea.', '❌');
      }
    });
  };

  const deleteTeamComment = async (teamId, commentId) => {
    try {
      await deleteFeedComment(commentId);
      await loadTeamDetail(teamId, true);
      showToast('🗑 Comentariu șters');
    } catch (error) {
      showToast(error.response?.data?.error || '❌ Nu am putut șterge comentariul.', '❌');
    }
  };

  const deleteProComment = async (professionalId, commentId) => {
    try {
      await deleteFeedComment(commentId);
      await loadPros();
      setExpandedPro(professionalId);
      showToast('🗑 Comentariu șters');
    } catch (error) {
      showToast(error.response?.data?.error || '❌ Nu am putut șterge comentariul.', '❌');
    }
  };

  const submitComment = async ({ teamId = null, professionalId = null, postId }) => {
    const value = String(commentDrafts[postId] || '').trim();
    if (!value || commentBusy) return;
    setCommentBusy(postId);
    try {
      await commentPost(postId, value);
      setCommentDrafts((prev) => ({ ...prev, [postId]: '' }));
      if (teamId) {
        await loadTeamDetail(teamId, true);
      }
      if (professionalId) {
        await loadPros();
        setExpandedPro(professionalId);
      }
      showToast('💬 Comentariu adăugat');
    } catch (error) {
      showToast(error.response?.data?.error || '❌ Nu am putut trimite comentariul.', '❌');
    } finally {
      setCommentBusy('');
    }
  };

  const renderPost = ({ post, onDelete, onDeleteComment, onComment, commentValue }) => (
    <div key={post.id} style={{ padding: 16, background: 'var(--c-bg)', borderRadius: 12, marginBottom: 10, border: '1px solid var(--c-border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--c-lime-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, color: 'var(--c-lime-d)', fontFamily: 'var(--fd)' }}>
          {(post.author || 'U')[0]}
        </div>
        <div style={{ flex: 1, minWidth: 120 }}>
          <div style={{ fontWeight: 700, fontSize: 13 }}>{post.author}</div>
          <div style={{ fontSize: 10, color: 'var(--c-ink3)' }}>{new Date(post.createdAt).toLocaleDateString('ro-RO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })} · ❤️ {post.likes || 0}</div>
        </div>
        <button onClick={onDelete} style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid var(--c-coral)', background: 'var(--c-coral-bg)', color: 'var(--c-coral)', fontSize: 11, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
          <Trash2 size={12} /> Șterge postare
        </button>
      </div>

      <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--c-ink)', margin: '0 0 10px' }}>{post.content}</p>
      {post.img ? <img src={post.img} alt="" style={{ width: '100%', maxHeight: 240, objectFit: 'cover', borderRadius: 10, marginBottom: 10 }} onError={(event) => { event.currentTarget.style.display = 'none'; }} /> : null}

      <div style={{ borderTop: '1px solid var(--c-border)', paddingTop: 10, marginTop: 6 }}>
        <div style={{ fontFamily: 'var(--fm)', fontSize: 9, letterSpacing: 1, color: 'var(--c-ink3)', marginBottom: 6 }}>COMENTARII ({post.comments?.length || 0})</div>
        {(post.comments || []).length ? (
          post.comments.map((comment) => (
            <div key={comment.id || `${post.id}-${comment.author}-${comment.createdAt}`} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', fontSize: 13 }}>
              <span style={{ fontWeight: 700, color: 'var(--c-ink)', fontSize: 12 }}>{comment.author}:</span>
              <span style={{ flex: 1, color: 'var(--c-ink2)', fontSize: 12 }}>{comment.text || comment.content}</span>
              {comment.id ? (
                <button onClick={() => onDeleteComment(comment.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--c-coral)', fontSize: 10, padding: '2px 4px', flexShrink: 0 }}>🗑</button>
              ) : null}
            </div>
          ))
        ) : (
          <div style={{ fontSize: 12, color: 'var(--c-ink3)', fontStyle: 'italic', marginBottom: 8 }}>Nu există comentarii încă.</div>
        )}

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
          <input
            value={commentValue || ''}
            onChange={(event) => setCommentValue(post.id, event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                onComment();
              }
            }}
            placeholder="Scrie un comentariu ca admin..."
            style={{ flex: '1 1 220px', minWidth: 180, padding: '10px 12px', borderRadius: 10, border: '1px solid var(--c-border)', background: 'var(--c-surface)' }}
          />
          <button className="btn btn-lime btn-sm" onClick={onComment} disabled={commentBusy === post.id || !String(commentValue || '').trim()}>
            {commentBusy === post.id ? 'Se trimite...' : 'Comentează'}
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="admin-page">
        <Toast toast={toast} />
        <div style={{ padding: 40, textAlign: 'center' }}><div className="spinner" /></div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <Toast toast={toast} />
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {[['teams', '🏆 Echipe'], ['pros', '👤 Profesioniști']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} style={{ padding: '8px 20px', borderRadius: 20, border: tab === key ? '2px solid var(--c-ink)' : '1.5px solid var(--c-border)', background: tab === key ? 'var(--c-ink)' : 'transparent', color: tab === key ? '#fff' : 'var(--c-ink2)', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'var(--fb)' }}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'teams' ? (
        <AdminPanel title={`Toate echipele (${teams.length})`}>
          {teams.map((team) => {
            const detail = teamDetails[team.id];
            const posts = detail?.posts || [];
            const pendingRequests = detail?.pendingRequests || [];
            return (
              <div key={team.id} style={{ borderBottom: '1px solid var(--c-border)', padding: '16px 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, overflow: 'hidden', flexShrink: 0, background: 'var(--c-ink)' }}>
                    {team.avatarUrl ? <img src={team.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(event) => { event.currentTarget.style.display = 'none'; }} /> : null}
                  </div>
                  <div style={{ flex: 1, minWidth: 150 }}>
                    <div style={{ fontWeight: 800, fontSize: 16, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      {team.name}
                      {team.teamType === 'private' ? <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 9, fontWeight: 800, background: 'var(--c-amber-bg)', color: 'var(--c-amber)', fontFamily: 'var(--fm)' }}>🔒 PRIVATĂ</span> : null}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--c-ink3)', marginTop: 2 }}>{team.category} · {team.membersCount} membri · {(detail?.postsCount ?? team.postsCount ?? posts.length)} postări · Coach: {detail?.coach || team.coach || '-'}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <button onClick={async () => {
                      const next = expandedTeam === team.id ? null : team.id;
                      setExpandedTeam(next);
                      if (next) await loadTeamDetail(next);
                    }} style={{ padding: '6px 16px', borderRadius: 8, border: '1px solid var(--c-border)', background: 'var(--c-surface)', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>
                      {expandedTeam === team.id ? '▲ Ascunde' : '▼ Postări'}
                    </button>
                    <button onClick={() => deleteTeamHandler(team.id)} style={{ padding: '6px 14px', borderRadius: 8, border: 'none', background: 'var(--c-coral)', cursor: 'pointer', color: '#fff', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Trash2 size={12} /> Șterge echipa
                    </button>
                  </div>
                </div>

                {expandedTeam === team.id ? (
                  <div style={{ marginTop: 16 }}>
                    {posts.length === 0 ? (
                      <div style={{ padding: 20, textAlign: 'center', color: 'var(--c-ink3)', fontSize: 13 }}>Nicio postare în această echipă</div>
                    ) : posts.map((post) => renderPost({
                      post,
                      onDelete: () => deleteTeamPost(team.id, post.id),
                      onDeleteComment: (commentId) => deleteTeamComment(team.id, commentId),
                      onComment: () => submitComment({ teamId: team.id, postId: post.id }),
                      commentValue: commentDrafts[post.id],
                    }))}

                    {pendingRequests.length ? (
                      <div style={{ marginTop: 10, padding: 14, background: 'var(--c-amber-bg)', borderRadius: 10, border: '1px solid rgba(180,83,9,0.15)' }}>
                        <div style={{ fontFamily: 'var(--fm)', fontSize: 9, letterSpacing: 1, color: 'var(--c-amber)', fontWeight: 700, marginBottom: 6 }}>🔔 CERERI PENDINTE ({pendingRequests.length})</div>
                        {pendingRequests.map((request) => (
                          <div key={request.id} style={{ fontSize: 13, color: 'var(--c-ink2)', padding: '4px 0' }}>
                            <strong>{request.userName}</strong> — {new Date(request.date).toLocaleDateString('ro-RO', { day: 'numeric', month: 'short' })}
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            );
          })}
        </AdminPanel>
      ) : (
        <AdminPanel title={`Profesioniști (${pros.length})`}>
          {pros.map((pro) => (
            <div key={pro.id} style={{ borderBottom: '1px solid var(--c-border)', padding: '16px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--c-ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16, color: 'var(--c-lime)', fontFamily: 'var(--fd)', flexShrink: 0 }}>
                  {(pro.name || 'P')[0]}
                </div>
                <div style={{ flex: 1, minWidth: 120 }}>
                  <div style={{ fontWeight: 800, fontSize: 16 }}>{pro.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--c-ink3)', display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                    <StatusPill tone={pro.role === 'COACH' ? 'info' : 'purple'}>{pro.role}</StatusPill>
                    {(pro.posts || []).length} postări
                  </div>
                </div>
                <button onClick={() => setExpandedPro(expandedPro === pro.id ? null : pro.id)} style={{ padding: '6px 16px', borderRadius: 8, border: '1px solid var(--c-border)', background: 'var(--c-surface)', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>
                  {expandedPro === pro.id ? '▲ Ascunde' : '▼ Postări'}
                </button>
              </div>

              {expandedPro === pro.id ? (
                <div style={{ marginTop: 14 }}>
                  {(pro.posts || []).length === 0 ? (
                    <div style={{ padding: 20, textAlign: 'center', color: 'var(--c-ink3)', fontSize: 13 }}>Nicio postare</div>
                  ) : (pro.posts || []).map((post) => renderPost({
                    post,
                    onDelete: () => deleteProPost(pro.id, post.id),
                    onDeleteComment: (commentId) => deleteProComment(pro.id, commentId),
                    onComment: () => submitComment({ professionalId: pro.id, postId: post.id }),
                    commentValue: commentDrafts[post.id],
                  }))}
                </div>
              ) : null}
            </div>
          ))}
        </AdminPanel>
      )}
    </div>
  );
}
