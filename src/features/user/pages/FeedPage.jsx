import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getFeed, createPost, likePost, commentPost, deletePost } from '../../../shared/api/index.js';
import { Heart, MessageCircle, Image, X, PenLine, Send } from 'lucide-react';
import { useConfirm } from '../../../shared/ui/ConfirmModal.jsx';
import { AnimatedPage, ScrollReveal, StaggerGrid } from '../../../shared/ui/animations/index.jsx';

function timeAgo(date) {
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 60) return 'acum';
  if (s < 3600) return `${Math.floor(s / 60)} min`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}z`;
}

export default function FeedPage() {
  const [posts, setPosts] = useState([]);
  const [text, setText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [commentText, setCommentText] = useState({});
  const [showComments, setShowComments] = useState({});
  const [showImageInput, setShowImageInput] = useState(false);
  const confirm = useConfirm();

  const load = useCallback(() => {
    getFeed().then(({ data }) => { setPosts(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);
  useEffect(() => { load(); }, [load]);

  const handlePost = async () => {
    if (!text.trim() && !imageUrl.trim()) return;
    setPosting(true);
    try { const { data } = await createPost({ content: text, imageUrl: imageUrl || null }); setPosts(p => [data, ...p]); setText(''); setImageUrl(''); setShowImageInput(false); } catch {}
    setPosting(false);
  };

  const handleLike = async (id) => {
    try { const { data } = await likePost(id); setPosts(p => p.map(x => x.id === id ? { ...x, liked: data.liked, likesCount: x.likesCount + (data.liked ? 1 : -1) } : x)); } catch {}
  };

  const handleComment = async (postId) => {
    const c = (commentText[postId] || '').trim();
    if (!c) return;
    try { const { data } = await commentPost(postId, c); setPosts(p => p.map(x => x.id === postId ? { ...x, comments: [...x.comments, data], commentsCount: x.commentsCount + 1 } : x)); setCommentText(p => ({ ...p, [postId]: '' })); } catch {}
  };

  const handleDelete = (id) => {
    confirm('Sigur vrei să ștergi postarea?', async () => {
      try { await deletePost(id); setPosts(p => p.filter(x => x.id !== id)); } catch {}
    });
  };

  const inputBase = { width: '100%', padding: '12px 14px', borderRadius: 'var(--r)', border: '1.5px solid var(--c-border)', fontSize: 15, fontFamily: 'var(--fb)', background: 'var(--c-bg)', boxSizing: 'border-box' };

  return (
    <AnimatedPage style={{ maxWidth: 600, margin: '0 auto', padding: '24px 16px' }}>
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: 'var(--fm)', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--c-lime-d)', fontWeight: 700 }}>social</div>
        <h1 style={{ fontFamily: 'var(--fd)', fontSize: 42, fontWeight: 900, letterSpacing: .5, color: 'var(--c-ink)', lineHeight: .95, marginTop: 4 }}>FEED</h1>
      </motion.div>

      {/* Composer */}
      <ScrollReveal>
        <div className="card card-glow" style={{ padding: 20, marginBottom: 24 }}>
          <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Ce ai antrenat azi? Impartaseste cu echipa..." style={{ ...inputBase, resize: 'none', minHeight: 70, border: 'none', background: 'transparent', padding: '0', fontSize: 15, lineHeight: 1.6 }} />
          <AnimatePresence>
            {showImageInput && (
              <motion.input initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="URL imagine (paste link Unsplash, Cloudinary...)" style={{ ...inputBase, marginTop: 10, fontSize: 13 }} />
            )}
          </AnimatePresence>
          {imageUrl && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              style={{ marginTop: 10, borderRadius: 'var(--r)', overflow: 'hidden', maxHeight: 200 }}>
              <img src={imageUrl} alt="" style={{ width: '100%', maxHeight: 200, objectFit: 'cover', display: 'block' }} onError={e => { e.target.style.display = 'none'; }} />
            </motion.div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--c-border)' }}>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => setShowImageInput(!showImageInput)} style={{ padding: '6px 14px', borderRadius: 8, border: '1.5px solid var(--c-border)', background: showImageInput ? 'var(--c-lime-bg)' : 'transparent', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--fb)', color: 'var(--c-ink2)', display: 'flex', alignItems: 'center', gap: 6 }}><Image size={14} /> Imagine</motion.button>
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={handlePost} disabled={posting || (!text.trim() && !imageUrl.trim())} style={{ marginLeft: 'auto', padding: '8px 22px', borderRadius: 'var(--r)', border: 0, background: 'var(--c-ink)', color: '#fff', fontFamily: 'var(--fd)', fontSize: 15, fontWeight: 800, cursor: 'pointer', letterSpacing: .5, opacity: posting || (!text.trim() && !imageUrl.trim()) ? .4 : 1 }}>{posting ? 'SE POSTEAZA...' : 'POSTEAZA'}</motion.button>
          </div>
        </div>
      </ScrollReveal>

      {/* Posts */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[1,2,3].map(i => <div key={i} className="forja-skeleton" style={{ height: 200, borderRadius: 16 }} />)}
        </div>
      ) : posts.length === 0 ? (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', padding: 60 }}>
          <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            style={{ marginBottom: 12, color: 'var(--c-ink3)' }}><PenLine size={40} strokeWidth={1.5} /></motion.div>
          <div style={{ fontFamily: 'var(--fd)', fontSize: 22, fontWeight: 800, color: 'var(--c-ink)' }}>Feed gol</div>
          <div style={{ fontSize: 14, color: 'var(--c-ink3)', marginTop: 6 }}>Fii primul care posteaza ceva!</div>
        </motion.div>
      ) : (
        <AnimatePresence>
          {posts.map((post, idx) => (
            <motion.div key={post.id}
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: -100, scale: 0.9 }}
              transition={{ delay: idx * 0.05, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="card card-glow"
              style={{ marginBottom: 16, overflow: 'hidden' }}
            >
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px 0' }}>
                <div style={{ width: 42, height: 42, borderRadius: '50%', overflow: 'hidden', background: 'var(--c-lime-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 17, color: 'var(--c-lime-d)', fontFamily: 'var(--fd)', flexShrink: 0 }}>
                  {post.user?.avatarUrl ? <img src={post.user.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (post.user?.name||'U')[0]}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--c-ink)' }}>{post.user?.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--c-ink3)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    {post.team && <span style={{ fontFamily: 'var(--fm)', fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: 'var(--c-blue-bg)', color: 'var(--c-blue)', textTransform: 'uppercase', letterSpacing: .5 }}>{post.team.name}</span>}
                    <span>{timeAgo(post.createdAt)}</span>
                  </div>
                </div>
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                  onClick={() => handleDelete(post.id)} title="Sterge" style={{ background: 'none', border: 0, color: 'var(--c-ink3)', cursor: 'pointer', padding: '4px 8px', borderRadius: 6, display: 'flex' }}><X size={16} /></motion.button>
              </div>

              {post.content && <div style={{ padding: '12px 18px 0', fontSize: 15, lineHeight: 1.65, color: 'var(--c-ink)', whiteSpace: 'pre-wrap' }}>{post.content}</div>}

              {post.imageUrl && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                  style={{ margin: '12px 0 0', maxHeight: 400, overflow: 'hidden' }}>
                  <img src={post.imageUrl} alt="" style={{ width: '100%', maxHeight: 400, objectFit: 'cover', display: 'block' }} />
                </motion.div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', gap: 0, padding: '0 6px', borderTop: post.imageUrl ? 'none' : '1px solid var(--c-border)', marginTop: post.imageUrl ? 0 : 12 }}>
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleLike(post.id)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '12px 0', background: 'none', border: 0, cursor: 'pointer', fontSize: 14, fontWeight: post.liked ? 700 : 400, color: post.liked ? 'var(--c-coral)' : 'var(--c-ink3)', fontFamily: 'var(--fb)', transition: 'color .15s' }}>
                  <motion.span animate={{ scale: post.liked ? [1, 1.3, 1] : 1 }} transition={{ duration: 0.3 }}>
                    {post.liked ? <Heart size={16} fill="var(--c-coral)" stroke="var(--c-coral)" /> : <Heart size={16} />}
                  </motion.span> {post.likesCount || 0}
                </motion.button>
                <button onClick={() => setShowComments(p => ({ ...p, [post.id]: !p[post.id] }))} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '12px 0', background: 'none', border: 0, cursor: 'pointer', fontSize: 14, color: 'var(--c-ink3)', fontFamily: 'var(--fb)' }}>
                  <MessageCircle size={16} /> {post.commentsCount || 0}
                </button>
              </div>

              {/* Comments */}
              <AnimatePresence>
                {showComments[post.id] && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    style={{ padding: '0 18px 14px', borderTop: '1px solid var(--c-border)', overflow: 'hidden' }}>
                    {post.comments?.map(c => (
                      <div key={c.id} style={{ display: 'flex', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--c-border)' }}>
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--c-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: 'var(--c-ink3)', fontFamily: 'var(--fd)', flexShrink: 0 }}>{(c.user?.name||'U')[0]}</div>
                        <div>
                          <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--c-ink)' }}>{c.user?.name}</span>
                          <span style={{ fontSize: 13, color: 'var(--c-ink2)', marginLeft: 8 }}>{c.content}</span>
                        </div>
                      </div>
                    ))}
                    <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                      <input value={commentText[post.id] || ''} onChange={e => setCommentText(p => ({ ...p, [post.id]: e.target.value }))} onKeyDown={e => e.key === 'Enter' && handleComment(post.id)} placeholder="Scrie un comentariu..." style={{ ...inputBase, fontSize: 13, padding: '10px 12px', flex: 1 }} />
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={() => handleComment(post.id)} style={{ padding: '0 14px', borderRadius: 'var(--r)', border: 0, background: 'var(--c-ink)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><Send size={14} /></motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>
      )}
    </AnimatedPage>
  );
}
