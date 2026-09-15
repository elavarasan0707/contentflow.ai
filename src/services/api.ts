import {
  User,
  UserStats,
  BrandVoice,
  ContentItem,
  ContentTemplate,
  GenerationRequest,
  GenerationResponse,
  AIAction,
  AdminStats,
  SubscriptionTier,
  UsageResponse
} from '../types';

const TOKEN_KEY = 'contentflow_token';
const USER_KEY = 'contentflow_user';
const STATS_KEY = 'contentflow_stats';
const LOGGED_OUT_KEY = 'contentflow_logged_out';

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
  return match ? decodeURIComponent(match[3]) : null;
}

function setCookie(name: string, value: string, days = 30): void {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function deleteCookie(name: string): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
}

export function getStoredToken(): string | null {
  try {
    const local = localStorage.getItem(TOKEN_KEY);
    if (local) return local;
    return getCookie(TOKEN_KEY);
  } catch {
    return getCookie(TOKEN_KEY);
  }
}

export function setStoredAuth(token: string, user: User): void {
  try {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    localStorage.removeItem(LOGGED_OUT_KEY);
  } catch (e) {
    console.warn('localStorage save failed:', e);
  }
  setCookie(TOKEN_KEY, token, 30);
  try {
    setCookie(USER_KEY, JSON.stringify(user), 30);
  } catch (e) {
    console.warn('Cookie save failed:', e);
  }
}

export function clearStoredAuth(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(STATS_KEY);
    localStorage.setItem(LOGGED_OUT_KEY, 'true');
  } catch (e) {
    console.warn('localStorage clear failed:', e);
  }
  deleteCookie(TOKEN_KEY);
  deleteCookie(USER_KEY);
  deleteCookie(STATS_KEY);
}

export function getStoredUser(): User | null {
  try {
    const data = localStorage.getItem(USER_KEY) || getCookie(USER_KEY);
    if (!data) return null;
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export function getStoredStats(): UserStats | null {
  try {
    const data = localStorage.getItem(STATS_KEY);
    if (!data) return null;
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export function setStoredStats(stats: UserStats): void {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch (e) {
    console.warn('Stats save failed:', e);
  }
}

export function isExplicitlyLoggedOut(): boolean {
  try {
    return localStorage.getItem(LOGGED_OUT_KEY) === 'true';
  } catch {
    return false;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const isPublicAuthEndpoint =
    endpoint.startsWith('/api/auth/login') ||
    endpoint.startsWith('/api/auth/register') ||
    endpoint.startsWith('/api/auth/forgot-password');

  const token = !isPublicAuthEndpoint ? getStoredToken() : null;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    headers['x-user-id'] = token;
  }

  let response: Response;
  try {
    response = await fetch(endpoint, {
      ...options,
      headers,
    });
  } catch (networkErr: any) {
    const error = new Error('Unable to connect to the server. Please check your internet connection or try again.') as any;
    error.status = 0;
    error.isNetworkError = true;
    error.originalError = networkErr;
    throw error;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    let errorMsg = data.error || data.message;
    if (!errorMsg) {
      if (response.status === 401) {
        errorMsg = 'Invalid email or password. Please check your credentials.';
      } else if (response.status === 403) {
        errorMsg = 'Account access denied or disabled. Please contact support.';
      } else if (response.status === 404) {
        errorMsg = 'Authentication service endpoint was not found.';
      } else if (response.status === 500) {
        errorMsg = 'Server encountered an error. Please try again in a moment.';
      } else {
        errorMsg = `Request failed with status ${response.status}`;
      }
    }

    const error = new Error(errorMsg) as any;
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data as T;
}

export const api = {
  // Auth
  async register(params: { name: string; email: string; password: string; confirmPassword?: string }) {
    return request<{ user: User; token: string; message: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(params)
    });
  },

  async login(params: { email: string; password: string }) {
    return request<{ user: User; token: string; message: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(params)
    });
  },

  async forgotPassword(email: string) {
    return request<{ message: string }>('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  },

  async getMe() {
    return request<{ user: User; stats: UserStats }>('/api/auth/me');
  },

  async getGoogleConfig() {
    return request<{ clientId: string; isConfigured: boolean }>('/api/auth/google/config');
  },

  async loginWithGoogle(payload: { credential?: string; accessToken?: string; idToken?: string; email?: string; name?: string; avatar?: string }) {
    return request<{ user: User; token: string; message: string }>('/api/auth/google', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async updateProfile(params: {
    name?: string;
    email?: string;
    avatar?: string;
    creator_name?: string;
    preferences?: Record<string, any>;
    currentPassword?: string;
    newPassword?: string;
  }) {
    return request<{ user: User; message: string }>('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(params)
    });
  },

  async getUsage() {
    return request<UsageResponse>('/api/usage');
  },

  async upgradeTier(tier: SubscriptionTier) {
    return request<{ user: User; message: string }>('/api/auth/upgrade-tier', {
      method: 'POST',
      body: JSON.stringify({ tier })
    });
  },

  // AI Generation
  async generateContent(payload: GenerationRequest) {
    return request<GenerationResponse>('/api/generate', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async transformContent(payload: {
    content: string;
    action: AIAction;
    targetLanguage?: string;
    targetTone?: string;
    platform?: string;
  }) {
    return request<{ success: boolean; content: string; meta: any; action: string }>('/api/transform', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  // Content Items
  async getContent(params: { type?: string; platform?: string; search?: string } = {}) {
    const query = new URLSearchParams();
    if (params.type) query.set('type', params.type);
    if (params.platform) query.set('platform', params.platform);
    if (params.search) query.set('search', params.search);
    return request<{ items: ContentItem[] }>(`/api/content?${query.toString()}`);
  },

  async getContentById(id: string) {
    return request<{ item: ContentItem }>(`/api/content/${id}`);
  },

  async saveContent(payload: Partial<ContentItem>) {
    return request<{ item: ContentItem; message: string }>('/api/content', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async updateContent(id: string, payload: Partial<ContentItem>) {
    return request<{ item: ContentItem; message: string }>(`/api/content/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  },

  async deleteContent(id: string) {
    return request<{ success: boolean; message: string }>(`/api/content/${id}`, {
      method: 'DELETE'
    });
  },

  // Brand Voice
  async getBrandVoice() {
    return request<{ brandVoice: BrandVoice }>('/api/brand-voice');
  },

  async updateBrandVoice(payload: Partial<BrandVoice>) {
    return request<{ brandVoice: BrandVoice; message: string }>('/api/brand-voice', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  // Templates
  async getTemplates() {
    return request<{ templates: ContentTemplate[]; totalCount?: number }>('/api/templates');
  },

  async getTemplateUserData() {
    return request<{ favorites: string[]; recent: string[] }>('/api/templates/user-data');
  },

  async toggleTemplateFavorite(templateId: string) {
    return request<{ favorites: string[]; isFavorite: boolean }>('/api/templates/favorite', {
      method: 'POST',
      body: JSON.stringify({ templateId })
    });
  },

  async trackTemplateUse(templateId: string) {
    return request<{ recent: string[] }>('/api/templates/track-use', {
      method: 'POST',
      body: JSON.stringify({ templateId })
    });
  },

  // Admin
  async getAdminStats() {
    return request<AdminStats>('/api/admin/stats');
  },

  async getAdminUsers() {
    return request<{ users: User[] }>('/api/admin/users');
  },

  async toggleUserStatus(userId: string) {
    return request<{ user: User; message: string }>(`/api/admin/users/${userId}/toggle-status`, {
      method: 'POST'
    });
  },

  async grantUserCredits(userId: string, amount: number) {
    return request<{ user: User; message: string }>(`/api/admin/users/${userId}/grant-credits`, {
      method: 'POST',
      body: JSON.stringify({ amount })
    });
  },

  async deleteUser(userId: string) {
    return request<{ success: boolean; message: string }>(`/api/admin/users/${userId}`, {
      method: 'DELETE'
    });
  }
};
