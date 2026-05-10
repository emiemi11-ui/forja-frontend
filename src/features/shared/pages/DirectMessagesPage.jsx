import { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import { getConversations, getConversation, sendDirectMessage, startConversation, markConversationRead } from '../../../shared/api/index.js';
import { useAuth } from '../../auth/context/AuthContext.jsx';
import { getStoredToken } from '../../auth/model/authStorage.js';
import { Toast, useToast } from '../../../shared/ui/helpers.jsx';
import { AnimatedPage } from '../../../shared/ui/animations/index.jsx';

function formatDateLabel(date) {
  if (!date || !(date instanceof Date) || Number.isNaN(date.getTime())) return '';
  const today = new Date();
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const isSameDay = (a, b) => a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();
  if (isSameDay(date, today)) return 'Astăzi';
  if (isSameDay(date, yesterday)) return 'Ieri';
  // Daca e in saptamana asta, ziua saptamanii
  const daysDiff = Math.round((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (daysDiff > 0 && daysDiff < 7) {
    return date.toLocaleDateString('ro-RO', { weekday: 'long' });
  }
  return date.toLocaleDateString('ro-RO', { day: '2-digit', month: 'long', year: 'numeric' });
}

export default function DirectMessagesPage() {
  const [conversations, setConversations] = useState([]);
  const [activeConvo, setActiveConvo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const { user } = useAuth();
  const { toast, showToast } = useToast();
  const msgsEndRef = useRef(null);
  const socketRef = useRef(null);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => { msgsEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const loadConversations = useCallback(async () => {
    try {
      const { data } = await getConversations();
      setConversations(data);
      setLoading(false);
    } catch { setLoading(false); }
  }, []);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  // Auto-open conversation if ?convo=ID is in URL (from Discover/Profile)
  useEffect(() => {
    const convoId = searchParams.get('convo');
    if (!convoId || activeConvo?.id === convoId) return;
    (async () => {
      try {
        const { data } = await getConversation(convoId);
        setActiveConvo(data.conversation);
        setMessages(data.messages);
        setSearchParams({}); // clear URL param after opening
      } catch { /* ignore */ }
    })();
  }, [searchParams, activeConvo?.id, setSearchParams]);

  // Socket for real-time DM — UN SINGUR socket, NU se reconectează la schimbarea de convo
  useEffect(() => {
    const token = getStoredToken();
    if (!token) return;
    const socketUrl = import.meta.env.VITE_API_URL || window.location.origin;
    const socket = io(socketUrl, { auth: { token }, transports: ['websocket', 'polling'] });
    socketRef.current = socket;
    socket.on('dm:new', ({ conversationId, message }) => {
      // Folosesc functional update ca să citesc activeConvo curent (nu cel din closure)
      setActiveConvo((curConvo) => {
        if (curConvo?.id === conversationId) {
          // Adaug doar dacă mesajul NU e al meu (al meu e deja adăugat optimist)
          setMessages((prev) => {
            if (prev.some((m) => m.id === message.id)) return prev; // dedup
            return [...prev, message];
          });
          // Daca mesajul e de la celalalt user si convo e deschisa, marcheaza imediat ca read
          // (asta declanseaza messages:seen catre sender pt indicator real-time)
          if (!message.isMe) {
            markConversationRead(conversationId).catch(() => {});
          }
        }
        return curConvo;
      });
      loadConversations();
    });
    // Cand celalalt user vede mesajele mele -> updatez seen=true pe toate
    socket.on('messages:seen', ({ conversationId }) => {
      setActiveConvo((curConvo) => {
        if (curConvo?.id === conversationId) {
          setMessages((prev) => prev.map((m) => m.isMe ? { ...m, seen: true } : m));
        }
        return curConvo;
      });
    });
    // Presence updates - cineva s-a conectat / deconectat
    socket.on('presence:online', ({ userId }) => {
      setActiveConvo((cur) => cur && cur.other?.id === userId ? { ...cur, other: { ...cur.other, isOnline: true } } : cur);
      setConversations((prev) => prev.map((c) => c.other?.id === userId ? { ...c, other: { ...c.other, isOnline: true } } : c));
    });
    socket.on('presence:offline', ({ userId }) => {
      setActiveConvo((cur) => cur && cur.other?.id === userId ? { ...cur, other: { ...cur.other, isOnline: false } } : cur);
      setConversations((prev) => prev.map((c) => c.other?.id === userId ? { ...c, other: { ...c.other, isOnline: false } } : c));
    });
    return () => { socket.disconnect(); socketRef.current = null; };
  }, [loadConversations]);

  const openConvo = async (convoId) => {
    try {
      const { data } = await getConversation(convoId);
      setActiveConvo(data.conversation);
      setMessages(data.messages);
      loadConversations(); // refresh unread counts
    } catch { showToast('❌ Eroare la încărcare', '❌'); }
  };

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!msg.trim() || !activeConvo || sending) return; // anti double-submit
    setSending(true);
    const text = msg.trim();
    setMsg(''); // clear ASAP ca să previn dublu trimitere
    try {
      const { data } = await sendDirectMessage(activeConvo.id, text);
      setMessages((prev) => {
        if (prev.some((m) => m.id === data.id)) return prev; // dedup în caz că socket a livrat înainte
        return [...prev, data];
      });
      loadConversations();
    } catch {
      showToast('❌ Eroare la trimitere', '❌');
      setMsg(text); // restore text dacă a eșuat
    }
    setSending(false);
  };

  const inputBase = { width: '100%', padding: '12px 14px', borderRadius: 'var(--r)', border: '1.5px solid var(--c-border)', fontSize: 14, fontFamily: 'var(--fb)', background: 'var(--c-bg)', boxSizing: 'border-box' };

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}><div className="spinner" /></div>;

  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 52px)', overflow: 'hidden' }}>
      <Toast toast={toast} />

      {/* Conversations list — hidden on mobile when convo is open */}
      <div style={{
        width: isMobile ? '100%' : 300, minWidth: isMobile ? 0 : 260,
        borderRight: isMobile ? 'none' : '1px solid var(--c-border)',
        background: 'var(--c-surface)', overflow: 'auto', flexShrink: 0,
        display: isMobile && activeConvo ? 'none' : 'block',
      }}>
        <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--c-border)' }}>
          <div style={{ fontFamily: 'var(--fd)', fontSize: 18, fontWeight: 800 }}>Mesaje directe</div>
        </div>
        {conversations.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--c-ink3)', fontSize: 13 }}>
            Nicio conversație încă.
          </div>
        ) : conversations.map(c => (
          <div key={c.id} onClick={() => openConvo(c.id)} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '12px 18px', cursor: 'pointer',
            borderBottom: '1px solid var(--c-border)',
            background: activeConvo?.id === c.id ? 'var(--c-lime-bg)' : 'transparent',
          }}>
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--c-ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, color: 'var(--c-lime)', fontFamily: 'var(--fd)', flexShrink: 0, overflow: 'hidden' }}>
              {c.other.avatarUrl ? <img src={c.other.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (c.other.name || 'U')[0]}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                {c.other.name}
                <span style={{ fontFamily: 'var(--fm)', fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 4, background: c.other.role === 'COACH' ? 'var(--c-blue-bg)' : c.other.role === 'NUTRITIONIST' ? 'var(--c-purple-bg)' : 'var(--c-lime-bg)', color: c.other.role === 'COACH' ? 'var(--c-blue)' : c.other.role === 'NUTRITIONIST' ? 'var(--c-purple)' : 'var(--c-lime-d)', textTransform: 'uppercase' }}>
                  {c.other.role}
                </span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--c-ink3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.lastMessage || 'Niciun mesaj'}</div>
            </div>
            {c.unread > 0 && (
              <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--c-coral)', color: '#fff', fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{c.unread}</div>
            )}
          </div>
        ))}
      </div>

      {/* Message area — hidden on mobile when no convo */}
      <div style={{ flex: 1, display: isMobile && !activeConvo ? 'none' : 'flex', flexDirection: 'column', background: 'var(--c-bg)' }}>
        {!activeConvo ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center', color: 'var(--c-ink3)' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>✉️</div>
              <div style={{ fontFamily: 'var(--fd)', fontSize: 22, fontWeight: 900, color: 'var(--c-ink)', marginBottom: 6 }}>Selectează o conversație</div>
              <div style={{ fontSize: 13 }}>sau începe una nouă din profilul unui utilizator</div>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--c-border)', background: 'var(--c-surface)', display: 'flex', alignItems: 'center', gap: 12 }}>
              {isMobile && <button onClick={() => setActiveConvo(null)} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', padding: '4px 8px', color: 'var(--c-ink)' }}>←</button>}
              <div style={{ position: 'relative' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--c-ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, color: 'var(--c-lime)', fontFamily: 'var(--fd)', overflow: 'hidden', flexShrink: 0 }}>
                  {activeConvo.other.avatarUrl ? <img src={activeConvo.other.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (activeConvo.other.name || 'U')[0]}
                </div>
                {/* Online dot */}
                <div style={{
                  position: 'absolute', bottom: 0, right: 0,
                  width: 10, height: 10, borderRadius: '50%',
                  background: activeConvo.other.isOnline !== false ? 'var(--c-green)' : 'var(--c-ink3)',
                  border: '2px solid var(--c-surface)',
                  animation: activeConvo.other.isOnline !== false ? 'onlinePulse 2.5s ease-in-out infinite' : 'none',
                }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{activeConvo.other.name}</div>
                <div style={{ fontSize: 11, color: 'var(--c-ink3)', fontFamily: 'var(--fm)' }}>{activeConvo.other.role}</div>
              </div>
              <div className={`online-badge${activeConvo.other.isOnline !== false ? '' : ' offline'}`}>
                <div className={`online-dot${activeConvo.other.isOnline !== false ? '' : ' offline'}`} />
                {activeConvo.other.isOnline !== false ? 'Conectat' : 'Offline'}
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflow: 'auto', padding: '16px 20px' }}>
              {(() => {
                let lastDateLabel = null;
                return messages.map((m) => {
                  const dateObj = m.createdAt ? new Date(m.createdAt) : null;
                  const dateLabel = dateObj ? formatDateLabel(dateObj) : null;
                  const showSeparator = dateLabel && dateLabel !== lastDateLabel;
                  if (showSeparator) lastDateLabel = dateLabel;
                  return (
                    <div key={m.id}>
                      {showSeparator && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '14px 0 8px' }}>
                          <div style={{ flex: 1, height: 1, background: 'var(--c-border)' }} />
                          <div style={{ fontSize: 11, color: 'var(--c-ink3)', fontFamily: 'var(--fm)', fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase' }}>{dateLabel}</div>
                          <div style={{ flex: 1, height: 1, background: 'var(--c-border)' }} />
                        </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: m.isMe ? 'flex-end' : 'flex-start', marginBottom: 8 }}>
                        <div style={{
                          maxWidth: '70%', padding: '10px 14px', borderRadius: 14,
                          background: m.isMe ? 'var(--c-ink)' : 'var(--c-surface)',
                          color: m.isMe ? '#fff' : 'var(--c-ink)',
                          border: m.isMe ? 'none' : '1px solid var(--c-border)',
                          fontSize: 14, lineHeight: 1.5,
                        }}>
                          {m.message}
                          <div style={{ fontSize: 10, color: m.isMe ? 'rgba(255,255,255,0.5)' : 'var(--c-ink3)', marginTop: 4, textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: 4, alignItems: 'center' }}>
                            <span>{m.time}</span>
                            {m.isMe && (
                              <span style={{ color: m.seen ? '#3FA9FF' : 'rgba(255,255,255,0.5)' }} title={m.seen ? 'Citit' : 'Trimis'}>
                                {m.seen ? '✓✓' : '✓'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}
              <div ref={msgsEndRef} />
            </div>

            {/* Input */}
            <div style={{ padding: '12px 20px', borderTop: '1px solid var(--c-border)', background: 'var(--c-surface)', display: 'flex', gap: 8 }}>
              <input value={msg} onChange={e => setMsg(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} placeholder="Scrie un mesaj..." style={{ ...inputBase, flex: 1 }} />
              <button onClick={handleSend} disabled={sending || !msg.trim()} className="btn btn-black" style={{ padding: '0 20px' }}>
                {sending ? '...' : '↑'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
