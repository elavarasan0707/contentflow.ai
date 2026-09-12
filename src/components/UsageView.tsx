import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Sparkles, 
  Zap, 
  Check, 
  Shield, 
  ArrowRight, 
  Calendar, 
  CreditCard,
  Clock,
  History,
  CheckCircle2,
  Film,
  Flame,
  MessageSquareQuote,
  Youtube,
  SearchCode,
  FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { SubscriptionTier, UsageLog } from '../types';

export const UsageView: React.FC = () => {
  const { user, stats, upgradeTier, openUpgradeModal } = useAuth();
  const [logs, setLogs] = useState<UsageLog[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  const creditsRemaining = stats?.credits_remaining ?? Math.max(0, (user?.credits_limit || 10) - (user?.credits_used || 0));
  const creditsLimit = stats?.credits_limit ?? (user?.credits_limit || 10);
  const creditsUsed = stats?.credits_used ?? (user?.credits_used || 0);
  const creditsPercent = Math.min(100, Math.round((creditsRemaining / creditsLimit) * 100));

  useEffect(() => {
    const fetchUsage = async () => {
      setIsLoadingLogs(true);
      try {
        const response = await api.getUsage();
        if (response) {
          setLogs(response.history || response.logs || []);
        }
      } catch (err) {
        console.error('Failed to load usage history:', err);
      } finally {
        setIsLoadingLogs(false);
      }
    };
    fetchUsage();
  }, [stats?.credits_used]);

  const getTypeIcon = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('reel')) return <Film className="w-3.5 h-3.5 text-pink-600" />;
    if (t.includes('hook')) return <Flame className="w-3.5 h-3.5 text-amber-600" />;
    if (t.includes('caption')) return <MessageSquareQuote className="w-3.5 h-3.5 text-emerald-600" />;
    if (t.includes('youtube')) return <Youtube className="w-3.5 h-3.5 text-red-600" />;
    if (t.includes('seo')) return <SearchCode className="w-3.5 h-3.5 text-indigo-600" />;
    return <FileText className="w-3.5 h-3.5 text-slate-600" />;
  };

  const plans = [
    {
      id: 'free' as SubscriptionTier,
      name: 'Free Starter',
      price: '₹0',
      period: '/month',
      credits: 10,
      features: [
        '10 AI Generations every month',
        'Basic Reel, Hook & Caption Generators',
        'Multi-language (EN, Tamil, Thanglish)',
        'Content Library (up to 20 items)'
      ]
    },
    {
      id: 'pro' as SubscriptionTier,
      name: 'Pro Creator',
      price: '₹499',
      period: '/month',
      popular: true,
      credits: 100,
      features: [
        '100 High-Speed AI Generations / mo',
        'All 6 Dedicated Generators (SEO, YouTube, Reels)',
        'Custom Brand Voice Persona Studio',
        '1-Click AI Transformations (Viral, Shorten, Emotional)',
        'Unlimited Content Vault',
        'Markdown & TXT Exports'
      ]
    },
    {
      id: 'agency' as SubscriptionTier,
      name: 'Agency & Scale',
      price: '₹1,499',
      period: '/month',
      credits: 500,
      features: [
        '500 High-Speed AI Generations / mo',
        'Multiple Brand Voice Profiles',
        'Batch Content Workflows',
        'Priority Gemini 3.7 Engine Queue',
        'Dedicated VIP Creator Support'
      ]
    }
  ];

  return (
    <div id="usage-view-root" className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-200">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full text-indigo-700 text-xs font-bold uppercase tracking-wider mb-2">
          <BarChart3 className="w-3.5 h-3.5" /> Billing & Usage
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Credit Usage & Subscription Plans
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Monitor your monthly AI quota and upgrade anytime for uninterrupted high-speed content generation.
        </p>
      </div>

      {/* Usage Meter Card */}
      <div id="usage-summary-card" className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Current Subscription</span>
              <span className="text-xs font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                {user?.tier || 'Free'} Plan
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {creditsRemaining} <span className="text-base font-normal text-slate-500">of {creditsLimit} generations remaining</span>
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="btn-usage-upgrade"
              onClick={openUpgradeModal}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Zap className="w-4 h-4 text-indigo-200" />
              <span>Upgrade Quota</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
          <div className="p-4 bg-slate-50 border border-slate-200/70 rounded-2xl">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Credits Used</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">{creditsUsed}</div>
            <span className="text-[11px] text-slate-400">this billing cycle</span>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200/70 rounded-2xl">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Credits Remaining</span>
            <div className="text-2xl font-extrabold text-indigo-600 mt-1">{creditsRemaining}</div>
            <span className="text-[11px] text-slate-400">out of {creditsLimit} total</span>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200/70 rounded-2xl">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Monthly Limit</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">{creditsLimit}</div>
            <span className="text-[11px] text-emerald-600 font-semibold">Resets on 1st of month</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-2">
            <span>Quota Used: {creditsUsed} / {creditsLimit} ({Math.min(100, Math.round((creditsUsed / creditsLimit) * 100))}%)</span>
            <span>{creditsRemaining} Credits Remaining</span>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${creditsRemaining < 3 ? 'bg-amber-500' : 'bg-indigo-600'}`}
              style={{ width: `${Math.min(100, Math.max(0, (creditsUsed / creditsLimit) * 100))}%` }}
            />
          </div>
        </div>
      </div>

      {/* Generation History Table */}
      <div id="usage-history-section" className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-2xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Generation History & Log</h3>
              <p className="text-xs text-slate-500">Record of content created and credits consumed.</p>
            </div>
          </div>
          <span className="text-xs font-semibold text-slate-400">
            {logs.length} {logs.length === 1 ? 'entry' : 'entries'}
          </span>
        </div>

        <div className="mt-4 overflow-x-auto">
          {isLoadingLogs ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              Loading usage history...
            </div>
          ) : logs.length === 0 ? (
            <div className="py-12 text-center">
              <Sparkles className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No generation history yet</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Generate your first reel script, viral hooks, or captions to see your usage activity logged here.
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="pb-3 pr-4">Date & Time</th>
                  <th className="pb-3 px-4">Type</th>
                  <th className="pb-3 px-4">Topic / Prompt</th>
                  <th className="pb-3 px-4">Language</th>
                  <th className="pb-3 px-4 text-center">Credits</th>
                  <th className="pb-3 pl-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {logs.map((log) => {
                  const dateStr = log.created_at 
                    ? new Date(log.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                    : 'Recent';

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 pr-4 text-slate-500 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{dateStr}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-[11px] font-semibold">
                          {getTypeIcon(log.type)}
                          <span className="capitalize">{log.type.replace('-', ' ')}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 max-w-xs truncate text-slate-800">
                        {log.prompt || 'Generated content'}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap capitalize text-slate-500">
                        {log.language || 'English'}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap font-bold text-indigo-600">
                        -{log.credits_consumed || 1}
                      </td>
                      <td className="py-3 pl-4 text-right whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Success</span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Plan Breakdown Cards */}
      <div>
        <h3 className="text-xl font-extrabold text-slate-900 mb-2">Available Subscription Plans</h3>
        <p className="text-xs text-slate-500 mb-6">Choose a plan tailored to your content output volume.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map(plan => {
            const isCurrent = user?.tier === plan.id;

            return (
              <div
                key={plan.id}
                className={`p-6 rounded-3xl border flex flex-col justify-between transition-all ${
                  plan.popular
                    ? 'bg-white border-2 border-indigo-600 shadow-xl shadow-indigo-500/10'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-slate-900">{plan.name}</h3>
                    {isCurrent && (
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md">
                        Current
                      </span>
                    )}
                  </div>

                  <div className="my-4">
                    <span className="text-3xl font-extrabold text-slate-900">{plan.price}</span>
                    <span className="text-xs text-slate-400 font-medium">{plan.period}</span>
                    <span className="text-xs font-bold text-indigo-600 block mt-1">
                      {plan.credits} AI generations / month
                    </span>
                  </div>

                  <div className="space-y-2 mb-6">
                    {plan.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                        <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isCurrent}
                  onClick={() => upgradeTier(plan.id)}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
                    isCurrent
                      ? 'bg-slate-100 text-slate-400 cursor-default'
                      : plan.popular
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20'
                        : 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-300'
                  }`}
                >
                  {isCurrent ? 'Active Plan' : `Switch to ${plan.name}`}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
