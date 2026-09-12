import React from 'react';
import { 
  LayoutDashboard, 
  Sparkles, 
  Film, 
  Flame, 
  MessageSquareQuote, 
  Youtube, 
  SearchCode, 
  Lightbulb,
  FolderHeart, 
  Sliders, 
  LayoutTemplate, 
  BarChart3, 
  Settings, 
  ShieldCheck, 
  ChevronLeft, 
  ChevronRight,
  LogOut,
  Zap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Logo } from './Logo';

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  onNavigate,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile
}) => {
  const { user, stats, openUpgradeModal, logout } = useAuth();

  const creditsRemaining = stats?.credits_remaining ?? Math.max(0, (user?.credits_limit || 10) - (user?.credits_used || 0));
  const creditsLimit = stats?.credits_limit ?? (user?.credits_limit || 10);
  const creditPercent = Math.min(100, Math.max(0, Math.round((creditsRemaining / creditsLimit) * 100)));
  const planName = (user?.tier || 'free').toUpperCase() + ' PLAN';

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, category: 'main' },
    { id: 'generate', label: 'Generate Content', icon: Sparkles, badge: 'AI', category: 'tools' },
    { id: 'reels', label: 'Reels Script', icon: Film, category: 'tools' },
    { id: 'hooks', label: 'Viral Hooks', icon: Flame, badge: 'Hot', category: 'tools' },
    { id: 'captions', label: 'Captions', icon: MessageSquareQuote, category: 'tools' },
    { id: 'youtube', label: 'YouTube Suite', icon: Youtube, category: 'tools' },
    { id: 'seo', label: 'SEO Content', icon: SearchCode, category: 'tools' },
    { id: 'ideas', label: 'Content Ideas', icon: Lightbulb, category: 'tools' },
    { id: 'my-content', label: 'My Content', icon: FolderHeart, category: 'manage' },
    { id: 'brand-voice', label: 'Brand Voice', icon: Sliders, category: 'manage' },
    { id: 'templates', label: 'Templates', icon: LayoutTemplate, category: 'manage' },
    { id: 'usage', label: 'Usage & Plans', icon: BarChart3, category: 'manage' },
    { id: 'settings', label: 'Settings', icon: Settings, category: 'system' },
  ];

  if (user?.role === 'admin') {
    navItems.push({ id: 'admin', label: 'Admin Panel', icon: ShieldCheck, badge: 'Admin', category: 'system' });
  }

  const handleNavClick = (pageId: string) => {
    onNavigate(pageId);
    if (isMobileOpen) {
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        id="app-sidebar"
        className={`fixed top-0 bottom-0 left-0 z-40 bg-white border-r border-slate-200/90 flex flex-col transition-all duration-300 ease-in-out
          ${isCollapsed ? 'w-20' : 'w-64'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Header / Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100">
          {!isCollapsed ? (
            <div className="cursor-pointer" onClick={() => handleNavClick('dashboard')}>
              <Logo size="md" />
            </div>
          ) : (
            <div className="w-full flex justify-center cursor-pointer" onClick={() => handleNavClick('dashboard')}>
              <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-xs shadow-md shadow-indigo-500/20">
                CF
              </div>
            </div>
          )}

          {/* Desktop Collapse Toggle */}
          <button
            type="button"
            id="btn-sidebar-collapse-toggle"
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1 custom-scrollbar">
          {/* Main Generators & Tools */}
          <div className="space-y-0.5">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activePage === item.id;

              return (
                <button
                  key={item.id}
                  id={`nav-item-${item.id}`}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  title={isCollapsed ? item.label : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all group relative
                    ${isActive 
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/25 font-bold' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/90'
                    }
                    ${isCollapsed ? 'justify-center px-0' : ''}
                  `}
                >
                  <Icon className={`w-4.5 h-4.5 shrink-0 transition-transform group-hover:scale-105 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-800'}`} />

                  {!isCollapsed && (
                    <span className="flex-1 text-left truncate tracking-tight">{item.label}</span>
                  )}

                  {!isCollapsed && item.badge && (
                    <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-md ${
                      isActive 
                        ? 'bg-white/20 text-white' 
                        : item.badge === 'Admin'
                          ? 'bg-purple-100 text-purple-700'
                          : item.badge === 'Hot'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-indigo-100 text-indigo-700'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Compact Credit Card Widget */}
        {!isCollapsed ? (
          <div id="sidebar-credit-card" className="p-3 mx-3 mb-2 bg-slate-50 border border-slate-200/90 rounded-2xl">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                {planName}
              </span>
              <span className="text-[11px] font-extrabold text-slate-900">
                {creditsRemaining}/{creditsLimit} Credits
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden mb-2.5">
              <div 
                className={`h-full rounded-full transition-all duration-300 ${creditsRemaining < 3 ? 'bg-amber-500' : 'bg-indigo-600'}`}
                style={{ width: `${creditPercent}%` }}
              />
            </div>
            <button
              id="btn-sidebar-upgrade-credits"
              type="button"
              onClick={openUpgradeModal}
              className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-[11px] font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Zap className="w-3 h-3 text-indigo-200" />
              <span>{user?.tier === 'agency' ? 'Manage Plan' : 'Get More Credits'}</span>
            </button>
          </div>
        ) : (
          <div className="px-2 mb-2 flex justify-center">
            <button
              type="button"
              onClick={openUpgradeModal}
              title={`${planName}: ${creditsRemaining}/${creditsLimit} Credits remaining`}
              className="p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl transition-colors"
            >
              <Zap className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* User Footer info */}
        <div className="p-3 border-t border-slate-100 flex items-center justify-between">
          <div className={`flex items-center gap-2.5 min-w-0 ${isCollapsed ? 'justify-center w-full' : ''}`}>
            <img
              src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'User'}`}
              alt={user?.name || 'User'}
              className="w-7 h-7 rounded-lg object-cover bg-slate-100 ring-1 ring-slate-200"
            />
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-slate-900 truncate leading-tight">
                  {user?.name || 'Creator'}
                </span>
                <span className="text-[10px] text-slate-400 truncate uppercase font-semibold">
                  {user?.tier || 'Free'} Plan
                </span>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <button
              type="button"
              onClick={logout}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
