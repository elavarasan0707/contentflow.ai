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
  loginWithGoogle: (
    param1?: string | { credential?: string; accessToken?: string; idToken?: string; email?: string; name?: string; avatar?: string },
    name?: string,
    avatar?: string
  ) => Promise<void>;
  register: (name: string, email: string, password: string, confirmPassword?: string) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<string>;
  updateProfile: (params: {
    name?: string;
    email?: string;
    avatar?: string;
    creator_name?: string;
    preferences?: Record<string, any>;
    currentPassword?: string;
    newPassword?: string;
  }) => Promise<void>;
  upgradeTier: (tier: SubscriptionTier) => Promise<void>;
  refreshUserData: () => Promise<void>;
  deductCreditLocal: (remaining: number, limit: number, used: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Synchronous initialization from localStorage / cookies to prevent unauthenticated flash across page refreshes
  const [user, setUser] = useState<User | null>(() => getStoredUser());
  const [stats, setStats] = useState<UserStats | null>(() => getStoredStats());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'signup' | 'forgot'>('login');
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState<boolean>(false);

  const { success, error, info } = useToast();

  const refreshUserData = useCallback(async () => {
    // Retrieve session token from localStorage / persistence
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
        // Persist token and user in localStorage
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

  // Initialize and retrieve stored user session token from localStorage on app load & page refreshes
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = getStoredToken();
        const storedUser = getStoredUser();

        if (token) {
          // Token exists in localStorage - immediately hydrate local state and verify session with backend
          if (storedUser && !user) {
            setUser(storedUser);
          }
          await refreshUserData();
        } else {
          // No active session
          setIsLoading(false);
        }
      } catch (err) {
        console.error('App initialization authentication error:', err);
        setIsLoading(false);
      }
    };

    initializeAuth();
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
      const cleanEmail = (email || '').trim();
      const res = await api.login({ email: cleanEmail, password });
      setStoredAuth(res.token, res.user);
      setUser(res.user);
      await refreshUserData();
      setIsAuthModalOpen(false);
      success(`Welcome back, ${res.user.name}!`);
    } catch (err: any) {
      const msg = err?.data?.error || err?.message || 'Login failed. Please check your credentials.';
      error(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (
    param1?: string | { credential?: string; accessToken?: string; idToken?: string; email?: string; name?: string; avatar?: string },
    name?: string,
    avatar?: string
  ) => {
    setIsLoading(true);
    try {
      let payload: { credential?: string; accessToken?: string; idToken?: string; email?: string; name?: string; avatar?: string };
      if (typeof param1 === 'object' && param1 !== null) {
        payload = param1;
      } else {
        const cleanEmail = typeof param1 === 'string' ? param1.trim() : '';
        payload = { email: cleanEmail, name, avatar };
      }

      const res = await api.loginWithGoogle(payload);
      setStoredAuth(res.token, res.user);
      setUser(res.user);
      await refreshUserData();
      setIsAuthModalOpen(false);
      success(`Welcome back, ${res.user.name}!`);
    } catch (err: any) {
      const msg = err?.data?.error || err?.message || 'Google sign-in failed';
      error(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, confirmPassword?: string) => {
    setIsLoading(true);
    try {
      const cleanName = (name || '').trim();
      const cleanEmail = (email || '').trim();
      const res = await api.register({ name: cleanName, email: cleanEmail, password, confirmPassword });
      setStoredAuth(res.token, res.user);
      setUser(res.user);
      await refreshUserData();
      setIsAuthModalOpen(false);
      success(`Account created! Welcome to ContentFlow AI, ${cleanName}!`);
    } catch (err: any) {
      const msg = err?.data?.error || err?.message || 'Registration failed';
      error(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (params: {
    name?: string;
    email?: string;
    avatar?: string;
    creator_name?: string;
    preferences?: Record<string, any>;
    currentPassword?: string;
    newPassword?: string;
  }) => {
    setIsLoading(true);
    try {
      const res = await api.updateProfile(params);
      setUser(res.user);
      const token = getStoredToken();
      if (token) {
        setStoredAuth(token, res.user);
      }
      await refreshUserData();
      success(res.message || 'Profile updated successfully.');
    } catch (err: any) {
      error(err.message || 'Failed to update profile');
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
        loginWithGoogle,
        register,
        logout,
        forgotPassword,
        updateProfile,
        upgradeTier,
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
