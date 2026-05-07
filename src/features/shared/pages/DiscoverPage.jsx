import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { startConversation, getDiscover, addDiscoverReview, requestProfessional } from '../../../shared/api/index.js';
import { Toast, useToast } from '../../../shared/ui/helpers.jsx';
import { useAuth } from '../../../features/auth/context/AuthContext.jsx';
import { Star, MessageCircle, Users, Award, ChevronDown, Heart, UserPlus } from 'lucide-react';
import { AnimatedPage } from '../../../shared/ui/animations/index.jsx';

const ROLE_FILTERS = ['Toți', 'Coach', 'Nutritionist'];

export default function DiscoverPage() {
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Toți');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(null);
  const [showReviews, setShowReviews] = useState(null);
  const [reviewText, setReviewText] = useState('');
  const [reviewStars, setReviewStars] = useState(5);
  const { toast, showToast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter === 'Coach') params.role = 'COACH';
      if (filter === 'Nutritionist') params.role = 'NUTRITIONIST';
      if (search.trim()) params.q = search.trim();
      const { data } = await getDiscover(params);
      setProfessionals(Array.isArray(data) ? data : []);
    } catch {
      setProfessionals([]);
    } finally {
      setLoading(false);
    }
  }, [filter, search]);

  useEffect(() => { load(); }, [load]);

  const dmBase = user?.role === 'COACH' ? '/coach/dm' : user?.role === 'NUTRITIONIST' ? '/nutritionist/dm' : '/app/dm';

  const handleMessage = async (targetUserId) => {
    try {
      await startConversation(targetUserId);
      navigate(dmBase);
      showToast('✅ Conversație creată!');
    } catch (e) {
      showToast(e.response?.data?.error || '❌ Eroare', '❌');
    }
  };

  const handleRequestProfessional = async (professional) => {
    const label = professional.role === 'COACH' ? 'coach' : 'nutriționist';
    try {
      const { data } = await requestProfessional(professional.id);
      if (data.status === 'ACCEPTED') {
        showToast(`✅ Ești deja conectat cu acest ${label}!`);
      } else if (data.status === 'PENDING_ATHLETE' || data.status === 'PENDING_CLIENT') {
        showToast(`✅ ${professional.name} te-a invitat — confirmă din profil!`);
      } else {
        showToast(`✅ Cerere trimisă către ${professional.name}!`);
      }
    } catch (e) {
      showToast(e.response?.data?.error || '❌ Eroare', '❌');
    }
  };

  return (
    <AnimatedPage>
      <Toast toast={toast} />
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--c-lime-d)', fontWeight: 700 }}>marketplace</div>
        <h1 style={{ fontFamily: 'var(--fd)', fontSize: 36, fontWeight: 900, letterSpacing: .5, color: 'var(--c-ink)', lineHeight: 1, marginTop: 4 }}>GĂSEȘTE PROFESIONIȘTII</h1>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        {ROLE_FILTERS.map(r => (
          <button key={r} className={`chip${filter === r ? ' on' : ''}`} onClick={() => setFilter(r)}>{r}</button>
        ))}
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Caută după nume..." style={{ padding: '8px 14px', borderRadius: 'var(--r)', border: '1.5px solid var(--c-border)', fontSize: 13, fontFamily: 'var(--fb)', background: 'var(--c-surface)', flex: 1, minWidth: 200 }} />
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center' }}><div className="spinner" /></div>
      ) : professionals.length === 0 ? (
        <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--c-ink3)', fontSize: 14 }}>
          Niciun profesionist găsit{search ? ` pentru "${search}"` : ''}.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
          {professionals.map(p => {
            const isExpanded = expanded === p.id;
            const roleColor = p.role === 'COACH' ? 'var(--c-blue)' : 'var(--c-purple)';
            const roleBg = p.role === 'COACH' ? 'var(--c-blue-bg)' : 'var(--c-purple-bg)';
            return (
              <div key={p.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {/* Cover */}
                <div style={{ height: 80, background: `linear-gradient(135deg, ${roleColor}20, ${roleColor}08)`, position: 'relative' }}>
                  <div style={{ position: 'absolute', bottom: -30, left: 20 }}>
                    <div style={{ width: 64, height: 64, borderRadius: '50%', border: '3px solid var(--c-surface)', overflow: 'hidden', background: roleColor }}>
                      {p.avatarUrl ? <img src={p.avatarUrl} alt="" onError={e => { e.target.style.display = "none"; }} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> :
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 24, color: '#fff', fontFamily: 'var(--fd)' }}>{p.avatar || p.name[0]}</div>}
                    </div>
                  </div>
                  {/* Role badge */}
                  <div style={{ position: 'absolute', top: 10, right: 10, padding: '4px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700, fontFamily: 'var(--fm)', background: 'var(--c-surface)', color: 'var(--c-ink)', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', letterSpacing: 0.5 }}>
                    {p.role === 'COACH' ? '🏋️ Coach' : '🥗 Nutriționist'}
                  </div>
                </div>

                {/* Info */}
                <div style={{ padding: '40px 20px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <div style={{ fontFamily: 'var(--fd)', fontSize: 20, fontWeight: 800 }}>{p.name}</div>
                    <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700, background: roleBg, color: roleColor, fontFamily: 'var(--fm)' }}>{p.role}</span>
                  </div>
                  {p.teamName && <div style={{ fontSize: 12, color: 'var(--c-ink3)', marginBottom: 6 }}>{p.teamName} · Lv.{p.level}</div>}
                  {p.bio && <p style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--c-ink2)', margin: '8px 0' }}>{p.bio}</p>}

                  {/* Stats row */}
                  <div style={{ display: 'flex', gap: 16, marginTop: 12, marginBottom: 12 }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontFamily: 'var(--fd)', fontSize: 20, fontWeight: 900, color: 'var(--c-ink)' }}>{p.clientsCount}</div>
                      <div style={{ fontFamily: 'var(--fm)', fontSize: 9, color: 'var(--c-ink3)', letterSpacing: 1 }}>{p.role === 'COACH' ? 'ATLEȚI' : 'CLIENȚI'}</div>
                    </div>
                    {p.rating && <div style={{ textAlign: 'center' }}>
                      <div style={{ fontFamily: 'var(--fd)', fontSize: 20, fontWeight: 900, color: '#f5c518' }}>★ {p.rating}</div>
                      <div style={{ fontFamily: 'var(--fm)', fontSize: 9, color: 'var(--c-ink3)', letterSpacing: 1 }}>{Array.isArray(p.reviews) ? p.reviews.length : p.reviews} RECENZII</div>
                    </div>}
                  </div>

                  {/* Benefits */}
                  {p.benefits && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
                      {p.benefits.map((b, i) => (
                        <span key={i} style={{ padding: '3px 8px', borderRadius: 6, fontSize: 10, fontWeight: 600, background: 'var(--c-bg)', color: 'var(--c-ink2)', fontFamily: 'var(--fm)' }}>✓ {b}</span>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-black btn-sm" style={{ flex: 1, justifyContent: 'center' }} onClick={() => handleMessage(p.id)}>
                      <MessageCircle size={14} /> Mesaj
                    </button>
                    {user?.role === 'USER' && (
                      <button
                        className="btn btn-outline btn-sm"
                        style={{ flex: 1, justifyContent: 'center', background: 'var(--c-lime)', color: 'var(--c-ink)', borderColor: 'var(--c-lime)' }}
                        onClick={() => handleRequestProfessional(p)}
                        title={p.role === 'COACH' ? 'Cere să-ți fie coach' : 'Cere să-ți fie nutriționist'}
                      >
                        <UserPlus size={14} /> Cere
                      </button>
                    )}
                    <button className="btn btn-outline btn-sm" onClick={() => setExpanded(isExpanded ? null : p.id)} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <ChevronDown size={14} style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} /> Postări
                    </button>
                  </div>
                </div>

                {/* Expanded posts */}
                {isExpanded && p.posts && (
                  <div style={{ borderTop: '1px solid var(--c-border)', padding: '0' }}>
                    {p.posts.map((post, i) => (
                      <div key={i} style={{ padding: '14px 20px', borderBottom: '1px solid var(--c-border)' }}>
                        <p style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--c-ink2)', margin: 0 }}>{post.content}</p>
                        {post.img && <img src={post.img} alt="" onError={e => { e.target.style.display = "none"; }} style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 10, marginTop: 8 }} />}
                        <div style={{ marginTop: 8, fontSize: 12, color: 'var(--c-ink3)' }}>
                          <Heart size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /> {post.likes}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* REVIEWS */}
                <div style={{ borderTop: '1px solid var(--c-border)', padding: '12px 20px' }}>
                  <button onClick={() => setShowReviews(showReviews === p.id ? null : p.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700, color: 'var(--c-ink2)', display: 'flex', alignItems: 'center', gap: 6, padding: 0, width: '100%' }}>
                    ⭐ Recenzii ({Array.isArray(p.reviews) ? p.reviews.length : 0})
                    <span style={{ marginLeft: 'auto', transform: showReviews === p.id ? 'rotate(180deg)' : '', transition: 'transform 0.2s' }}>▼</span>
                  </button>
                  {showReviews === p.id && (
                    <div style={{ marginTop: 10 }}>
                      {Array.isArray(p.reviews) && p.reviews.map((r, ri) => (
                        <div key={ri} style={{ padding: '8px 0', borderBottom: '1px solid var(--c-border)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div><span style={{ fontWeight: 700, fontSize: 12 }}>{r.user}</span> <span style={{ color: '#f5c518', fontSize: 12 }}>{'★'.repeat(r.stars)}{'☆'.repeat(5-r.stars)}</span></div>
                            <span style={{ fontSize: 10, color: 'var(--c-ink3)' }}>{r.date}</span>
                          </div>
                          <p style={{ fontSize: 12, color: 'var(--c-ink2)', margin: '4px 0 0', lineHeight: 1.4 }}>{r.text}</p>
                        </div>
                      ))}
                      {/* Add review */}
                      <div style={{ marginTop: 12, padding: '12px', borderRadius: 10, background: 'var(--c-bg)', border: '1px solid var(--c-border)' }}>
                        <div style={{ fontFamily: 'var(--fm)', fontSize: 9, letterSpacing: 1, color: 'var(--c-ink3)', marginBottom: 6 }}>LASĂ O RECENZIE</div>
                        <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
                          {[1,2,3,4,5].map(s => (
                            <button key={s} onClick={() => setReviewStars(s)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: s <= reviewStars ? '#f5c518' : 'var(--c-border)', padding: 0 }}>★</button>
                          ))}
                        </div>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <input value={reviewText} onChange={e => setReviewText(e.target.value)} placeholder="Scrie recenzia ta..."
                            style={{ flex: 1, padding: '8px 10px', borderRadius: 8, border: '1px solid var(--c-border)', fontSize: 12, fontFamily: 'var(--fb)', background: 'var(--c-surface)' }} />
                          <button onClick={async () => {
                            if (!reviewText.trim()) return;
                            try {
                              const { data } = await addDiscoverReview(p.id, { stars: reviewStars, text: reviewText.trim() });
                              const nextReview = { user: data.user || 'Tu', stars: data.stars || reviewStars, text: data.text || reviewText.trim(), date: data.date || new Date().toISOString().slice(0, 10) };
                              setProfessionals((prev) => prev.map((person) => {
                                if (person.id !== p.id) return person;
                                const reviews = Array.isArray(person.reviews) ? [...person.reviews, nextReview] : [nextReview];
                                const rating = Number((reviews.reduce((sum, review) => sum + Number(review.stars || 0), 0) / reviews.length).toFixed(1));
                                return { ...person, reviews, rating };
                              }));
                              setReviewText('');
                              setShowReviews(p.id);
                              showToast('✅ Recenzie publicată!');
                            } catch (e) {
                              showToast(e.response?.data?.error || '❌ Nu am putut publica recenzia.', '❌');
                            }
                          }} style={{ padding: '8px 14px', borderRadius: 8, border: 'none', background: 'var(--c-lime)', color: '#000', fontSize: 11, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>Publică</button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AnimatedPage>
  );
}
