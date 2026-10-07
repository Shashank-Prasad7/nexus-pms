import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { api } from '../api/client';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  sessionError: string | null;
  clearSessionError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [sessionError, setSessionError] = useState<string | null>(null);

  useEffect(() => {
    // Listen for 401 unauthorized from client
    api.setOnUnauthorized(() => {
      setUser(null);
      setSessionError('Your session has expired. Please log in again.');
    });

    const initAuth = async () => {
      const token = api.getToken();
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.getMe();
        if (res.success && res.user) {
          setUser(res.user);
        } else {
          api.setToken(null);
        }
      } catch (err) {
        api.setToken(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.login({ email, password });
    if (res.token && res.user) {
      api.setToken(res.token);
      setUser(res.user);
      setSessionError(null);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await api.register({ name, email, password });
    if (res.token && res.user) {
      api.setToken(res.token);
      setUser(res.user);
      setSessionError(null);
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } finally {
      api.setToken(null);
      setUser(null);
    }
  };

  const clearSessionError = () => {
    setSessionError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        sessionError,
        clearSessionError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
