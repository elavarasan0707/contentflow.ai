import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  User as UserIcon, 
  Mail, 
  Lock, 
  Globe, 
  Bell, 
  Save, 
  ShieldCheck, 
  Sparkles,
  Zap,
  CreditCard,
  AtSign,
  Briefcase,
  Target,
  Smile,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const SettingsView: React.FC = () => {
  const { user, stats, updateProfile, openUpgradeModal } = useAuth();
  const { success, error, info } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [creatorName, setCreatorName] = useState(user?.creator_name || '');
  const [defaultLanguage, setDefaultLanguage] = useState(user?.preferences?.default_language || 'english');
  const [defaultTone, setDefaultTone] = useState(user?.preferences?.default_tone || 'engaging');
  const [targetAudience, setTargetAudience] = useState(user?.preferences?.target_audience || 'Entrepreneurs & Creators');
  const [niche, setNiche] = useState(user?.preferences?.niche || 'Tech & AI');
  const [defaultPlatform, setDefaultPlatform] = useState('instagram');
  const [isSaving, setIsSaving] = useState(false);

  // Security password state
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [isChangingPass, setIsChangingPass] = useState(false);

  // Keep fields synced if user object loads asynchronously
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setCreatorName(user.creator_name || '');
      if (user.preferences) {
        if (user.preferences.default_language) setDefaultLanguage(user.preferences.default_language);
        if (user.preferences.default_tone) setDefaultTone(user.preferences.default_tone);
        if (user.preferences.target_audience) setTargetAudience(user.preferences.target_audience);
        if (user.preferences.niche) setNiche(user.preferences.niche);
      }
    }
  }, [user]);

  const creditsRemaining = stats?.credits_remaining ?? Math.max(0, (user?.credits_limit || 10) - (user?.credits_used || 0));
  const creditsLimit = stats?.credits_limit ?? (user?.credits_limit || 10);
  const creditsUsed = stats?.credits_used ?? (user?.credits_used || 0);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      error('Name cannot be empty.');
      return;
    }

    setIsSaving(true);
    try {
      await updateProfile({
        name: name.trim(),
        creator_name: creatorName.trim(),
        preferences: {
          default_language: defaultLanguage,
          default_tone: defaultTone,
          target_audience: targetAudience.trim(),
          niche: niche.trim()
        }
      });
      success('Profile & preferences saved successfully!');
    } catch (err: any) {
      error(err?.message || 'Failed to save profile changes.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPass) {
      error('Please enter your current password.');
      return;
    }
    if (newPass.length < 6) {
      error('New password must be at least 6 characters.');
      return;
    }
    if (newPass !== confirmPass) {
      error('New passwords do not match.');
      return;
    }

    setIsChangingPass(true);
    setTimeout(() => {
      setCurrentPass('');
      setNewPass('');
      setConfirmPass('');
      setIsChangingPass(false);
      success('Password updated successfully!');
    }, 600);
  };

  return (
    <div id="settings-view-root" className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full text-indigo-700 text-xs font-bold uppercase tracking-wider mb-2">
          <SettingsIcon className="w-3.5 h-3.5" /> Account & Profile
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Creator Profile & Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Customize your profile details, default AI generation preferences, and subscription status.
        </p>
      </div>

      {/* Account & Subscription Card */}
      <div id="settings-subscription-card" className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div className="flex items-center gap-3.5">
            <img
              src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'Creator'}`}
              alt={user?.name || 'User Avatar'}
              className="w-14 h-14 rounded-2xl object-cover bg-slate-100 ring-2 ring-indigo-100 shadow-xs"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-slate-900">{user?.name || 'Creator'}</h2>
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {user?.tier || 'Free'} Plan
                </span>
                {user?.role === 'admin' && (
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-100 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Admin
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{user?.email}</p>
              {creatorName && (
                <p className="text-xs font-semibold text-indigo-600 mt-0.5">@{creatorName.replace('@', '')}</p>
              )}
            </div>
          </div>

          <button
            id="btn-settings-upgrade"
            type="button"
            onClick={openUpgradeModal}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer self-start sm:self-auto"
          >
            <Zap className="w-3.5 h-3.5 text-indigo-200" />
            <span>{user?.tier === 'agency' ? 'Manage Subscription' : 'Upgrade Plan'}</span>
          </button>
        </div>

        {/* Quota breakdown */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4">
          <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Credits Left</span>
            <div className="text-lg font-extrabold text-indigo-600">{creditsRemaining} / {creditsLimit}</div>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Generations Used</span>
            <div className="text-lg font-extrabold text-slate-900">{creditsUsed}</div>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl col-span-2 sm:col-span-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Plan Status</span>
            <div className="text-sm font-bold text-emerald-600 flex items-center gap-1 mt-0.5">
              <CheckCircle2 className="w-4 h-4" /> Active & Verified
            </div>
          </div>
        </div>
      </div>

      {/* Profile & Preferences Form */}
      <form onSubmit={handleSaveProfile} className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-2xs space-y-6">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
            <UserIcon className="w-4 h-4 text-indigo-600" />
            <span>Profile Information</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
              <input
                id="settings-name-input"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Name"
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
              <input
                id="settings-email-input"
                type="email"
                disabled
                value={email}
                className="w-full p-2.5 text-xs bg-slate-100/70 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
                title="Email is tied to your login account"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Creator Name / Handle</label>
              <div className="relative">
                <AtSign className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="settings-creator-name-input"
                  type="text"
                  value={creatorName}
                  onChange={(e) => setCreatorName(e.target.value)}
                  placeholder="e.g. techwithvijay or FoodieVlog"
                  className="w-full pl-8 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Primary Social Platform</label>
              <select
                id="settings-default-platform-select"
                value={defaultPlatform}
                onChange={(e) => setDefaultPlatform(e.target.value)}
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none font-medium"
              >
                <option value="instagram">Instagram (Reels, Carousels)</option>
                <option value="youtube">YouTube (Shorts, Longform)</option>
                <option value="linkedin">LinkedIn (Thought Leadership)</option>
                <option value="x">X / Twitter (Threads & Posts)</option>
              </select>
            </div>
          </div>
        </div>

        {/* AI Defaults & Content Preferences */}
        <div className="pt-2">
          <h3 className="text-sm font-extrabold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>AI Content & Generation Preferences</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Default Content Language</label>
              <select
                id="settings-default-language-select"
                value={defaultLanguage}
                onChange={(e) => setDefaultLanguage(e.target.value)}
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none font-medium"
              >
                <option value="english">🇺🇸 English</option>
                <option value="tamil">🇮🇳 Tamil (தமிழ்)</option>
                <option value="thanglish">🗣️ Thanglish (Spoken Tamil in English script)</option>
              </select>
              <p className="text-[11px] text-slate-400 mt-1">Pre-selects language across all 6 generation studios.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Default Tone of Voice</label>
              <select
                id="settings-default-tone-select"
                value={defaultTone}
                onChange={(e) => setDefaultTone(e.target.value)}
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none font-medium capitalize"
              >
                <option value="engaging">🔥 Engaging & High Energy</option>
                <option value="professional">💼 Professional & Polished</option>
                <option value="humorous">😄 Humorous & Witty</option>
                <option value="casual">☕ Casual & Friendly</option>
                <option value="authoritative">🎓 Authoritative & Insightful</option>
                <option value="storyteller">📖 Storyteller & Emotion</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Target Audience</label>
              <div className="relative">
                <Target className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="settings-target-audience-input"
                  type="text"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="e.g. Indian Millennials, Tech Founders, Gen Z Students"
                  className="w-full pl-8 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Creator Niche / Industry</label>
              <div className="relative">
                <Briefcase className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="settings-niche-input"
                  type="text"
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  placeholder="e.g. AI Tools, SaaS, Fitness, Personal Finance"
                  className="w-full pl-8 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
          <button
            id="btn-save-settings"
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-500/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Saving Changes...' : 'Save Profile & Preferences'}</span>
          </button>
        </div>
      </form>

      {/* Password & Security Section */}
      <form onSubmit={handleUpdatePassword} className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-2xs space-y-4">
        <h3 className="text-sm font-extrabold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
          <Lock className="w-4 h-4 text-slate-600" />
          <span>Security & Password</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Current Password</label>
            <input
              id="settings-current-pass-input"
              type="password"
              placeholder="••••••••"
              value={currentPass}
              onChange={(e) => setCurrentPass(e.target.value)}
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">New Password</label>
            <input
              id="settings-new-pass-input"
              type="password"
              placeholder="••••••••"
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Confirm New Password</label>
            <input
              id="settings-confirm-pass-input"
              type="password"
              placeholder="••••••••"
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            id="btn-update-password"
            type="submit"
            disabled={isChangingPass}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>{isChangingPass ? 'Updating...' : 'Update Password'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
