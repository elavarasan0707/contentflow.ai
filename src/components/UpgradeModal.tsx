import React, { useState } from 'react';
import { X, Check, Zap, Sparkles, Shield, ArrowRight, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SubscriptionTier } from '../types';

export const UpgradeModal: React.FC = () => {
  const { isUpgradeModalOpen, closeUpgradeModal, user, upgradeTier } = useAuth();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [isUpgrading, setIsUpgrading] = useState(false);

  if (!isUpgradeModalOpen) return null;

  const handleSelectTier = async (tier: SubscriptionTier) => {
    setIsUpgrading(true);
    try {
      await upgradeTier(tier);
    } finally {
      setIsUpgrading(false);
    }
  };

  const plans = [
    {
      id: 'free' as SubscriptionTier,
      name: 'Free',
      price: '₹0',
      period: '/month',
      desc: 'Perfect for getting started and exploring AI creation.',
      credits: '10 AI generations / mo',
      popular: false,
      features: [
        '10 AI generations every month',
        'Basic Hook, Reel & Caption generators',
        'Multi-language (EN, Tamil, Thanglish)',
        'Standard generation speed',
        'My Content library (up to 20 items)'
      ]
    },
    {
      id: 'pro' as SubscriptionTier,
      name: 'Pro Creator',
      price: billingCycle === 'monthly' ? '₹499' : '₹399',
      period: '/month',
      desc: 'For digital marketers, creators & ambitious freelancers.',
      credits: '100 AI generations / mo',
      popular: true,
      features: [
        '100 High-Speed AI generations / mo',
        'All Dedicated Generators (Reel, Hook, SEO, YT)',
        'Custom Brand Voice Persona Studio',
        '1-Click AI Transformations (Viral, Shorten, Emotional)',
        'Unlimited Saved Content Library',
        'Priority Gemini 3.7 Flash Engine',
        'Export to Markdown & Text'
      ]
    },
    {
      id: 'agency' as SubscriptionTier,
      name: 'Agency & Scale',
      price: billingCycle === 'monthly' ? '₹1,499' : '₹1,199',
      period: '/month',
      desc: 'For marketing agencies, power creators & business teams.',
      credits: '500 AI generations / mo',
      popular: false,
      features: [
        '500 High-Speed AI generations / mo',
        'Multiple Brand Voice Profiles',
        'Batch Content Generation Workflows',
        'Custom SEO FAQ & Outline Builder',
        'Dedicated VIP Creator Support',
        'Early Access to New Prompt Frameworks'
      ]
    }
  ];

  return (
    <div id="upgrade-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div 
        id="upgrade-modal-card" 
        className="relative w-full max-w-4xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Close Button */}
        <button
          id="btn-close-upgrade-modal"
          type="button"
          onClick={closeUpgradeModal}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="p-6 md:p-8 text-center bg-gradient-to-b from-indigo-50/50 to-white border-b border-slate-100">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Simple, Transparent Pricing
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Supercharge Your Content Creation
          </h2>
          <p className="text-xs md:text-sm text-slate-500 max-w-lg mx-auto mt-2">
            Choose the plan that fits your growth. Upgrade or change your tier anytime with instant activation.
          </p>

          {/* Billing Cycle Toggle */}
          <div className="flex items-center justify-center gap-2 mt-5">
            <span className={`text-xs font-semibold ${billingCycle === 'monthly' ? 'text-slate-900' : 'text-slate-400'}`}>
              Monthly Billing
            </span>
            <button
              type="button"
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
              className={`relative w-12 h-6 rounded-full transition-colors p-1 ${billingCycle === 'yearly' ? 'bg-indigo-600' : 'bg-slate-200'}`}
            >
              <div 
                className={`w-4 h-4 rounded-full bg-white transition-transform ${billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-0'}`} 
              />
            </button>
            <span className={`text-xs font-semibold flex items-center gap-1 ${billingCycle === 'yearly' ? 'text-slate-900' : 'text-slate-400'}`}>
              Yearly Billing
              <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.2 rounded-md">
                Save 20%
              </span>
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-5">
          {plans.map(plan => {
            const isCurrent = user?.tier === plan.id;

            return (
              <div
                key={plan.id}
                id={`pricing-card-${plan.id}`}
                className={`relative flex flex-col justify-between p-5 rounded-2xl border transition-all ${
                  plan.popular
                    ? 'border-indigo-600 shadow-xl shadow-indigo-500/10 ring-2 ring-indigo-600 bg-white'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300'
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-indigo-600 text-white text-[10px] font-extrabold uppercase tracking-wider rounded-full shadow-sm">
                    Most Popular
                  </span>
                )}

                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-slate-900">{plan.name}</h3>
                    {isCurrent && (
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md">
                        Current Plan
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1 min-h-[32px]">{plan.desc}</p>

                  <div className="mt-4 mb-4 pb-4 border-b border-slate-100">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl md:text-3xl font-extrabold text-slate-900">{plan.price}</span>
                      <span className="text-xs text-slate-400 font-medium">{plan.period}</span>
                    </div>
                    <span className="text-[11px] font-bold text-indigo-600 block mt-1">
                      {plan.credits}
                    </span>
                  </div>

                  <div className="space-y-2 mb-6">
                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                      What's included:
                    </span>
                    {plan.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                        <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  id={`btn-select-tier-${plan.id}`}
                  type="button"
                  disabled={isCurrent || isUpgrading}
                  onClick={() => handleSelectTier(plan.id)}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 ${
                    isCurrent
                      ? 'bg-slate-100 text-slate-400 cursor-default'
                      : plan.popular
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20'
                        : 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-300'
                  }`}
                >
                  {isCurrent ? (
                    'Active Plan'
                  ) : (
                    <>
                      <span>Switch to {plan.name}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Security / FAQ note */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
          <Shield className="w-4 h-4 text-emerald-600" />
          <span>Simulation Mode: Tiers update instantly in local database. No credit card required.</span>
        </div>
      </div>
    </div>
  );
};
