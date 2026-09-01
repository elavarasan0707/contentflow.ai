import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Film, 
  Flame, 
  MessageSquareQuote, 
  Youtube, 
  SearchCode, 
  Lightbulb, 
  Sliders, 
  FolderHeart, 
  Zap, 
  ArrowRight, 
  Copy, 
  Trash2, 
  Eye, 
  Clock, 
  ExternalLink,
  PlusCircle,
  BarChart2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { ContentItem } from '../types';

interface DashboardViewProps {
  onNavigate: (page: string, params?: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const { user, stats, openUpgradeModal } = useAuth();
  const { copied, success, error } = useToast();

  const [recentItems, setRecentItems] = useState<ContentItem[]>([]);
  const [isLoadingRecent, setIsLoadingRecent] = useState(true);
  const [quickTopic, setQuickTopic] = useState('');

  // Time-aware greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const loadRecentContent = async () => {
    try {
      const res = await api.getContent();
      setRecentItems(res.items.slice(0, 5));
    } catch (err) {
      console.warn('Could not load recent content', err);
    } finally {
      setIsLoadingRecent(false);
    }
  };

  useEffect(() => {
    loadRecentContent();
  }, []);

  const handleDeleteItem = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.deleteContent(id);
      setRecentItems(prev => prev.filter(item => item.id !== id));
      success('Item deleted from your content library');
    } catch (err: any) {
      error(err.message || 'Failed to delete item');
    }
  };

  const handleQuickLaunch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTopic.trim()) return;
    onNavigate('generate', { topic: quickTopic });
  };

  const creditsRemaining = stats?.credits_remaining ?? Math.max(0, (user?.credits_limit || 10) - (user?.credits_used || 0));
  const creditsLimit = user?.credits_limit || 10;
  const creditsPercent = Math.min(100, Math.round((creditsRemaining / creditsLimit) * 100));

  const quickTools = [
    {
      id: 'reels',
      title: 'Reel Script',
      desc: 'Hook-first video scripts with visual cues & speaking duration gauge.',
      icon: Film,
      badge: 'Instagram / Shorts',
      color: 'bg-indigo-50 text-indigo-600 border-indigo-100',
      tag: '60s Script'
    },
    {
      id: 'hooks',
      title: 'Viral Hooks',
      desc: '10 Psychological hook variations for maximum feed retention.',
      icon: Flame,
      badge: 'TikTok / Reels',
      color: 'bg-amber-50 text-amber-600 border-amber-100',
      tag: '10 Angles'
    },
    {
      id: 'captions',
      title: 'Captions & Tags',
      desc: 'High-converting social captions with tailored CTAs & hashtag lists.',
      icon: MessageSquareQuote,
      badge: 'Social Media',
      color: 'bg-purple-50 text-purple-600 border-purple-100',
      tag: 'Short & Long'
    },
    {
      id: 'youtube',
      title: 'YouTube Studio',
      desc: '5 CTR titles, full description with timestamps & tag list.',
      icon: Youtube,
      badge: 'YouTube SEO',
      color: 'bg-rose-50 text-rose-600 border-rose-100',
      tag: 'CTR Titles'
    },
    {
      id: 'seo',
      title: 'SEO Copywriter',
      desc: 'Rank-ready articles, meta tags, H1/H2 structures & FAQs.',
      icon: SearchCode,
      badge: 'Google Search',
      color: 'bg-blue-50 text-blue-600 border-blue-100',
      tag: 'Meta & FAQ'
    },
    {
      id: 'ideas',
      title: 'Content Ideas',
      desc: '20 High-converting content concepts & viral angles for your niche.',
      icon: Lightbulb,
      badge: 'Brainstorm',
      color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      tag: '20 Concepts'
    }
  ];

  return (
    <div id="dashboard-view-root" className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* 1. Header Greeting & Credit Metric Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 p-6 sm:p-8 rounded-3xl text-white shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/15 rounded-full text-indigo-200 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
            <span>AI Content Studio Active</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {getGreeting()}, {user?.name || 'Creator'} 👋
          </h1>
          <p className="text-xs sm:text-sm text-indigo-200/90 max-w-xl leading-relaxed">
            Turn your ideas into high-converting hooks, Reel scripts, captions, and SEO articles in seconds.
          </p>
        </div>

        {/* Credit Meter Widget */}
        <div className="bg-white/10 border border-white/15 p-4 rounded-2xl md:min-w-[240px] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-200">
              {user?.tier || 'Free'} Plan Credits
            </span>
            <span className="text-xs font-bold text-white">
              {creditsRemaining} / {creditsLimit}
            </span>
          </div>
          <div className="w-full h-2 bg-black/30 rounded-full overflow-hidden mb-3">
            <div 
              className={`h-full rounded-full transition-all ${creditsRemaining < 3 ? 'bg-amber-400' : 'bg-emerald-400'}`}
              style={{ width: `${creditsPercent}%` }}
            />
          </div>
          <button
            id="btn-dashboard-upgrade-plan"
            type="button"
            onClick={openUpgradeModal}
            className="w-full py-1.5 px-3 bg-white hover:bg-indigo-50 text-indigo-900 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Zap className="w-3.5 h-3.5 text-indigo-600" />
            <span>Get More Credits</span>
          </button>
        </div>
      </div>

      {/* 2. Fast Topic Generator Launcher */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs">
        <form onSubmit={handleQuickLaunch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Sparkles className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500" />
            <input
              id="dashboard-quick-prompt-input"
              type="text"
              placeholder="What do you want to create content about? (e.g. 5 morning habits of top founders...)"
              value={quickTopic}
              onChange={(e) => setQuickTopic(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-none"
            />
          </div>
          <button
            id="btn-dashboard-quick-generate"
            type="submit"
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 shrink-0"
          >
            <span>Launch Generator</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* 3. Quick Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div 
          onClick={() => onNavigate('my-content')}
          className="p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs hover:border-indigo-200 cursor-pointer transition-all flex items-center justify-between"
        >
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Saved Creations</span>
            <span className="text-xl font-extrabold text-slate-900 mt-1 block">
              {stats?.total_content_saved || recentItems.length} items
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <FolderHeart className="w-5 h-5" />
          </div>
        </div>

        <div 
          onClick={() => onNavigate('brand-voice')}
          className="p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs hover:border-indigo-200 cursor-pointer transition-all flex items-center justify-between"
        >
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Brand Voice Persona</span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md mt-1 inline-block">
              {stats?.has_brand_voice ? 'Active & Calibrated' : 'Default Studio'}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Sliders className="w-5 h-5" />
          </div>
        </div>

        <div 
          onClick={() => onNavigate('templates')}
          className="p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs hover:border-indigo-200 cursor-pointer transition-all flex items-center justify-between"
        >
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Prompt Templates</span>
            <span className="text-xl font-extrabold text-slate-900 mt-1 block">
              8 Ready Templates
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 4. Generator Tools Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">Dedicated AI Generators</h2>
            <p className="text-xs text-slate-500">Select a specialized workflow to start producing content</p>
          </div>
          <button
            onClick={() => onNavigate('generate')}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            <span>All Formats</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickTools.map(tool => {
            const Icon = tool.icon;
            return (
              <div
                key={tool.id}
                id={`card-tool-${tool.id}`}
                onClick={() => onNavigate(tool.id)}
                className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-2xs hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${tool.color} group-hover:scale-105 transition-transform`}>
                      <Icon className="w-4.5 h-4.5" />
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md">
                      {tool.tag}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {tool.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {tool.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-600 group-hover:text-indigo-600">
                  <span>{tool.badge}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Recent Creations Table / History */}
      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <h3 className="text-sm font-bold text-slate-900">Recent Creations</h3>
          </div>
          <button
            onClick={() => onNavigate('my-content')}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {isLoadingRecent ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading recent content...</div>
        ) : recentItems.length === 0 ? (
          <div className="p-8 text-center">
            <Sparkles className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-700">No content created yet</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Use any generator above to start filling your library</p>
            <button
              onClick={() => onNavigate('reels')}
              className="mt-3 px-4 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-2xs hover:bg-indigo-700 transition-colors inline-flex items-center gap-1.5"
            >
              <Film className="w-3.5 h-3.5" />
              <span>Create First Reel Script</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentItems.map(item => (
              <div
                key={item.id}
                onClick={() => onNavigate('my-content', { selectId: item.id })}
                className="p-4 hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-4 cursor-pointer"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.2 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {item.type}
                    </span>
                    <span className="text-[10px] text-slate-400 capitalize">{item.platform}</span>
                    <span className="text-[10px] text-slate-400">•</span>
                    <span className="text-[10px] text-slate-400 capitalize">{item.language}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 truncate">
                    {item.title || item.topic}
                  </h4>
                  <p className="text-xs text-slate-500 line-clamp-1 mt-0.5 font-mono">
                    {item.content.replace(/[#*`_]/g, '')}
                  </p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigator.clipboard.writeText(item.content);
                      copied('Content copied to clipboard');
                    }}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Copy Content"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleDeleteItem(item.id, e)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
