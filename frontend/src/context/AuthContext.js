import React, { createContext, useContext, useState, useCallback } from 'react';
import API from '../utils/api';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('techmart_user')); } catch { return null; }
  });

  // Standard login — throws on failure so callers can handle errors
  const login = async (email, password) => {
    const { data } = await API.post('/auth/login', { email, password });
    if (!data.success) throw new Error(data.message || 'Login failed');
    
    // Handle 2FA requirement
    if (data.requires2FA) {
      return { requires2FA: true, email: data.email };
    }

    localStorage.setItem('techmart_token', data.token);
    localStorage.setItem('techmart_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  // FIX B03: register now just sends OTP — does NOT auto-login
  // Returns the API response object for the caller to handle
  const register = async (name, email, password, phone) => {
    const { data } = await API.post('/auth/register', { name, email, password, phone });
    if (!data.success) throw new Error(data.message || 'Registration failed');
    // No token stored — user must verify email first
    return data; // { success, message, email }
  };

  // Called after email OTP verification succeeds — receives token from /verify-email
  const loginWithToken = useCallback((token, userData) => {
    localStorage.setItem('techmart_token', token);
    localStorage.setItem('techmart_user', JSON.stringify(userData));
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('techmart_token');
    localStorage.removeItem('techmart_user');
    setUser(null);
  }, []);

  // Refresh user info from server (useful after profile update)
  const refreshUser = useCallback(async () => {
    try {
      const { data } = await API.get('/auth/me');
      if (data.success) {
        const updated = data.user;
        localStorage.setItem('techmart_user', JSON.stringify(updated));
        setUser(updated);
        return updated;
      }
    } catch (err) {
      console.error('refreshUser error:', err.message);
    }
  }, []);

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, login, register, loginWithToken, logout, refreshUser, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};
