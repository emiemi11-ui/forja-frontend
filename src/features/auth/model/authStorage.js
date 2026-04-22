const STORAGES = [localStorage, sessionStorage];
const DEMO_SESSION_KEY = 'forja_demo_mode';

function safeParseUser(rawValue) {
  if (!rawValue) return null;
  try {
    return JSON.parse(rawValue);
  } catch {
    return null;
  }
}

export function readStoredAuth() {
  for (const storage of STORAGES) {
    const token = storage.getItem('token');
    const user = safeParseUser(storage.getItem('user'));
    if (token && user) {
      return { storage, token, user };
    }
  }
  return null;
}

export function readStoredUser() {
  return readStoredAuth()?.user || null;
}

export function getStoredToken() {
  return readStoredAuth()?.token || null;
}

export function getActiveStorage() {
  return readStoredAuth()?.storage || localStorage;
}

export function isDemoSession() {
  return STORAGES.some((storage) => storage.getItem(DEMO_SESSION_KEY) === 'true');
}

export function setDemoSession(enabled, persist = true) {
  const primary = persist ? localStorage : sessionStorage;
  const secondary = persist ? sessionStorage : localStorage;

  secondary.removeItem(DEMO_SESSION_KEY);
  if (enabled) {
    primary.setItem(DEMO_SESSION_KEY, 'true');
  } else {
    primary.removeItem(DEMO_SESSION_KEY);
  }
}

export function clearStoredAuth() {
  for (const storage of STORAGES) {
    storage.removeItem('token');
    storage.removeItem('user');
    storage.removeItem(DEMO_SESSION_KEY);
  }
  try { localStorage.removeItem('forja_registered'); } catch {}
}

export function persistAuth(data, persist = true, options = {}) {
  const primary = persist ? localStorage : sessionStorage;
  const secondary = persist ? sessionStorage : localStorage;
  const useDemo = options?.isDemo === true;

  secondary.removeItem('token');
  secondary.removeItem('user');
  secondary.removeItem(DEMO_SESSION_KEY);

  primary.setItem('token', data.token);
  primary.setItem('user', JSON.stringify(data.user));
  if (useDemo) {
    primary.setItem(DEMO_SESSION_KEY, 'true');
  } else {
    primary.removeItem(DEMO_SESSION_KEY);
  }
}

export function updateStoredUser(patch) {
  const activeStorage = getActiveStorage();
  const currentUser = safeParseUser(activeStorage.getItem('user')) || {};
  const nextUser = { ...currentUser, ...patch };
  activeStorage.setItem('user', JSON.stringify(nextUser));
  return nextUser;
}
