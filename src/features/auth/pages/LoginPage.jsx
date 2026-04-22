import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import RegisterWizard from '../components/RegisterWizard.jsx';
import { requestPasswordReset } from '../../../shared/api/index.js';
import { buildDemoAuth } from '../../../shared/api/mockData.js';
import '../auth.css';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const DEMO_ROLES_RAW = [
  {
    id: 'athlete',
    title: 'Athlete',
    label: 'personal performance',
    description: 'Workout, nutriție, recovery și progress tracking într-un singur flow vizual.',
    email: 'user@forja.ro',
    accent: '#d7ff45',
    image:
      '/img/ext/role-athlete-demo.jpg',
    backendRole: 'USER',
  },
  {
    id: 'coach',
    title: 'Coach',
    label: 'team command',
    description: 'Coordonezi sportivi, construiești programe și urmărești execuția fără haos.',
    email: 'coach@forja.ro',
    accent: '#8ab4ff',
    image:
      '/img/ext/role-coach-demo.jpg',
    backendRole: 'COACH',
  },
  {
    id: 'nutritionist',
    title: 'Nutritionist',
    label: 'nutrition desk',
    description: 'Planuri alimentare, compliance și ajustări rapide pentru fiecare client.',
    email: 'nutritionist@forja.ro',
    accent: '#ffbc7d',
    image:
      '/img/ext/role-nutritionist-demo.jpg',
    backendRole: 'NUTRITIONIST',
  },
  {
    id: 'admin',
    title: 'Admin',
    label: 'system control',
    description: 'Panou de administrare: utilizatori, inbox, setări și securitate.',
    email: 'admin@forja.ro',
    accent: '#ff5577',
    image:
      '/img/ext/role-admin-demo.jpg',
    backendRole: 'ADMIN',
  },
];

const DEMO_ROLES = DEMO_ROLES_RAW;
const SHOW_DEMO = DEMO_ROLES.length > 0;
const FALLBACK_DEMO_ROLE = DEMO_ROLES_RAW[0];

const PLAN_TILES = [
  {
    id: 'free',
    title: 'free',
    label: 'solo access',
    description: 'Workout, nutriție și recovery pentru acces individual rapid.',
  },
  {
    id: 'pro',
    title: 'pro',
    label: 'system flow',
    description: 'Fluxul complet FORJA pentru progres constant și tracking premium.',
  },
  {
    id: 'team',
    title: 'team',
    label: 'teams + coach',
    description: 'Pentru echipe, coachi și operațiuni coordonate din același ecosistem.',
  },
];

const PLAN_LABELS = {
  free: 'Starter',
  starter: 'Starter',
  pro: 'PRO',
  annual: 'PRO anual',
  team: 'Team',
  business: 'Business',
  coach: 'Coach',
  nutritionist: 'Nutriționist',
  'nut.': 'Nutriționist',
};

const ROLE_PARAM_TO_KEY = {
  user: 'athlete',
  athlete: 'athlete',
  coach: 'coach',
  nutritionist: 'nutritionist',
  nut: 'nutritionist',
  'nut.': 'nutritionist',
};

function normalize(value) {
  return String(value || '').trim().toLowerCase();
}

function roleKeyFromParams(roleParam, planParam, inviteToken) {
  if (inviteToken) return 'athlete';
  const roleKey = ROLE_PARAM_TO_KEY[normalize(roleParam)];
  if (roleKey) return roleKey;
  const plan = normalize(planParam);
  if (plan === 'coach') return 'coach';
  if (plan === 'nutritionist' || plan === 'nut.') return 'nutritionist';
  return 'athlete';
}

function planTierFromContext(planParam, roleKey) {
  const plan = normalize(planParam);
  if (plan === 'free' || plan === 'starter') return 'free';
  if (plan === 'pro' || plan === 'annual') return 'pro';
  if (plan === 'team' || plan === 'business' || plan === 'coach' || plan === 'nutritionist' || plan === 'nut.') {
    return 'team';
  }
  return roleKey === 'coach' || roleKey === 'nutritionist' ? 'team' : 'pro';
}

function labelForPlan(plan) {
  const normalized = normalize(plan);
  return PLAN_LABELS[normalized] || (normalized ? normalized.toUpperCase() : 'Plan selectat');
}

function resolvePlanForSubmit(lockedPlan, planTier, roleKey) {
  if (lockedPlan) return lockedPlan;
  if (planTier === 'free') return 'free';
  if (planTier === 'pro') return 'pro';
  if (roleKey === 'coach') return 'coach';
  if (roleKey === 'nutritionist') return 'nutritionist';
  return 'team';
}

function ArrowRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

function Eye({ open }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.48 18.48 0 0 1 5.17-6.05" />
      <path d="M9.53 9.53A3 3 0 0 0 12 15a3 3 0 0 0 2.47-5.47" />
      <path d="M21 12s-1.72-3.44-5-5.5" />
      <path d="M1 1l22 22" />
    </svg>
  );
}

function Check() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export default function Login() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, register, startDemo } = useAuth();

  const planParam = normalize(searchParams.get('plan'));
  const inviteToken = searchParams.get('invite') || '';
  const inviteEmail = searchParams.get('email') || '';
  const roleParam = searchParams.get('role') || '';
  const requestedTab = normalize(searchParams.get('tab'));

  const initialRoleKey = roleKeyFromParams(roleParam, planParam, inviteToken);
  const initialTab = ['login', 'register', 'demo'].includes(requestedTab)
    ? (requestedTab === 'demo' && !SHOW_DEMO ? 'login' : requestedTab)
    : (planParam || inviteToken ? 'register' : 'login');
  const initialPlanTier = planTierFromContext(planParam, initialRoleKey);
  const planLocked = Boolean(planParam);
  const roleLocked = Boolean(inviteToken || normalize(roleParam) || planParam === 'coach' || planParam === 'nutritionist' || planParam === 'nut.');

  const [tab, setTab] = useState(initialTab);
  const [email, setEmail] = useState(inviteEmail || '');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [selectedRole, setSelectedRole] = useState(initialRoleKey);
  const [planTier, setPlanTier] = useState(initialPlanTier);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingDemo, setLoadingDemo] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [resettingPassword, setResettingPassword] = useState(false);

  const activeRole = useMemo(
    () => DEMO_ROLES.find((role) => role.id === selectedRole) || DEMO_ROLES_RAW.find((role) => role.id === selectedRole) || FALLBACK_DEMO_ROLE,
    [selectedRole]
  );

  const inviteBanner = Boolean(inviteToken);

  const resetFeedback = () => {
    setError('');
    setSuccess(false);
  };

  const switchTab = (nextTab) => {
    resetFeedback();
    setTab(nextTab);
  };

  const handleRoleChange = (roleId) => {
    if (roleLocked) return;
    setSelectedRole(roleId);
    resetFeedback();
    if (!planLocked && (roleId === 'coach' || roleId === 'nutritionist')) {
      setPlanTier('ops');
    }
  };

  const runAuth = async (fn) => {
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const redirect = await fn();
      setSuccess(true);
      window.setTimeout(() => navigate(redirect || '/app'), 650);
    } catch (err) {
      setError(err.response?.data?.error || 'Eroare de conexiune cu backend-ul.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setError('');
    setSuccess(false);
    if (!email.trim()) {
      setError('Introdu emailul contului pentru resetarea parolei.');
      return;
    }
    setResettingPassword(true);
    try {
      const { data } = await requestPasswordReset(email.trim());
      setSuccess(Boolean(data?.ok));
    } catch (err) {
      setError(err.response?.data?.error || 'Nu am putut înregistra cererea de resetare.');
    } finally {
      setResettingPassword(false);
    }
  };

  const doLogin = async (event) => {
    event?.preventDefault();

    if (!email.trim() || !password) {
      setError('Completează emailul și parola.');
      return;
    }
    if (!EMAIL_REGEX.test(email.trim())) {
      setError('Adresa de email nu este validă.');
      return;
    }

    await runAuth(() => login(email.trim(), password, { persist: rememberMe }));
  };

  const doRegister = async (event) => {
    event?.preventDefault();

    if (!name.trim() || !email.trim() || !password) {
      setError('Completează toate câmpurile.');
      return;
    }
    if (name.trim().length < 2) {
      setError('Numele trebuie să aibă minim 2 caractere.');
      return;
    }
    if (!EMAIL_REGEX.test(email.trim())) {
      setError('Adresa de email nu este validă.');
      return;
    }
    if (password.length < 6) {
      setError('Parola trebuie să aibă minim 6 caractere.');
      return;
    }

    const resolvedPlan = resolvePlanForSubmit(planParam, planTier, selectedRole);
    await runAuth(() => register(
      name.trim(),
      email.trim(),
      password,
      activeRole.backendRole,
      resolvedPlan,
      inviteToken || undefined,
      { persist: rememberMe }
    ));
  };

  const doQuickLogin = async (role) => {
    if (!SHOW_DEMO) return;
    setLoadingDemo(role.id);
    setError('');
    setSuccess(false);

    try {
      const demoSession = buildDemoAuth(role.email);
      if (!demoSession) throw new Error('Cont demo indisponibil.');
      const redirect = await startDemo(demoSession, { persist: true });
      setSuccess(true);
      window.setTimeout(() => navigate(redirect || '/app'), 320);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Nu am putut intra în contul demo.');
    } finally {
      setLoadingDemo('');
    }
  };

  return (
    <div className="forja-auth-page">
      

      <div className="forja-auth-shell">
        <section className="forja-auth-left">
          <img
            src="/img/ext/auth-cover-athlete.jpg"
            alt="FORJA cinematic athlete"
            className="forja-auth-cover"
          />

          <div className="forja-auth-left-content">
            <div>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                <div>
                  <div className="forja-kicker">performance operating system</div>
                  <div className="forja-logo">FORJA</div>
                </div>
                <a className="forja-ghost-btn" href="/landing.html">înapoi la landing</a>
              </div>
            </div>

            <div style={{ maxWidth: 780, padding: '32px 0 40px' }}>
              <h1 className="forja-headline" style={{ marginTop: 22 }}>
                Antrenament. Nutriție. <br /> Echipă. Un singur loc.
              </h1>
            </div>
          </div>
        </section>

        <section className="forja-auth-right">
          <div className="forja-glass-card forja-auth-panel">
            <div>
              <div className="forja-mini-label">access panel</div>
              <h2>Intră în cont</h2>
            </div>

            {inviteBanner && (
              <div className="forja-status-banner" style={{ borderColor: 'rgba(138,180,255,0.28)', background: 'rgba(138,180,255,0.08)' }}>
                <strong style={{ color: '#bcd0ff' }}>Invitație activă</strong>
              </div>
            )}

            <div className="forja-tab-row" style={{ '--forja-tab-count': SHOW_DEMO ? 3 : 2 }}>
              {[
                ['login', 'Login'],
                ['register', 'Register'],
                ...(SHOW_DEMO ? [['demo', 'Try demo']] : []),
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  className={`forja-tab-btn ${tab === value ? 'active' : ''}`}
                  onClick={() => switchTab(value)}
                >
                  {label}
                </button>
              ))}
            </div>

            {tab === 'login' && (
              <form className="forja-section" onSubmit={doLogin}>
                <div className="forja-form-grid">
                  <div className="forja-field-wrap">
                    <label htmlFor="login-email">Email</label>
                    <input
                      id="login-email"
                      className="forja-field"
                      value={email}
                      autoComplete="email"
                      onChange={(event) => {
                        setEmail(event.target.value);
                        resetFeedback();
                      }}
                    />
                  </div>

                  <div className="forja-field-wrap">
                    <label htmlFor="login-password">Parolă</label>
                    <div className="forja-password-field">
                      <input
                        id="login-password"
                        className="forja-field"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        autoComplete="current-password"
                        onChange={(event) => {
                          setPassword(event.target.value);
                          resetFeedback();
                        }}
                      />
                      <button
                        type="button"
                        className="forja-eye-btn"
                        onClick={() => setShowPassword((value) => !value)}
                        aria-label={showPassword ? 'Ascunde parola' : 'Arată parola'}
                      >
                        <Eye open={showPassword} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="forja-row-between">
                  <label className="forja-checkbox">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(event) => setRememberMe(event.target.checked)}
                    />
                    ține-mă minte
                  </label>

                  <button
                    type="button"
                    className="forja-link-btn"
                    onClick={handleForgotPassword}
                    disabled={resettingPassword}
                  >
                    {resettingPassword ? 'Se înregistrează...' : 'ai uitat parola?'}
                  </button>
                </div>

                <button className="forja-primary-btn" type="submit" disabled={loading || success}>
                  {success ? 'Intrare confirmată' : loading ? 'Se verifică login-ul...' : <>Enter system <ArrowRight /></>}
                </button>
              </form>
            )}

            {tab === 'register' && (
              <RegisterWizard
                onRegister={async ({ name, email, password, role, plan, extra }) => {
                  resetFeedback();
                  setLoading(true);
                  try {
                    const redirect = await register(name, email, password, role, plan, null, extra, { persist: rememberMe });
                    setSuccess(true);
                    setTimeout(() => navigate(redirect || '/app'), 600);
                  } catch (err) {
                    setError(err?.response?.data?.error || 'Eroare la creare cont');
                  } finally {
                    setLoading(false);
                  }
                }}
                loading={loading}
                error={error}
              />
            )}

            {SHOW_DEMO && tab === 'demo' && (
              <div className="forja-section">
                <div className="forja-demo-list">
                  {DEMO_ROLES.map((role) => (
                    <div
                      key={role.id}
                      className={`forja-demo-card ${selectedRole === role.id ? 'active' : ''}`}
                      onClick={() => setSelectedRole(role.id)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          setSelectedRole(role.id);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="forja-demo-grid">
                        <img src={role.image} alt={role.title} className="forja-demo-image" />
                        <div className="forja-demo-content">
                          <div>
                            <div className="forja-inline-label">{role.label}</div>
                            <div className="forja-demo-title">{role.title}</div>
                            <p className="forja-demo-copy">{role.description}</p>
                          </div>

                          <div className="forja-demo-footer">
                            <div className="forja-demo-email">
                              <Check /> {role.email}
                            </div>
                            <button
                              type="button"
                              className="forja-inline-btn"
                              style={{ background: role.accent }}
                              disabled={Boolean(loadingDemo)}
                              onClick={(event) => {
                                event.stopPropagation();
                                doQuickLogin(role);
                              }}
                            >
                              {loadingDemo === role.id ? 'Se intră...' : <>intră demo <ArrowRight /></>}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {error && <div className="forja-alert error">{error}</div>}
            {success && <div className="forja-alert success">Redirecționare...</div>}
          </div>
        </section>
      </div>
    </div>
  );
}
