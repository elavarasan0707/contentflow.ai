import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, UserStats, SubscriptionTier } from '../types';
import { 
  api, 
  getStoredToken, 
  setStoredAuth, 
  clearStoredAuth, 
  getStoredUser, 
  getStoredStats, 
  setStoredStats, 
  isExplicitlyLoggedOut 
} from '../services/api';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: User | null;
  stats: UserStats | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  authModalTab: 'login' | 'signup' | 'forgot';
  isUpgradeModalOpen: boolean;
  openAuthModal: (tab?: 'login' | 'signup' | 'forgot') => void;
  closeAuthModal: () => void;
  openUpgradeModal: () => void;
  closeUpgradeModal: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, confirmPassword?: string) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<string>;
  upgradeTier: (tier: SubscriptionTier) => Promise<void>;
  switchDemoRole: (role: 'creator' | 'admin' | 'free') => Promise<void>;
  refreshUserData: () => Promise<void>;
  deductCreditLocal: (remaining: number, limit: number, used: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Synchronous initialization from persisted storage to prevent unauthenticated flash
  const [user, setUser] = useState<User | null>(() => getStoredUser());
  const [stats, setStats] = useState<UserStats | null>(() => getStoredStats());
  const [isLoading, setIsLoading] = useState<boolean>(!getStoredUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'signup' | 'forgot'>('login');
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState<boolean>(false);

  const { success, error, info } = useToast();

  const refreshUserData = useCallback(async () => {
    const token = getStoredToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const data = await api.getMe();
      if (data && data.user) {
        setUser(data.user);
        setStats(data.stats);
        setStoredAuth(token, data.user);
        if (data.stats) {
          setStoredStats(data.stats);
        }
      }
    } catch (err: any) {
      console.warn('Session verification error:', err);
      // If token is invalid / expired or user disabled
      if (err?.status === 401 || err?.status === 403) {
        clearStoredAuth();
        setUser(null);
        setStats(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initialize and verify session on load / refresh
  useEffect(() => {
    const token = getStoredToken();
    const isLoggedOut = isExplicitlyLoggedOut();

    if (token) {
      // User has an existing persisted session - verify with server
      refreshUserData();
    } else if (!isLoggedOut) {
      // First visit - auto-initialize standard demo account
      api.switchDemo('creator')
        .then(res => {
          setStoredAuth(res.token, res.user);
          setUser(res.user);
          refreshUserData();
        })
        .catch(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, [refreshUserData]);

  const openAuthModal = useCallback((tab: 'login' | 'signup' | 'forgot' = 'login') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  const openUpgradeModal = useCallback(() => {
    setIsUpgradeModalOpen(true);
  }, []);

  const closeUpgradeModal = useCallback(() => {
    setIsUpgradeModalOpen(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.login({ email, password });
      setStoredAuth(res.token, res.user);
      setUser(res.user);
      await refreshUserData();
      setIsAuthModalOpen(false);
      success(`Welcome back, ${res.user.name}!`);
    } catch (err: any) {
      error(err.message || 'Login failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, confirmPassword?: string) => {
    setIsLoading(true);
    try {
      const res = await api.register({ name, email, password, confirmPassword });
      setStoredAuth(res.token, res.user);
      setUser(res.user);
      await refreshUserData();
      setIsAuthModalOpen(false);
      success(`Account created! Welcome to ContentFlow AI, ${name}!`);
    } catch (err: any) {
      error(err.message || 'Registration failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    clearStoredAuth();
    setUser(null);
    setStats(null);
    info('You have been logged out.');
  };

  const forgotPassword = async (email: string) => {
    try {
      const res = await api.forgotPassword(email);
      info(res.message);
      return res.message;
    } catch (err: any) {
      error(err.message || 'Failed to send reset link');
      throw err;
    }
  };

  const upgradeTier = async (tier: SubscriptionTier) => {
    try {
      const res = await api.upgradeTier(tier);
      setUser(res.user);
      const token = getStoredToken();
      if (token) {
        setStoredAuth(token, res.user);
      }
      await refreshUserData();
      setIsUpgradeModalOpen(false);
      success(`Plan upgraded to ${tier.toUpperCase()} successfully!`);
    } catch (err: any) {
      error(err.message || 'Upgrade failed');
      throw err;
    }
  };

  const switchDemoRole = async (role: 'creator' | 'admin' | 'free') => {
    setIsLoading(true);
    try {
      const res = await api.switchDemo(role);
      setStoredAuth(res.token, res.user);
      setUser(res.user);
      await refreshUserData();
      success(`Switched account to: ${res.user.name} (${res.user.role.toUpperCase()})`);
    } catch (err: any) {
      error(err.message || 'Failed to switch demo account');
    } finally {
      setIsLoading(false);
    }
  };

  const deductCreditLocal = (remaining: number, limit: number, used: number) => {
    if (user) {
      const updatedUser = { ...user, credits_used: used, credits_limit: limit };
      setUser(updatedUser);
      const token = getStoredToken();
      if (token) {
        setStoredAuth(token, updatedUser);
      }
    }
    if (stats) {
      const updatedStats = {
        ...stats,
        credits_remaining: remaining,
        credits_limit: limit,
        credits_used: used
      };
      setStats(updatedStats);
      setStoredStats(updatedStats);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        stats,
        isLoading,
        isAuthenticated: !!user,
        isAuthModalOpen,
        authModalTab,
        isUpgradeModalOpen,
        openAuthModal,
        closeAuthModal,
        openUpgradeModal,
        closeUpgradeModal,
        login,
        register,
        logout,
        forgotPassword,
        upgradeTier,
        switchDemoRole,
        refreshUserData,
        deductCreditLocal
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
