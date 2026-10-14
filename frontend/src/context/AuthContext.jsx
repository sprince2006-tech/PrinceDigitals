import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi, setStoredToken, clearStoredToken } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null); // 'admin' | 'user' | null
  const [authConfig, setAuthConfig] = useState({
    googleAuthEnabled: true,
    passwordAuthEnabled: true,
  });
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      // Check if URL has token from Google OAuth redirect
      const urlParams = new URLSearchParams(window.location.search);
      const redirectToken = urlParams.get('token');
      if (redirectToken) {
        setStoredToken(redirectToken);
        // Clean URL params without page reload
        urlParams.delete('token');
        urlParams.delete('auth');
        const newSearch = urlParams.toString();
        const newUrl = window.location.pathname + (newSearch ? `?${newSearch}` : '');
        window.history.replaceState({}, document.title, newUrl);
      }

      const res = await authApi.getSession();
      if (res?.data?.authenticated && res.data.user) {
        setIsAuthenticated(true);
        setUser(res.data.user);
        setRole(res.data.user.role || res.data.role || 'user');
      } else {
        setIsAuthenticated(false);
        setUser(null);
        setRole(null);
      }

      if (res?.data?.config) {
        setAuthConfig(res.data.config);
      }
    } catch (err) {
      console.warn('Session verification check failed:', err.message);
      setIsAuthenticated(false);
      setUser(null);
      setRole(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const loginWithPassword = async (identifier, password) => {
    setLoading(true);
    try {
      const res = await authApi.login(identifier, password);
      if (res.data?.token) {
        setStoredToken(res.data.token);
      }
      const authenticatedUser = res.data?.user || { email: identifier, role: res.data?.role || 'user' };
      const resolvedRole = res.data?.role || authenticatedUser.role || 'user';

      setIsAuthenticated(true);
      setUser(authenticatedUser);
      setRole(resolvedRole);

      return { success: true, role: resolvedRole, user: authenticatedUser };
    } catch (error) {
      return { success: false, error: error.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    try {
      const res = await authApi.register(name, email, password);
      if (res.data?.token) {
        setStoredToken(res.data.token);
      }
      const newUser = res.data?.user || { name, email, role: 'user' };

      setIsAuthenticated(true);
      setUser(newUser);
      setRole('user');

      return { success: true, role: 'user', user: newUser };
    } catch (error) {
      return { success: false, error: error.message || 'Registration failed' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authApi.logout();
    } catch (err) {
      console.warn('Logout API warning:', err.message);
    } finally {
      clearStoredToken();
      setIsAuthenticated(false);
      setUser(null);
      setRole(null);
      setLoading(false);
    }
  };

  const isAdmin = role === 'admin';

  const value = {
    isAuthenticated,
    user,
    role,
    isAdmin,
    admin: isAdmin ? user : null, // Backwards compatibility with admin components
    authConfig,
    loading,
    loginWithPassword,
    register,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
