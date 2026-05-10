import { useEffect, useState } from 'react';
import { getUser, patchUser, changePassword } from '../../../shared/api/index.js';
import { useAuth } from '../../auth/context/AuthContext.jsx';
import { Toast, useToast } from '../../../shared/ui/helpers.jsx';

export default function AdminAccountPage() {
  const { updateUser } = useAuth();
  const { toast, showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pwdSaving, setPwdSaving] = useState(false);

  const [form, setForm] = useState({ name: '', email: '' });
  const [pwd, setPwd] = useState({ current: '', next: '', confirm: '' });

  useEffect(() => {
    let mounted = true;
    getUser()
      .then(({ data }) => {
        if (!mounted) return;
        setForm({ name: data.name || '', email: data.email || '' });
      })
      .catch(() => {})
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const handleSaveAccount = async () => {
    if (!form.name.trim()) return showToast('Numele e obligatoriu', '⚠️');
    if (!form.email.trim() || !form.email.includes('@')) return showToast('Email invalid', '⚠️');
    setSaving(true);
    try {
      const { data } = await patchUser({ name: form.name.trim(), email: form.email.trim() });
      updateUser({ name: data.name, email: data.email });
      showToast('✅ Cont actualizat!');
    } catch (e) {
      showToast(e.response?.data?.error || '❌ Eroare la salvare', '❌');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!pwd.current || !pwd.next || !pwd.confirm) return showToast('Completează toate câmpurile', '⚠️');
    if (pwd.next.length < 6) return showToast('Parola nouă: minim 6 caractere', '⚠️');
    if (pwd.next !== pwd.confirm) return showToast('Parolele nu coincid', '⚠️');
    setPwdSaving(true);
    try {
      await changePassword(pwd.current, pwd.next);
      showToast('✅ Parola a fost schimbată!');
      setPwd({ current: '', next: '', confirm: '' });
    } catch (e) {
      showToast(e.response?.data?.error || '❌ Eroare la schimbarea parolei', '❌');
    } finally {
      setPwdSaving(false);
    }
  };

  const inputBase = { width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid var(--c-border)', fontSize: 14, fontFamily: 'var(--fb)', background: 'var(--c-bg)', boxSizing: 'border-box', marginTop: 4 };
  const labelBase = { fontSize: 11, color: 'var(--c-ink3)', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700, fontFamily: 'var(--fm)' };

  if (loading) return <div className="adm-page" style={{ padding: 20 }}>Se încarcă...</div>;

  return (
    <div className="adm-page" style={{ padding: '0 4px' }}>
      <Toast toast={toast} />

      <h2 style={{ fontFamily: 'var(--fd)', fontSize: 28, fontWeight: 900, marginBottom: 4 }}>Contul meu</h2>
      <p style={{ fontSize: 13, color: 'var(--c-ink3)', marginBottom: 24 }}>Modifică datele contului de admin.</p>

      <div className="card" style={{ padding: 20, maxWidth: 560, marginBottom: 16 }}>
        <div style={{ fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--c-ink3)', marginBottom: 12 }}>
          👤 INFORMAȚII CONT
        </div>

        <label style={labelBase}>Nume complet</label>
        <input value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
          style={{ ...inputBase, marginBottom: 14 }} />

        <label style={labelBase}>Email</label>
        <input type="email" value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
          style={{ ...inputBase, marginBottom: 16 }} />

        <button className="btn btn-lime" onClick={handleSaveAccount} disabled={saving}
          style={{ padding: '12px 24px', fontWeight: 800 }}>
          {saving ? 'Se salvează...' : '💾 SALVEAZĂ'}
        </button>
      </div>

      <div className="card" style={{ padding: 20, maxWidth: 560 }}>
        <div style={{ fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--c-ink3)', marginBottom: 12 }}>
          🔐 SCHIMBĂ PAROLA
        </div>

        <label style={labelBase}>Parola actuală</label>
        <input type="password" value={pwd.current} onChange={(e) => setPwd(p => ({ ...p, current: e.target.value }))}
          placeholder="Parola pe care o folosești acum"
          style={{ ...inputBase, marginBottom: 14 }} />

        <label style={labelBase}>Parola nouă (minim 6 caractere)</label>
        <input type="password" value={pwd.next} onChange={(e) => setPwd(p => ({ ...p, next: e.target.value }))}
          placeholder="Noua parolă"
          style={{ ...inputBase, marginBottom: 14 }} />

        <label style={labelBase}>Confirmă parola nouă</label>
        <input type="password" value={pwd.confirm} onChange={(e) => setPwd(p => ({ ...p, confirm: e.target.value }))}
          placeholder="Repetă noua parolă"
          onKeyDown={(e) => e.key === 'Enter' && handleChangePassword()}
          style={{ ...inputBase, marginBottom: 16 }} />

        <button className="btn btn-black" onClick={handleChangePassword} disabled={pwdSaving}
          style={{ padding: '12px 24px', fontWeight: 800 }}>
          {pwdSaving ? 'Se salvează...' : '🔐 SCHIMBĂ PAROLA'}
        </button>
      </div>
    </div>
  );
}
