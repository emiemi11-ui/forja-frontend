/* ══════════════════════════════════════════════════════════════════════════
   FORJA — STATEFUL Mock API  (works without any backend / database)
   All data persists in memory during the browser session.
   ══════════════════════════════════════════════════════════════════════════ */

// ── USERS ────────────────────────────────────────────────────────────────
const MOCK_USERS = {
  'user@forja.ro': { id: 'u1', name: 'Alex Popescu',     email: 'user@forja.ro',         role: 'USER',         avatar: 'M', avatarUrl: null, plan: 'PRO',   level: 7, xp: 1340, streak: 12, weight: 78, teamName: 'Iron Wolves', isDemo: true },
  'coach@forja.ro': { id: 'c1', name: 'Mihai Ionescu',    email: 'coach@forja.ro',        role: 'COACH',        avatar: 'M', avatarUrl: null, plan: 'COACH', level: 5, xp: 980,  streak: 8,  weight: 85, teamName: 'Iron Wolves', isDemo: true },
  'nutritionist@forja.ro': { id: 'n1', name: 'Elena Dumitrescu', email: 'nutritionist@forja.ro', role: 'NUTRITIONIST', avatar: 'F', avatarUrl: null, plan: 'NUT',  level: 4, xp: 720,  streak: 6,  weight: 62, teamName: '', isDemo: true },
  'admin@forja.ro': { id: 'a1', name: 'Admin FORJA',      email: 'admin@forja.ro',        role: 'ADMIN',        avatar: 'M', avatarUrl: null, plan: 'PRO',   level: 10,xp: 5000, streak: 30, weight: 80, teamName: '', isDemo: true },
};
const REDIRECT_MAP = { USER: '/app', COACH: '/coach', NUTRITIONIST: '/nutritionist', ADMIN: '/admin' };

// ── EXERCISE LIBRARY (matches backend format) ───────────────────────────
const EXERCISE_LIBRARY = [
  { id: 10, name: 'Squat',             muscle: 'Picioare', equip: 'Bară',     icon: '🦵', sets: '4×8',  detail: '100 kg', img: '/img/ex-squat.svg', anim: '/img/ex-squat.svg' },
  { id: 11, name: 'Deadlift',          muscle: 'Spate',    equip: 'Bară',     icon: '⚡', sets: '3×5',  detail: '120 kg', img: '/img/ex-deadlift.svg', anim: '/img/ex-deadlift.svg' },
  { id: 12, name: 'Bench Press',       muscle: 'Piept',    equip: 'Bară',     icon: '🏋️', sets: '4×8',  detail: '80 kg',  img: '/img/ex-bench.svg', anim: '/img/ex-bench.svg' },
  { id: 13, name: 'Incline DB Press',  muscle: 'Piept',    equip: 'Gantere',  icon: '📈', sets: '3×10', detail: '30 kg',  img: '/img/ex-incline.svg', anim: '/img/ex-incline.svg' },
  { id: 14, name: 'Lateral Raise',     muscle: 'Umeri',    equip: 'Gantere',  icon: '↔️', sets: '4×12', detail: '12 kg',  img: '/img/ex-lateral-raise.svg', anim: '/img/ex-lateral-raise.svg' },
  { id: 15, name: 'Bicep Curl',        muscle: 'Brațe',    equip: 'Gantere',  icon: '💪', sets: '3×12', detail: '16 kg',  img: '/img/ex-bicep-curl.svg', anim: '/img/ex-bicep-curl.svg' },
  { id: 16, name: 'Cable Fly',         muscle: 'Piept',    equip: 'Cablu',    icon: '🦅', sets: '4×12', detail: '15 kg',  img: '/img/ex-cable-fly.svg', anim: '/img/ex-cable-fly.svg' },
  { id: 17, name: 'OHP',               muscle: 'Umeri',    equip: 'Bară',     icon: '🎯', sets: '4×6',  detail: '50 kg',  img: '/img/ex-ohp.svg', anim: '/img/ex-ohp.svg' },
  { id: 18, name: 'Plank',             muscle: 'Core',     equip: 'Bodyweight',icon:'🧘', sets: '3×60s',detail: 'Timp',   img: '/img/ex-plank.svg', anim: '/img/ex-plank.svg' },
  { id: 19, name: 'Pull Up',           muscle: 'Spate',    equip: 'Bară',     icon: '🔝', sets: '4×8',  detail: 'BW',     img: '/img/ex-pullup.svg', anim: '/img/ex-pullup.svg' },
  { id: 20, name: 'Leg Press',         muscle: 'Picioare', equip: 'Aparat',   icon: '🦵', sets: '4×10', detail: '180 kg', img: '/img/ex-squat.svg', anim: '/img/ex-squat.svg' },
  { id: 21, name: 'Lunges',            muscle: 'Picioare', equip: 'Bodyweight',icon:'🚶', sets: '3×12', detail: 'BW',     img: '/img/ex-lunge.svg', anim: '/img/ex-lunge.svg' },
  { id: 22, name: 'Tricep Pushdown',   muscle: 'Brațe',    equip: 'Cablu',    icon: '💪', sets: '3×12', detail: '25 kg',  img: '/img/ex-tricep.svg', anim: '/img/ex-tricep.svg' },
  { id: 23, name: 'Romanian Deadlift', muscle: 'Picioare', equip: 'Bară',     icon: '🏋️', sets: '3×10', detail: '80 kg',  img: '/img/ex-deadlift.svg', anim: '/img/ex-deadlift.svg' },
  { id: 24, name: 'Push-Up',           muscle: 'Piept',    equip: 'Bodyweight',icon:'✋', sets: '3×20', detail: 'BW',     img: '/img/ex-pushup.svg', anim: '/img/ex-pushup.svg' },
  { id: 25, name: 'Running',           muscle: 'Cardio',   equip: 'Niciunul', icon: '🏃', sets: '1×30m',detail: 'Cardio', img: '/img/ex-running.svg', anim: '/img/ex-running.svg' },
];

// ── FOOD DATABASE ────────────────────────────────────────────────────────
const FOOD_DB = [
  { id: 'f1', name: 'Piept de pui (100g)',  kcal: 165, p: 31, c: 0,  f: 3.6, fib: 0,  img: '', icon: '🍗' },
  { id: 'f2', name: 'Orez alb (100g)',      kcal: 130, p: 2.7,c: 28, f: 0.3, fib: 0.4,img: '/img/ext/u-ad8afb97c7.jpg' },
  { id: 'f3', name: 'Ou (1 buc)',           kcal: 72,  p: 6.3,c: 0.4,f: 5,   fib: 0,  img: '/img/ext/u-cd286f26a0.jpg' },
  { id: 'f4', name: 'Banană (1 medie)',     kcal: 105, p: 1.3,c: 27, f: 0.4, fib: 3.1,img: '/img/ext/u-0297955a9f.jpg' },
  { id: 'f5', name: 'Lapte (250ml)',        kcal: 150, p: 8,  c: 12, f: 8,   fib: 0,  img: '/img/ext/u-5eeb4e9165.jpg' },
  { id: 'f6', name: 'Somon (100g)',         kcal: 208, p: 20, c: 0,  f: 13,  fib: 0,  img: '/img/ext/u-c3ef69a1f2.jpg' },
  { id: 'f7', name: 'Broccoli (100g)',      kcal: 34,  p: 2.8,c: 7,  f: 0.4, fib: 2.6,img: '/img/ext/u-0344019958.jpg' },
  { id: 'f8', name: 'Pâine integrală (1f)', kcal: 80,  p: 4,  c: 14, f: 1,   fib: 2,  img: '/img/ext/u-e30577f0c8.jpg' },
  { id: 'f9', name: 'Avocado (½)',          kcal: 120, p: 1.5,c: 6,  f: 11,  fib: 5,  img: '/img/ext/u-c4e1757ac2.jpg' },
  { id: 'f10',name: 'Iaurt grecesc (150g)', kcal: 100, p: 17, c: 6,  f: 0.7, fib: 0,  img: '/img/ext/u-795f51f1ce.jpg' },
];

// ══════════════════════════════════════════════════════════════════════════
//  STATEFUL SESSION — persists in memory during browser session
// ══════════════════════════════════════════════════════════════════════════
function parseSets(s) { const m = String(s).match(/(\d+)[×x](\d+)/); return m ? { sets: parseInt(m[1]), reps: m[2] } : { sets: 3, reps: s }; }

const STATE = {
  waterCups: 5,
  steps: 7200,
  // User exercises (plan of the day)
  exercises: [
    { id: 'e1', libId: 12, name: 'Bench Press',     sets: '4×8',  muscle: 'Piept',  equip: 'Bară',     icon: '🏋️', detail: '80 kg',  done: false, img: '/img/ex-bench.svg', anim: '/img/ex-bench.svg' },
    { id: 'e2', libId: 13, name: 'Incline DB Press', sets: '3×10', muscle: 'Piept',  equip: 'Gantere',  icon: '📈', detail: '30 kg',  done: false, img: '/img/ex-incline.svg', anim: '/img/ex-incline.svg' },
    { id: 'e3', libId: 16, name: 'Cable Fly',       sets: '3×12', muscle: 'Piept',  equip: 'Cablu',    icon: '🦅', detail: '15 kg',  done: false, img: '/img/ex-cable-fly.svg', anim: '/img/ex-cable-fly.svg' },
    { id: 'e4', libId: 17, name: 'OHP',             sets: '4×6',  muscle: 'Umeri',  equip: 'Bară',     icon: '🎯', detail: '50 kg',  done: false, img: '/img/ex-ohp.svg', anim: '/img/ex-ohp.svg' },
    { id: 'e5', libId: 14, name: 'Lateral Raise',   sets: '3×15', muscle: 'Umeri',  equip: 'Gantere',  icon: '↔️', detail: '12 kg',  done: false, img: '/img/ex-lateral-raise.svg', anim: '/img/ex-lateral-raise.svg' },
    { id: 'e6', libId: 22, name: 'Tricep Pushdown', sets: '3×12', muscle: 'Brațe',  equip: 'Cablu',    icon: '💪', detail: '25 kg',  done: false, img: '/img/ex-tricep.svg', anim: '/img/ex-tricep.svg' },
  ],
  // User meals
  meals: [
    { id: 'm1', foodId: 'f3', name: 'Ouă + pâine integrală', meal: 'Mic dejun', kcal: 380, p: 24, c: 32, f: 18, time: '08:15', img: '/img/ext/u-70eee660d1.jpg' },
    { id: 'm2', foodId: 'f1', name: 'Piept de pui + orez',   meal: 'Prânz',     kcal: 520, p: 48, c: 55, f: 10, time: '13:00', img: '/img/ext/u-bd5ba813c1.jpg' },
  ],
  // Workout session
  workoutSession: null,
  nextId: 100,
};

function genId() { return 'mock-' + (STATE.nextId++); }

function sumMeals() {
  return STATE.meals.reduce((s, m) => ({ kcal: s.kcal + m.kcal, p: s.p + m.p, c: s.c + m.c, f: s.f + m.f }), { kcal: 0, p: 0, c: 0, f: 0 });
}

function readStoredMockUser() {
  try {
    const raw = localStorage.getItem('user') || sessionStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function getActiveMockUser() {
  const stored = readStoredMockUser();
  if (stored?.email && MOCK_USERS[stored.email]) return MOCK_USERS[stored.email];
  if (STATE._registeredUser) return STATE._registeredUser;
  return MOCK_USERS['user@forja.ro'];
}

function buildAssignedWorkoutPlan() {
  return {
    id: 'wp-demo',
    name: 'Push Day A',
    coachName: 'Mihai Ionescu',
    coach: 'Mihai Ionescu',
    category: 'Hipertrofie',
    exercises: STATE.exercises.length,
    assignedAt: '2025-04-01',
    status: 'active',
    items: STATE.exercises.map((exercise) => ({
      id: exercise.id,
      libId: exercise.libId,
      name: exercise.name,
      sets: exercise.sets,
      detail: exercise.detail,
      done: Boolean(exercise.done),
      img: exercise.img,
      anim: exercise.anim,
    })),
  };
}

function buildAssignedNutritionPlan() {
  const baseTemplate = Array.isArray(MOCK_NUT_TEMPLATES[0]?.mealPlan) ? MOCK_NUT_TEMPLATES[0].mealPlan : [];
  return {
    id: 'np-demo',
    name: MOCK_NUT_TEMPLATES[0]?.name || 'High Protein',
    nutritionist: 'Elena Dumitrescu',
    kcal: MOCK_NUT_TEMPLATES[0]?.kcal || 2200,
    assignedAt: '2025-03-15',
    status: 'active',
    meals: baseTemplate.map((meal, index) => ({
      id: `demo-meal-${index + 1}`,
      type: meal.type,
      name: meal.name,
      items: meal.items || meal.name,
      kcal: meal.kcal,
      img: meal.img,
    })),
  };
}

function flattenAdminInbox() {
  const contacts = Array.isArray(MOCK_ADMIN_INBOX.contacts) ? MOCK_ADMIN_INBOX.contacts : [];
  const waitlist = Array.isArray(MOCK_ADMIN_INBOX.waitlist) ? MOCK_ADMIN_INBOX.waitlist : [];
  return [
    ...contacts.map((entry, index) => ({
      id: entry.id || `contact-${index + 1}`,
      type: 'contact',
      name: entry.name || '—',
      email: entry.email || '',
      subject: entry.topic || entry.subject || 'Contact',
      message: entry.message || '',
      date: entry.createdAt ? new Date(entry.createdAt).toLocaleString('ro-RO', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '',
      status: 'nou',
      createdAt: entry.createdAt || new Date().toISOString(),
    })),
    ...waitlist.map((entry, index) => ({
      id: entry.id || `wait-${index + 1}`,
      type: 'early-access',
      name: '—',
      email: entry.email || '',
      subject: entry.type || 'Early Access',
      message: entry.message || 'Înscris pe lista de așteptare.',
      date: entry.createdAt ? new Date(entry.createdAt).toLocaleString('ro-RO', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '',
      status: 'nou',
      createdAt: entry.createdAt || new Date().toISOString(),
    })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

function normalizeAuditEvents() {
  return (STATE.auditLog || []).map((entry, index) => ({
    id: entry.id || `audit-${index + 1}`,
    type: String(entry.type || '').toLowerCase(),
    action: entry.action || 'EVENT',
    status: entry.status || 'INFO',
    user: entry.user || 'system',
    detail: entry.detail || '',
    date: entry.date || '',
    createdAt: new Date(Date.now() - index * 3600000).toISOString(),
  }));
}

// ── AUTH ──────────────────────────────────────────────────────────────────
function mockLogin(email) {
  // Clear registered flag when logging in as demo
  try { localStorage.removeItem('forja_registered'); } catch {}
  STATE._registeredUser = null;
  const user = MOCK_USERS[email];
  if (!user) return null;
  return { ok: true, token: 'mock-jwt-' + user.role.toLowerCase(), user, redirect: REDIRECT_MAP[user.role] };
}

export function buildDemoAuth(email) {
  const session = mockLogin(email);
  return session ? { ...session } : null;
}
function mockRegister(name, email, role, plan, extra) {
  const id = 'reg-' + Date.now();
  const r = (role || 'USER').toUpperCase();
  const planName = plan || (r === 'COACH' ? 'COACH' : r === 'NUTRITIONIST' ? 'NUT' : 'FREE');
  const user = {
    id, name, email, role: r, avatar: name[0], avatarUrl: null, plan: planName,
    level: 1, xp: 0, streak: 0, weight: parseInt(extra?.weight) || 0, height: parseInt(extra?.height) || 0,
    teamName: '', isDemo: false,
    bio: extra?.bio || '', specialization: extra?.specialization || '', goal: extra?.goal || '',
    certifications: extra?.certifications || '', experience: parseInt(extra?.experience) || 0,
  };
  // Store as the active registered user so mockRoute can detect non-demo
  STATE._registeredUser = user;
  try { localStorage.setItem('forja_registered', 'true'); } catch {}
  return { ok: true, token: 'mock-jwt-' + id, user, redirect: REDIRECT_MAP[r] || '/app' };
}

// ── SLEEP ────────────────────────────────────────────────────────────────
const MOCK_SLEEP = {
  score: 82, hours: 7.5, bed: '23:15', wake: '06:45', quality: 4, bedTime: '23:15', wakeTime: '06:45',
  history: [
    { date: 'd-6', hours: 6.5, score: 65 }, { date: 'd-5', hours: 7, score: 72 },
    { date: 'd-4', hours: 8, score: 90 }, { date: 'd-3', hours: 7.5, score: 80 },
    { date: 'd-2', hours: 6, score: 58 }, { date: 'd-1', hours: 7.5, score: 85 },
    { date: 'azi', hours: 7.5, score: 82 },
  ],
  recommendations: ['Ritmul tău arată bine. Menține aceeași oră de culcare și hidratarea moderată seara.'],
  weekAvg: 7.14, consistencyScore: 78,
};

// ── TEAMS ────────────────────────────────────────────────────────────────
const MOCK_TEAMS = [
  { id: 't1', name: 'Iron Wolves', pendingRequests: [{id:'req1',userId:'u5',userName:'Ioana Preda',avatar:'I',date:'2026-04-13T10:00:00'}],   coach: 'Mihai Ionescu',   category: 'Powerlifting', description: 'Echipa de powerlifting pentru competiții naționale. Planuri personalizate, tracking progres, comunitate activă.',    isPublic: true,  teamType: 'paid', price: 0, membersCount: 14, postsCount: 32, isMember: true,  joined: true,  active: true,  myRole: 'OWNER', slug: 'iron-wolves',   avatarUrl: '/img/ext/u-088bb3cd4a.jpg', createdAt: '2025-01-10', benefits: ['Planuri personalizate', 'Chat exclusiv', 'Video antrenamente', 'Suport coach 1:1'] },
  { id: 't2', name: 'Cardio Crew',   coach: 'Ana Vasilescu',   category: 'Cardio',       description: 'Running, cycling și HIIT pentru rezistență maximă. Comunitate de alergători.',     isPublic: true,  teamType: 'free', price: 0, membersCount: 23, postsCount: 18, isMember: true, joined: true, active: false, myRole: 'OWNER', slug: 'cardio-crew',   avatarUrl: '/img/ext/u-e5bd749169.jpg', createdAt: '2025-02-05', benefits: ['Planuri running', 'Challenges săptămânale'] },
  { id: 't3', name: 'Flex Nation',    coach: 'Radu Petrescu',   category: 'Bodybuilding', description: 'Masă musculară, definiție și pregătire competiții. Planuri avansate de nutriție.',      isPublic: true,  teamType: 'paid', price: 0, membersCount: 19, postsCount: 45, isMember: false, joined: false, active: false, myRole: null,     slug: 'flex-nation',   avatarUrl: '/img/ext/u-075eea5dd8.jpg', createdAt: '2025-03-12', benefits: ['Planuri masă/definiție', 'Nutriție individualizată', 'Competiții interne', 'Acces video HD'] },
  { id: 't4', name: 'War Ready', pendingRequests: [{id:'req2',userId:'u6',userName:'Dan Gheorghe',avatar:'D',date:'2026-04-12T14:30:00'}],     coach: 'Mihai Ionescu',   category: 'Funcțional',   description: 'Antrenament funcțional și pregătire fizică generală. Doar prin invitație.',   isPublic: false, teamType: 'private', price: 0, membersCount: 11, postsCount: 8,  isMember: false, joined: false, active: false, myRole: null,     slug: 'war-ready',     avatarUrl: '/img/ext/u-e2d14a26de.jpg', createdAt: '2025-04-01', benefits: ['Antrenament funcțional', 'Mobilitate', 'Flexibilitate'] },
  { id: 't5', name: 'Runners Club',  coach: 'Ana Vasilescu',   category: 'Cardio',       description: 'Club gratuit de alergare. Toată lumea e binevenită!',     isPublic: true,  teamType: 'free', price: 0, membersCount: 45, postsCount: 22, isMember: false, joined: false, active: false, myRole: null,     slug: 'runners-club',  avatarUrl: '/img/ext/u-e5bd749169.jpg', createdAt: '2025-01-20', benefits: ['Gratuit', 'Comunitate deschisă'] },
  { id: 't6', name: 'Elite Squad', pendingRequests: [{id:'req4',userId:'u8',userName:'Maria Pop',avatar:'M',date:'2026-04-10T16:00:00'}],   coach: 'Mihai Ionescu',   category: 'Powerlifting', description: 'Echipă privată pentru competitori avansați. Doar prin invitație.',   isPublic: false, teamType: 'private', price: 0, membersCount: 6,  postsCount: 15, isMember: false, joined: false, active: false, myRole: null,     slug: 'elite-squad',   avatarUrl: '/img/ext/u-088bb3cd4a.jpg', createdAt: '2025-02-15', benefits: ['Acces exclusiv', 'Competiții naționale', 'Coaching premium', 'Nutriție avansată'] },
];

const MOCK_CHATS = {
  t1: {
    teamName: 'Iron Wolves', teamId: 't1', membersCount: 14,
    team: { id: 't1', name: 'Iron Wolves', pendingRequests: [{id:'req1',userId:'u5',userName:'Ioana Preda',avatar:'I',date:'2026-04-13T10:00:00'}], category: 'Powerlifting', membersCount: 14, activeToday: 4 },
    messages: [
      { id: 'msg1', from: 'Mihai Ionescu', avatar: 'M', senderId: 'c1', isMe: false, msg: 'Bine ați venit! Antrenamentul de mâine: Push Day A 💪', time: '09:15' },
      { id: 'msg2', from: 'Alex Popescu',  avatar: 'A', senderId: 'u1', isMe: true,  msg: 'Perfect, sunt pregătit. La ce oră ne vedem?',        time: '09:22' },
      { id: 'msg3', from: 'Andrei Marin',  avatar: 'A', senderId: 'u3', isMe: false, msg: 'Eu ajung pe la 10. Bench day! 🏋️',                    time: '09:30' },
      { id: 'msg4', from: 'Maria Stancu',  avatar: 'M', senderId: 'u2', isMe: false, msg: 'Am terminat cardio-ul dimineața. 5km în 24min 🏃‍♀️',    time: '09:45' },
      { id: 'msg5', from: 'Mihai Ionescu', avatar: 'M', senderId: 'c1', isMe: false, msg: 'Bravo Maria! Mâine upper body, toată lumea la 10:00', time: '10:02' },
    ],
  },
  t2: {
    teamName: 'Cardio Crew', teamId: 't2', membersCount: 23,
    team: { id: 't2', name: 'Cardio Crew', category: 'Cardio', membersCount: 23, activeToday: 8 },
    messages: [
      { id: 'cc1', from: 'Ana Vasilescu', avatar: 'A', senderId: 'c2', isMe: false, msg: 'Alergare de grup sâmbătă dimineață, 8:00 la Herăstrău! 🏃', time: '18:00' },
      { id: 'cc2', from: 'Alex Popescu',  avatar: 'A', senderId: 'u1', isMe: true,  msg: 'Sunt! Ce distanță facem?', time: '18:15' },
      { id: 'cc3', from: 'Ana Vasilescu', avatar: 'A', senderId: 'c2', isMe: false, msg: '10K la ritm confortabil. Warm-up 1km + 9km progresiv 👟', time: '18:20' },
      { id: 'cc4', from: 'Dan Gheorghe',  avatar: 'D', senderId: 'u5', isMe: false, msg: 'Vin și eu! Am făcut 48min pe 10K ultima dată 🔥', time: '18:45' },
    ],
  },
};
const MOCK_CHAT = MOCK_CHATS.t1;

const MOCK_CONVERSATIONS = [
  { id: 'conv1', other: { id: 'c1', name: 'Mihai Ionescu', role: 'COACH', avatar: 'M', isOnline: true }, lastMessage: 'Da, ajustăm planul mâine.', lastAt: new Date(Date.now() - 1800000).toISOString(), unread: 1 },
  { id: 'conv2', other: { id: 'n1', name: 'Elena Dumitrescu', role: 'NUTRITIONIST', avatar: 'E', isOnline: true }, lastMessage: 'Am actualizat template-ul tău de nutriție.', lastAt: new Date(Date.now() - 86400000).toISOString(), unread: 0 },
  { id: 'conv3', other: { id: 'u2', name: 'Maria Stancu', role: 'USER', avatar: 'M', isOnline: false }, lastMessage: 'Ne vedem la antrenament?', lastAt: new Date(Date.now() - 172800000).toISOString(), unread: 2 },
];
const MOCK_DM_MESSAGES_MAP = {
  conv1: [
    { id: 'dm1', message: 'Salut Alex! Cum merge antrenamentul?', isMe: false, time: '09:15' },
    { id: 'dm2', message: 'Bine, am făcut PR la squat ieri! 140kg 💪', isMe: true, time: '09:30' },
    { id: 'dm3', message: 'Excelent! Vrei să creștem volumul săptămâna asta?', isMe: false, time: '09:45' },
    { id: 'dm4', message: 'Da, sunt pregătit. Putem adăuga un set extra la deadlift?', isMe: true, time: '10:00' },
    { id: 'dm5', message: 'Da, ajustăm planul mâine. O să-ți trimit noul plan pe chat.', isMe: false, time: '10:15' },
  ],
  conv2: [
    { id: 'dm6', message: 'Bună Elena! Am o întrebare despre macronutrienți.', isMe: true, time: '14:00' },
    { id: 'dm7', message: 'Sigur, spune-mi!', isMe: false, time: '14:10' },
    { id: 'dm8', message: 'Pot crește proteinele la 200g/zi fără probleme?', isMe: true, time: '14:15' },
    { id: 'dm9', message: 'Da, dar asigură-te că bei minim 3L apă. Am actualizat template-ul tău de nutriție.', isMe: false, time: '14:30' },
  ],
  conv3: [
    { id: 'dm10', message: 'Hey Maria! Mâine ai antrenament?', isMe: true, time: '18:00' },
    { id: 'dm11', message: 'Da! Leg day 🦵', isMe: false, time: '18:15' },
    { id: 'dm12', message: 'Perfect, ne vedem la 10. Nu uita să iei centura!', isMe: true, time: '18:20' },
    { id: 'dm13', message: 'Ne vedem la antrenament?', isMe: false, time: '18:30' },
  ],
};
const MOCK_DM_MESSAGES = MOCK_DM_MESSAGES_MAP.conv1;

const MOCK_FEED = [
  { id: 'p1', author: 'Alex Popescu', avatar: 'A', teamName: 'Iron Wolves', content: '💪 PR nou la squat: 140kg!', likes: 12, liked: false, comments: [{ id: 'cm1', author: 'Mihai Ionescu', content: 'Bravo!' }], createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: 'p2', author: 'Radu Petrescu', avatar: 'R', teamName: 'Flex Nation', content: '🥗 Prep-ul de masă pentru săptămâna asta.', likes: 8, liked: true, comments: [], createdAt: new Date(Date.now() - 7200000).toISOString() },
];

const MOCK_CHALLENGES = [
  { id: 'ch1', name: '30 Day Squat Challenge', description: '100 squats pe zi, 30 zile.', participants: 34, joined: true, progress: 67, endDate: '2025-05-01', createdBy: 'Mihai Ionescu' },
  { id: 'ch2', name: '10K Steps Daily', description: 'Minimum 10.000 pași zilnic.', participants: 56, joined: false, progress: 0, endDate: '2025-04-20', createdBy: 'Ana Vasilescu' },
];

// ── COACH ────────────────────────────────────────────────────────────────
const MOCK_COACH_TEAM = { name: 'Iron Wolves', coachName: 'Mihai Ionescu', members: 5, active_today: 3, compliance_week: 78, workouts: 4 };
const MOCK_COACH_ATHLETES = [
  { id: 'ca1', name: 'Alex Popescu', av: 'A', col: '#B8ED00', plan: 'Push/Pull/Legs', goal: 'Forță', compliance: 85, streak: 12, weight: 78, trend: 'up', last: new Date(Date.now()-3600000).toISOString(), inviteStatus: 'ACCEPTED', inviteEmail: 'user@forja.ro', notes: 'Obiectiv curent: forță maximală. Focus pe squat și deadlift. Crește greutățile cu 2.5kg/săptămână.', journal: [{text:'Început plan Push/Pull/Legs. Testare maximale: SQ 140, BP 100, DL 160.',date:'2025-03-15'},{text:'Obiectiv curent: forță maximală. Focus pe squat și deadlift. Crește greutățile cu 2.5kg/săptămână.',date:'2025-04-01'}] },
  { id: 'ca2', name: 'Maria Stancu', av: 'M', col: '#FF6B6B', plan: 'Full Body', goal: 'Tonifiere', compliance: 72, streak: 5, weight: 58, trend: 'flat', last: new Date(Date.now()-7200000).toISOString(), inviteStatus: 'ACCEPTED', inviteEmail: 'maria@test.ro', notes: 'Tonifiere — cardio 3x/săptămână + full body 2x. Atenție la alimentație, tinde să sară mesele.', journal: [{text:'Tonifiere — cardio 3x/săptămână + full body 2x. Atenție la alimentație, tinde să sară mesele.',date:'2025-03-20'}] },
  { id: 'ca3', name: 'Andrei Marin', av: 'A', col: '#4ECDC4', plan: 'Upper/Lower', goal: 'Masă', compliance: 91, streak: 18, weight: 82, trend: 'up', last: new Date(Date.now()-1800000).toISOString(), inviteStatus: 'ACCEPTED', inviteEmail: 'andrei@test.ro', notes: 'Masă musculară — surplus caloric 300kcal. Push/Pull/Legs split. Progresează bine.', journal: [{text:'Masă musculară — surplus caloric 300kcal. Push/Pull/Legs split. Progresează bine.',date:'2025-04-05'}] },
  { id: 'ca4', name: 'Ioana Preda', av: 'I', col: '#A78BFA', plan: 'Starter', goal: 'Slăbire', compliance: 60, streak: 2, weight: 65, trend: 'down', last: new Date(Date.now()-86400000).toISOString(), inviteStatus: 'PENDING', inviteEmail: 'ioana@test.ro', notes: 'Invite pending. Plan starter pregătit.', journal: [] },
  { id: 'ca5', name: 'Dan Gheorghe', av: 'D', col: '#F97316', plan: 'Push/Pull/Legs', goal: 'Rezistență', compliance: 88, streak: 9, weight: 90, trend: 'flat', last: new Date(Date.now()-5400000).toISOString(), inviteStatus: 'ACCEPTED', inviteEmail: 'dan@test.ro', notes: 'Rezistență + mobilitate. Antrenament funcțional 4x/săptămână. Foarte disciplinat.', journal: [{text:'Rezistență + mobilitate. Antrenament funcțional 4x/săptămână. Foarte disciplinat.',date:'2025-03-28'}] },
];
const MOCK_COACH_WORKOUTS = [
  { id: 'cw1', name: 'Push Day A', category: 'Forță', exercises: 6, assigned: 3 },
  { id: 'cw2', name: 'Pull Day B', category: 'Forță', exercises: 5, assigned: 2 },
  { id: 'cw3', name: 'Leg Day', category: 'Hipertrofie', exercises: 7, assigned: 4 },
  { id: 'cw4', name: 'Full Body', category: 'General', exercises: 8, assigned: 1 },
];
const MOCK_COACH_MESSAGES = [
  { id: 'cm1', from: 'Alex Popescu', av: 'A', col: '#B8ED00', msg: 'Am terminat antrenamentul. 140kg squat PR!', time: '14:22', unread: true },
  { id: 'cm2', from: 'Maria Stancu', av: 'M', col: '#FF6B6B', msg: 'Pot schimba programul de mâine?', time: '11:05', unread: true },
];
const MOCK_NUT_OVERVIEW = { nutritionistName: 'Elena Dumitrescu', total_clients: 4, active_today: 2, avg_compliance: 74, plans_created: 3 };
const MOCK_NUT_CLIENTS = [
  { id: 'nc1', name: 'Alex Popescu', av: 'A', col: '#B8ED00', goal: 'Masă musculară', plan: 'High Protein', notes: 'Surplus 300kcal. 2200kcal target. Focus proteine >180g. Mănâncă bine dimineața, sare gustarea de după-amiază.', journal: [{text:'Început plan High Protein 2200kcal. Surplus moderat.',date:'2025-03-10'},{text:'Surplus 300kcal. 2200kcal target. Focus proteine >180g. Mănâncă bine dimineața, sare gustarea de după-amiază.',date:'2025-04-02'}], kcal_target: 2200, kcal_today: 1680, compliance: 85 },
  { id: 'nc2', name: 'Ioana Preda', av: 'I', col: '#A78BFA', goal: 'Slăbire', plan: 'Deficit', notes: 'Deficit 500kcal. Atenție la gustări seara. Hidratare insuficientă — reminder zilnic apă.', journal: [{text:'Deficit 500kcal. Atenție la gustări seara. Hidratare insuficientă — reminder zilnic apă.',date:'2025-03-25'}], kcal_target: 1600, kcal_today: 1420, compliance: 72 },
  { id: 'nc3', name: 'Dan Gheorghe', av: 'D', col: '#F97316', goal: 'Menținere', plan: 'Echilibrat', notes: 'Menținere 2000kcal. Echilibrat macro. Foarte consistent cu meal prep.', journal: [{text:'Menținere 2000kcal. Echilibrat macro. Foarte consistent cu meal prep.',date:'2025-04-01'}], kcal_target: 2000, kcal_today: 1850, compliance: 68 },
];
const MOCK_NUT_TEMPLATES = [
  { id: 'nt1', name: 'High Protein', kcal: 2200, p: 180, c: 220, f: 65, meals: 5, description: 'Plan hipercaloric bogat în proteine pentru masă musculară.', clients: 2, createdAt: '2025-01-15',
    img: '',
    mealPlan: [
      { type: 'Mic dejun', name: '3 ouă + pâine integrală + avocado', kcal: 450, p: 28, c: 35, f: 22, img: '',
        recipe: 'Bate 3 ouă cu sare și piper. Prăjește 3 min pe fiecare parte. Servește cu 2 felii pâine integrală prăjită și jumătate de avocado feliat.' },
      { type: 'Gustare 1', name: 'Iaurt grecesc + banană + nuci', kcal: 280, p: 22, c: 30, f: 10, img: '',
        recipe: '150g iaurt grecesc 0% grăsimi, 1 banană feliată, 15g nuci caju. Opțional: 1 linguriță miere.' },
      { type: 'Prânz', name: 'Piept de pui + orez + broccoli', kcal: 550, p: 48, c: 55, f: 12, img: '',
        recipe: '200g piept de pui la grătar cu condimente. 150g orez fiert. 100g broccoli la aburi 5 min. Adaugă 1 lingură ulei de măsline și lămâie.' },
      { type: 'Gustare 2', name: 'Shake proteic + biscuiți ovăz', kcal: 320, p: 38, c: 28, f: 8, img: '',
        recipe: '1 scoop whey protein cu 300ml lapte. 2 biscuiți ovăz. Blender 30 sec.' },
      { type: 'Cină', name: 'Somon + cartofi dulci + salată', kcal: 600, p: 44, c: 72, f: 13, img: '',
        recipe: '180g somon la cuptor 20 min la 200°C. 200g cartofi dulci copți. Salată verde cu roșii, castraveți și dressing de lămâie.' },
    ]},
  { id: 'nt2', name: 'Deficit moderat', kcal: 1600, p: 140, c: 150, f: 50, meals: 4, description: 'Deficit de 500 kcal cu macronutrienți optimizați pentru slăbire.', clients: 1, createdAt: '2025-02-10',
    img: '',
    mealPlan: [
      { type: 'Mic dejun', name: 'Omletă cu legume', kcal: 350, p: 28, c: 15, f: 18, img: '',
        recipe: '3 ouă bătute cu 50g spanac, 30g roșii cherry, 20g brânză feta. Gătește la foc mediu 4 min.' },
      { type: 'Prânz', name: 'Salată pui + quinoa', kcal: 480, p: 42, c: 40, f: 14, img: '',
        recipe: '150g piept de pui fiert, 80g quinoa fiartă, 100g mix salată, 50g roșii, 30g castraveți. Dressing: 1 lingură ulei măsline + oțet balsamic.' },
      { type: 'Gustare', name: 'Măr + unt de arahide', kcal: 250, p: 8, c: 30, f: 12, img: '',
        recipe: '1 măr mediu feliat cu 1 lingură unt de arahide natural.' },
      { type: 'Cină', name: 'Cod + legume la cuptor', kcal: 420, p: 38, c: 35, f: 12, img: '',
        recipe: '180g cod la cuptor cu lămâie, 150g mix legume (ardei, zucchini, vinete) la cuptor cu 1 lingură ulei măsline, 20 min la 200°C.' },
    ]},
  { id: 'nt3', name: 'Echilibrat', kcal: 2000, p: 160, c: 200, f: 60, meals: 4, description: 'Plan echilibrat pentru menținerea greutății și sănătate optimă.', clients: 1, createdAt: '2025-03-05',
    img: '',
    mealPlan: [
      { type: 'Mic dejun', name: 'Overnight oats', kcal: 420, p: 22, c: 55, f: 14, img: '',
        recipe: '60g fulgi de ovăz, 150ml lapte, 1 lingură semințe chia, 1 banană, 10g miere. Lasă peste noapte la frigider.' },
    ]},
];
const MOCK_ADMIN_OVERVIEW_FN = () => ({
  kpis: {
    totalUsers: (MOCK_ADMIN_USERS.users.length || 0) + 20,
    userCount: 18,
    coachCount: MOCK_DISCOVER.filter((item) => item.role === 'COACH').length,
    nutritionistCount: MOCK_DISCOVER.filter((item) => item.role === 'NUTRITIONIST').length,
    adminCount: 1,
    teamsCount: MOCK_TEAMS.length,
    workoutCount: MOCK_COACH_WORKOUTS.length,
    templateCount: MOCK_NUT_TEMPLATES.length,
    pendingInvites: MOCK_COACH_ATHLETES.filter((item) => item.inviteStatus === 'PENDING').length,
    publicLeads: flattenAdminInbox().length,
  },
  roles: {
    USER: 18,
    COACH: MOCK_DISCOVER.filter((item) => item.role === 'COACH').length,
    NUTRITIONIST: MOCK_DISCOVER.filter((item) => item.role === 'NUTRITIONIST').length,
    ADMIN: 1,
  },
  plans: {
    FREE: STATE.finance?.subs?.free || 0,
    PRO: STATE.finance?.subs?.pro || 0,
    TEAM: STATE.finance?.subs?.team || 0,
  },
  finance: { ...STATE.finance },
});
const MOCK_ADMIN_USERS = { total: 6, users: [
  { id: 'u1', name: 'Alex Popescu', email: 'user@forja.ro', role: 'USER', plan: 'PRO', level: 7, xp: 1340, streak: 12, weight: 78, teamName: 'Iron Wolves', createdAt: '2025-01-10' },
  { id: 'c1', name: 'Mihai Ionescu', email: 'coach@forja.ro', role: 'COACH', plan: 'COACH', level: 5, xp: 980, streak: 8, weight: 85, teamName: 'Iron Wolves', createdAt: '2025-01-05' },
  { id: 'n1', name: 'Elena Dumitrescu', email: 'nutritionist@forja.ro', role: 'NUTRITIONIST', plan: 'NUT', level: 4, xp: 720, streak: 6, weight: 62, teamName: '', createdAt: '2025-01-08' },
  { id: 'a1', name: 'Admin FORJA', email: 'admin@forja.ro', role: 'ADMIN', plan: 'PRO', level: 10, xp: 5000, streak: 30, weight: 80, teamName: '', createdAt: '2024-12-01' },
]};
const MOCK_ADMIN_INBOX = { summary: { waitlist: 3, contacts: 2, total: 5 }, waitlist: [{ email: 'ion@gmail.com', type: 'app', createdAt: '2025-04-01' }], contacts: [{ name: 'Cristina M.', email: 'cm@co.ro', topic: 'business', message: 'Plan business 50 angajați.', createdAt: '2025-04-02' }], timeline: [{ id: 'tl1', kind: 'contact', createdAt: '2025-04-02', title: 'Cristina M.', sub: 'cm@co.ro · business', message: 'Plan business.' }] };
const MOCK_ADMIN_SETTINGS = { settings: { allowPublicSignup: true, allowWaitlist: true, allowContact: true, maintenanceMode: false } };
const MOCK_DISCOVER = [
  { id: 'c1', name: 'Mihai Ionescu', role: 'COACH', avatarUrl: '/img/ext/u-46da82c9e3.jpg', avatar: 'M', teamName: 'Iron Wolves', level: 5, clientsCount: 14, price: 0, bio: 'Coach certificat cu 8 ani experiență. Specializat în powerlifting și forță generală. Rezultate: 3 sportivi la naționale.', benefits: ['Plan personalizat', 'Suport 1:1', 'Video feedback', 'Nutriție inclusă'], rating: 4.9, reviews: [{user:'Alex P.',stars:5,text:'Cel mai bun coach! Planurile sunt perfecte.',date:'2025-03-10'},{user:'Maria S.',stars:5,text:'Super dedicat, răspunde instant.',date:'2025-03-15'},{user:'Dan G.',stars:4,text:'Foarte bun, dar uneori e greu de prins.',date:'2025-04-01'}], posts: [
    { id: 'dp1', content: '💪 Noul program Push/Pull/Legs e live! Rezultate garantate în 12 săptămâni.', likes: 34, img: '', createdAt: '2026-04-13T09:00:00', comments: [{author:'Alex P.',text:'Abia aștept! 🔥'},{author:'Maria S.',text:'Mă înscriu și eu!'}], author: 'Mihai Ionescu' },
    { id: 'dp2', content: '🏆 Felicitări Alex pentru PR-ul la squat: 180kg! Iron Wolves strong!', likes: 22, createdAt: '2026-04-12T15:00:00', comments: [{author:'Dan G.',text:'Monstru! 💪'},{author:'Andrei M.',text:'Obiectivul meu e 200kg'}], author: 'Mihai Ionescu' },
  ]},
  { id: 'c2', name: 'Radu Petrescu', role: 'COACH', avatarUrl: '/img/ext/u-03ba73e641.jpg', avatar: 'R', teamName: 'Flex Nation', level: 3, clientsCount: 19, price: 0, bio: 'Coach bodybuilding. Pregătire competiții, masă musculară, definiție. Planuri avansate de nutriție și suplimentare.', benefits: ['Pregătire competiții', 'Plan nutriție', 'Posing coaching', 'Suplimentare'], rating: 4.7, reviews: [{user:'Andrei M.',stars:5,text:'Pregătire competiții de top!',date:'2025-02-20'},{user:'Cristina B.',stars:4,text:'Bun plan, rezultate vizibile.',date:'2025-03-05'}], posts: [
    { id: 'dp3', content: '🥇 Sezonul de competiții începe! Înscrieri deschise pentru echipa Flex Nation.', likes: 18, img: '', createdAt: '2026-04-11T10:00:00', comments: [{author:'Cristina B.',text:'Mă înscriu! Ce categorie?'}], author: 'Radu Petrescu' },
  ]},
  { id: 'n1', name: 'Elena Dumitrescu', role: 'NUTRITIONIST', avatarUrl: '/img/ext/u-cc8b45ac77.jpg', avatar: 'E', teamName: '', level: 4, clientsCount: 12, price: 0, bio: 'Nutriționist certificat, master în dietetică. Planuri alimentare personalizate pentru performanță, slăbire sau masă musculară.', benefits: ['Plan alimentar custom', 'Monitorizare compliance', 'Ajustări săptămânale', 'Rețete incluse'], rating: 4.8, reviews: [{user:'Alex P.',stars:5,text:'Planul alimentar e perfect. Am slăbit 5kg în 2 luni.',date:'2025-03-01'},{user:'Ioana P.',stars:5,text:'Foarte atentă la detalii.',date:'2025-03-20'},{user:'Dan G.',stars:4,text:'Rețete bune, ușor de preparat.',date:'2025-04-05'}], posts: [
    { id: 'dp4', content: '🥗 Rețetă nouă: Bowl proteic cu quinoa, somon și avocado. 650 kcal, 42g proteine!', likes: 45, img: '', createdAt: '2026-04-13T12:00:00', comments: [{author:'Alex P.',text:'Arată incredibil! 🤤'},{author:'Ioana P.',text:'Trimite rețeta completă!'}], author: 'Elena Dumitrescu' },
    { id: 'dp5', content: '📊 Studiu nou: intermittent fasting + high protein = rezultate superioare la definiție.', likes: 28, createdAt: '2026-04-10T14:30:00', comments: [{author:'Dan G.',text:'Eu fac IF de 3 luni, confirm!'}], author: 'Elena Dumitrescu' },
  ]},
  { id: 'n2', name: 'Ana Vasilescu', role: 'NUTRITIONIST', avatarUrl: '/img/ext/u-c70fb9e63f.jpg', avatar: 'A', teamName: 'Cardio Crew', level: 6, clientsCount: 8, price: 0, bio: 'Nutriționist sportiv specializat pe endurance. Consultații gratuite pentru membrii Cardio Crew.', benefits: ['Consultație gratuită', 'Plan running nutrition', 'Hidratare curse'], rating: 4.6, reviews: [{user:'Maria S.',stars:5,text:'Consultații foarte utile!',date:'2025-02-28'}], posts: [
    { id: 'dp6', content: '🏃 Nutriția pentru maraton: ce mănânci în ziua cursei contează enorm!', likes: 31, createdAt: '2026-04-09T08:00:00', comments: [{author:'Maria S.',text:'Super util! Mersi!'},{author:'Andrei M.',text:'Ce recomanzi pre-race?'}], author: 'Ana Vasilescu' },
  ]},
];

const MOCK_TEAM_POSTS = {
  t1: [
    { id: 'tp1', author: 'Mihai Ionescu', content: '💪 Antrenamentul de azi: Push Day A. Toată lumea la sală la 10:00! Nu uitați încălzirea — 10 min cardio + mobilitate umeri.', createdAt: '2026-04-14T09:00:00', likes: 8, img: '', comments: [{ author: 'Alex Popescu', text: 'Ajung la timp! 🔥' }, { author: 'Maria Stancu', text: 'Fac și cardio înainte.' }] },
    { id: 'tp2', author: 'Alex Popescu', content: '🏆 PR nou la bench: 100kg! Mulțumesc Mihai pentru programul ăsta, funcționează perfect.', createdAt: '2026-04-13T10:00:00', likes: 15, img: '', comments: [{ author: 'Mihai Ionescu', text: 'Bravo! Urcăm spre 110.' }, { author: 'Dan Gheorghe', text: 'Monstru! 💪' }] },
    { id: 'tp3', author: 'Andrei Marin', content: '🥗 Meal prep done pentru toată săptămâna. Macros perfecte: 2200 kcal, 180g proteine.', createdAt: '2026-04-12T12:30:00', likes: 11, img: '', comments: [{ author: 'Maria Stancu', text: 'Vreau și eu lista completă.' }] },
  ],
  t2: [
    { id: 't2p1', author: 'Ana Vasilescu', content: '🏃‍♀️ Duminică avem alergare lungă. Hidratare bună și mic dejun lejer înainte.', createdAt: '2026-04-14T07:10:00', likes: 9, comments: [{ author: 'Alex Popescu', text: 'Vin și eu la 8:00.' }] },
  ],
};

function normalizeComments(comments = [], postId = 'post') {
  if (!Array.isArray(comments)) return [];
  return comments.map((comment, index) => ({
    id: comment.id || `${postId}-c-${index + 1}`,
    author: comment.author || comment.user || 'Utilizator',
    text: comment.text || comment.content || '',
    content: comment.content || comment.text || '',
    createdAt: comment.createdAt || new Date().toISOString(),
  }));
}

function ensureCommentIds(posts = [], prefix = 'post') {
  posts.forEach((post, postIndex) => {
    post.comments = normalizeComments(post.comments, post.id || `${prefix}-${postIndex + 1}`);
  });
}

ensureCommentIds(MOCK_FEED, 'feed');
Object.values(MOCK_TEAM_POSTS).forEach((posts, index) => ensureCommentIds(posts, `team-${index + 1}`));
MOCK_DISCOVER.forEach((professional, index) => ensureCommentIds(professional.posts || [], `discover-${index + 1}`));

function getTeamPosts(teamId) {
  const basePosts = (MOCK_TEAM_POSTS[teamId] || []).map((post) => ({ ...post, comments: normalizeComments(post.comments, post.id) }));
  const team = MOCK_TEAMS.find((item) => item.id === teamId);
  const customPosts = Array.isArray(team?._posts) ? team._posts : [];
  ensureCommentIds(customPosts, `${teamId}-custom`);
  return [...customPosts, ...basePosts];
}

function allMutablePostCollections() {
  return [
    MOCK_FEED,
    ...Object.values(MOCK_TEAM_POSTS),
    ...MOCK_TEAMS.map((team) => (Array.isArray(team._posts) ? team._posts : [])),
    ...MOCK_DISCOVER.map((professional) => (Array.isArray(professional.posts) ? professional.posts : [])),
  ];
}

function findMutablePost(postId) {
  for (const posts of allMutablePostCollections()) {
    const post = posts.find((item) => item.id === postId);
    if (post) {
      ensureCommentIds([post], postId);
      return post;
    }
  }
  return null;
}

function deleteMutableComment(commentId) {
  for (const posts of allMutablePostCollections()) {
    for (const post of posts) {
      ensureCommentIds([post], post.id || 'post');
      const before = post.comments.length;
      post.comments = post.comments.filter((comment) => comment.id !== commentId);
      if (post.comments.length !== before) return true;
    }
  }
  return false;
}

const MOCK_GOALS = { kcal: 2200, protein: 180, carbs: 280, fat: 70, water: 3, steps: 10000, sleep: 8 };

// ══════════════════════════════════════════════════════════════════════════
//  STATEFUL ROUTER
// ══════════════════════════════════════════════════════════════════════════
export { MOCK_DISCOVER, MOCK_TEAMS, MOCK_COACH_WORKOUTS, MOCK_NUT_TEMPLATES, EXERCISE_LIBRARY, FOOD_DB, STATE };

// ── ADMIN FINANCE & AUDIT ──
STATE.finance = {
  month: 4280, year: 38650, profit: 3420, commission: 15,
  subs: { free: 12, pro: 8, team: 3 },
  history: [2100, 2800, 3200, 3600, 3900, 4280],
  professionals: [
    { name: 'Mihai Ionescu', role: 'COACH', clients: 14, revenue: 1960, commission: 294 },
    { name: 'Radu Petrescu', role: 'COACH', clients: 19, revenue: 2660, commission: 399 },
    { name: 'Elena Dumitrescu', role: 'NUTRITIONIST', clients: 12, revenue: 1680, commission: 252 },
    { name: 'Ana Moldovan', role: 'NUTRITIONIST', clients: 8, revenue: 1120, commission: 168 },
  ],
};
STATE.auditLog = [
  { id: 1, type: 'auth', action: 'LOGIN', user: 'admin@forja.ro', detail: 'Admin login successful', status: 'SUCCESS', date: '12.04.2026, 18:24' },
  { id: 2, type: 'auth', action: 'LOGIN', user: 'coach@forja.ro', detail: 'Coach login', status: 'SUCCESS', date: '12.04.2026, 17:45' },
  { id: 3, type: 'moderare', action: 'DELETE_POST', user: 'admin@forja.ro', detail: 'Postare ștearsă din Iron Wolves — spam', status: 'ACTION', date: '11.04.2026, 14:30' },
  { id: 4, type: 'auth', action: 'REGISTER', user: 'newuser@test.ro', detail: 'Cont nou creat — plan PRO', status: 'SUCCESS', date: '11.04.2026, 12:00' },
  { id: 5, type: 'moderare', action: 'BLOCK_USER', user: 'admin@forja.ro', detail: 'Utilizator spam_bot@fake.ro blocat', status: 'ACTION', date: '10.04.2026, 16:20' },
  { id: 6, type: 'setari', action: 'UPDATE_SETTINGS', user: 'admin@forja.ro', detail: 'Maintenance mode dezactivat', status: 'INFO', date: '10.04.2026, 09:00' },
  { id: 7, type: 'auth', action: 'LOGIN', user: 'nutritionist@forja.ro', detail: 'Nutritionist login', status: 'SUCCESS', date: '10.04.2026, 08:30' },
  { id: 8, type: 'finante', action: 'PAYMENT', user: 'alex@forja.ro', detail: 'Plată PRO — 29 lei', status: 'SUCCESS', date: '09.04.2026, 20:15' },
  { id: 9, type: 'moderare', action: 'DELETE_COMMENT', user: 'admin@forja.ro', detail: 'Comentariu șters — limbaj inadecvat', status: 'ACTION', date: '09.04.2026, 11:45' },
  { id: 10, type: 'auth', action: 'LOGIN_FAIL', user: 'unknown@test.ro', detail: '3 încercări eșuate — IP blocat 15min', status: 'WARNING', date: '08.04.2026, 23:10' },
  { id: 11, type: 'finante', action: 'PAYMENT', user: 'ioana@forja.ro', detail: 'Plată TEAM — 49 lei', status: 'SUCCESS', date: '08.04.2026, 14:00' },
  { id: 12, type: 'setari', action: 'INVITE_SENT', user: 'coach@forja.ro', detail: 'Invitație către dan@test.ro', status: 'INFO', date: '07.04.2026, 16:30' },
  { id: 13, type: 'auth', action: 'REGISTER', user: 'maria.s@gmail.com', detail: 'Cont nou — plan FREE', status: 'SUCCESS', date: '07.04.2026, 10:15' },
  { id: 14, type: 'moderare', action: 'UNBLOCK_USER', user: 'admin@forja.ro', detail: 'Utilizator test@old.ro deblocat', status: 'ACTION', date: '06.04.2026, 12:00' },
  { id: 15, type: 'finante', action: 'REFUND', user: 'admin@forja.ro', detail: 'Ramburs 29 lei — cont anulat', status: 'WARNING', date: '05.04.2026, 09:30' },
];

export function mockRoute(method, url, body, params) {
  const m = method.toUpperCase();
  const u = url.replace(/^\/api/, '');
  const registeredUser = STATE._registeredUser || null;
  const isRegistered = Boolean(registeredUser && !registeredUser.isDemo);

  // ── AUTH ──
  if (u === '/auth/login' && m === 'POST') return mockLogin(body?.email) || { error: 'Cont inexistent' };
  if (u === '/auth/register' && m === 'POST') return mockRegister(body?.name, body?.email, body?.role, body?.plan, body?.extra);

  // ── DASHBOARD (computed from state) ──
  if (u === '/dashboard' && m === 'GET') {
    const macros = sumMeals();
    const done = STATE.exercises.filter(e => e.done).length;
    return {
      user: getActiveMockUser(),
      goals: MOCK_GOALS,
      today: { water_cups: STATE.waterCups, steps: STATE.steps, sleep_score: 82, sleep_hours: 7.5, kcal: macros.kcal, score: 72 },
      workout: { name: 'PUSH DAY A', day: 4, week: 2, exercisesTotal: STATE.exercises.length, exercisesDone: done, exercises_total: STATE.exercises.length, exercises_done: done, progressPct: STATE.exercises.length ? Math.round(done/STATE.exercises.length*100) : 0, progress_pct: STATE.exercises.length ? Math.round(done/STATE.exercises.length*100) : 0 },
      macros: { kcal: macros.kcal, target: 2200, p: macros.p, c: macros.c, f: macros.f, fib: 0, protein: macros.p, carbs: macros.c, fat: macros.f },
      exercises: STATE.exercises,
      assignedWorkoutPlan: buildAssignedWorkoutPlan(),
      assignedNutritionPlan: buildAssignedNutritionPlan(),
    };
  }

  // ── USER ──
  if (u === '/user' && m === 'GET') return isRegistered && registeredUser ? registeredUser : MOCK_USERS['user@forja.ro'];
  if (u === '/user' && m === 'PATCH') return { ...MOCK_USERS['user@forja.ro'], ...(body||{}) };
  if (u === '/goals' && m === 'GET') return isRegistered ? { kcal: 2200, protein: 150, carbs: 250, fat: 70, water: 3, steps: 10000, sleep: 8 } : MOCK_GOALS;
  if (u === '/goals' && m === 'PUT') return { ...MOCK_GOALS, ...(body||{}) };

  // ── TODAY / WATER / STEPS ──
  if (u === '/today' && m === 'GET') { const mac = sumMeals(); return { water_cups: STATE.waterCups, steps: STATE.steps, sleep_score: 82, kcal: mac.kcal }; }
  if (u === '/today/water' && m === 'POST') { STATE.waterCups = body?.cups ?? STATE.waterCups; return { water_cups: STATE.waterCups }; }
  if (u === '/today/steps' && m === 'POST') { STATE.steps = body?.steps ?? STATE.steps; return { steps: STATE.steps }; }

  // ── EXERCISES (stateful) ──
  if (u === '/exercises' && m === 'GET') return STATE.exercises;
  if (u.startsWith('/exercises/library')) {
    let results = [...EXERCISE_LIBRARY];
    const q = params?.q; const muscle = params?.muscle;
    if (q) { const ql = String(q).toLowerCase(); results = results.filter(e => e.name.toLowerCase().includes(ql) || e.muscle.toLowerCase().includes(ql)); }
    if (muscle && muscle !== 'Toate') results = results.filter(e => e.muscle === muscle);
    return results;
  }
  if (u === '/exercises' && m === 'POST') {
    const lib = EXERCISE_LIBRARY.find(e => e.id === body?.libId);
    if (!lib) return { error: 'Not found' };
    if (STATE.exercises.find(e => e.libId === lib.id)) return { error: 'Deja în plan' };
    const ex = { id: genId(), libId: lib.id, name: lib.name, sets: lib.sets, muscle: lib.muscle, equip: lib.equip, icon: lib.icon, detail: lib.detail, done: false, img: lib.img, anim: lib.anim };
    STATE.exercises.push(ex);
    return ex;
  }
  if (u.match(/\/exercises\/[^/]+\/toggle/) && m === 'PATCH') {
    const id = u.split('/')[2]; const ex = STATE.exercises.find(e => e.id === id);
    if (ex) ex.done = !ex.done;
    return { ok: true };
  }
  if (u.match(/\/exercises\/[^/]+$/) && m === 'DELETE') {
    const id = u.split('/')[2]; STATE.exercises = STATE.exercises.filter(e => e.id !== id);
    return { ok: true };
  }
  if (u === '/exercises' && m === 'DELETE') { STATE.exercises = []; return { ok: true }; }
  if (u.includes('/exercises/bulk-done')) { STATE.exercises.forEach(e => e.done = true); return { ok: true }; }

  // ── MEALS (stateful) ──
  if (u === '/meals' && m === 'GET') return STATE.meals;
  if (u === '/meals' && m === 'POST') {
    const food = FOOD_DB.find(f => f.id === body?.foodId);
    if (!food) return { error: 'Aliment negăsit' };
    const mealType = body?.meal || 'Gustare';
    const meal = {
      id: genId(),
      foodId: food.id,
      name: food.name,
      meal: mealType,
      kcal: food.kcal,
      p: food.p,
      c: food.c,
      f: food.f,
      recipe: food.recipe || '',
      quantity: food.quantity || '1 porție',
      time: new Date().toTimeString().slice(0,5),
      img: food.img || '',
    };
    STATE.meals.push(meal);
    return meal;
  }
  if (u.match(/\/meals\//) && m === 'DELETE') {
    const id = u.split('/').pop();
    STATE.meals = STATE.meals.filter(ml => ml.id !== id);
    return { ok: true };
  }
  if (u === '/food/custom' && m === 'POST') {
    const baseName = String(body?.name || '').trim();
    if (!baseName) return { error: 'Completează denumirea alimentului.' };
    const quantity = String(body?.quantity || '1 porție').trim();
    const customFood = {
      id: genId(),
      name: quantity ? `${baseName} (${quantity})` : baseName,
      baseName,
      quantity,
      kcal: Number(body?.kcal || 0),
      p: Number(body?.p || 0),
      c: Number(body?.c || 0),
      f: Number(body?.f || 0),
      fib: Number(body?.fib || 0),
      img: body?.img || '',
      recipe: body?.recipe || '',
      custom: true,
    };
    FOOD_DB.unshift(customFood);
    return customFood;
  }
  if (u === '/food' || u.startsWith('/food')) {
    const q = params?.q;
    const list = [...FOOD_DB];
    if (q) {
      const ql = String(q).toLowerCase();
      return list.filter(f => String(f.name || '').toLowerCase().includes(ql) || String(f.baseName || '').toLowerCase().includes(ql));
    }
    return list;
  }

  // ── SLEEP ──
  if (u === '/sleep') return MOCK_SLEEP;
  if (u === '/sleep/log' && m === 'POST') return { ok: true, score: 80 };

  // ── CHAT (stateful) ──
  if (u === '/chat/teams' && m === 'GET') return MOCK_TEAMS.filter(t => t.isMember);
  if (u.startsWith('/chat') && m === 'GET') {
    const tid = u.split('?teamId=')[1] || 't1';
    return MOCK_CHATS[tid] || MOCK_CHATS.t1;
  }
  if (u.startsWith('/chat') && m === 'POST') {
    const tid = body?.teamId || 't1';
    const chat = MOCK_CHATS[tid] || MOCK_CHATS.t1;
    const msg = { id: genId(), from: 'Alex Popescu', avatar: 'A', senderId: 'u1', isMe: true, msg: body?.msg, time: new Date().toTimeString().slice(0,5) };
    chat.messages.push(msg);
    return msg;
  }

  // ── WORKOUT SESSION (fully stateful) ──
  if (u === '/workout/current') return { session: STATE.workoutSession };
  if (u === '/workout/start' && m === 'POST') {
    if (STATE.exercises.length === 0) return { error: 'Nu ai exerciții în plan.' };
    const snapshot = STATE.exercises.map(ex => {
      const p = parseSets(ex.sets);
      return { id: ex.id, libId: ex.libId, name: ex.name, muscle: ex.muscle, equip: ex.equip, icon: ex.icon, setsTotal: p.sets, reps: p.reps, detail: ex.detail, img: ex.img, anim: ex.anim };
    });
    const progress = {}; snapshot.forEach(ex => { progress[ex.id] = { setsCompleted: 0 }; });
    STATE.workoutSession = { id: genId(), exercises: snapshot, progress, startedAt: new Date().toISOString(), totalSets: snapshot.reduce((s,e) => s + e.setsTotal, 0), completedSets: 0, completedExercises: 0, elapsedSeconds: 0 };
    return { session: STATE.workoutSession };
  }
  if (u === '/workout/current/set' && m === 'PATCH') {
    const s = STATE.workoutSession; if (!s) return { error: 'Nicio sesiune activă' };
    const exId = body?.exerciseId; const ex = s.exercises.find(e => e.id === exId); if (!ex) return { error: 'Exercițiu negăsit' };
    const p = s.progress[exId] || { setsCompleted: 0 };
    p.setsCompleted = Math.min(p.setsCompleted + 1, ex.setsTotal);
    s.progress[exId] = p;
    s.completedSets = Object.values(s.progress).reduce((sum, pr) => sum + pr.setsCompleted, 0);
    s.completedExercises = s.exercises.filter(e => { const pr = s.progress[e.id]; return pr && pr.setsCompleted >= e.setsTotal; }).length;
    const exerciseDone = p.setsCompleted >= ex.setsTotal;
    const allDone = s.completedExercises >= s.exercises.length;
    if (exerciseDone) { const planEx = STATE.exercises.find(e => e.id === exId); if (planEx) planEx.done = true; }
    return { exerciseId: exId, setsCompleted: p.setsCompleted, setsTotal: ex.setsTotal, exerciseDone, totalCompletedSets: s.completedSets, totalCompletedExercises: s.completedExercises, allDone };
  }
  if (u === '/workout/finish' && m === 'POST') {
    const s = STATE.workoutSession; if (!s) return { error: 'Nicio sesiune activă' };
    const dur = Math.floor((Date.now() - new Date(s.startedAt).getTime()) / 1000);
    const mm = Math.floor(dur/60); const ss = dur % 60;
    const allDone = s.completedExercises >= s.exercises.length;
    const xp = s.completedSets * 10 + (allDone ? 50 : 0);
    STATE.workoutSession = null;
    return { durationFormatted: `${String(mm).padStart(2,'0')}:${String(ss).padStart(2,'0')}`, totalExercises: s.exercises.length, completedExercises: s.completedExercises, totalSets: s.totalSets, completedSets: s.completedSets, xpEarned: xp, allDone };
  }
  if (u === '/workout/abandon' && m === 'POST') { STATE.workoutSession = null; return { ok: true }; }
  if (u === '/workout/history') return [
    { id: 'wh1', name: 'Push Day A', completedAt: new Date(Date.now()-86400000).toISOString(), duration: 52, exercises: 6, completed: 6 },
    { id: 'wh2', name: 'Pull Day B', completedAt: new Date(Date.now()-172800000).toISOString(), duration: 48, exercises: 5, completed: 5 },
  ];

  // ── TEAMS (stateful join/leave) ──
  if (u === '/teams' && m === 'GET') {
    let filtered = [...MOCK_TEAMS];
    const f = params?.filter; const q = params?.q;
    if (f === 'mine') filtered = filtered.filter(t => t.isMember);
    else if (f === 'public') filtered = filtered.filter(t => t.isPublic && !t.isMember);
    if (q) { const ql = String(q).toLowerCase(); filtered = filtered.filter(t => t.name.toLowerCase().includes(ql) || t.category.toLowerCase().includes(ql) || t.coach.toLowerCase().includes(ql)); }
    return filtered;
  }
  if (u === '/teams' && m === 'POST') {
    const newTeam = { id: genId(), name: body?.name || 'Echipă nouă', coach: 'Tu', category: body?.category || 'General', description: body?.description || '', isPublic: true, membersCount: 1, postsCount: 0, isMember: true, joined: true, active: true, myRole: 'OWNER', slug: 'new', avatarUrl: null, createdAt: new Date().toISOString() };
    MOCK_TEAMS.push(newTeam);
    return { ...newTeam, activeTeam: newTeam.name, refreshSocket: true };
  }
  if (u.match(/\/teams\/(.+)\/join/) && m === 'POST') {
    const id = u.match(/\/teams\/(.+)\/join/)[1];
    const team = MOCK_TEAMS.find(t => t.id === id);
    if (team) { team.isMember = true; team.joined = true; team.membersCount++; team.myRole = 'MEMBER'; }
    return { ok: true, activeTeam: team?.name || '', refreshSocket: true };
  }
  if (u.match(/\/teams\/(.+)\/leave/) && m === 'POST') {
    const id = u.match(/\/teams\/(.+)\/leave/)[1];
    const team = MOCK_TEAMS.find(t => t.id === id);
    if (team) { team.isMember = false; team.joined = false; team.membersCount = Math.max(0, team.membersCount - 1); team.myRole = null; team.active = false; }
    return { ok: true, activeTeam: '', refreshSocket: true };
  }
  if (u.match(/\/teams\/(\w+)$/) && m === 'GET') {
    const id = u.split('/').pop();
    const team = MOCK_TEAMS.find(t => t.id === id) || MOCK_TEAMS[0];
    return {
      ...team,
      postsCount: getTeamPosts(team.id).length,
      members: [
        { id: 'c1', name: team.coach || 'Coach', role: 'COACH', teamRole: 'OWNER', avatarUrl: null, avatar: (team.coach||'C')[0], streak: 8, level: 5 },
        { id: 'u1', name: 'Alex Popescu', role: 'USER', teamRole: 'MEMBER', avatarUrl: null, avatar: 'A', streak: 12, level: 7 },
        { id: 'u3', name: 'Andrei Marin', role: 'USER', teamRole: 'ADMIN', avatarUrl: null, avatar: 'A', streak: 18, level: 6 },
        { id: 'u2', name: 'Maria Stancu', role: 'USER', teamRole: 'MEMBER', avatarUrl: null, avatar: 'M', streak: 5, level: 2 },
        { id: 'u4', name: 'Dan Gheorghe', role: 'USER', teamRole: 'MEMBER', avatarUrl: null, avatar: 'D', streak: 9, level: 4 },
      ],
      posts: getTeamPosts(team.id),
    };
  }

  // ── FEED ──
  if (u === '/feed' && m === 'GET') return isRegistered ? [] : MOCK_FEED;
  if (u === '/feed' && m === 'POST') {
    const post = { id: genId(), author: 'Tu', avatar: 'T', teamName: '', content: body?.content, likes: 0, liked: false, comments: [], createdAt: new Date().toISOString(), img: body?.imageUrl || '' };
    MOCK_FEED.unshift(post);
    return post;
  }
  if (u.match(/\/feed\/.*\/like/)) {
    const postId = u.split('/')[2];
    const post = findMutablePost(postId);
    if (post) post.likes = Number(post.likes || 0) + 1;
    return { ok: true };
  }
  if (u.match(/\/feed\/.*\/comment/) && m === 'POST') {
    const postId = u.split('/')[2];
    const post = findMutablePost(postId);
    if (!post) return { error: 'Postare inexistentă' };
    const text = String(body?.content || '').trim();
    if (!text) return { error: 'Comentariul este gol.' };
    const active = getActiveMockUser();
    const comment = {
      id: genId(),
      author: active?.name || 'Admin FORJA',
      authorId: active?.id || 'a1',
      text,
      content: text,
      createdAt: new Date().toISOString(),
    };
    post.comments = normalizeComments([...(post.comments || []), comment], post.id);
    return comment;
  }
  if (u.match(/\/feed\/comments\/.*$/) && m === 'DELETE') {
    const commentId = u.split('/').pop();
    const removed = deleteMutableComment(commentId);
    return removed ? { ok: true } : { error: 'Comentariu inexistent' };
  }
  if (u.match(/\/feed\/[^/]+$/) && m === 'DELETE') {
    const postId = u.split('/').pop();
    for (const posts of allMutablePostCollections()) {
      const index = posts.findIndex((post) => post.id === postId);
      if (index >= 0) {
        posts.splice(index, 1);
        return { ok: true };
      }
    }
    return { error: 'Postare inexistentă' };
  }

  // ── CHALLENGES ──
  if (u === '/challenges') return MOCK_CHALLENGES;
  if (u.match(/\/challenges\/.*\/join/)) return { ok: true };
  if (u.match(/\/challenges\/.*\/leaderboard/)) return [{ rank: 1, name: 'Alex Popescu', progress: 67 }];

  // ── DM (stateful conversations) ──
  if (u === '/messages/conversations') return isRegistered ? [] : MOCK_CONVERSATIONS;
  if (u === '/messages/start' && m === 'POST') {
    const existing = MOCK_CONVERSATIONS.find(c => c.other.id === body?.targetUserId);
    if (existing) return { conversationId: existing.id, other: existing.other };
    const newConvo = { id: genId(), other: { id: body?.targetUserId, name: 'Utilizator', role: 'USER', avatar: 'U' }, lastMessage: '', lastAt: new Date().toISOString(), unread: 0 };
    MOCK_CONVERSATIONS.push(newConvo);
    return { conversationId: newConvo.id, other: newConvo.other };
  }
  if (u === '/messages/unread/count') return { unread: MOCK_CONVERSATIONS.reduce((s,c) => s + c.unread, 0) };
  if (u.match(/\/messages\/[\w-]+$/) && m === 'GET') {
    const convoId = u.split('/').pop();
    const convo = MOCK_CONVERSATIONS.find(c => c.id === convoId) || MOCK_CONVERSATIONS[0];
    if (convo) convo.unread = 0;
    const msgs = MOCK_DM_MESSAGES_MAP[convoId] || MOCK_DM_MESSAGES_MAP.conv1 || [];
    return { conversation: convo, messages: msgs };
  }
  if (u.match(/\/messages\/[\w-]+$/) && m === 'POST') {
    const convoId = u.split('/').pop();
    const newMsg = { id: genId(), message: body?.message, isMe: true, time: new Date().toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' }) };
    if (!MOCK_DM_MESSAGES_MAP[convoId]) MOCK_DM_MESSAGES_MAP[convoId] = [];
    MOCK_DM_MESSAGES_MAP[convoId].push(newMsg);
    const convo = MOCK_CONVERSATIONS.find(c => c.id === convoId);
    if (convo) { convo.lastMessage = body?.message; convo.lastAt = new Date().toISOString(); }
    return newMsg;
  }

  // ── SEARCH / AVATAR ──
  if (u === '/search' || u.startsWith('/search')) return [{ type: 'page', label: 'Overview', hint: 'Dashboard', to: '/app' }];
  if (u === '/user/avatar') return { avatarUrl: null };

  // ── COACH ──
  if (u === '/coach/team') {
    const dn = STATE.exercises.filter(e => e.done).length;
    const tot = STATE.exercises.length;
    const comp = tot ? Math.round(dn/tot*100) : 0;
    return { name: 'Iron Wolves', coachName: 'Mihai Ionescu', members: MOCK_COACH_ATHLETES.length,
      active_today: MOCK_COACH_ATHLETES.filter(a => a.inviteStatus === 'ACCEPTED').length,
      compliance_week: comp, workouts: MOCK_COACH_WORKOUTS.length };
  }
  if (u === '/coach/athletes' && m === 'GET') {
    const mac = sumMeals(); const dn = STATE.exercises.filter(e => e.done).length;
    MOCK_COACH_ATHLETES[0].compliance = STATE.exercises.length ? Math.round(dn/STATE.exercises.length*100) : 0;
    return MOCK_COACH_ATHLETES;
  }
  if (u.match(/\/coach\/athletes\/[\w-]+$/) && m === 'GET') {
    const aid = u.split('/').pop();
    const ath = MOCK_COACH_ATHLETES.find(a => a.id === aid) || MOCK_COACH_ATHLETES[0];
    const mac = sumMeals(); const dn = STATE.exercises.filter(e => e.done).length; const tot = STATE.exercises.length;
    return { ...ath, compliance: tot ? Math.round(dn/tot*100) : 0,
      history: [65,70,78,82, tot ? Math.round(dn/tot*100) : 85, 80, tot ? Math.round(dn/tot*100) : 88], linked: true,
      realData: { kcalToday: mac.kcal, kcalTarget: 2200, exercisesDone: dn, exercisesTotal: tot,
        macros: { p: mac.p, c: mac.c, f: mac.f }, waterCups: STATE.waterCups,
        meals: STATE.meals.map(ml => ({ name: ml.name, kcal: ml.kcal, time: ml.time, img: ml.img })),
        exercises: STATE.exercises.map(ex => ({ name: ex.name, done: ex.done, sets: ex.sets, img: ex.img, anim: ex.anim })),
      }
    };
  }
  if (u.includes('/coach/athletes/invite')) return { ok: true, message: 'Invitație trimisă' };
  if (u === '/coach/workouts' && m === 'GET') return isRegistered ? [] : MOCK_COACH_WORKOUTS;
  if (u.match(/\/coach\/workouts\/[\w-]+$/) && m === 'GET') {
    const id = u.split('/').pop();
    const wp = MOCK_COACH_WORKOUTS.find(w => w.id === id) || MOCK_COACH_WORKOUTS[0];
    return { ...wp, exercises: [
      { id: 'we1', name: 'Bench Press', sets: 4, reps: 8, rest: 120, order: 1, anim: '/img/ex-bench.svg', img: '/img/ex-bench.svg' },
      { id: 'we2', name: 'Incline DB Press', sets: 3, reps: 10, rest: 90, order: 2, anim: '/img/ex-incline.svg', img: '/img/ex-incline.svg' },
      { id: 'we3', name: 'Cable Fly', sets: 3, reps: 12, rest: 60, order: 3, anim: '/img/ex-cable-fly.svg', img: '/img/ex-cable-fly.svg' },
      { id: 'we4', name: 'OHP', sets: 4, reps: 6, rest: 120, order: 4, anim: '/img/ex-ohp.svg', img: '/img/ex-ohp.svg' },
      { id: 'we5', name: 'Lateral Raise', sets: 3, reps: 15, rest: 60, order: 5, anim: '/img/ex-lateral-raise.svg', img: '/img/ex-lateral-raise.svg' },
      { id: 'we6', name: 'Tricep Pushdown', sets: 3, reps: 12, rest: 60, order: 6, anim: '/img/ex-tricep.svg', img: '/img/ex-tricep.svg' },
    ], assignedTo: ['ca1','ca3','ca5'] };
  }
  if (u === '/coach/workouts' && m === 'POST') {
    const newWp = { id: genId(), name: body?.name || 'Plan nou', category: body?.category || 'General', exercises: 0, assigned: 0 };
    MOCK_COACH_WORKOUTS.push(newWp);
    return newWp;
  }
  if (u.includes('/assign')) return { ok: true };
  if (u === '/coach/messages' && m === 'GET') return MOCK_COACH_MESSAGES;
  if (u.match(/\/coach\/messages\/.*\/reply/)) return { ok: true };
  if (u.match(/\/coach\/messages\/.*\/read/)) return { ok: true };

  // ── NUTRITIONIST ──
  if (u === '/nutritionist/overview') {
    const mac = sumMeals();
    const avgComp = MOCK_NUT_CLIENTS.reduce((s,c) => s + c.compliance, 0) / Math.max(1, MOCK_NUT_CLIENTS.length);
    return { nutritionistName: 'Elena Dumitrescu', total_clients: MOCK_NUT_CLIENTS.length,
      active_today: Math.min(MOCK_NUT_CLIENTS.length, 2), avg_compliance: Math.round(avgComp),
      plans_created: MOCK_NUT_TEMPLATES.length, kcal_avg: mac.kcal };
  }
  if (u === '/nutritionist/clients' && m === 'GET') {
    const mac = sumMeals();
    MOCK_NUT_CLIENTS[0].kcal_today = mac.kcal;
    MOCK_NUT_CLIENTS[0].compliance = mac.kcal > 0 ? Math.min(100, Math.round(mac.kcal / (MOCK_NUT_CLIENTS[0].kcal_target||2200) * 100)) : 0;
    return MOCK_NUT_CLIENTS;
  }
  if (u.match(/\/nutritionist\/clients\/[\w-]+$/) && m === 'GET') {
    const cid = u.split('/').pop();
    const cli = MOCK_NUT_CLIENTS.find(c => c.id === cid) || MOCK_NUT_CLIENTS[0];
    const mac = sumMeals();
    return { ...cli, kcal_today: mac.kcal, compliance: mac.kcal > 0 ? Math.min(100, Math.round(mac.kcal / (cli.kcal_target||2200) * 100)) : 0,
      meals: STATE.meals.map(ml => ({ type: ml.meal, items: ml.name, kcal: ml.kcal, img: ml.img })),
      linked: true, currentTemplate: 'High Protein',
      realData: { kcalToday: mac.kcal, kcalTarget: cli.kcal_target||2200, macros: { p: mac.p, c: mac.c, f: mac.f },
        waterCups: STATE.waterCups, streak: 12, weight: 78 },
    };
  }
  if (u.includes('/nutritionist/clients/invite')) return { ok: true, message: 'Invitație trimisă' };
  if (u === '/nutritionist/clients' && m === 'POST') return { id: genId(), name: body?.name, av: (body?.name||'N')[0], col: '#888', goal: body?.goal, plan: 'Nou', kcal_target: body?.kcal_target || 2000, kcal_today: 0, compliance: 0 };
  if (u === '/nutritionist/templates' && m === 'GET') return isRegistered ? [] : MOCK_NUT_TEMPLATES;
  if (u.match(/\/nutritionist\/templates\/[\w-]+$/) && m === 'GET') {
    const id = u.split('/').pop();
    return MOCK_NUT_TEMPLATES.find(t => t.id === id) || MOCK_NUT_TEMPLATES[0];
  }
  if (u === '/nutritionist/templates' && m === 'POST') {
    const mealPlan = Array.isArray(body?.mealPlan) ? body.mealPlan : [];
    const newT = {
      id: genId(),
      name: body?.name,
      kcal: body?.kcal || 2000,
      p: body?.p || 160,
      c: body?.c || 200,
      f: body?.f || 60,
      meals: mealPlan.length || 4,
      description: body?.description,
      clients: 0,
      createdAt: new Date().toISOString(),
      img: body?.img || mealPlan.find(meal => meal?.img)?.img || '',
      mealPlan,
    };
    MOCK_NUT_TEMPLATES.unshift(newT);
    return newT;
  }
  if (u.match(/\/nutritionist\/templates\/.*\/apply/)) return { ok: true };

  // ── ADMIN ──
  if (u === '/admin/overview') return MOCK_ADMIN_OVERVIEW_FN();
  if (u === '/admin/users' || u.startsWith('/admin/users?')) return MOCK_ADMIN_USERS;
  if (u.match(/\/admin\/users\/.*\/role/)) return { error: 'Schimbarea rolurilor este dezactivată din panoul admin.' };
  if (u.match(/\/admin\/users\/\w+$/) && m === 'DELETE') return { ok: true };
  if (u === '/admin/inbox') return flattenAdminInbox();
  if (u === '/admin/settings' && m === 'GET') return MOCK_ADMIN_SETTINGS;
  if (u === '/admin/settings' && m === 'PUT') return { settings: { ...MOCK_ADMIN_SETTINGS.settings, ...(body||{}) } };
  if (u === '/admin/audit' || u.startsWith('/admin/audit')) return normalizeAuditEvents();
  if (u === '/admin/system') return { uptime: '14d 6h', memory: '256MB', cpu: '12%' };

  // ── DISCOVER ──
  if (u === '/discover' || u.startsWith('/discover')) {
    let results = MOCK_DISCOVER;
    if (params?.role) results = results.filter(p => p.role === params.role);
    if (params?.q) { const q = params.q.toLowerCase(); results = results.filter(p => p.name.toLowerCase().includes(q)); }
    return results;
  }

  if (u === '/achievements' && m === 'GET') return { badges: [{ id: 'b3', earned: true, date: '2026-03-01' },{ id: 'b1', earned: true, date: '2026-03-15' },{ id: 'b10', earned: true, date: '2026-04-02' }], stats: { workouts: 47, streak: 12, earned: 3, xp: 1250 } };
  if (u === '/contact' && m === 'POST') return { ok: true };
  if (u === '/waitlist' && m === 'POST') return { ok: true };
  if (u === '/settings/public' && m === 'GET') return { settings: { allowContact: true, maintenanceMode: false } };
  if (u === '/auth/forgot-password' && m === 'POST') return { ok: true };

  void 0;
  return { ok: true };
}
