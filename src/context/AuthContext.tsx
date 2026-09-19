import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, ParkingPartner } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  partner: ParkingPartner | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  authModalTab: 'login' | 'signup';
  authModalRole: 'CUSTOMER' | 'PARTNER';
  openAuthModal: (tab?: 'login' | 'signup', role?: 'CUSTOMER' | 'PARTNER') => void;
  closeAuthModal: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  loginAsDemo: (role: 'customer' | 'partner' | 'admin') => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [partner, setPartner] = useState<ParkingPartner | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('pp_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'signup'>('login');
  const [authModalRole, setAuthModalRole] = useState<'CUSTOMER' | 'PARTNER'>('CUSTOMER');

  const refreshUser = useCallback(async () => {
    const currentToken = localStorage.getItem('pp_token');
    if (!currentToken) {
      setUser(null);
      setPartner(null);
      setIsLoading(false);
      return;
    }

    try {
      const data = await api.getMe();
      setUser(data.user);
      setPartner(data.partner || null);
    } catch (err) {
      console.warn('Session expired or invalid token:', err);
      localStorage.removeItem('pp_token');
      setUser(null);
      setPartner(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.login(email, password);
      localStorage.setItem('pp_token', res.token);
      setToken(res.token);
      setUser(res.user);
      setPartner(res.partner || null);
      setIsAuthModalOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: any) => {
    setIsLoading(true);
    try {
      const res = await api.register(data);
      localStorage.setItem('pp_token', res.token);
      setToken(res.token);
      setUser(res.user);
      setIsAuthModalOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const loginAsDemo = async (role: 'customer' | 'partner' | 'admin') => {
    const demoCredentials = {
      customer: { email: 'user@parkingpartner.demo', password: 'password123' },
      partner: { email: 'partner@parkingpartner.demo', password: 'password123' },
      admin: { email: 'admin@parkingpartner.demo', password: 'password123' }
    };

    const creds = demoCredentials[role];
    await login(creds.email, creds.password);
  };

  const logout = () => {
    localStorage.removeItem('pp_token');
    setToken(null);
    setUser(null);
    setPartner(null);
  };

  const openAuthModal = (tab: 'login' | 'signup' = 'login', role: 'CUSTOMER' | 'PARTNER' = 'CUSTOMER') => {
    setAuthModalTab(tab);
    setAuthModalRole(role);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        partner,
        token,
        isAuthenticated: !!user,
        isLoading,
        isAuthModalOpen,
        authModalTab,
        authModalRole,
        openAuthModal,
        closeAuthModal,
        login,
        register,
        loginAsDemo,
        logout,
        refreshUser
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
