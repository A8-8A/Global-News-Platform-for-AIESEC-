// Auth context - single source of truth for "who is logged in".
//
// Works for BOTH auth paths (AIESEC OAuth users and admins) because
// once a session exists it is the same kind of JWT either way. The
// context exposes the current user (with role) and helpers.

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api, getToken, setToken, clearToken } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // user: { id, role: 'MCP' | 'MEMBER' | 'ADMIN', fullName, ... } | null
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On first load, if a token exists, ask the backend who we are.
  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get('/api/auth/me')
      .then((me) => setUser(me))
      .catch(() => {
        // token invalid/expired - drop it
        clearToken();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  /** Called after a successful login (OAuth callback or admin login). */
  const completeLogin = useCallback((token, me) => {
    setToken(token);
    setUser(me);
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  const value = {
    user,
    loading,
    completeLogin,
    logout,
    isAuthenticated: !!user,
    isMcp: user?.role === 'MCP',
    isMember: user?.role === 'MEMBER',
    isAdmin: user?.role === 'ADMIN',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** Hook for consuming auth state anywhere in the tree. */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
