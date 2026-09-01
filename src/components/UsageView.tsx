import React from 'react';
import { 
  BarChart3, 
  Sparkles, 
  Zap, 
  Check, 
  Shield, 
  ArrowRight, 
  Calendar, 
  CreditCard 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SubscriptionTier } from '../types';

export const UsageView: React.FC = () => {
  const { user, stats, upgradeTier, openUpgradeModal } = useAuth();

  const creditsRemaining = stats?.credits_remaining ?? Math.max(0, (user?.credits_limit || 10) - (user?.credits_used || 0));
  const creditsLimit = user?.credits_limit || 10;
  const creditsUsed = user?.credits_used || 0;
  const creditsPercent = Math.min(100, Math.round((creditsRemaining / creditsLimit) * 100));

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
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Current Subscription</span>
              <span className="text-xs font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                {user?.tier || 'Free'} Plan
              </span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900">
              {creditsRemaining} <span className="text-base font-normal text-slate-500">of {creditsLimit} generations remaining</span>
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={openUpgradeModal}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-500/20 transition-all flex items-center gap-1.5"
            >
              <Zap className="w-4 h-4" />
              <span>Upgrade Plan</span>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-2">
            <span>Quota Used: {creditsUsed} ({Math.round((creditsUsed / creditsLimit) * 100)}%)</span>
            <span>Monthly Reset in 18 days</span>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all ${creditsRemaining < 3 ? 'bg-amber-500' : 'bg-indigo-600'}`}
              style={{ width: `${(creditsUsed / creditsLimit) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Plan Breakdown Cards */}
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
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 ${
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
  );
};
