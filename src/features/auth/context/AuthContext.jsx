import { createContext, useContext, useState, useCallback } from 'react';
import { login as apiLogin, register as apiRegister } from '../../../shared/api/index.js';
import {
  readStoredUser,
  persistAuth,
  clearStoredAuth,
  updateStoredUser,
} from '../model/authStorage.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readStoredUser());

  const storeAuth = useCallback((data, persist = true, options = {}) => {
    persistAuth(data, persist, options);
    setUser(data.user);
  }, []);

  const login = useCallback(
    async (email, password, options = {}) => {
      const { data } = await apiLogin(email, password);
      storeAuth(data, options.persist !== false, { isDemo: false });
      return data.redirect;
    },
    [storeAuth],
  );

  const register = useCallback(
    async (name, email, password, role, plan, inviteToken, extra, options = {}) => {
      const { persist = true, adminBootstrapKey } = options || {};
      const { data } = await apiRegister(name, email, password, role, plan, inviteToken, extra, {
        adminBootstrapKey,
      });
      // Daca contul e in stare PENDING_PAYMENT, NU stocam auth, returnam doar info
      if (data.pendingPayment) {
        return { pendingPayment: true, upgradeRequest: data.upgradeRequest };
      }
      storeAuth(data, persist !== false, { isDemo: false });
      return data.redirect;
    },
    [storeAuth],
  );

  const startDemo = useCallback(
    async (demoSession, options = {}) => {
      if (!demoSession?.token || !demoSession?.user) {
        throw new Error('Sesiunea demo nu a putut fi pregătită.');
      }
      storeAuth(demoSession, options.persist !== false, { isDemo: true });
      return demoSession.redirect;
    },
    [storeAuth],
  );

  const updateUser = useCallback((patch) => {
    const nextUser = updateStoredUser(patch);
    setUser(nextUser);
  }, []);

  const logout = useCallback(() => {
    clearStoredAuth();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, startDemo, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
