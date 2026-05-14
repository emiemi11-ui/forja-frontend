import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getUser, getGoals, putGoals, patchUser, setSteps, uploadAvatar, getMyProfessionals, removeProfessionalLink, acceptProfessionalInvite, rejectProfessionalInvite, startConversation, cancelSubscription, getMyUpgradeRequest } from '../../../shared/api/index.js';
import { changePassword } from '../../../shared/api/auth.api.js';
import { Toast, useToast } from '../../../shared/ui/helpers.jsx';
import { useAuth } from '../../../features/auth/context/AuthContext.jsx';
import { useConfirm } from '../../../shared/ui/ConfirmModal.jsx';
import Modal, { ModalField, ModalInput, ModalActions } from '../../../shared/ui/Modal.jsx';
import UpgradeModal from '../../../shared/ui/UpgradeModal.jsx';
import { AnimatedPage, ScrollReveal, CountUp } from '../../../shared/ui/animations/index.jsx';

export default function ProfilePage() {
  const [userData, setUserData] = useState(null);
  const [goals, setGoals]       = useState(null);
  const [editing, setEditing]   = useState(false);
  const [editingUser, setEditingUser] = useState(false);
  const [userForm, setUserForm] = useState({});
  const [showStepsModal, setShowStepsModal] = useState(false);
  const [stepsInput, setStepsInput] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeTargetPlan, setUpgradeTargetPlan] = useState('PRO');
  const [pendingRequest, setPendingRequest] = useState(null);
  const confirm = useConfirm();
  const [pwdForm, setPwdForm] = useState({ current: '', next: '', confirm: '' });
  const [pwdSaving, setPwdSaving] = useState(false);
  const [professionals, setProfessionals] = useState({ coaches: [], nutritionists: [] });
  const { toast, showToast }    = useToast();
  const { logout, updateUser } = useAuth();
  const navigate                = useNavigate();

  const load = async () => {
    const [u, g, pros] = await Promise.all([getUser(), getGoals(), getMyProfessionals().catch(() => ({ data: { coaches: [], nutritionists: [] } }))]);
    setUserData(u.data);
    // Verifica daca exista cerere upgrade pending
    getMyUpgradeRequest().then(({ data }) => {
      if (data?.request && data.request.status === 'PENDING') {
        setPendingRequest(data.request);
      } else {
        setPendingRequest(null);
      }
    }).catch(() => {});
    const avatarThemeMatch = /[?&]background=([^&]+)/.exec(u.data.avatarUrl || '');
    setUserForm({ name: u.data.name, email: u.data.email || '', weight: u.data.weight || '', height: u.data.height || '', goal: u.data.goal || '', avatar: u.data.avatar, avatarUrl: u.data.avatarUrl || '', avatarTheme: avatarThemeMatch ? decodeURIComponent(avatarThemeMatch[1]) : '' });
    setGoals(g.data || {});
    setProfessionals(pros.data || { coaches: [], nutritionists: [] });
  };
  useEffect(() => { load(); }, []);

  const handleRemoveProfessional = async (type, linkId, name) => {
    if (!confirm(`Sigur vrei să elimini legătura cu ${name}?`)) return;
    try {
      await removeProfessionalLink(type, linkId);
      showToast('✅ Legătură eliminată');
      load();
    } catch (e) {
      showToast(e.response?.data?.error || '❌ Eroare', '❌');
    }
  };

  const handleAcceptProfessional = async (type, linkId, name) => {
    try {
      await acceptProfessionalInvite(type, linkId);
      showToast(`✅ Invitație acceptată — ${name} este acum ${type === 'COACH' ? 'coach-ul' : 'nutriționistul'} tău`);
      load();
    } catch (e) {
      showToast(e.response?.data?.error || '❌ Eroare', '❌');
    }
  };

  const handleRejectProfessional = async (type, linkId, name) => {
    if (!confirm(`Refuzi invitația de la ${name}?`)) return;
    try {
      await rejectProfessionalInvite(type, linkId);
      showToast('Invitație refuzată');
      load();
    } catch (e) {
      showToast(e.response?.data?.error || '❌ Eroare', '❌');
    }
  };

  const handleMessageProfessional = async (professionalId) => {
    try {
      await startConversation(professionalId);
      navigate('/app/dm');
    } catch (e) {
      showToast(e.response?.data?.error || '❌ Eroare', '❌');
    }
  };

  const handleSaveGoals = async () => {
    await putGoals(goals);
    showToast('✅ Obiective salvate!');
    setEditing(false);
  };

  const handleSaveUser = async () => {
    try {
      const patch = {
        name: userForm.name,
        email: userForm.email,
        weight: parseFloat(userForm.weight) || undefined,
        height: parseFloat(userForm.height) || undefined,
        goal: userForm.goal || undefined,
        avatar: userForm.avatar,
        avatarUrl: userForm.avatarUrl || undefined,
      };
      const { data: updated } = await patchUser(patch);
      // Update user in auth context + localStorage
      updateUser({ name: updated.name, email: updated.email, weight: updated.weight, height: updated.height, goal: updated.goal, avatarUrl: updated.avatarUrl });
      showToast('✅ Profil actualizat!');
      setEditingUser(false);
      load();
    } catch (e) {
      showToast(e.response?.data?.error || '❌ Eroare la salvare', '❌');
    }
  };

  const handleLogSteps = async () => {
    const s = parseInt(stepsInput, 10);
    if (!s || s < 0) { showToast('Introdu un număr valid', '⚠️'); return; }
    await setSteps(s);
    showToast(`✅ ${s.toLocaleString('ro')} pași înregistrați!`);
    setShowStepsModal(false);
    setStepsInput('');
    load();
  };

  const handlePasswordChange = async () => {
    if (!pwdForm.current || !pwdForm.next || !pwdForm.confirm) {
      showToast('Completează toate câmpurile', '⚠️');
      return;
    }
    if (pwdForm.next.length < 6) {
      showToast('Parola nouă: minim 6 caractere', '⚠️');
      return;
    }
    if (pwdForm.next !== pwdForm.confirm) {
      showToast('Parolele noi nu coincid', '⚠️');
      return;
    }
    setPwdSaving(true);
    try {
      await changePassword(pwdForm.current, pwdForm.next);
      showToast('✅ Parola a fost schimbată!');
      setShowPasswordModal(false);
      setPwdForm({ current: '', next: '', confirm: '' });
    } catch (error) {
      showToast(error.response?.data?.error || '❌ Eroare la schimbarea parolei', '❌');
    } finally {
      setPwdSaving(false);
    }
  };

  if (!userData || !goals) return (
    <AnimatedPage>
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16 }}>
        <div className="forja-skeleton" style={{ height: 400, borderRadius: 16 }} />
        <div className="forja-skeleton" style={{ height: 400, borderRadius: 16 }} />
      </div>
    </AnimatedPage>
  );

  const AVATAR_COLORS = ['#B8ED00','#1A52FF','#FF4422','#7B2FBE','#15803D','#B45309','#0891B2','#FF8C42'];

  return (
    <AnimatedPage>
      <Toast toast={toast} />

      {/* Steps Modal */}
      <Modal open={showStepsModal} onClose={() => setShowStepsModal(false)} title="📍 Înregistrează pași">
        <ModalField label="Număr pași azi">
          <ModalInput
            type="number"
            placeholder="ex: 8500"
            value={stepsInput}
            onChange={e => setStepsInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogSteps()}
            autoFocus
          />
        </ModalField>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
          {[2500, 5000, 7500, 10000].map(v => (
            <button key={v} onClick={() => setStepsInput(String(v))}
              className={`chip${stepsInput === String(v) ? ' on' : ''}`}
              style={{ fontSize: 11 }}>
              {v.toLocaleString('ro')}
            </button>
          ))}
        </div>
        <ModalActions>
          <button className="btn btn-outline btn-sm" onClick={() => setShowStepsModal(false)}>Anulează</button>
          <button className="btn btn-black" onClick={handleLogSteps}>✅ Salvează</button>
        </ModalActions>
      </Modal>

      {/* Password Modal */}
      <Modal open={showPasswordModal} onClose={() => { setShowPasswordModal(false); setPwdForm({ current: '', next: '', confirm: '' }); }} title="🔐 Schimbă parola">
        <ModalField label="Parola actuală">
          <ModalInput
            type="password"
            placeholder="Parola pe care o folosești acum"
            value={pwdForm.current}
            onChange={e => setPwdForm(prev => ({ ...prev, current: e.target.value }))}
            autoFocus
          />
        </ModalField>
        <ModalField label="Parola nouă (minim 6 caractere)">
          <ModalInput
            type="password"
            placeholder="Noua parolă"
            value={pwdForm.next}
            onChange={e => setPwdForm(prev => ({ ...prev, next: e.target.value }))}
          />
        </ModalField>
        <ModalField label="Confirmă parola nouă">
          <ModalInput
            type="password"
            placeholder="Repetă noua parolă"
            value={pwdForm.confirm}
            onChange={e => setPwdForm(prev => ({ ...prev, confirm: e.target.value }))}
            onKeyDown={e => e.key === 'Enter' && handlePasswordChange()}
          />
        </ModalField>
        <ModalActions>
          <button className="btn btn-outline btn-sm" onClick={() => { setShowPasswordModal(false); setPwdForm({ current: '', next: '', confirm: '' }); }}>Anulează</button>
          <button className="btn btn-black" onClick={handlePasswordChange} disabled={pwdSaving}>{pwdSaving ? '⏳ Salvez...' : '🔐 Schimbă parola'}</button>
        </ModalActions>
      </Modal>

      {/* === PLAN MODAL === */}
      <Modal open={showPlanModal} onClose={() => setShowPlanModal(false)} title="💎 Planul meu">
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: 'var(--c-ink3)', textTransform: 'uppercase', letterSpacing: 1, fontFamily: 'var(--fm)', marginBottom: 6 }}>Plan curent</div>
          <div style={{
            padding: 16, borderRadius: 12,
            background: userData?.plan === 'TEAM' ? 'rgba(123,47,190,0.08)' : (userData?.plan === 'PRO' ? 'rgba(26,82,255,0.08)' : 'rgba(184,237,0,0.08)'),
            border: '2px solid',
            borderColor: userData?.plan === 'TEAM' ? 'var(--c-purple)' : (userData?.plan === 'PRO' ? 'var(--c-blue)' : 'var(--c-lime)'),
          }}>
            <div style={{ fontFamily: 'var(--fd)', fontSize: 28, fontWeight: 900, marginBottom: 4 }}>
              {userData?.plan || 'FREE'}
            </div>
            <div style={{ fontSize: 13, color: 'var(--c-ink3)' }}>
              {userData?.plan === 'FREE' ? 'Gratuit - funcționalități de bază' :
               userData?.plan === 'PRO' ? '29 lei/lună - DM, Coach 1:1, statistici avansate' :
               '49 lei/lună - tot din PRO + echipe nelimitate + chat de echipă'}
            </div>
          </div>
        </div>

        {pendingRequest && (
          <div style={{ marginBottom: 16, padding: 14, borderRadius: 10, background: 'rgba(255,193,7,0.08)', border: '1.5px solid #ffc107' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#a08000', marginBottom: 6 }}>
              ⏳ Cerere în așteptare
            </div>
            <div style={{ fontSize: 12, color: 'var(--c-ink2)', lineHeight: 1.5 }}>
              Ai o cerere de upgrade la <strong>{pendingRequest.toPlan}</strong> ({pendingRequest.amount} lei) trimisă pe {new Date(pendingRequest.createdAt).toLocaleDateString('ro-RO')}.
              Adminul va aproba după confirmarea plății.
            </div>
          </div>
        )}

        <div style={{ fontSize: 11, color: 'var(--c-ink3)', textTransform: 'uppercase', letterSpacing: 1, fontFamily: 'var(--fm)', marginBottom: 8 }}>
          Schimbă planul
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
          {userData?.plan !== 'FREE' && (
            <button
              onClick={() => {
                setShowPlanModal(false);
                confirm('Ești sigur că vrei să anulezi abonamentul? Vei trece imediat pe planul FREE și pierzi accesul la funcționalitățile premium.', async () => {
                  try {
                    await cancelSubscription();
                    showToast('✅ Abonamentul a fost anulat. Ești acum pe FREE.');
                    load();
                    updateUser({ plan: 'FREE' });
                  } catch (e) {
                    showToast(e.response?.data?.error || '❌ Eroare', '❌');
                  }
                });
              }}
              style={{ padding: 12, borderRadius: 10, border: '1.5px solid var(--c-coral)', background: 'transparent', color: 'var(--c-coral)', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
              ⬇️ Downgrade la FREE — anulează abonamentul
            </button>
          )}
          {userData?.plan !== 'PRO' && !pendingRequest && (
            <button
              onClick={() => { setShowPlanModal(false); setUpgradeTargetPlan('PRO'); setShowUpgradeModal(true); }}
              style={{ padding: 12, borderRadius: 10, border: '1.5px solid var(--c-blue)', background: 'rgba(26,82,255,0.04)', color: 'var(--c-blue)', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
              ⬆️ Upgrade la PRO — 29 lei/lună
            </button>
          )}
          {userData?.plan !== 'TEAM' && !pendingRequest && (
            <button
              onClick={() => { setShowPlanModal(false); setUpgradeTargetPlan('TEAM'); setShowUpgradeModal(true); }}
              style={{ padding: 12, borderRadius: 10, border: '1.5px solid var(--c-purple)', background: 'rgba(123,47,190,0.04)', color: 'var(--c-purple)', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
              ⬆️ Upgrade la TEAM — 49 lei/lună
            </button>
          )}
        </div>

        <ModalActions>
          <button className="btn btn-outline btn-sm" onClick={() => setShowPlanModal(false)}>Închide</button>
        </ModalActions>
      </Modal>

      {/* === UPGRADE MODAL === */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => { setShowUpgradeModal(false); load(); }}
        targetPlan={upgradeTargetPlan}
        currentEmail={userData?.email || ''}
        onSuccess={() => { load(); }}
      />

      <div className="prof-layout">
        <div className="prof-left-card">
          <div className="prof-hd">
            <div className="prof-glow" />
            <div className="prof-av-wrap">
              <div className="prof-av" style={{ position: 'relative', cursor: 'pointer' }}
                onClick={() => document.getElementById('avatarFileInput').click()}>
                <img
                  src={userData.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=1a1a18&color=B8ED00&size=144&font-size=0.45&bold=true`}
                  alt={`Avatar ${userData.name || 'utilizator'}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=1a1a18&color=B8ED00&size=144`; }}
                />
                <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'rgba(0,0,0,0)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'all 0.2s', fontSize: 22 }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.55)'; e.currentTarget.style.opacity = 1; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0)'; e.currentTarget.style.opacity = 0; }}>
                  📷
                </div>
                <input id="avatarFileInput" type="file" accept="image/*" style={{ display: 'none' }}
                  onChange={async e => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (file.size > 5 * 1024 * 1024) { showToast('Fișierul e prea mare (max 5MB)', '⚠️'); return; }
                    try {
                      showToast('⏳ Se uploadează...');
                      const r = await uploadAvatar(file);
                      updateUser({ avatarUrl: r.data.avatarUrl });
                      showToast('✅ Avatar actualizat!');
                      load();
                    } catch { showToast('❌ Eroare la upload', '❌'); }
                    e.target.value = '';
                  }}
                />
              </div>
              <div className="prof-lv">{userData.level || 1}</div>
            </div>
            {editingUser ? (
              <div style={{ padding: '0 16px', width: '100%' }}>
                <input
                  value={userForm.name}
                  onChange={e => setUserForm(f => {
                    const nextName = e.target.value;
                    return {
                      ...f,
                      name: nextName,
                      avatar: nextName?.[0]?.toUpperCase() || 'U',
                      avatarUrl: f.avatarTheme ? `https://ui-avatars.com/api/?name=${encodeURIComponent(nextName || 'FORJA')}&background=${f.avatarTheme}&color=ffffff&size=144&font-size=0.45&bold=true` : f.avatarUrl,
                    };
                  })}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, padding: '8px 12px', color: '#fff', fontSize: 14, fontWeight: 700, marginBottom: 10, boxSizing: 'border-box', fontFamily: 'var(--fd)', textAlign: 'center', letterSpacing: 0.5 }}
                />
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 10 }}>
                  {AVATAR_COLORS.map(c => {
                    const selected = userForm.avatarTheme === c.replace('#', '');
                    return (
                      <div key={c}
                        onClick={() => {
                          const bg = c.replace('#', '');
                          const nextName = userForm.name || userData.name || 'FORJA';
                          setUserForm(f => ({
                            ...f,
                            avatar: nextName?.[0]?.toUpperCase() || 'U',
                            avatarTheme: bg,
                            avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(nextName)}&background=${bg}&color=ffffff&size=144&font-size=0.45&bold=true`,
                          }));
                        }}
                        style={{ width: 22, height: 22, borderRadius: '50%', background: c, cursor: 'pointer', border: selected ? '2px solid #fff' : '2px solid rgba(255,255,255,0.2)', boxShadow: selected ? '0 0 0 3px rgba(255,255,255,0.18)' : 'none' }} />
                    );
                  })}
                </div>
                <input
                  type="email"
                  value={userForm.email}
                  onChange={e => setUserForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="Email"
                  style={{ width: '100%', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, padding: '8px 12px', color: '#fff', fontSize: 13, marginBottom: 10, boxSizing: 'border-box', fontFamily: 'var(--fm)' }}
                />
                <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                  <input
                    type="number"
                    value={userForm.weight}
                    onChange={e => setUserForm(f => ({ ...f, weight: e.target.value }))}
                    placeholder="Greutate (kg)"
                    style={{ flex: 1, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, padding: '8px 12px', color: '#fff', fontSize: 13, boxSizing: 'border-box', fontFamily: 'var(--fm)' }}
                  />
                  <input
                    type="number"
                    value={userForm.height}
                    onChange={e => setUserForm(f => ({ ...f, height: e.target.value }))}
                    placeholder="Înălțime (cm)"
                    style={{ flex: 1, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, padding: '8px 12px', color: '#fff', fontSize: 13, boxSizing: 'border-box', fontFamily: 'var(--fm)' }}
                  />
                </div>
                <select
                  value={userForm.goal}
                  onChange={e => setUserForm(f => ({ ...f, goal: e.target.value }))}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, padding: '8px 12px', color: '#fff', fontSize: 13, marginBottom: 10, boxSizing: 'border-box', fontFamily: 'var(--fm)' }}
                >
                  <option value="" style={{ color: '#000' }}>— Obiectiv principal —</option>
                  {['Forță', 'Masă musculară', 'Slăbire', 'Rezistență', 'Sănătate generală'].map(g => (
                    <option key={g} value={g} style={{ color: '#000' }}>{g}</option>
                  ))}
                </select>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-outline btn-sm" style={{ flex: 1 }} onClick={() => setEditingUser(false)}>Anulează</button>
                  <button className="btn btn-black btn-sm" style={{ flex: 1 }} onClick={handleSaveUser}>✅ Salvează</button>
                </div>
              </div>
            ) : (
              <>
                <div className="prof-nm">{userData.name}</div>
                <div className="prof-team">{userData.teamName || 'Fără echipă'} · {userData.plan || 'FREE'}</div>
              </>
            )}
            <div className="prof-stats">
              {[
                { val: userData.streak || 0, lbl: 'Streak' },
                { val: userData.level || 1, lbl: 'Level' },
                { val: userData.xp || 0, lbl: 'XP' },
              ].map(s => (
                <div key={s.lbl} className="prst">
                  <div className="prst-val">{s.val}</div>
                  <div className="prst-lbl">{s.lbl}</div>
                </div>
              ))}
            </div>
          </div>

          {/* PRIMUL - cel mai important: schimba abonamentul */}
          <div className="prof-link" style={{ background: userData.plan === 'FREE' ? 'rgba(184,237,0,0.06)' : (userData.plan === 'TEAM' ? 'rgba(123,47,190,0.06)' : 'rgba(26,82,255,0.06)'), border: '1.5px solid', borderColor: userData.plan === 'FREE' ? 'var(--c-lime)' : (userData.plan === 'TEAM' ? 'var(--c-purple)' : 'var(--c-blue)') }} onClick={() => setShowPlanModal(true)}>
            <div className="pli">💎</div>
            <div>
              <div className="pl-txt">Planul meu — <strong style={{ color: userData.plan === 'FREE' ? 'var(--c-lime-d)' : (userData.plan === 'TEAM' ? 'var(--c-purple)' : 'var(--c-blue)') }}>{userData.plan}</strong></div>
              <div className="pl-sub">{userData.plan === 'FREE' ? 'Upgrade la PRO sau TEAM' : 'Schimbă planul sau anulează'}</div>
            </div>
            <span style={{ color: 'var(--c-ink3)' }}>›</span>
          </div>
          <div className="prof-link" onClick={() => setEditingUser(e => !e)}>
            <div className="pli">✏️</div>
            <div><div className="pl-txt">Editează profil</div><div className="pl-sub">Nume, greutate, avatar</div></div>
            <span style={{ color: 'var(--c-ink3)' }}>›</span>
          </div>
          <div className="prof-link" onClick={() => setShowStepsModal(true)}>
            <div className="pli">👟</div>
            <div><div className="pl-txt">Înregistrează pași</div><div className="pl-sub">Log manual activitate</div></div>
            <span style={{ color: 'var(--c-ink3)' }}>›</span>
          </div>
          <div className="prof-link" onClick={() => navigate('/app/teams')}>
            <div className="pli">🏆</div>
            <div><div className="pl-txt">Echipele mele</div><div className="pl-sub">{userData.teamName || 'Nicio echipă'}</div></div>
            <span style={{ color: 'var(--c-ink3)' }}>›</span>
          </div>
          <div className="prof-link" onClick={() => setShowPasswordModal(true)}>
            <div className="pli">🔐</div>
            <div><div className="pl-txt">Schimbă parola</div><div className="pl-sub">Actualizează parola contului</div></div>
            <span style={{ color: 'var(--c-ink3)' }}>›</span>
          </div>
          <div className="prof-link" style={{ color: 'var(--c-coral)' }} onClick={() => { logout(); navigate('/login'); }}>
            <div className="pli">↪️</div>
            <div><div className="pl-txt">Logout</div><div className="pl-sub">Deconectare</div></div>
          </div>
        </div>

        <div>
          <div className="sbig-grid">
            {[
              { lbl: 'Greutate', val: userData.weight ? `${userData.weight}` : '—', unit: userData.weight ? 'kg' : '', color: 'var(--c-ink)', trend: goals.weightTarget ? `Target: ${goals.weightTarget} kg` : 'Setează un target', tc: 'kt-up' },
              { lbl: 'Streak', val: userData.streak || 0, unit: 'zile', color: 'var(--c-coral)', trend: userData.streak > 0 ? '🔥 Continuă seria!' : 'Începe azi!', tc: 'kt-up' },
              { lbl: 'Level', val: userData.level || 1, unit: '', color: 'var(--c-lime-d)', trend: `${userData.xp || 0} XP acumulate`, tc: 'kt-up' },
              { lbl: 'Target', val: goals.weightTarget || '—', unit: goals.weightTarget ? 'kg' : '', color: 'var(--c-blue)', trend: userData.weight && goals.weightTarget ? `${Math.abs(userData.weight - goals.weightTarget).toFixed(1)} kg rămase` : 'Setează în obiective', tc: 'kt-warn' },
            ].map(s => (
              <div key={s.lbl} className="sbig">
                <div className="sbig-lbl">{s.lbl}</div>
                <div className="sbig-val" style={{ color: s.color }}>{s.val}<span style={{ fontSize: 16, fontWeight: 400, color: 'var(--c-ink3)' }}>{s.unit}</span></div>
                <div className={`sbig-trend ${s.tc}`}>{s.trend}</div>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="card-hd">
              <span className="card-hd-title">Obiectivele mele</span>
              <button className="btn btn-black btn-sm" onClick={() => editing ? handleSaveGoals() : setEditing(true)}>
                {editing ? '✅ Salvează' : '✏️ Editează'}
              </button>
            </div>
            <div className="card-body">
              <div className="goals-form">
                {[
                  { icon: '🔥', lbl: 'Calorii zilnice', key: 'kcal', unit: 'kcal' },
                  { icon: '🥩', lbl: 'Proteină', key: 'protein', unit: 'g' },
                  { icon: '🍚', lbl: 'Carbohidrați', key: 'carbs', unit: 'g' },
                  { icon: '🥑', lbl: 'Grăsimi', key: 'fat', unit: 'g' },
                  { icon: '💧', lbl: 'Apă', key: 'water', unit: 'L' },
                  { icon: '👟', lbl: 'Pași', key: 'steps', unit: 'pași' },
                  { icon: '😴', lbl: 'Somn', key: 'sleep', unit: 'ore' },
                  { icon: '⚖️', lbl: 'Greutate target', key: 'weightTarget', unit: 'kg' },
                ].map(g => (
                  <div key={g.key} className="goal-row">
                    <span className="goal-icon">{g.icon}</span>
                    <span className="goal-lbl">{g.lbl}</span>
                    <input className="goal-inp" type="number" value={goals[g.key] || 0}
                      disabled={!editing}
                      onChange={e => setGoals(prev => ({ ...prev, [g.key]: parseFloat(e.target.value) || 0 }))} />
                    <span className="goal-unit">{g.unit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* === PROFESIONISTII MEI === */}
          <div className="card">
            <div className="card-hd">
              <span className="card-hd-title">👥 Profesioniștii mei</span>
              <button className="btn btn-outline btn-sm" onClick={() => navigate('/app/discover')}>
                + Caută
              </button>
            </div>
            <div className="card-body">
              {professionals.coaches.length === 0 && professionals.nutritionists.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 12px', color: 'var(--c-ink3)' }}>
                  <div style={{ fontSize: 13, marginBottom: 8 }}>Nu ai încă niciun coach sau nutriționist.</div>
                  <button className="btn btn-black btn-sm" onClick={() => navigate('/app/discover')}>
                    🔍 Găsește profesioniști
                  </button>
                </div>
              ) : (
                <>
                  {professionals.coaches.length > 0 && (
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--c-ink3)', fontWeight: 700, marginBottom: 8 }}>
                        Coach-i
                      </div>
                      {professionals.coaches.map((link) => (
                        <ProfessionalRow
                          key={link.linkId}
                          link={link}
                          type="COACH"
                          onMessage={() => handleMessageProfessional(link.professional.id)}
                          onRemove={() => handleRemoveProfessional('COACH', link.linkId, link.professional.name)}
                          onAccept={() => handleAcceptProfessional('COACH', link.linkId, link.professional.name)}
                          onReject={() => handleRejectProfessional('COACH', link.linkId, link.professional.name)}
                        />
                      ))}
                    </div>
                  )}
                  {professionals.nutritionists.length > 0 && (
                    <div>
                      <div style={{ fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--c-ink3)', fontWeight: 700, marginBottom: 8 }}>
                        Nutriționiști
                      </div>
                      {professionals.nutritionists.map((link) => (
                        <ProfessionalRow
                          key={link.linkId}
                          link={link}
                          type="NUTRITIONIST"
                          onMessage={() => handleMessageProfessional(link.professional.id)}
                          onRemove={() => handleRemoveProfessional('NUTRITIONIST', link.linkId, link.professional.name)}
                          onAccept={() => handleAcceptProfessional('NUTRITIONIST', link.linkId, link.professional.name)}
                          onReject={() => handleRejectProfessional('NUTRITIONIST', link.linkId, link.professional.name)}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
}

// Helper component pentru o linie din lista de profesionisti
function ProfessionalRow({ link, type, onMessage, onRemove, onAccept, onReject }) {
  const p = link.professional;
  const isPending = link.status === 'PENDING';
  const isWaitingMe = link.status === 'PENDING_ATHLETE' || link.status === 'PENDING_CLIENT';
  const isAccepted = link.status === 'ACCEPTED';

  let badge = null;
  if (isAccepted) badge = <span style={{ background: 'var(--c-lime)', color: 'var(--c-ink)', padding: '2px 8px', borderRadius: 4, fontSize: 9, fontWeight: 700, fontFamily: 'var(--fm)', letterSpacing: 1 }}>ACTIV</span>;
  else if (isPending) badge = <span style={{ background: '#fef3c7', color: '#92400e', padding: '2px 8px', borderRadius: 4, fontSize: 9, fontWeight: 700, fontFamily: 'var(--fm)', letterSpacing: 1 }}>CEREREA TA — ÎN AȘTEPTARE</span>;
  else if (isWaitingMe) badge = <span style={{ background: '#dbeafe', color: '#1e40af', padding: '2px 8px', borderRadius: 4, fontSize: 9, fontWeight: 700, fontFamily: 'var(--fm)', letterSpacing: 1 }}>TE-A INVITAT</span>;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--c-bg)', flexWrap: 'wrap' }}>
      <div style={{
        width: 40, height: 40, borderRadius: '50%',
        background: p.avatarUrl ? `url(${p.avatarUrl}) center/cover` : 'var(--c-blue, #3b82f6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'white', fontWeight: 800, fontFamily: 'var(--fd)', fontSize: 16,
        flexShrink: 0,
      }}>
        {!p.avatarUrl && (p.name?.[0] || p.email?.[0] || '?').toUpperCase()}
      </div>
      <div style={{ flex: 1, minWidth: 120 }}>
        <div style={{ fontFamily: 'var(--fd)', fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{p.name}</div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, color: 'var(--c-ink3)' }}>{p.specialization || (type === 'COACH' ? 'Antrenor' : 'Nutriționist')}</span>
          {badge}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {isWaitingMe ? (
          <>
            <button
              className="btn btn-sm"
              onClick={onAccept}
              style={{ background: 'var(--c-lime)', color: 'var(--c-ink)', border: 'none', fontWeight: 800, padding: '6px 14px', fontSize: 12 }}
              title="Acceptă invitația"
            >
              ✓ Acceptă
            </button>
            <button
              className="btn btn-outline btn-sm"
              onClick={onReject}
              style={{ color: '#dc2626', borderColor: '#dc2626' }}
              title="Refuză invitația"
            >
              ✕ Refuză
            </button>
          </>
        ) : (
          <>
            <button className="btn btn-outline btn-sm" onClick={onMessage} title="Trimite mesaj">💬</button>
            <button className="btn btn-outline btn-sm" onClick={onRemove} title={isAccepted ? 'Desfă legătura' : 'Anulează cererea'} style={{ color: '#dc2626' }}>✕</button>
          </>
        )}
      </div>
    </div>
  );
}
