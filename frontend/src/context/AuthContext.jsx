import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')) || null; }
    catch { return null; }
  });
  const [token, setToken] = useState(() =>
    localStorage.getItem('token') || null
  );

  // ← CRITICAL: Must start as TRUE
  // AdminRoute waits for this to be false before making routing decisions
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!user && !!token;
  const isAdmin = user?.role === 'admin';

  const saveAuth = useCallback((userData, tokenValue) => {
    setUser(userData);
    setToken(tokenValue);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', tokenValue);
  }, []);

  const clearAuth = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }, []);

  // Verify token on every page load/refresh
  useEffect(() => {
    const storedToken = localStorage.getItem('token');

    if (!storedToken) {
      console.log('[Auth] No token found — clearing auth');
      setLoading(false);
      return;
    }

    console.log('[Auth] Token found — verifying with backend...');

    authAPI.getMe()
      .then(({ data }) => {
        const freshUser = data.data.user;
        console.log('[Auth] Token valid — user:', freshUser.email, '| role:', freshUser.role);
        saveAuth(freshUser, storedToken);
      })
      .catch((err) => {
        console.log('[Auth] Token invalid/expired —', err.response?.status);
        clearAuth();
      })
      .finally(() => {
        console.log('[Auth] Loading complete');
        setLoading(false);
      });
  }, []); // eslint-disable-line

  const login = async (email, password) => {
    try {
      const { data } = await authAPI.login({ email, password });
      saveAuth(data.data.user, data.data.token);
      return { success: true, user: data.data.user };
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed.';
      return {
        success: false,
        message,
        isUnverified: message === 'EMAIL_NOT_VERIFIED',
      };
    }
  };

  const logout = useCallback(() => {
    console.log('[Auth] Logging out');
    clearAuth();
  }, [clearAuth]);

  return (
    <AuthContext.Provider value={{
      user, token, isAuthenticated, isAdmin, loading,
      login, logout, saveAuth, clearAuth,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};