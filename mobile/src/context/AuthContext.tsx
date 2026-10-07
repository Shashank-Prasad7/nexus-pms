import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { mobileApi } from '../api/client';
import { getToken, deleteToken } from '../utils/storage';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  sessionMessage: string | null;
  clearSessionMessage: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionMessage, setSessionMessage] = useState<string | null>(null);

  useEffect(() => {
    mobileApi.setOnUnauthorized(() => {
      setUser(null);
      setSessionMessage('Your session has expired. Please sign in again.');
    });

    const init = async () => {
      try {
        const token = await getToken();
        if (!token) {
          setLoading(false);
          return;
        }

        const res = await mobileApi.getMe();
        if (res.success && res.user) {
          setUser(res.user);
        } else {
          await deleteToken();
        }
      } catch (err) {
        // Keep offline or reset
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await mobileApi.login({ email, password });
    if (res.user) {
      setUser(res.user);
      setSessionMessage(null);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await mobileApi.register({ name, email, password });
    if (res.user) {
      setUser(res.user);
      setSessionMessage(null);
    }
  };

  const logout = async () => {
    try {
      await mobileApi.logout();
    } finally {
      setUser(null);
    }
  };

  const clearSessionMessage = () => {
    setSessionMessage(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        sessionMessage,
        clearSessionMessage,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
};
