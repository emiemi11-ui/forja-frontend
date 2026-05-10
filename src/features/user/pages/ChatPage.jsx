import { useEffect, useState, useCallback, useRef } from 'react';
import { getChat, sendChat, getTeams } from '../../../shared/api/index.js';
import { useAuth } from '../../../features/auth/context/AuthContext.jsx';
import { AnimatedPage } from '../../../shared/ui/animations/index.jsx';

function formatDateLabel(date) {
  if (!date || !(date instanceof Date) || Number.isNaN(date.getTime())) return '';
  const today = new Date();
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const isSameDay = (a, b) => a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();
  if (isSameDay(date, today)) return 'Astăzi';
  if (isSameDay(date, yesterday)) return 'Ieri';
  const daysDiff = Math.round((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (daysDiff > 0 && daysDiff < 7) {
    return date.toLocaleDateString('ro-RO', { weekday: 'long' });
  }
  return date.toLocaleDateString('ro-RO', { day: '2-digit', month: 'long', year: 'numeric' });
}

const CHAT_PHOTOS = {
  M: '/img/ext/u-ce999c14f0.jpg',
  A: '/img/ext/u-cac95b1201.jpg',
  R: '/img/ext/u-84148064a5.jpg',
  D: '/img/ext/u-3c736987da.jpg',
};

function normalizeMessage(message, currentUserId) {
  return {
    ...message,
    from: message.from || message.sender || '',
    msg: message.msg || message.text || message.content || '',
    isMe: message.senderId === currentUserId || message.isMe,
  };
}

export default function ChatPage() {
  const [teams, setTeams] = useState([]);
  const [activeTeamId, setActiveTeamId] = useState(null);
  const [chatData, setChatData] = useState(null);
  const [messages, setMessages] = useState([]);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const msgsEndRef = useRef(null);

  useEffect(() => {
    msgsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadTeams = useCallback(async () => {
    try {
      const { data } = await getTeams({ filter: 'mine' });
      const mine = data || [];
      setTeams(mine);
      if (mine.length === 0) {
        setActiveTeamId(null);
        setChatData(null);
        setMessages([]);
        setLoading(false);
        return;
      }
      setActiveTeamId((current) => {
        if (current && mine.some((team) => team.id === current)) return current;
        return mine[0].id;
      });
    } catch {
      setTeams([]);
      setActiveTeamId(null);
      setChatData(null);
      setMessages([]);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTeams();
    const onTeamChanged = () => loadTeams();
    window.addEventListener('forja:team_changed', onTeamChanged);
    return () => window.removeEventListener('forja:team_changed', onTeamChanged);
  }, [loadTeams]);

  useEffect(() => {
    if (!activeTeamId || !teams.some((team) => team.id === activeTeamId)) {
      setChatData(null);
      setMessages([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    getChat(activeTeamId)
      .then(({ data }) => {
        if (cancelled) return;
        if (!data?.teamId) {
          setChatData(null);
          setMessages([]);
          setActiveTeamId(null);
          return;
        }
        setChatData(data);
        setMessages((data.messages || []).map((message) => normalizeMessage(message, user?.id)));
      })
      .catch(() => {
        if (cancelled) return;
        setChatData(null);
        setMessages([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeTeamId, teams, user?.id]);

  const handleSend = async () => {
    if (!msg.trim() || !activeTeamId) return;
    try {
      const { data } = await sendChat(msg, activeTeamId);
      setMessages((prev) => [...prev, normalizeMessage(data, user?.id)]);
      setMsg('');
    } catch {}
  };

  const teamName = chatData?.teamName || '';
  const membersCount = chatData?.membersCount || 0;

  return (
    <AnimatedPage>
      <div style={{ display: 'flex', height: 'calc(100vh - 52px)', overflow: 'hidden' }}>
        <div className="chat-sidebar" style={{ width: 220, minWidth: 180, borderRight: '1px solid var(--c-border)', background: 'var(--c-surface)', overflow: 'auto', flexShrink: 0 }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--c-border)', fontFamily: 'var(--fd)', fontSize: 14, fontWeight: 800, letterSpacing: 1, color: 'var(--c-ink3)', textTransform: 'uppercase' }}>Echipele mele</div>
          {teams.length === 0 ? (
            <div style={{ padding: '30px 16px', textAlign: 'center', color: 'var(--c-ink3)', fontSize: 12 }}>Nu ești în nicio echipă.</div>
          ) : teams.map((team) => (
            <div
              key={team.id}
              onClick={() => setActiveTeamId(team.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', cursor: 'pointer',
                borderBottom: '1px solid var(--c-border)',
                background: activeTeamId === team.id ? 'var(--c-lime-bg)' : 'transparent',
                borderLeft: activeTeamId === team.id ? '3px solid var(--c-lime-d)' : '3px solid transparent',
              }}
            >
              <div style={{ width: 36, height: 36, borderRadius: 10, overflow: 'hidden', flexShrink: 0, background: 'var(--c-ink)' }}>
                {team.avatarUrl && <img src={team.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(event) => { event.target.style.display = 'none'; }} />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: activeTeamId === team.id ? 'var(--c-ink)' : 'var(--c-ink2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{team.name}</div>
                <div style={{ fontSize: 10, color: 'var(--c-ink3)', fontFamily: 'var(--fm)' }}>{team.membersCount} membri</div>
              </div>
            </div>
          ))}
        </div>

        <div className="chat-main" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {teams.length > 1 && (
            <div className="chat-mobile-teams" style={{ display: 'none', padding: '8px 14px', borderBottom: '1px solid var(--c-border)', background: 'var(--c-surface)', overflowX: 'auto', gap: 6 }}>
              {teams.map((team) => (
                <button
                  key={team.id}
                  onClick={() => setActiveTeamId(team.id)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px',
                    borderRadius: 20, border: activeTeamId === team.id ? '2px solid var(--c-lime-d)' : '1.5px solid var(--c-border)',
                    background: activeTeamId === team.id ? 'var(--c-lime-bg)' : 'transparent',
                    fontSize: 12, fontWeight: 700, fontFamily: 'var(--fb)', cursor: 'pointer',
                    whiteSpace: 'nowrap', flexShrink: 0,
                    color: activeTeamId === team.id ? 'var(--c-lime-d)' : 'var(--c-ink2)',
                  }}
                >
                  {team.name}
                </button>
              ))}
            </div>
          )}

          <div className="chat-header" style={{ padding: '10px 18px', borderBottom: '1px solid var(--c-border)', display: 'flex', alignItems: 'center', gap: 12, background: 'var(--c-surface)' }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, overflow: 'hidden', background: 'var(--c-ink)', flexShrink: 0 }}>
              <img src="/img/ext/u-46f039ceeb.jpg" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(event) => { event.target.style.display = 'none'; }} />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--fd)', fontSize: 16, fontWeight: 800 }}>{teamName || 'Chat echipă'}{teamName ? ' 🔥' : ''}</div>
              <div style={{ fontSize: 11, color: 'var(--c-ink3)', fontFamily: 'var(--fm)' }}>{teamName ? `${membersCount} membri` : 'Intră într-o echipă ca să poți conversa.'}</div>
            </div>
          </div>

          <div className="msgs-area" style={{ flex: 1, overflow: 'auto', padding: '16px 18px' }}>
            {loading && <div style={{ padding: 20, textAlign: 'center' }}><div className="spinner" /></div>}
            {!loading && !activeTeamId && (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--c-ink3)', fontSize: 13 }}>
                Nu ești în nicio echipă. Creează una nouă sau intră într-o echipă publică.
              </div>
            )}
            {!loading && activeTeamId && messages.length === 0 && (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--c-ink3)', fontSize: 13 }}>
                Niciun mesaj încă. Fii primul care scrie! 🚀
              </div>
            )}
            {(() => {
              let lastDateLabel = null;
              return messages.map((message) => {
                const dateObj = message.createdAt ? new Date(message.createdAt) : null;
                const dateLabel = dateObj ? formatDateLabel(dateObj) : null;
                const showSeparator = dateLabel && dateLabel !== lastDateLabel;
                if (showSeparator) lastDateLabel = dateLabel;
                return (
                  <div key={message.id}>
                    {showSeparator && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '14px 0 8px' }}>
                        <div style={{ flex: 1, height: 1, background: 'var(--c-border)' }} />
                        <div style={{ fontSize: 11, color: 'var(--c-ink3)', fontFamily: 'var(--fm)', fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase' }}>{dateLabel}</div>
                        <div style={{ flex: 1, height: 1, background: 'var(--c-border)' }} />
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: message.isMe ? 'flex-end' : 'flex-start', marginBottom: 12, gap: 8, alignItems: 'flex-end' }}>
                      {!message.isMe && (
                        <div style={{ width: 32, height: 32, borderRadius: '50%', overflow: 'hidden', background: 'var(--c-surface)', border: '1px solid var(--c-border)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {CHAT_PHOTOS[message.avatar] ? <img src={CHAT_PHOTOS[message.avatar]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(event) => { event.target.style.display = 'none'; }} /> : <span style={{ fontSize: 11, fontWeight: 700 }}>{message.avatar}</span>}
                        </div>
                      )}
                      <div>
                        {!message.isMe && <div style={{ fontSize: 11, color: 'var(--c-ink3)', marginBottom: 2, fontWeight: 600 }}>{message.from || message.sender}</div>}
                        <div style={{ maxWidth: 320, padding: '10px 14px', borderRadius: message.isMe ? '14px 14px 4px 14px' : '14px 14px 14px 4px', background: message.isMe ? 'var(--c-ink)' : 'var(--c-surface)', color: message.isMe ? '#fff' : 'var(--c-ink)', border: message.isMe ? 'none' : '1px solid var(--c-border)', fontSize: 14, lineHeight: 1.5 }}>
                          {message.msg || message.text || message.content}
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--c-ink3)', marginTop: 3, textAlign: message.isMe ? 'right' : 'left', fontFamily: 'var(--fm)' }}>{message.time}</div>
                      </div>
                    </div>
                  </div>
                );
              });
            })()}
            <div ref={msgsEndRef} />
          </div>

          <div className="chat-inp-bar" style={{ padding: '12px 18px', borderTop: '1px solid var(--c-border)', background: 'var(--c-surface)', display: 'flex', gap: 8 }}>
            <input
              value={msg}
              onChange={(event) => setMsg(event.target.value)}
              onKeyDown={(event) => event.key === 'Enter' && handleSend()}
              placeholder="Scrie un mesaj echipei..."
              disabled={!activeTeamId}
              style={{ flex: 1, padding: '12px 16px', borderRadius: 'var(--r)', border: '1.5px solid var(--c-border)', fontSize: 14, fontFamily: 'var(--fb)', background: 'var(--c-bg)', boxSizing: 'border-box' }}
            />
            <button onClick={handleSend} disabled={!activeTeamId || !msg.trim()} className="btn btn-black" style={{ padding: '0 20px' }}>↑</button>
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
}
