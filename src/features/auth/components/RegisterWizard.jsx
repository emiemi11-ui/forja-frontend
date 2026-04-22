import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ENABLE_ADMIN_BOOTSTRAP = import.meta.env.VITE_ENABLE_ADMIN_BOOTSTRAP === 'true';

const BASE_ROLES = [
  { id: 'USER', icon: '⚡', title: 'ATLETUL', subtitle: 'Antrenament · Nutriție · Progres', color: '#B8ED00', desc: 'Antrenează-te cu planuri personalizate, trackuiește mâncarea și somnul, alătură-te unei echipe.' },
  { id: 'COACH', icon: '👥', title: 'COACH-UL', subtitle: 'Planuri · Atleți · Performanță', color: '#1A52FF', desc: 'Creează planuri de antrenament, gestionează atleți, monitorizează compliance și progresul.' },
  { id: 'NUTRITIONIST', icon: '🥗', title: 'NUTRIȚIONISTUL', subtitle: 'Planuri · Clienți · Compliance', color: '#7B2FBE', desc: 'Template-uri nutriție, tracking macros per client, rețete și recomandări automate.' },
];

const ADMIN_ROLE = {
  id: 'ADMIN',
  icon: '🛠️',
  title: 'ADMIN',
  subtitle: 'Sistem · Moderare · Control',
  color: '#FF5577',
  desc: 'Bootstrap doar pentru primul administrator real al platformei. Folosește-l doar la inițializarea sistemului.',
};

const ROLES = ENABLE_ADMIN_BOOTSTRAP ? [...BASE_ROLES, ADMIN_ROLE] : BASE_ROLES;

const PLANS_USER = [
  { id: 'FREE', title: 'FREE', price: '0 lei', desc: 'Antrenament de bază, tracking calorii, o echipă publică.', features: ['Antrenament zilnic', 'Tracking calorii', '1 echipă publică'] },
  { id: 'PRO', title: 'PRO', price: '49 lei/lună', desc: 'Tot ce include FREE + somn, realizări, planuri avansate.', features: ['Tot din FREE', 'Analiza somn', 'Realizări & badges', 'Planuri multiple', 'Statistici avansate'], popular: true },
  { id: 'TEAM', title: 'TEAM', price: '99 lei/lună', desc: 'Tot ce include PRO + echipe nelimitate, chat, coaching 1:1.', features: ['Tot din PRO', 'Echipe nelimitate', 'Chat de echipă', 'Mesaje directe', 'Coaching 1:1', 'Echipele mele'] },
];

const PROFILE_FIELDS = {
  USER: [
    { key: 'weight', label: 'Greutate (kg)', type: 'number', placeholder: '75' },
    { key: 'height', label: 'Înălțime (cm)', type: 'number', placeholder: '178' },
    { key: 'goal', label: 'Obiectiv principal', type: 'select', options: ['Forță', 'Masă musculară', 'Slăbire', 'Rezistență', 'Sănătate generală'] },
  ],
  COACH: [
    { key: 'specialization', label: 'Specializare', type: 'select', options: ['Powerlifting', 'Bodybuilding', 'CrossFit', 'Funcțional', 'Cardio', 'General'] },
    { key: 'experience', label: 'Ani experiență', type: 'number', placeholder: '5' },
    { key: 'bio', label: 'Bio scurt', type: 'text', placeholder: 'Coach certificat cu experiență în...' },
  ],
  NUTRITIONIST: [
    { key: 'specialization', label: 'Specializare', type: 'select', options: ['Sport', 'Slăbire', 'Masă musculară', 'Dietetică clinică', 'Vegan/Vegetarian'] },
    { key: 'certifications', label: 'Certificări', type: 'text', placeholder: 'ex: Nutriționist certificat ANP' },
    { key: 'bio', label: 'Bio scurt', type: 'text', placeholder: 'Nutriționist cu experiență în...' },
  ],
};

const anim = {
  enter: (d) => ({ x: d > 0 ? 280 : -280, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (d) => ({ x: d > 0 ? -280 : 280, opacity: 0 }),
};

export default function RegisterWizard({ onRegister, loading, error }) {
  const [step, setStep] = useState(1);
  const [dir, setDir] = useState(1);
  const [role, setRole] = useState('');
  const [plan, setPlan] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '', password2: '' });
  const [extra, setExtra] = useState({});
  const [formError, setFormError] = useState('');

  const go = (s) => { setDir(s > step ? 1 : -1); setStep(s); };

  const rolePlanMap = {
    COACH: 'COACH',
    NUTRITIONIST: 'NUT',
    ADMIN: 'PRO',
  };

  const handleRoleSelect = (r) => {
    setRole(r);
    if (r !== 'USER') {
      setPlan(rolePlanMap[r] || 'FREE');
      go(3);
    } else {
      setPlan('');
      go(2);
    }
  };

  const handleSubmit = () => {
    if (!form.name.trim()) return setFormError('Introdu numele complet');
    if (!form.email.trim() || !form.email.includes('@')) return setFormError('Introdu un email valid');
    if (form.password.length < 4) return setFormError('Parola minim 4 caractere');
    if (form.password !== form.password2) return setFormError('Parolele nu se potrivesc');
    setFormError('');
    onRegister({ name: form.name, email: form.email, password: form.password, role, plan, extra });
  };

  const accent = role === 'COACH' ? '#1A52FF' : role === 'NUTRITIONIST' ? '#7B2FBE' : role === 'ADMIN' ? '#FF5577' : '#B8ED00';
  const inputStyle = { width: '100%', padding: '12px 14px', borderRadius: 10, border: '1.5px solid var(--c-border)', fontSize: 14, fontFamily: 'var(--fb)', background: 'var(--c-surface)', boxSizing: 'border-box', color: 'var(--c-ink)' };
  const labelStyle = { fontSize: 11, fontWeight: 700, color: 'var(--c-ink2)', marginBottom: 4, display: 'block' };

  return (
    <div style={{ minHeight: 420, overflow: 'hidden' }}>
      {/* Progress */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
        {[1, 2, 3].map(s => (
          <div key={s} style={{ flex: 1, height: 4, borderRadius: 2, background: s <= step ? accent : 'var(--c-border)', transition: 'all 0.3s' }} />
        ))}
      </div>

      <AnimatePresence mode="wait" custom={dir}>
        {step === 1 && (
          <motion.div key="s1" custom={dir} variants={anim} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}>
            <div style={{ fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: 2, color: 'var(--c-ink3)', marginBottom: 6 }}>PAS 1 DIN 3</div>
            <h2 style={{ fontFamily: 'var(--fd)', fontSize: 28, fontWeight: 900, marginBottom: 4 }}>ALEGE ROLUL TĂU</h2>
            <p style={{ fontSize: 13, color: 'var(--c-ink3)', marginBottom: 20 }}>Ce vrei să faci în FORJA?</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {ROLES.map(r => (
                <motion.button key={r.id} type="button" whileHover={{ scale: 1.01, x: 4 }} whileTap={{ scale: 0.99 }}
                  onClick={() => handleRoleSelect(r.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '18px 20px', borderRadius: 14, border: '1.5px solid var(--c-border)', background: 'var(--c-surface)', cursor: 'pointer', textAlign: 'left' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: r.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{r.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'var(--fd)', fontSize: 20, fontWeight: 900, color: 'var(--c-ink)' }}>{r.title}</div>
                    <div style={{ fontSize: 10, color: r.color, fontFamily: 'var(--fm)', letterSpacing: 1, marginTop: 1 }}>{r.subtitle}</div>
                    <div style={{ fontSize: 12, color: 'var(--c-ink3)', marginTop: 3, lineHeight: 1.4 }}>{r.desc}</div>
                  </div>
                  <span style={{ fontSize: 16, color: 'var(--c-ink3)' }}>→</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="s2" custom={dir} variants={anim} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}>
            <div style={{ fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: 2, color: 'var(--c-ink3)', marginBottom: 6 }}>PAS 2 DIN 3</div>
            <h2 style={{ fontFamily: 'var(--fd)', fontSize: 28, fontWeight: 900, marginBottom: 4 }}>ALEGE PLANUL</h2>
            <p style={{ fontSize: 13, color: 'var(--c-ink3)', marginBottom: 20 }}>Poți schimba oricând din setări.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {PLANS_USER.map(p => (
                <motion.button key={p.id} type="button" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                  onClick={() => { setPlan(p.id); go(3); }}
                  style={{ padding: '18px 20px', borderRadius: 14, textAlign: 'left', cursor: 'pointer', border: p.popular ? '2px solid #B8ED00' : '1.5px solid var(--c-border)', background: p.popular ? 'rgba(184,237,0,0.04)' : 'var(--c-surface)', position: 'relative' }}>
                  {p.popular && <div style={{ position: 'absolute', top: -10, right: 16, background: '#B8ED00', color: '#000', padding: '2px 10px', borderRadius: 100, fontSize: 9, fontWeight: 800, fontFamily: 'var(--fm)', letterSpacing: 1 }}>RECOMANDAT</div>}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontFamily: 'var(--fd)', fontSize: 22, fontWeight: 900 }}>{p.title}</span>
                    <span style={{ fontFamily: 'var(--fm)', fontSize: 14, fontWeight: 700, color: 'var(--c-lime-d)' }}>{p.price}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--c-ink3)', marginBottom: 8 }}>{p.desc}</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {p.features.map((f, i) => <span key={i} style={{ fontSize: 10, padding: '3px 8px', borderRadius: 6, background: 'var(--c-lime-bg)', color: 'var(--c-lime-d)', fontWeight: 600 }}>✓ {f}</span>)}
                  </div>
                </motion.button>
              ))}
            </div>
            <button type="button" onClick={() => go(1)} style={{ marginTop: 14, background: 'none', border: 'none', fontSize: 13, color: 'var(--c-ink3)', cursor: 'pointer', fontWeight: 600 }}>← Înapoi</button>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="s3" custom={dir} variants={anim} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}>
            <div style={{ fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: 2, color: 'var(--c-ink3)', marginBottom: 6 }}>PAS 3 DIN 3</div>
            <h2 style={{ fontFamily: 'var(--fd)', fontSize: 28, fontWeight: 900, marginBottom: 4 }}>COMPLETEAZĂ PROFILUL</h2>
            <p style={{ fontSize: 13, color: 'var(--c-ink3)', marginBottom: 16 }}>
              {role === 'USER' ? `Plan: ${plan}` : role === 'COACH' ? 'Cont Coach' : role === 'NUTRITIONIST' ? 'Cont Nutriționist' : 'Cont Admin'}
              {role !== 'USER' && ' — acces complet inclus'}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div><label htmlFor="reg-name" style={labelStyle}>Nume complet *</label><input id="reg-name" value={form.name} autoComplete="name" onChange={e => setForm(f => ({...f, name: e.target.value}))} placeholder="Ion Popescu" style={inputStyle} /></div>
              <div><label htmlFor="reg-email" style={labelStyle}>Email *</label><input id="reg-email" type="email" value={form.email} autoComplete="email" onChange={e => setForm(f => ({...f, email: e.target.value}))} placeholder="email@exemplu.ro" style={inputStyle} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div><label htmlFor="reg-pass" style={labelStyle}>Parolă *</label><input id="reg-pass" type="password" value={form.password} autoComplete="new-password" onChange={e => setForm(f => ({...f, password: e.target.value}))} placeholder="••••••" style={inputStyle} /></div>
                <div><label htmlFor="reg-pass2" style={labelStyle}>Confirmă *</label><input id="reg-pass2" type="password" value={form.password2} autoComplete="new-password" onChange={e => setForm(f => ({...f, password2: e.target.value}))} placeholder="••••••" style={inputStyle} /></div>
              </div>
              {(PROFILE_FIELDS[role] || []).map(field => (
                <div key={field.key}>
                  <label htmlFor={`reg-${field.key}`} style={labelStyle}>{field.label}</label>
                  {field.type === 'select' ? (
                    <select id={`reg-${field.key}`} value={extra[field.key] || ''} onChange={e => setExtra(x => ({...x, [field.key]: e.target.value}))} style={inputStyle}>
                      <option value="">Alege...</option>
                      {field.options.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input id={`reg-${field.key}`} type={field.type || 'text'} value={extra[field.key] || ''} onChange={e => setExtra(x => ({...x, [field.key]: e.target.value}))} placeholder={field.placeholder} style={inputStyle} />
                  )}
                </div>
              ))}
            </div>
            {(formError || error) && <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 8, background: 'var(--c-coral-bg)', color: 'var(--c-coral)', fontSize: 13, fontWeight: 600 }}>{formError || error}</div>}
            <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
              <button type="button" onClick={() => go(role === 'USER' ? 2 : 1)} style={{ padding: '12px 20px', borderRadius: 10, border: '1.5px solid var(--c-border)', background: 'transparent', fontWeight: 700, fontSize: 13, cursor: 'pointer', color: 'var(--c-ink2)' }}>← Înapoi</button>
              <button type="button" onClick={handleSubmit} disabled={loading}
                style={{ flex: 1, padding: '12px 20px', borderRadius: 10, border: 'none', background: accent, color: role === 'USER' ? '#000' : '#fff', fontWeight: 800, fontSize: 14, cursor: 'pointer', fontFamily: 'var(--fd)', letterSpacing: 0.5 }}>
                {loading ? 'Se creează...' : '🚀 CREEAZĂ CONTUL'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
