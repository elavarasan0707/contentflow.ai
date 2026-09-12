import React, { useState } from 'react';
import { 
  Mail, 
  Lock, 
  User as UserIcon, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Loader2, 
  Eye, 
  EyeOff, 
  ArrowLeft,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Logo } from './Logo';

interface LoginPageProps {
  initialMode?: 'login' | 'signup' | 'forgot';
  onNavigate: (page: string) => void;
  onSuccess?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  initialMode = 'login',
  onNavigate,
  onSuccess
}) => {
  const { login, loginWithGoogle, register, forgotPassword, switchDemoRole } = useAuth();
  const { success, error: toastError, info } = useToast();

  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const validate = (): boolean => {
    if (!email.trim()) {
      setErrorMsg('Please enter your email address.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMsg('Please enter a valid email address.');
      return false;
    }
    if (mode !== 'forgot' && !password) {
      setErrorMsg('Please enter your password.');
      return false;
    }
    if (mode === 'signup') {
      if (!name.trim()) {
        setErrorMsg('Please enter your full name.');
        return false;
      }
      if (password.length < 6) {
        setErrorMsg('Password must be at least 6 characters.');
        return false;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match.');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    const cleanEmail = email.trim();

    try {
      if (mode === 'signup') {
        await register(name.trim(), cleanEmail, password, confirmPassword);
        if (onSuccess) {
          onSuccess();
        } else {
          onNavigate('dashboard');
        }
      } else if (mode === 'login') {
        await login(cleanEmail, password);
        if (onSuccess) {
          onSuccess();
        } else {
          onNavigate('dashboard');
        }
      } else if (mode === 'forgot') {
        await forgotPassword(cleanEmail);
        setSuccessMsg('Password reset instructions sent to your email.');
      }
    } catch (err: any) {
      const serverMsg = err?.data?.error || err?.message;
      if (err?.status === 401 || serverMsg?.toLowerCase().includes('invalid') || serverMsg?.toLowerCase().includes('incorrect')) {
        setErrorMsg('Invalid email or password. Please verify your credentials or use the 1-click demo accounts below.');
      } else if (err?.status === 403) {
        setErrorMsg('This account has been disabled. Please contact support.');
      } else if (err?.status === 400) {
        setErrorMsg(serverMsg || 'Please provide all required fields correctly.');
      } else if (err?.isNetworkError || err?.status === 0) {
        setErrorMsg('Unable to reach the server. Please verify the server is running.');
      } else {
        setErrorMsg(serverMsg || 'Authentication failed. Please check your credentials.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = async (role: 'creator' | 'admin' | 'free') => {
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      await switchDemoRole(role);
      const roleLabel = role === 'creator' ? 'Creator Pro' : role === 'admin' ? 'Administrator' : 'Free Tier';
      success(`Signed in as ${roleLabel}!`);
      if (onSuccess) {
        onSuccess();
      } else {
        onNavigate('dashboard');
      }
    } catch (err: any) {
      toastError('Could not switch demo role');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      await loginWithGoogle('google.creator@contentflow.ai', 'Creator (Google)', 'https://api.dicebear.com/7.x/avataaars/svg?seed=GoogleUser');
      success('Signed in with Google!');
      if (onSuccess) {
        onSuccess();
      } else {
        onNavigate('dashboard');
      }
    } catch (err: any) {
      setErrorMsg('Google authentication failed. Please try standard sign-in.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="login-page-root" className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-indigo-500 selection:text-white">
      {/* Top Bar Navigation */}
      <header className="w-full bg-white border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <button
            id="btn-login-back-app"
            type="button"
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </button>
          <div className="hidden sm:block">
            <Logo size="sm" showTagline={false} />
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="text-xs text-slate-500 hidden sm:inline">
            {mode === 'login' ? "Don't have an account?" : "Already have an account?"}
          </span>
          <button
            id="btn-toggle-auth-mode-header"
            type="button"
            onClick={() => {
              setErrorMsg('');
              setSuccessMsg('');
              setMode(mode === 'login' ? 'signup' : 'login');
            }}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3.5 py-1.5 rounded-xl border border-indigo-100 transition-colors cursor-pointer"
          >
            {mode === 'login' ? 'Sign Up' : 'Sign In'}
          </button>
        </div>
      </header>

      {/* Centered Modern SaaS Card Layout */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md bg-white border border-slate-200/90 rounded-2xl shadow-xl shadow-slate-200/50 p-6 sm:p-8 relative">
          {/* Brand Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full text-indigo-700 text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>CONTENTFLOW AI</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {mode === 'login' && 'Welcome back'}
              {mode === 'signup' && 'Create your account'}
              {mode === 'forgot' && 'Reset your password'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
              {mode === 'login' && 'Sign in to continue creating amazing content with AI.'}
              {mode === 'signup' && 'Join thousands of creators generating viral hooks, reels & captions.'}
              {mode === 'forgot' && 'Enter your registered email address to receive reset instructions.'}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          {mode !== 'forgot' && (
            <div className="flex border border-slate-200 bg-slate-100/80 p-1 rounded-xl mb-5">
              <button
                id="tab-login-signin"
                type="button"
                onClick={() => { setMode('login'); setErrorMsg(''); setSuccessMsg(''); }}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  mode === 'login' 
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60 font-bold' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Sign In
              </button>
              <button
                id="tab-login-signup"
                type="button"
                onClick={() => { setMode('signup'); setErrorMsg(''); setSuccessMsg(''); }}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  mode === 'signup' 
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60 font-bold' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Sign Up
              </button>
            </div>
          )}

          {/* Validation & Status Alerts */}
          {errorMsg && (
            <div id="login-error-alert" className="p-3 mb-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium leading-relaxed">{errorMsg}</div>
            </div>
          )}

          {successMsg && (
            <div id="login-success-alert" className="p-3 mb-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium leading-relaxed">{successMsg}</div>
            </div>
          )}

          {/* Interactive Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="login-input-name"
                    type="text"
                    placeholder="Alex Rivera"
                    value={name}
                    onChange={(e) => { setName(e.target.value); if (errorMsg) setErrorMsg(''); }}
                    className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all placeholder:text-slate-400 text-slate-900 font-medium"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="login-input-email"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); if (errorMsg) setErrorMsg(''); }}
                  className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all placeholder:text-slate-400 text-slate-900 font-medium"
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700">Password</label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      id="link-forgot-password"
                      onClick={() => { setMode('forgot'); setErrorMsg(''); setSuccessMsg(''); }}
                      className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="login-input-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); if (errorMsg) setErrorMsg(''); }}
                    className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all placeholder:text-slate-400 text-slate-900 font-medium"
                  />
                  <button
                    type="button"
                    id="btn-toggle-password-visibility"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="login-input-confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); if (errorMsg) setErrorMsg(''); }}
                    className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all placeholder:text-slate-400 text-slate-900 font-medium"
                  />
                </div>
              </div>
            )}

            {mode === 'login' && (
              <div className="flex items-center justify-between pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 accent-indigo-600 cursor-pointer"
                  />
                  <span className="text-xs text-slate-600 font-medium">Remember this device</span>
                </label>
              </div>
            )}

            <button
              id="btn-login-submit"
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 sm:py-3 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing in…</span>
                </>
              ) : (
                <>
                  <span>
                    {mode === 'login' && 'Sign In'}
                    {mode === 'signup' && 'Create Account'}
                    {mode === 'forgot' && 'Send Reset Link'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Social Sign In */}
          {mode !== 'forgot' && (
            <div className="mt-5">
              <div className="relative flex items-center justify-center my-4">
                <div className="border-t border-slate-200 w-full" />
                <span className="bg-white px-3 text-[11px] font-medium text-slate-400 uppercase tracking-wider absolute">
                  Or
                </span>
              </div>

              <button
                type="button"
                id="btn-login-google"
                onClick={handleGoogleLogin}
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 flex items-center justify-center gap-2.5 shadow-2xs hover:shadow-xs transition-all cursor-pointer disabled:opacity-60"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Continue with Google</span>
              </button>
            </div>
          )}

          {/* Mode Switch Footer */}
          <div className="text-center mt-5 text-xs text-slate-500">
            {mode === 'login' ? (
              <p>
                Don't have an account?{' '}
                <button
                  type="button"
                  id="link-switch-signup"
                  onClick={() => { setMode('signup'); setErrorMsg(''); setSuccessMsg(''); }}
                  className="text-indigo-600 hover:text-indigo-700 font-semibold hover:underline cursor-pointer"
                >
                  Sign up
                </button>
              </p>
            ) : mode === 'signup' ? (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  id="link-switch-signin"
                  onClick={() => { setMode('login'); setErrorMsg(''); setSuccessMsg(''); }}
                  className="text-indigo-600 hover:text-indigo-700 font-semibold hover:underline cursor-pointer"
                >
                  Sign in
                </button>
              </p>
            ) : (
              <p>
                Remembered your password?{' '}
                <button
                  type="button"
                  id="link-switch-back-login"
                  onClick={() => { setMode('login'); setErrorMsg(''); setSuccessMsg(''); }}
                  className="text-indigo-600 hover:text-indigo-700 font-semibold hover:underline cursor-pointer"
                >
                  Back to sign in
                </button>
              </p>
            )}
          </div>

          {/* Quick 1-Click Demo Profiles */}
          <div className="mt-6 pt-4 border-t border-slate-100 bg-slate-50 -mx-6 -mb-6 sm:-mx-8 sm:-mb-8 p-4 sm:p-5 rounded-b-2xl">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Instant 1-Click Demo Accounts
              </span>
              <span className="text-[10px] text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                Ready to test
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                id="btn-demo-creator-pro"
                onClick={() => handleDemoLogin('creator')}
                disabled={isSubmitting}
                className="p-2.5 bg-white hover:bg-indigo-50/50 border border-slate-200 hover:border-indigo-300 rounded-xl text-center transition-all group shadow-2xs cursor-pointer"
              >
                <div className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 flex items-center justify-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <span>Creator</span>
                </div>
                <span className="text-[10px] text-slate-400 block mt-0.5 font-medium">100 Credits</span>
              </button>

              <button
                type="button"
                id="btn-demo-free-user"
                onClick={() => handleDemoLogin('free')}
                disabled={isSubmitting}
                className="p-2.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-center transition-all group shadow-2xs cursor-pointer"
              >
                <div className="text-xs font-bold text-slate-800 flex items-center justify-center gap-1">
                  <UserIcon className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>Free Tier</span>
                </div>
                <span className="text-[10px] text-slate-400 block mt-0.5 font-medium">10 Credits</span>
              </button>

              <button
                type="button"
                id="btn-demo-admin"
                onClick={() => handleDemoLogin('admin')}
                disabled={isSubmitting}
                className="p-2.5 bg-white hover:bg-purple-50 border border-purple-200 rounded-xl text-center transition-all group shadow-2xs cursor-pointer"
              >
                <div className="text-xs font-bold text-purple-700 flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                  <span>Admin</span>
                </div>
                <span className="text-[10px] text-purple-400 block mt-0.5 font-medium">Full Control</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
