import { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../../../features/auth/context/AuthContext.jsx';
import { Toast, useToast } from '../../../shared/ui/helpers.jsx';
import {
  acceptJoinRequest,
  createPost,
  deletePost as deleteFeedPost,
  getFeed,
  getTeamDetail,
  getTeams,
  getUser,
  patchTeam,
  patchUser,
  rejectJoinRequest,
  updateTeamMember,
} from '../../../shared/api/index.js';
import { Save, Plus, Heart, Trash2, Image } from 'lucide-react';
import { AnimatedPage } from '../../../shared/ui/animations/index.jsx';
import { useConfirm } from '../../../shared/ui/ConfirmModal.jsx';
import ImageUploadButton from '../../../shared/ui/ImageUploadButton.jsx';
import { changePassword } from '../../../shared/api/auth.api.js';
import Modal, { ModalField, ModalInput, ModalActions } from '../../../shared/ui/Modal.jsx';

const DEFAULT_COVERS = [
  '/img/ext/u-a7ebdd7ec1.jpg',
  '/img/ext/u-0c8cce274f.jpg',
  '/img/ext/u-d0faf6332f.jpg',
  '/img/ext/u-e11e589fd6.jpg',
  '/img/ext/u-be7d416e34.jpg',
  '/img/ext/u-b5840e2830.jpg',
];

function parseBenefits(value) {
  return String(value || '')
    .split(/\r?\n|[;,|]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function ProProfilePage() {
  const { user } = useAuth();
  const { toast, showToast } = useToast();
  const confirm = useConfirm();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [teamLoading, setTeamLoading] = useState(false);

  const [tab, setTab] = useState(user?.role === 'USER' ? 'teams' : 'profile');

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pwdForm, setPwdForm] = useState({ current: '', next: '', confirm: '' });
  const [pwdSaving, setPwdSaving] = useState(false);

  const [profile, setProfile] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [bio, setBio] = useState('');
  const [benefits, setBenefits] = useState([]);
  const [newBenefit, setNewBenefit] = useState('');
  const [coverImg, setCoverImg] = useState('');

  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [newPostImg, setNewPostImg] = useState(null);

  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teamDetail, setTeamDetail] = useState(null);
  const [teamPost, setTeamPost] = useState('');
  const [teamPostImg, setTeamPostImg] = useState(null);
  const [editingTeam, setEditingTeam] = useState(null);

  const [customImages, setCustomImages] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const roleColor = user?.role === 'COACH'
    ? 'var(--c-blue)'
    : user?.role === 'NUTRITIONIST'
      ? 'var(--c-purple)'
      : 'var(--c-lime-d)';
  const roleLabel = user?.role === 'COACH'
    ? 'COACH'
    : user?.role === 'NUTRITIONIST'
      ? 'NUTRIȚIONIST'
      : 'UTILIZATOR';

  const coverOptions = useMemo(() => [...DEFAULT_COVERS, ...customImages], [customImages]);

  const activeTeam = useMemo(() => {
    if (!teamDetail) return null;
    return { ...teamDetail, ...(editingTeam || {}) };
  }, [teamDetail, editingTeam]);

  const isAthlete = user?.role === 'USER';

  const refreshPosts = async () => {
    const { data } = await getFeed();
    const publicPosts = Array.isArray(data)
      ? data.filter((post) => !post.teamId && !post.teamName)
      : [];
    setPosts(publicPosts);
  };

  const refreshTeams = async (preferredTeamId = null) => {
    const { data } = await getTeams();
    const managedTeams = Array.isArray(data)
      ? data.filter((team) => team.myRole === 'OWNER' || team.myRole === 'ADMIN')
      : [];
    setTeams(managedTeams);
    setSelectedTeam((current) => {
      const next = preferredTeamId && managedTeams.some((team) => team.id === preferredTeamId)
        ? preferredTeamId
        : current && managedTeams.some((team) => team.id === current)
          ? current
          : managedTeams[0]?.id || null;
      return next;
    });
    return managedTeams;
  };

  const loadPage = async () => {
    setLoading(true);
    try {
      const [{ data: profileData }] = await Promise.all([
        getUser(),
      ]);

      setProfile(profileData);
      setName(profileData?.name || '');
      setEmail(profileData?.email || '');
      setSpecialization(profileData?.specialization || '');
      setBio(profileData?.bio || '');
      setBenefits(parseBenefits(profileData?.certifications));
      setCoverImg(profileData?.avatarUrl || '');

      await Promise.all([refreshPosts(), refreshTeams()]);
    } catch (error) {
      showToast(error.response?.data?.error || '❌ Nu am putut încărca profilul.', '❌');
    } finally {
      setLoading(false);
    }
  };

  const loadSelectedTeam = async (teamId) => {
    if (!teamId) {
      setTeamDetail(null);
      setEditingTeam(null);
      return;
    }
    setTeamLoading(true);
    try {
      const { data } = await getTeamDetail(teamId);
      setTeamDetail(data);
      setEditingTeam({
        description: data?.description || '',
        avatarUrl: data?.avatarUrl || '',
        isPublic: data?.isPublic !== false,
      });
    } catch (error) {
      setTeamDetail(null);
      setEditingTeam(null);
      showToast(error.response?.data?.error || '❌ Nu am putut încărca echipa.', '❌');
    } finally {
      setTeamLoading(false);
    }
  };

  useEffect(() => {
    loadPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadSelectedTeam(selectedTeam);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTeam]);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const payload = {
        name,
        email,
        specialization,
        bio,
        avatarUrl: coverImg || null,
        certifications: benefits.join('\n'),
      };
      const { data } = await patchUser(payload);
      setProfile(data);
      showToast('✅ Profil salvat! Modificările sunt vizibile în Descoperă.');
    } catch (error) {
      showToast(error.response?.data?.error || '❌ Nu am putut salva profilul.', '❌');
    } finally {
      setSaving(false);
    }
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

  const addBenefit = () => {
    if (!newBenefit.trim()) return;
    setBenefits((prev) => [...prev, newBenefit.trim()]);
    setNewBenefit('');
  };

  const addPost = async () => {
    if (!newPost.trim()) return;
    try {
      await createPost({ content: newPost.trim(), imageUrl: newPostImg || undefined });
      setNewPost('');
      setNewPostImg(null);
      await refreshPosts();
      showToast('✅ Postare publicată!');
    } catch (error) {
      showToast(error.response?.data?.error || '❌ Nu am putut publica postarea.', '❌');
    }
  };

  const removeProfilePost = (postId) => {
    confirm('Sigur vrei să ștergi această postare?', async () => {
      try {
        await deleteFeedPost(postId);
        setPosts((prev) => prev.filter((post) => post.id !== postId));
        showToast('🗑 Postare ștearsă');
      } catch (error) {
        showToast(error.response?.data?.error || '❌ Nu am putut șterge postarea.', '❌');
      }
    });
  };

  const addTeamPost = async () => {
    if (!teamPost.trim() || !selectedTeam) return;
    try {
      await createPost({ content: teamPost.trim(), imageUrl: teamPostImg || undefined, teamId: selectedTeam });
      setTeamPost('');
      setTeamPostImg(null);
      await loadSelectedTeam(selectedTeam);
      await refreshTeams(selectedTeam);
      showToast('✅ Postare publicată în echipă!');
    } catch (error) {
      showToast(error.response?.data?.error || '❌ Nu am putut posta în echipă.', '❌');
    }
  };

  const saveTeamInfo = async () => {
    if (!selectedTeam || !editingTeam) return;
    try {
      await patchTeam(selectedTeam, editingTeam);
      await loadSelectedTeam(selectedTeam);
      await refreshTeams(selectedTeam);
      showToast('✅ Echipă actualizată!');
    } catch (error) {
      showToast(error.response?.data?.error || '❌ Nu am putut salva echipa.', '❌');
    }
  };

  const updateTeamInfo = (field, value) => {
    setEditingTeam((prev) => ({ ...(prev || {}), [field]: value }));
  };

  const handleAcceptRequest = async (requestId, userName) => {
    try {
      await acceptJoinRequest(selectedTeam, requestId);
      await loadSelectedTeam(selectedTeam);
      await refreshTeams(selectedTeam);
      showToast(`✅ ${userName} acceptat în echipă!`);
    } catch (error) {
      showToast(error.response?.data?.error || '❌ Nu am putut accepta cererea.', '❌');
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await rejectJoinRequest(selectedTeam, requestId);
      await loadSelectedTeam(selectedTeam);
      await refreshTeams(selectedTeam);
      showToast('❌ Cerere respinsă');
    } catch (error) {
      showToast(error.response?.data?.error || '❌ Nu am putut respinge cererea.', '❌');
    }
  };

  const kickMember = (memberId) => {
    confirm('Sigur vrei să elimini acest membru din echipă?', async () => {
      try {
        await updateTeamMember(selectedTeam, memberId, 'kick');
        await loadSelectedTeam(selectedTeam);
        await refreshTeams(selectedTeam);
        showToast('👋 Membru eliminat din echipă');
      } catch (error) {
        showToast(error.response?.data?.error || '❌ Nu am putut elimina membrul.', '❌');
      }
    });
  };

  const promoteMember = async (member) => {
    const action = member?.teamRole === 'ADMIN' || member?.role === 'ADMIN' ? 'demote' : 'promote';
    try {
      await updateTeamMember(selectedTeam, member.id, action);
      await loadSelectedTeam(selectedTeam);
      await refreshTeams(selectedTeam);
      showToast(action === 'promote'
        ? `⬆️ ${member.name} promovat la ADMIN`
        : `⬇️ ${member.name} retrogradat la MEMBER`);
    } catch (error) {
      showToast(error.response?.data?.error || '❌ Nu am putut actualiza rolul.', '❌');
    }
  };

  const handleFileUpload = (files) => {
    Array.from(files || []).forEach((file) => {
      if (!file?.type?.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result;
        if (!url) return;
        setCustomImages((prev) => (prev.includes(url) ? prev : [...prev, url]));
        setCoverImg(url);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragOver(false);
    handleFileUpload(event.dataTransfer.files);
  };

  const handleRemoveImage = (url, event) => {
    event.stopPropagation();
    setCustomImages((prev) => prev.filter((item) => item !== url));
    if (coverImg === url) setCoverImg(DEFAULT_COVERS[0] || '');
  };

  const copyInviteLink = async () => {
    const inviteUrl = `${window.location.origin}/app/teams`;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      showToast('✉️ Link de invitație copiat!');
    } catch {
      showToast('✉️ Trimite membrilor linkul către pagina Echipe.');
    }
  };

  if (loading) {
    return (
      <AnimatedPage style={{ maxWidth: 800, margin: '0 auto', padding: '40px 0' }}>
        <Toast toast={toast} />
        <div style={{ padding: 40, textAlign: 'center' }}>
          <div className="spinner" />
        </div>
      </AnimatedPage>
    );
  }

  return (
    <AnimatedPage style={{ maxWidth: 800, margin: '0 auto' }}>
      <Toast toast={toast} />

      <div style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: roleColor, fontWeight: 700 }}>{roleLabel}</div>
        <h1 style={{ fontFamily: 'var(--fd)', fontSize: 28, fontWeight: 900, color: 'var(--c-ink)', lineHeight: 1, margin: '4px 0' }}>{isAthlete ? 'ECHIPELE MELE' : 'PROFIL PUBLIC & ECHIPE'}</h1>
        <p style={{ fontSize: 13, color: 'var(--c-ink3)' }}>{isAthlete ? 'Gestionează echipele în care ai rol de admin/owner și administrează membrii.' : 'Editează ce văd utilizatorii pe profilul tău public.'}</p>
      </div>

      {(() => {
        const allTabs = [['profile', '📝 Profil'], ['posts', '📢 Postări'], ['teams', '🏆 Echipele mele'], ['preview', '👁️ Preview']];
        const tabs = isAthlete ? allTabs.filter(([key]) => key === 'teams') : allTabs;
        return (
          <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
            {tabs.map(([key, label]) => (
              <button key={key} className={`chip${tab === key ? ' on' : ''}`} onClick={() => setTab(key)}>{label}</button>
            ))}
          </div>
        );
      })()}

      {tab === 'profile' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="card" style={{ padding: 16 }}>
            <label style={{ fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--c-ink3)', display: 'block', marginBottom: 8 }}>
              <Image size={12} style={{ verticalAlign: 'middle' }} /> IMAGINE PROFIL
            </label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              {coverOptions.map((url, index) => (
                <div key={index} style={{ position: 'relative' }}>
                  <div onClick={() => setCoverImg(url)}
                    style={{ width: 80, height: 60, borderRadius: 10, overflow: 'hidden', cursor: 'pointer', border: coverImg === url ? '3px solid var(--c-lime)' : '2px solid var(--c-border)', transition: 'all 0.2s' }}>
                    <img src={url} alt="" onError={(event) => { event.target.style.display = 'none'; }} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  {coverImg === url && (
                    <button onClick={(event) => { event.stopPropagation(); setCoverImg(''); }}
                      style={{ position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: '50%', background: 'var(--c-coral)', color: '#fff', border: 'none', fontSize: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>✕</button>
                  )}
                </div>
              ))}
              <label style={{ width: 80, height: 60, borderRadius: 10, border: '2px dashed var(--c-border)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', gap: 2, transition: 'all 0.2s', background: dragOver ? 'var(--c-lime-bg)' : 'var(--c-bg)' }}
                onDragOver={(event) => { event.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}>
                <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(event) => {
                  handleFileUpload(event.target.files);
                  event.target.value = '';
                }} />
                <span style={{ fontSize: 18, color: 'var(--c-ink3)' }}>+</span>
                <span style={{ fontSize: 8, color: 'var(--c-ink3)', fontFamily: 'var(--fm)' }}>UPLOAD</span>
              </label>
            </div>
            {customImages.length > 0 && (
              <div style={{ marginTop: 10, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {customImages.map((url) => (
                  <button key={url} onClick={(event) => handleRemoveImage(url, event)} style={{ padding: '4px 8px', borderRadius: 999, border: '1px solid var(--c-border)', background: 'var(--c-bg)', fontSize: 11, cursor: 'pointer', color: 'var(--c-ink2)' }}>
                    Elimină imagine uploadată
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="card" style={{ padding: 16 }}>
            <div style={{ fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--c-ink3)', marginBottom: 12 }}>
              👤 INFORMAȚII CONT
            </div>
            <label style={{ fontSize: 11, color: 'var(--c-ink3)', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700, fontFamily: 'var(--fm)' }}>Nume complet</label>
            <input value={name} onChange={(e) => setName(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid var(--c-border)', fontSize: 14, fontFamily: 'var(--fb)', background: 'var(--c-bg)', boxSizing: 'border-box', marginTop: 4, marginBottom: 12 }} />
            <label style={{ fontSize: 11, color: 'var(--c-ink3)', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700, fontFamily: 'var(--fm)' }}>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid var(--c-border)', fontSize: 14, fontFamily: 'var(--fb)', background: 'var(--c-bg)', boxSizing: 'border-box', marginTop: 4, marginBottom: 12 }} />
            <label style={{ fontSize: 11, color: 'var(--c-ink3)', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700, fontFamily: 'var(--fm)' }}>Specializare</label>
            <select value={specialization} onChange={(e) => setSpecialization(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid var(--c-border)', fontSize: 14, fontFamily: 'var(--fb)', background: 'var(--c-bg)', boxSizing: 'border-box', marginTop: 4 }}>
              <option value="">— Alege —</option>
              {(user?.role === 'NUTRITIONIST'
                ? ['Sport', 'Slăbire', 'Masă musculară', 'Dietetică clinică', 'Vegan/Vegetarian']
                : ['Powerlifting', 'Bodybuilding', 'CrossFit', 'Funcțional', 'Cardio', 'General']
              ).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="card" style={{ padding: 16 }}>
            <label style={{ fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--c-ink3)', display: 'block', marginBottom: 6 }}>BIO / DESCRIERE</label>
            <textarea value={bio} onChange={(event) => setBio(event.target.value)} rows={3}
              style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid var(--c-border)', fontSize: 14, fontFamily: 'var(--fb)', background: 'var(--c-bg)', resize: 'vertical', boxSizing: 'border-box' }} />
          </div>

          <div className="card" style={{ padding: 16 }}>
            <label style={{ fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--c-ink3)', display: 'block', marginBottom: 8 }}>BENEFICII INCLUSE</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
              {benefits.map((benefit, index) => (
                <span key={`${benefit}-${index}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '5px 12px', borderRadius: 8, background: 'var(--c-lime-bg)', color: 'var(--c-lime-d)', fontSize: 12, fontWeight: 600 }}>
                  ✓ {benefit} <button onClick={() => setBenefits((prev) => prev.filter((_, currentIndex) => currentIndex !== index))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--c-coral)', padding: 0, marginLeft: 2 }}>×</button>
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input value={newBenefit} onChange={(event) => setNewBenefit(event.target.value)} placeholder="ex: Video feedback, Nutriție inclusă..."
                onKeyDown={(event) => event.key === 'Enter' && addBenefit()}
                style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1.5px solid var(--c-border)', fontSize: 13, fontFamily: 'var(--fb)', background: 'var(--c-bg)' }} />
              <button className="btn btn-black btn-sm" onClick={addBenefit}><Plus size={14} /></button>
            </div>
          </div>

          <div className="card" style={{ padding: 16 }}>
            <div style={{ fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--c-ink3)', marginBottom: 8 }}>
              🔐 CONT & SECURITATE
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>Parola contului</div>
                <div style={{ fontSize: 12, color: 'var(--c-ink3)', marginTop: 2 }}>Schimb-o periodic pentru securitate.</div>
              </div>
              <button className="btn btn-outline btn-sm" onClick={() => setShowPasswordModal(true)}>
                🔐 Schimbă parola
              </button>
            </div>
          </div>

          <button className="btn btn-lime" style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: 16 }} onClick={handleSaveProfile} disabled={saving}>
            {saving ? 'Se salvează...' : <><Save size={16} /> SALVEAZĂ PROFILUL</>}
          </button>
        </div>
      )}

      {tab === 'posts' && (
        <div>
          <div className="card" style={{ padding: 16, marginBottom: 16 }}>
            <div style={{ fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--c-ink3)', marginBottom: 8 }}>POSTARE NOUĂ PE PROFIL</div>
            <textarea value={newPost} onChange={(event) => setNewPost(event.target.value)} placeholder="Scrie o postare (tips, rezultate, motivație)..." rows={3}
              style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1.5px solid var(--c-border)', fontSize: 14, fontFamily: 'var(--fb)', background: 'var(--c-bg)', resize: 'vertical', marginBottom: 8, boxSizing: 'border-box' }} />
            <ImageUploadButton
              onImageSelect={setNewPostImg}
              currentImage={newPostImg}
              onRemove={() => setNewPostImg(null)}
              label="Adaugă imagine la postare"
            />
            <div style={{ marginTop: 8 }}>
              <button className="btn btn-lime" onClick={addPost} disabled={!newPost.trim()}>📢 Publică pe profil</button>
            </div>
          </div>
          {posts.length === 0 ? (
            <div className="card" style={{ padding: 24, textAlign: 'center', color: 'var(--c-ink3)' }}>Încă nu ai postări publice.</div>
          ) : posts.map((post) => (
            <div key={post.id} className="card" style={{ padding: 16, marginBottom: 10, position: 'relative' }}>
              <button onClick={() => removeProfilePost(post.id)} style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--c-coral)' }}><Trash2 size={14} /></button>
              <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--c-ink2)', margin: 0, paddingRight: 30 }}>{post.content}</p>
              {post.img && <img src={post.img} alt="" onError={(event) => { event.target.style.display = 'none'; }} style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 12, marginTop: 10 }} />}
              <div style={{ marginTop: 8, fontSize: 12, color: 'var(--c-ink3)' }}><Heart size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /> {post.likes || 0} · {new Date(post.createdAt).toLocaleDateString('ro-RO')}</div>
            </div>
          ))}
        </div>
      )}

      {tab === 'teams' && (
        <div>
          {teams.length === 0 ? (
            <div className="card" style={{ padding: 40, textAlign: 'center' }}>
              <p style={{ color: 'var(--c-ink3)' }}>Nu ești admin/owner în nicio echipă.</p>
            </div>
          ) : (
            <>
              {teams.length > 1 && (
                <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                  {teams.map((team) => (
                    <button key={team.id} className={`chip${selectedTeam === team.id ? ' on' : ''}`} onClick={() => setSelectedTeam(team.id)}>{team.name}</button>
                  ))}
                </div>
              )}

              {teamLoading ? (
                <div className="card" style={{ padding: 28, textAlign: 'center' }}><div className="spinner" /></div>
              ) : activeTeam ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ height: 100, background: `url(${activeTeam.avatarUrl || DEFAULT_COVERS[0]}) center/cover`, position: 'relative' }}>
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(transparent 30%, rgba(0,0,0,0.7))' }} />
                      <div style={{ position: 'absolute', bottom: 10, left: 16, color: '#fff' }}>
                        <div style={{ fontFamily: 'var(--fd)', fontSize: 22, fontWeight: 900 }}>{activeTeam.name}</div>
                        <div style={{ fontSize: 11, opacity: 0.7 }}>{activeTeam.category} · {activeTeam.membersCount} membri · {activeTeam.myRole}</div>
                      </div>
                    </div>
                    <div style={{ padding: 16 }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                        <div>
                          <label style={{ fontFamily: 'var(--fm)', fontSize: 9, letterSpacing: 1, color: 'var(--c-ink3)' }}>DESCRIERE</label>
                          <textarea value={editingTeam?.description || ''} onChange={(event) => updateTeamInfo('description', event.target.value)} rows={2}
                            style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--c-border)', fontSize: 12, fontFamily: 'var(--fb)', background: 'var(--c-bg)', resize: 'vertical', boxSizing: 'border-box' }} />
                        </div>
                        <div>
                          <label style={{ fontFamily: 'var(--fm)', fontSize: 9, letterSpacing: 1, color: 'var(--c-ink3)' }}>TIP ECHIPĂ</label>
                          <div style={{ padding: '10px', fontSize: 14, fontWeight: 700, color: 'var(--c-ink)' }}>{(editingTeam?.isPublic ?? activeTeam.isPublic) ? '🌍 Publică — inclusă în abonament' : '🔒 Privată — doar prin invitație'}</div>
                          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--c-ink2)', cursor: 'pointer', padding: '0 10px' }}>
                            <input type="checkbox" checked={editingTeam?.isPublic ?? activeTeam.isPublic ?? true} onChange={(event) => updateTeamInfo('isPublic', event.target.checked)} />
                            Echipă publică
                          </label>
                        </div>
                      </div>
                      <label style={{ fontFamily: 'var(--fm)', fontSize: 9, letterSpacing: 1, color: 'var(--c-ink3)' }}>COVER IMAGE</label>
                      <div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap', alignItems: 'center' }}>
                        {coverOptions.map((url, index) => (
                          <div key={index} style={{ position: 'relative' }}>
                            <div onClick={() => updateTeamInfo('avatarUrl', url)}
                              style={{ width: 60, height: 40, borderRadius: 6, overflow: 'hidden', cursor: 'pointer', border: (editingTeam?.avatarUrl || activeTeam.avatarUrl) === url ? '2px solid var(--c-lime)' : '1px solid var(--c-border)' }}>
                              <img src={url} alt="" onError={(event) => { event.target.style.display = 'none'; }} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                            {(editingTeam?.avatarUrl || activeTeam.avatarUrl) === url && (
                              <button onClick={(event) => { event.stopPropagation(); updateTeamInfo('avatarUrl', ''); }}
                                style={{ position: 'absolute', top: -5, right: -5, width: 16, height: 16, borderRadius: '50%', background: 'var(--c-coral)', color: '#fff', border: 'none', fontSize: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                            )}
                          </div>
                        ))}
                        <label style={{ width: 60, height: 40, borderRadius: 6, border: '1.5px dashed var(--c-border)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: 'var(--c-bg)', gap: 1 }}>
                          <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(event) => {
                            const file = event.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (loadEvent) => {
                                const nextUrl = loadEvent.target?.result;
                                if (!nextUrl) return;
                                setCustomImages((prev) => (prev.includes(nextUrl) ? prev : [...prev, nextUrl]));
                                updateTeamInfo('avatarUrl', nextUrl);
                              };
                              reader.readAsDataURL(file);
                            }
                            event.target.value = '';
                          }} />
                          <span style={{ fontSize: 14, color: 'var(--c-ink3)', lineHeight: 1 }}>+</span>
                          <span style={{ fontSize: 7, color: 'var(--c-ink3)', fontFamily: 'var(--fm)' }}>UPLOAD</span>
                        </label>
                      </div>
                      <button className="btn btn-lime btn-sm" style={{ marginTop: 12 }} onClick={saveTeamInfo}>
                        <Save size={14} /> Salvează modificările
                      </button>
                    </div>
                  </div>

                  {Array.isArray(activeTeam.pendingRequests) && activeTeam.pendingRequests.length > 0 && (
                    <div className="card" style={{ padding: 16, border: '1.5px solid var(--c-amber-bg)' }}>
                      <div style={{ fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--c-amber)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                        🔔 CERERI DE ALĂTURARE ({activeTeam.pendingRequests.length})
                      </div>
                      {activeTeam.pendingRequests.map((request) => (
                        <div key={request.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--c-border)' }}>
                          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--c-amber-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, color: 'var(--c-amber)', fontFamily: 'var(--fd)', flexShrink: 0 }}>
                            {request.avatar || request.userName?.[0]}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: 13 }}>{request.userName}</div>
                            <div style={{ fontSize: 11, color: 'var(--c-ink3)' }}>{new Date(request.date).toLocaleDateString('ro-RO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
                          </div>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button onClick={() => handleAcceptRequest(request.id, request.userName)} style={{ padding: '5px 14px', borderRadius: 6, border: 'none', background: 'var(--c-green)', color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                              ✓ Acceptă
                            </button>
                            <button onClick={() => handleRejectRequest(request.id)} style={{ padding: '5px 14px', borderRadius: 6, border: '1px solid var(--c-border)', background: 'transparent', color: 'var(--c-coral)', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                              ✕ Respinge
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="card" style={{ padding: 16 }}>
                    <div style={{ fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--c-lime-d)', marginBottom: 8 }}>📢 POSTEAZĂ ÎN {activeTeam.name.toUpperCase()}</div>
                    <textarea value={teamPost} onChange={(event) => setTeamPost(event.target.value)} placeholder="Postare nouă pentru echipă..." rows={2}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid var(--c-border)', fontSize: 14, fontFamily: 'var(--fb)', background: 'var(--c-bg)', resize: 'vertical', marginBottom: 8, boxSizing: 'border-box' }} />
                    <ImageUploadButton
                      onImageSelect={setTeamPostImg}
                      currentImage={teamPostImg}
                      onRemove={() => setTeamPostImg(null)}
                      label="Imagine postare"
                      compact
                    />
                    <div style={{ marginTop: 8 }}>
                      <button className="btn btn-black" onClick={addTeamPost} disabled={!teamPost.trim()}>📢 Publică în echipă</button>
                    </div>
                  </div>

                  <div className="card" style={{ padding: 16 }}>
                    <div style={{ fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--c-ink3)', marginBottom: 10 }}>MEMBRI ({activeTeam.members?.length || 0})</div>
                    {(activeTeam.members || []).map((member) => (
                      <div key={member.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--c-border)' }}>
                        <div style={{ width: 34, height: 34, borderRadius: '50%', background: member.teamRole === 'ADMIN' || member.teamRole === 'OWNER' ? 'var(--c-blue-bg)' : 'var(--c-lime-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, color: member.teamRole === 'ADMIN' || member.teamRole === 'OWNER' ? 'var(--c-blue)' : 'var(--c-lime-d)', fontFamily: 'var(--fd)', overflow: 'hidden' }}>
                          {member.avatarUrl ? (
                            <img src={member.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(event) => { event.target.style.display = 'none'; }} />
                          ) : member.avatar}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: 13 }}>{member.name}</div>
                        </div>
                        <span style={{ padding: '3px 8px', borderRadius: 5, fontSize: 9, fontWeight: 800, background: member.teamRole === 'ADMIN' || member.teamRole === 'OWNER' ? 'var(--c-blue-bg)' : 'var(--c-bg)', color: member.teamRole === 'ADMIN' || member.teamRole === 'OWNER' ? 'var(--c-blue)' : 'var(--c-ink3)', fontFamily: 'var(--fm)' }}>{member.teamRole}</span>
                        {member.teamRole !== 'OWNER' && (
                          <div style={{ display: 'flex', gap: 4 }}>
                            <button onClick={() => promoteMember(member)} title={member.teamRole === 'ADMIN' ? 'Retrogradează la member' : 'Promovează la admin'}
                              style={{ width: 26, height: 26, borderRadius: 6, border: 'none', background: member.teamRole === 'ADMIN' ? 'var(--c-amber-bg)' : 'var(--c-blue-bg)', color: member.teamRole === 'ADMIN' ? 'var(--c-amber)' : 'var(--c-blue)', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              {member.teamRole === 'ADMIN' ? '⬇' : '⬆'}
                            </button>
                            <button onClick={() => kickMember(member.id)} title="Elimină din echipă"
                              style={{ width: 26, height: 26, borderRadius: 6, border: 'none', background: 'var(--c-coral-bg)', color: 'var(--c-coral)', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                          </div>
                        )}
                      </div>
                    ))}
                    <button className="btn btn-outline btn-sm" style={{ marginTop: 12, width: '100%', justifyContent: 'center' }} onClick={copyInviteLink}>✉️ Invită membru nou</button>
                  </div>
                </div>
              ) : null}
            </>
          )}
        </div>
      )}

      {tab === 'preview' && (
        <div>
          <div style={{ textAlign: 'center', marginBottom: 16, padding: '10px', background: 'var(--c-lime-bg)', borderRadius: 10, fontSize: 12, color: 'var(--c-lime-d)', fontWeight: 600 }}>
            👁️ Așa te văd utilizatorii în pagina Descoperă
          </div>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ height: 80, background: `linear-gradient(135deg, ${roleColor}30, ${roleColor}08)`, position: 'relative' }}>
              <div style={{ position: 'absolute', bottom: -28, left: 20 }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', border: '3px solid var(--c-surface)', overflow: 'hidden', background: roleColor }}>
                  {coverImg ? <img src={coverImg} alt="" onError={(event) => { event.target.style.display = 'none'; }} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> :
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 22, color: '#fff', fontFamily: 'var(--fd)' }}>{profile?.name?.[0] || user?.name?.[0]}</div>}
                </div>
              </div>
              <div style={{ position: 'absolute', top: 8, right: 10, padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700, fontFamily: 'var(--fm)', background: 'var(--c-surface)', color: 'var(--c-ink)' }}>
                {roleLabel}
              </div>
            </div>
            <div style={{ padding: '36px 20px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <div style={{ fontFamily: 'var(--fd)', fontSize: 20, fontWeight: 800 }}>{profile?.name || user?.name}</div>
                <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700, background: `${roleColor}15`, color: roleColor, fontFamily: 'var(--fm)' }}>{roleLabel}</span>
              </div>
              <p style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--c-ink2)', margin: '8px 0 12px' }}>{bio}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {benefits.map((benefit, index) => (
                  <span key={`${benefit}-${index}`} style={{ padding: '3px 8px', borderRadius: 6, fontSize: 10, fontWeight: 600, background: 'var(--c-bg)', color: 'var(--c-ink2)' }}>✓ {benefit}</span>
                ))}
              </div>
            </div>
            {posts.length > 0 && (
              <div style={{ borderTop: '1px solid var(--c-border)' }}>
                {posts.slice(0, 2).map((post) => (
                  <div key={post.id} style={{ padding: '12px 20px', borderBottom: '1px solid var(--c-border)' }}>
                    <p style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--c-ink2)', margin: 0 }}>{post.content}</p>
                    {post.img && <img src={post.img} alt="" onError={(event) => { event.target.style.display = 'none'; }} style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 8, marginTop: 8 }} />}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Password Modal */}
      <Modal
        open={showPasswordModal}
        onClose={() => { setShowPasswordModal(false); setPwdForm({ current: '', next: '', confirm: '' }); }}
        title="🔐 Schimbă parola"
      >
        <ModalField label="Parola actuală">
          <ModalInput
            type="password"
            placeholder="Parola pe care o folosești acum"
            value={pwdForm.current}
            onChange={(e) => setPwdForm((prev) => ({ ...prev, current: e.target.value }))}
            autoFocus
          />
        </ModalField>
        <ModalField label="Parola nouă (minim 6 caractere)">
          <ModalInput
            type="password"
            placeholder="Noua parolă"
            value={pwdForm.next}
            onChange={(e) => setPwdForm((prev) => ({ ...prev, next: e.target.value }))}
          />
        </ModalField>
        <ModalField label="Confirmă parola nouă">
          <ModalInput
            type="password"
            placeholder="Repetă noua parolă"
            value={pwdForm.confirm}
            onChange={(e) => setPwdForm((prev) => ({ ...prev, confirm: e.target.value }))}
            onKeyDown={(e) => e.key === 'Enter' && handlePasswordChange()}
          />
        </ModalField>
        <ModalActions>
          <button className="btn btn-outline btn-sm" onClick={() => { setShowPasswordModal(false); setPwdForm({ current: '', next: '', confirm: '' }); }}>Anulează</button>
          <button className="btn btn-black" onClick={handlePasswordChange} disabled={pwdSaving}>
            {pwdSaving ? '⏳ Salvez...' : '🔐 Schimbă parola'}
          </button>
        </ModalActions>
      </Modal>
    </AnimatedPage>
  );
}
