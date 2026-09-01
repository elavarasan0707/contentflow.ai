import React, { useState } from 'react';
import { 
  Mail, 
  Lock, 
  User as UserIcon, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Loader2, 
  Check, 
  Eye, 
  EyeOff, 
  ArrowLeft,
  Flame,
  Film,
  Star,
  CheckCircle2,
  Globe,
  Sliders
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
  const { login, register, forgotPassword, switchDemoRole } = useAuth();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);

    try {
      if (mode === 'signup') {
        if (!name.trim()) {
          setErrorMsg('Please enter your full name');
          setIsSubmitting(false);
          return;
        }
        if (password.length < 6) {
          setErrorMsg('Password must be at least 6 characters');
          setIsSubmitting(false);
          return;
        }
        if (password !== confirmPassword) {
          setErrorMsg('Passwords do not match');
          setIsSubmitting(false);
          return;
        }
        await register(name, email, password, confirmPassword);
        success('Account created successfully! Welcome to ContentFlow AI.');
        if (onSuccess) {
          onSuccess();
        } else {
          onNavigate('dashboard');
        }
      } else if (mode === 'login') {
        await login(email, password);
        success('Signed in successfully! Welcome back.');
        if (onSuccess) {
          onSuccess();
        } else {
          onNavigate('dashboard');
        }
      } else if (mode === 'forgot') {
        if (!email.trim()) {
          setErrorMsg('Please enter your email address');
          setIsSubmitting(false);
          return;
        }
        await forgotPassword(email);
        setSuccessMsg('Password reset instructions sent to your email.');
        success('Password reset link dispatched.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please check your credentials.');
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

  const handleSocialMockLogin = (provider: string) => {
    info(`Connecting to ${provider}...`);
    setTimeout(() => {
      handleDemoLogin('creator');
    }, 400);
  };

  return (
    <div id="login-page-root" className="min-h-screen bg-slate-50 flex flex-col font-['Inter',sans-serif] text-slate-900 selection:bg-indigo-500 selection:text-white">
      {/* Top Bar Navigation */}
      <header className="w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
        <div className="flex items-center gap-4">
          <button
            id="btn-login-back-app"
            type="button"
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
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
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100/80 px-3.5 py-1.5 rounded-xl border border-indigo-100 transition-colors cursor-pointer"
          >
            {mode === 'login' ? 'Create Account' : 'Sign In'}
          </button>
        </div>
      </header>

      {/* Main Split Layout */}
      <main className="flex-1 flex flex-col lg:flex-row max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 gap-8 items-center justify-center">
        {/* Left Side: Auth Form Card */}
        <div className="w-full max-w-md bg-white border border-slate-200/90 rounded-2xl shadow-xl p-6 sm:p-8 relative overflow-hidden">
          <div className="mb-6">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 border border-indigo-100 rounded-full text-indigo-700 text-[11px] font-semibold tracking-wide mb-2.5">
              <Sparkles className="w-3 h-3 text-indigo-600" />
              <span>AI Content Studio</span>
            </div>
            
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {mode === 'login' && 'Sign in to ContentFlow'}
              {mode === 'signup' && 'Create your free account'}
              {mode === 'forgot' && 'Reset your password'}
            </h1>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              {mode === 'login' && 'Enter your account details or choose an instant 1-click test account below.'}
              {mode === 'signup' && 'Join 10,000+ creators generating viral hooks, reel scripts, and captions in seconds.'}
              {mode === 'forgot' && 'Enter your registered email address to receive password recovery instructions.'}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          {mode !== 'forgot' && (
            <div className="flex border border-slate-200 bg-slate-100/80 p-1 rounded-xl mb-5">
              <button
                id="tab-login-signin"
                type="button"
                onClick={() => { setMode('login'); setErrorMsg(''); setSuccessMsg(''); }}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  mode === 'login' 
                    ? 'bg-white text-indigo-600 shadow-2xs' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Sign In
              </button>
              <button
                id="tab-login-signup"
                type="button"
                onClick={() => { setMode('signup'); setErrorMsg(''); setSuccessMsg(''); }}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  mode === 'signup' 
                    ? 'bg-white text-indigo-600 shadow-2xs' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Create Account
              </button>
            </div>
          )}

          {/* Feedback alerts */}
          {errorMsg && (
            <div className="p-3 mb-4 bg-rose-50 border border-rose-200/90 text-rose-700 text-xs rounded-xl flex items-start gap-2 animate-in fade-in">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
              <div className="flex-1 font-medium">{errorMsg}</div>
            </div>
          )}

          {successMsg && (
            <div className="p-3 mb-4 bg-emerald-50 border border-emerald-200/90 text-emerald-700 text-xs rounded-xl flex items-start gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{successMsg}</div>
            </div>
          )}

          {/* Interactive Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="login-input-name"
                    type="text"
                    required
                    placeholder="e.g. Alex Morgan"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-none transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="login-input-email"
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-none transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-slate-700">Password</label>
                  {mode === 'login' && (
                    <button
                      type="button"
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
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-none transition-all placeholder:text-slate-400"
                  />
                  <button
                    type="button"
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
                <label className="block text-xs font-medium text-slate-700 mb-1.5">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="login-input-confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-none transition-all placeholder:text-slate-400"
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
                    className="w-3.5 h-3.5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 accent-indigo-600 cursor-pointer"
                  />
                  <span className="text-xs text-slate-600 font-medium">Remember this device</span>
                </label>
              </div>
            )}

            <button
              id="btn-login-submit"
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-xs rounded-xl shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>
                    {mode === 'login' && 'Sign in to Account'}
                    {mode === 'signup' && 'Create Free Account'}
                    {mode === 'forgot' && 'Send Reset Instructions'}
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
                  Or continue with
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleSocialMockLogin('Google')}
                  className="w-full py-2 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Google</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSocialMockLogin('GitHub')}
                  className="w-full py-2 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4 fill-slate-800" viewBox="0 0 24 24">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                  <span>GitHub</span>
                </button>
              </div>
            </div>
          )}

          {/* Quick 1-Click Demo Profiles */}
          <div className="mt-6 pt-4 border-t border-slate-100 bg-slate-50/80 -mx-6 -mb-6 sm:-mx-8 sm:-mb-8 p-4 sm:p-6 rounded-b-2xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Instant 1-Click Demo Accounts
              </span>
              <span className="text-[10px] text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                No password required
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                id="btn-demo-creator-pro"
                onClick={() => handleDemoLogin('creator')}
                disabled={isSubmitting}
                className="p-2.5 bg-white hover:bg-indigo-50/50 border border-slate-200 hover:border-indigo-300 rounded-xl text-center transition-all group shadow-2xs hover:shadow-sm cursor-pointer"
              >
                <div className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 flex items-center justify-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <span>Creator</span>
                </div>
                <span className="text-[10px] text-slate-400 group-hover:text-indigo-400 block mt-0.5 font-medium">100 Credits</span>
              </button>

              <button
                type="button"
                id="btn-demo-free-user"
                onClick={() => handleDemoLogin('free')}
                disabled={isSubmitting}
                className="p-2.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-center transition-all group shadow-2xs hover:shadow-sm cursor-pointer"
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
                className="p-2.5 bg-white hover:bg-purple-50 border border-purple-200/80 rounded-xl text-center transition-all group shadow-2xs hover:shadow-sm cursor-pointer"
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

        {/* Right Side: Visual Feature Showcase & Testimonial */}
        <div className="hidden lg:flex flex-col justify-between w-full max-w-lg p-8 bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 rounded-2xl text-white shadow-xl relative overflow-hidden min-h-[560px]">
          {/* Background Ambient Glows */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl" />

          {/* Top Section */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/15 rounded-full text-indigo-200 text-xs font-bold tracking-wide uppercase mb-6 backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Built for High-Growth Creators</span>
            </div>

            <h2 className="text-3xl font-extrabold tracking-tight leading-snug mb-3">
              Generate content that converts audiences into customers.
            </h2>
            <p className="text-xs text-indigo-200/80 leading-relaxed max-w-md">
              From viral 3-second hooks to fully timed Reel scripts and colloquial Thanglish social posts, power your entire distribution engine with Google Gemini 3.1 Flash Lite.
            </p>
          </div>

          {/* Center Showcase Interactive Cards */}
          <div className="relative z-10 space-y-3 my-6">
            <div className="p-3.5 bg-white/10 border border-white/15 rounded-2xl backdrop-blur-md flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/30 border border-indigo-400/40 flex items-center justify-center text-indigo-300 shrink-0">
                <Flame className="w-4.5 h-4.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs font-bold text-white">10 Psychological Hooks</span>
                  <span className="text-[10px] text-amber-300 font-semibold bg-amber-500/20 px-1.5 py-0.2 rounded">Viral</span>
                </div>
                <p className="text-[11px] text-indigo-200 truncate">Curiosity gaps & controversy angles tailored to your topic</p>
              </div>
            </div>

            <div className="p-3.5 bg-white/10 border border-white/15 rounded-2xl backdrop-blur-md flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-500/30 border border-purple-400/40 flex items-center justify-center text-purple-300 shrink-0">
                <Globe className="w-4.5 h-4.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs font-bold text-white">Tamil & Spoken Thanglish</span>
                  <span className="text-[10px] text-emerald-300 font-semibold bg-emerald-500/20 px-1.5 py-0.2 rounded">Regional</span>
                </div>
                <p className="text-[11px] text-indigo-200 truncate">Natural slang that sounds like real creator speech</p>
              </div>
            </div>

            <div className="p-3.5 bg-white/10 border border-white/15 rounded-2xl backdrop-blur-md flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/30 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shrink-0">
                <Sliders className="w-4.5 h-4.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs font-bold text-white">Custom Brand Voice</span>
                  <span className="text-[10px] text-indigo-300 font-semibold bg-indigo-500/20 px-1.5 py-0.2 rounded">Pro</span>
                </div>
                <p className="text-[11px] text-indigo-200 truncate">Preserves your unique tone and vocabulary across every post</p>
              </div>
            </div>
          </div>

          {/* Bottom Testimonial Banner */}
          <div className="relative z-10 pt-4 border-t border-white/10">
            <div className="flex items-center gap-1 text-amber-400 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
              ))}
              <span className="text-[11px] text-indigo-200 font-semibold ml-1.5">4.9/5 from 1,200+ creators</span>
            </div>
            <p className="text-xs text-slate-300 italic leading-snug">
              "ContentFlow cut our weekly scriptwriting time from 10 hours to 45 minutes. The hook generation alone doubled our Instagram reach."
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};
