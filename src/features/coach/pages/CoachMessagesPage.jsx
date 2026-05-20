import { useEffect, useState } from 'react';
import Drawer from '../../../shared/ui/Drawer.jsx';
import { getCoachMessages, coachReplyMessage, coachReadMessage } from '../../../shared/api/index.js';
import { Toast, useToast } from '../../../shared/ui/helpers.jsx';
import { AnimatedPage } from '../../../shared/ui/animations/index.jsx';


function CoachAv({ av, col, size = 36 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: col || '#1A52FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: size * 0.4, color: '#fff', fontFamily: 'var(--fd)', flexShrink: 0 }}>
      {av}
    </div>
  );
}

export default function CoachMessagesPage() {
  const [msgs, setMsgs]         = useState([]);
  const [selected, setSelected] = useState(null);
  const [reply, setReply]       = useState('');
  const [loading, setLoading]   = useState(false);
  const { toast, showToast }    = useToast();

  const load = () => getCoachMessages().then(r => setMsgs(r.data));
  useEffect(() => { load(); }, []);

  const openMsg = async (m) => {
    setSelected(m);
    setReply('');
    if (m.unread) {
      try { await coachReadMessage(m.id); load(); } catch (e) { void 0; }
    }
  };

  const handleReply = async () => {
    if (!reply.trim() || loading) return; // anti double-submit
    setLoading(true);
    const text = reply.trim();
    setReply(''); // clear ASAP — dispare imediat
    try {
      await coachReplyMessage(selected.id, text);
      showToast(`✅ Răspuns trimis lui ${selected.from}`);
      load();
    } catch (e) {
      showToast('❌ Eroare', '❌');
      setReply(text); // restore daca a esuat
    } finally { setLoading(false); }
  };

  const unread = msgs.filter(m => m.unread).length;

  return (
    <AnimatedPage>
      <Toast toast={toast} />

      {/* Message Drawer */}
      <Drawer open={!!selected} onClose={() => setSelected(null)} title={selected ? `Conversație cu ${selected.from}` : ''}>
        {selected && (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, padding: '0 0 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <CoachAv av={selected.av} col={selected.col} size={40} />
              <div>
                <div style={{ fontWeight: 700 }}>{selected.from}</div>
                <div style={{ fontSize: 11, color: 'var(--c-ink3)', marginTop: 2 }}>{selected.time}</div>
              </div>
            </div>
            {/* Original message */}
            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: '14px 16px', marginBottom: 20, borderLeft: '3px solid var(--c-blue)', fontSize: 13, color: 'var(--c-ink2)', lineHeight: 1.6 }}>
              {selected.msg}
            </div>
            {/* Reply */}
            <div style={{ fontSize: 11, color: 'var(--c-ink3)', fontFamily: 'var(--fm)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Răspuns tău</div>
            <textarea
              value={reply}
              onChange={e => setReply(e.target.value)}
              placeholder="Scrie un răspuns..."
              style={{
                flex: 1, minHeight: 100, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 10, padding: '12px 14px', color: '#fff', resize: 'none',
                fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 13, outline: 'none', lineHeight: 1.6,
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(255,255,255,0.3)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button className="btn btn-outline btn-sm" style={{ flex: 1 }} onClick={() => setSelected(null)}>Anulează</button>
              <button className="btn btn-black" style={{ flex: 1 }} onClick={handleReply} disabled={!reply.trim() || loading}>
                {loading ? 'Se trimite...' : '📤 Trimite răspuns'}
              </button>
            </div>
          </div>
        )}
      </Drawer>

      <div style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: 'var(--fd)', fontSize: 28, fontWeight: 900 }}>Mesaje</div>
        <div style={{ fontSize: 13, color: 'var(--c-ink2)', marginTop: 2 }}>{unread} necitite</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {msgs.map(m => (
          <div key={m.id} className="card" style={{ padding: '16px 20px', display: 'flex', gap: 14, alignItems: 'flex-start', opacity: m.unread ? 1 : 0.7, cursor: 'pointer', borderLeft: m.unread ? '3px solid var(--c-coral)' : '3px solid transparent', transition: 'all 0.15s' }}
            onClick={() => openMsg(m)}
            onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.borderColor = m.unread ? 'var(--c-coral)' : 'rgba(255,255,255,0.15)'; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = m.unread ? '1' : '0.7'; e.currentTarget.style.borderLeft = m.unread ? '3px solid var(--c-coral)' : '3px solid transparent'; }}>
            <CoachAv av={m.av} col={m.col} size={40} />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontWeight: 700 }}>{m.from}</span>
                <span style={{ fontSize: 10, color: 'var(--c-ink3)', fontFamily: 'var(--fm)' }}>{m.time}</span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--c-ink2)', lineHeight: 1.5 }}>{m.msg}</div>
            </div>
            {m.unread && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--c-coral)', flexShrink: 0, marginTop: 6 }} />}
          </div>
        ))}
      </div>
    </AnimatedPage>
  );
}
