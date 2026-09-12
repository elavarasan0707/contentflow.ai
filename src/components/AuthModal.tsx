import React, { useState } from 'react';
import { X, Mail, Lock, User as UserIcon, ArrowRight, Sparkles, ShieldCheck, Loader2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Logo } from './Logo';

export const AuthModal: React.FC = () => {
  const { 
    isAuthModalOpen, 
    closeAuthModal, 
    authModalTab, 
    login, 
    register, 
    forgotPassword, 
    switchDemoRole 
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'login' | 'signup' | 'forgot'>(authModalTab || 'login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    const cleanEmail = email.trim();

    try {
      if (activeTab === 'signup') {
        if (password !== confirmPassword) {
          setErrorMsg('Passwords do not match');
          setIsSubmitting(false);
          return;
        }
        await register(name.trim(), cleanEmail, password, confirmPassword);
      } else if (activeTab === 'login') {
        await login(cleanEmail, password);
      } else if (activeTab === 'forgot') {
        await forgotPassword(cleanEmail);
        setActiveTab('login');
      }
    } catch (err: any) {
      const serverMsg = err?.data?.error || err?.message;
      if (err?.status === 401 || serverMsg?.toLowerCase().includes('invalid') || serverMsg?.toLowerCase().includes('incorrect')) {
        setErrorMsg('Invalid email or password. Please check your credentials.');
      } else {
        setErrorMsg(serverMsg || 'Action failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoClick = async (role: 'creator' | 'admin' | 'free') => {
    setIsSubmitting(true);
    try {
      await switchDemoRole(role);
      closeAuthModal();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="auth-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        id="auth-modal-card" 
        className="relative w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden font-sans animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Close Button */}
        <button
          id="btn-close-auth-modal"
          type="button"
          aria-label="Close"
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors z-10 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="p-6 pb-4 text-center border-b border-slate-100">
          <div className="flex justify-center mb-3">
            <Logo size="md" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            {activeTab === 'signup' && 'Create your ContentFlow account'}
            {activeTab === 'login' && 'Welcome back to ContentFlow AI'}
            {activeTab === 'forgot' && 'Reset your password'}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {activeTab === 'signup' && 'Join 10,000+ creators generating viral hooks & high-converting scripts'}
            {activeTab === 'login' && 'Enter your credentials or test with 1-click demo accounts'}
            {activeTab === 'forgot' && 'Enter your email to receive recovery instructions'}
          </p>
        </div>

        {/* Tabs */}
        {activeTab !== 'forgot' && (
          <div className="flex border border-slate-200 bg-slate-100/80 p-1 mx-6 mt-4 rounded-xl">
            <button
              id="tab-auth-login"
              type="button"
              onClick={() => { setActiveTab('login'); setErrorMsg(''); }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${activeTab === 'login' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Sign In
            </button>
            <button
              id="tab-auth-signup"
              type="button"
              onClick={() => { setActiveTab('signup'); setErrorMsg(''); }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${activeTab === 'signup' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Sign Up
            </button>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-3.5">
          {errorMsg && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
              {errorMsg}
            </div>
          )}

          {activeTab === 'signup' && (
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="auth-signup-name"
                  type="text"
                  required
                  placeholder="e.g. Sarah Jenkins"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-none transition-all placeholder:text-slate-400"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="auth-email-input"
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-none transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          {activeTab !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-slate-700">Password</label>
                {activeTab === 'login' && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('forgot')}
                    className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 hover:underline cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="auth-password-input"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-none transition-all placeholder:text-slate-400"
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'signup' && (
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="auth-confirm-password-input"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-none transition-all placeholder:text-slate-400"
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          <button
            id="btn-auth-submit"
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-xs rounded-xl shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>
                  {activeTab === 'signup' && 'Create Free Account'}
                  {activeTab === 'login' && 'Sign In to Dashboard'}
                  {activeTab === 'forgot' && 'Send Reset Link'}
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Logins for Instant Testing */}
        <div className="px-6 pb-6 pt-2 border-t border-slate-100 bg-slate-50/70">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center mb-2.5">
            Instant 1-Click Demo Login
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleDemoClick('creator')}
              disabled={isSubmitting}
              className="px-2 py-1.5 bg-white hover:bg-indigo-50/50 border border-slate-200 hover:border-indigo-300 rounded-xl text-center transition-all group cursor-pointer shadow-2xs"
            >
              <div className="text-[11px] font-bold text-slate-800 group-hover:text-indigo-600 flex items-center justify-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-500" />
                Creator Pro
              </div>
              <span className="text-[9px] text-slate-400 block font-medium">100 Credits</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoClick('free')}
              disabled={isSubmitting}
              className="px-2 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-center transition-all group cursor-pointer shadow-2xs"
            >
              <div className="text-[11px] font-bold text-slate-800 flex items-center justify-center gap-1">
                <UserIcon className="w-3 h-3 text-slate-500" />
                Free Tier
              </div>
              <span className="text-[9px] text-slate-400 block font-medium">10 Credits</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoClick('admin')}
              disabled={isSubmitting}
              className="px-2 py-1.5 bg-white hover:bg-purple-50 border border-purple-200 rounded-xl text-center transition-all group cursor-pointer shadow-2xs"
            >
              <div className="text-[11px] font-bold text-purple-700 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3 h-3 text-purple-600" />
                Admin
              </div>
              <span className="text-[9px] text-purple-400 block font-medium">Full Access</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
