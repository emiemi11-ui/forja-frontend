import { useEffect, useState, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import { getConversations, getConversation, sendDirectMessage, startConversation } from '../../../shared/api/index.js';
import { useAuth } from '../../auth/context/AuthContext.jsx';
import { getStoredToken } from '../../auth/model/authStorage.js';
import { Toast, useToast } from '../../../shared/ui/helpers.jsx';
import { AnimatedPage } from '../../../shared/ui/animations/index.jsx';

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

  useEffect(() => { msgsEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const loadConversations = useCallback(async () => {
    try {
      const { data } = await getConversations();
      setConversations(data);
      setLoading(false);
    } catch { setLoading(false); }
  }, []);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  // Socket for real-time DM
  useEffect(() => {
    const token = getStoredToken();
    if (!token) return;
    const socketUrl = import.meta.env.VITE_API_URL || window.location.origin;
    const socket = io(socketUrl, { auth: { token }, transports: ['websocket', 'polling'] });
    socketRef.current = socket;
    socket.on('dm:new', ({ conversationId, message }) => {
      if (activeConvo?.id === conversationId) {
        setMessages(prev => [...prev, message]);
      }
      loadConversations();
    });
    return () => socket.disconnect();
  }, [activeConvo?.id, loadConversations]);

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
    if (!msg.trim() || !activeConvo) return;
    setSending(true);
    try {
      const { data } = await sendDirectMessage(activeConvo.id, msg.trim());
      setMessages(prev => [...prev, data]);
      setMsg('');
      loadConversations();
    } catch { showToast('❌ Eroare la trimitere', '❌'); }
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
              {messages.map(m => (
                <div key={m.id} style={{ display: 'flex', justifyContent: m.isMe ? 'flex-end' : 'flex-start', marginBottom: 8 }}>
                  <div style={{
                    maxWidth: '70%', padding: '10px 14px', borderRadius: 14,
                    background: m.isMe ? 'var(--c-ink)' : 'var(--c-surface)',
                    color: m.isMe ? '#fff' : 'var(--c-ink)',
                    border: m.isMe ? 'none' : '1px solid var(--c-border)',
                    fontSize: 14, lineHeight: 1.5,
                  }}>
                    {m.message}
                    <div style={{ fontSize: 10, color: m.isMe ? 'rgba(255,255,255,0.4)' : 'var(--c-ink3)', marginTop: 4, textAlign: 'right' }}>{m.time}</div>
                  </div>
                </div>
              ))}
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
