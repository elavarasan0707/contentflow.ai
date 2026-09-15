import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Bell, 
  Sparkles, 
  ChevronDown, 
  User as UserIcon, 
  ShieldCheck, 
  LogOut, 
  Settings, 
  Sliders, 
  CreditCard,
  BarChart3,
  Menu,
  X,
  ExternalLink,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Logo } from './Logo';

interface NavbarProps {
  activePage: string;
  onNavigate: (page: string) => void;
  onToggleMobileSidebar: () => void;
  isMobileSidebarOpen: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activePage,
  onNavigate,
  onToggleMobileSidebar,
  isMobileSidebarOpen
}) => {
  const { user, stats, openUpgradeModal, logout, openAuthModal, isAuthenticated } = useAuth();
  const { copied, info } = useToast();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const creditsRemaining = stats?.credits_remaining ?? Math.max(0, (user?.credits_limit || 10) - (user?.credits_used || 0));
  const creditsLimit = stats?.credits_limit ?? (user?.credits_limit || 10);
  const creditsPercent = Math.min(100, Math.round((creditsRemaining / creditsLimit) * 100));

  const notifications = [
    { id: 1, title: 'Welcome to ContentFlow AI', time: '10m ago', text: 'You have 10 free AI generations to test viral reels, hooks & captions.' },
    { id: 2, title: 'Thanglish & Tamil Generation Active', time: '1h ago', text: 'Create colloquial spoken Tamil social posts with authentic slang.' },
    { id: 3, title: 'Pro Plan features unlocked', time: '1d ago', text: 'Brand voice customization and unlimited tone rewrites enabled.' },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    onNavigate('my-content');
    info(`Filtered content library for "${searchQuery}"`);
  };

  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
    onNavigate('dashboard');
  };

  return (
    <header id="app-top-navbar" className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 lg:px-6 py-2.5">
      <div className="flex items-center justify-between gap-3 max-w-7xl mx-auto">
        {/* Left: Mobile Toggle & Brand/Search */}
        <div className="flex items-center gap-3">
          <button
            id="btn-sidebar-mobile-toggle"
            type="button"
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Toggle Navigation"
          >
            {isMobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Quick Search */}
          <form onSubmit={handleSearchSubmit} className="relative hidden sm:block w-64 md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              id="navbar-search-input"
              type="text"
              placeholder="Search hooks, reels, topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-100/80 border border-slate-200/80 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-none transition-all placeholder:text-slate-400"
            />
          </form>
        </div>

        {/* Right: Credits, Notifications, User Profile */}
        <div className="flex items-center gap-2.5">
          {/* Credits Remaining Badge */}
          {isAuthenticated ? (
            <div 
              id="navbar-credits-badge"
              onClick={openUpgradeModal}
              className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50/70 border border-indigo-100 hover:border-indigo-200 rounded-xl cursor-pointer transition-all hover:bg-indigo-50 group"
              title="Click to manage credits or upgrade"
            >
              <div className="flex flex-col items-end">
                <span className="text-[11px] font-bold text-indigo-900">
                  {creditsRemaining} / {creditsLimit} <span className="font-normal text-indigo-700">credits</span>
                </span>
                <div className="w-16 h-1.5 bg-indigo-200/70 rounded-full overflow-hidden mt-0.5">
                  <div 
                    className={`h-full rounded-full transition-all ${creditsRemaining < 3 ? 'bg-amber-500' : 'bg-indigo-600'}`}
                    style={{ width: `${creditsPercent}%` }}
                  />
                </div>
              </div>
              <button
                type="button"
                id="btn-upgrade-pill"
                className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-2 py-0.5 rounded-md transition-colors"
              >
                <Sparkles className="w-2.5 h-2.5" />
                Upgrade
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                id="btn-navbar-signin"
                onClick={() => onNavigate('login')}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-sm cursor-pointer"
              >
                Sign In
              </button>
            </div>
          )}

          {/* Notifications Popover */}
          <div className="relative" ref={notifRef}>
            <button
              id="btn-navbar-notifications"
              type="button"
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="w-4.5 h-4.5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-600 rounded-full ring-2 ring-white" />
            </button>

            {isNotifOpen && (
              <div 
                id="navbar-notifications-panel"
                className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 z-40"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                  <h4 className="text-xs font-bold text-slate-900">Notifications</h4>
                  <span className="text-[10px] text-indigo-600 font-medium cursor-pointer" onClick={() => info('All marked as read')}>
                    Mark all read
                  </span>
                </div>
                <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
                  {notifications.map(n => (
                    <div key={n.id} className="p-2 bg-slate-50 hover:bg-slate-100/80 rounded-xl transition-colors">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-800 mb-0.5">
                        <span>{n.title}</span>
                        <span className="text-[9px] text-slate-400 font-normal">{n.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-snug">{n.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Menu with Avatar, Name, Plan Badge & Dropdown */}
          {isAuthenticated && user && (
            <div className="relative" ref={profileRef}>
              <button
                id="btn-navbar-user-profile"
                type="button"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all cursor-pointer shadow-2xs"
              >
                <img
                  src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                  alt={user.name}
                  className="w-7 h-7 rounded-lg object-cover bg-white ring-1 ring-slate-200"
                />
                <div className="hidden md:flex flex-col items-start text-left min-w-0">
                  <span className="text-xs font-bold text-slate-900 max-w-[110px] truncate leading-tight">
                    {user.name}
                  </span>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 leading-tight">
                    {user.tier || 'Free'}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
              </button>

              {isProfileOpen && (
                <div 
                  id="navbar-profile-dropdown"
                  className="absolute right-0 mt-2 w-60 bg-white border border-slate-200 rounded-2xl shadow-xl py-1.5 z-40 animate-in fade-in duration-150"
                >
                  <div className="px-3.5 py-3 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                    <div className="flex items-center gap-1.5 mt-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {user.tier || 'Free'} Plan
                      </span>
                      <span className="text-[10px] font-semibold text-slate-500">
                        {creditsRemaining}/{creditsLimit} Credits
                      </span>
                    </div>
                  </div>

                  <div className="py-1">
                    <button
                      id="dropdown-item-profile"
                      onClick={() => { onNavigate('settings'); setIsProfileOpen(false); }}
                      className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <UserIcon className="w-4 h-4 text-slate-400" />
                      <span>Profile</span>
                    </button>
                    <button
                      id="dropdown-item-usage"
                      onClick={() => { onNavigate('usage'); setIsProfileOpen(false); }}
                      className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <BarChart3 className="w-4 h-4 text-slate-400" />
                      <span>Usage & Credits</span>
                    </button>
                    <button
                      id="dropdown-item-settings"
                      onClick={() => { onNavigate('settings'); setIsProfileOpen(false); }}
                      className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <Settings className="w-4 h-4 text-slate-400" />
                      <span>Settings</span>
                    </button>
                    <button
                      id="dropdown-item-brand-voice"
                      onClick={() => { onNavigate('brand-voice'); setIsProfileOpen(false); }}
                      className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <Sliders className="w-4 h-4 text-slate-400" />
                      <span>Brand Voice Studio</span>
                    </button>
                    <button
                      id="dropdown-item-subscription"
                      onClick={() => { openUpgradeModal(); setIsProfileOpen(false); }}
                      className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <CreditCard className="w-4 h-4 text-slate-400" />
                      <span>Manage Subscription</span>
                    </button>
                    {user.role === 'admin' && (
                      <button
                        id="dropdown-item-admin"
                        onClick={() => { onNavigate('admin'); setIsProfileOpen(false); }}
                        className="w-full text-left px-3.5 py-2 text-xs font-bold text-purple-700 hover:bg-purple-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <ShieldCheck className="w-4 h-4 text-purple-600" />
                        <span>Admin Dashboard</span>
                      </button>
                    )}
                  </div>

                  <div className="border-t border-slate-100 pt-1">
                    <button
                      id="dropdown-item-logout"
                      onClick={handleLogout}
                      className="w-full text-left px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
