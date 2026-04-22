export const ENDPOINTS = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
  },
  athlete: {
    dashboard: '/dashboard',
    user: '/user',
    goals: '/goals',
    today: '/today',
    todayWater: '/today/water',
    todaySteps: '/today/steps',
    exercises: '/exercises',
    exercisesLibrary: '/exercises/library',
    meals: '/meals',
    food: '/food',
    sleep: '/sleep',
    sleepLog: '/sleep/log',
    teams: '/teams',
    chat: '/chat',
    search: '/search',
    avatar: '/user/avatar',
    discover: '/discover',
    workoutCurrent: '/workout/current',
    workoutStart: '/workout/start',
    workoutSet: '/workout/current/set',
    workoutFinish: '/workout/finish',
    workoutAbandon: '/workout/abandon',
    workoutHistory: '/workout/history',
  },
  coach: {
    team: '/coach/team',
    athletes: '/coach/athletes',
    workouts: '/coach/workouts',
    messages: '/coach/messages',
  },
  nutritionist: {
    overview: '/nutritionist/overview',
    clients: '/nutritionist/clients',
    templates: '/nutritionist/templates',
  },
  admin: {
    overview: '/admin/overview',
    users: '/admin/users',
    inbox: '/admin/inbox',
    settings: '/admin/settings',
    system: '/admin/system',
    audit: '/admin/audit',
  },
};

// Extended endpoints
ENDPOINTS.feed = {
  list: '/feed',
  create: '/feed',
};
ENDPOINTS.teams = {
  list: '/teams',
  create: '/teams',
  detail: (id) => `/teams/${id}`,
  join: (id) => `/teams/${id}/join`,
  leave: (id) => `/teams/${id}/leave`,
};
ENDPOINTS.challenges = {
  list: '/challenges',
  create: '/challenges',
  join: (id) => `/challenges/${id}/join`,
  progress: (id) => `/challenges/${id}/progress`,
  leaderboard: (id) => `/challenges/${id}/leaderboard`,
};
ENDPOINTS.messages = {
  conversations: '/messages/conversations',
  start: '/messages/start',
  detail: (id) => `/messages/${id}`,
  send: (id) => `/messages/${id}`,
  unreadCount: '/messages/unread/count',
};
