import React, { useState } from 'react';
import { 
  Sparkles, 
  Film, 
  Flame, 
  MessageSquareQuote, 
  Youtube, 
  SearchCode, 
  Lightbulb, 
  ArrowRight, 
  CheckCircle2, 
  Check, 
  Zap, 
  Globe, 
  Sliders, 
  Star, 
  ChevronDown, 
  Copy, 
  ShieldCheck,
  TrendingUp,
  Play
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Logo } from './Logo';

interface LandingPageProps {
  onStartCreating: () => void;
  onNavigate: (page: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartCreating,
  onNavigate
}) => {
  const { openAuthModal, openUpgradeModal, isAuthenticated } = useAuth();
  const { copied } = useToast();

  const [activePreviewTab, setActivePreviewTab] = useState<'reel' | 'hook' | 'caption' | 'thanglish'>('reel');
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  const previewExamples = {
    reel: {
      title: 'Why Small Businesses Need Digital Marketing in 2026',
      badge: 'Reel Script (60s)',
      hook: 'HOOK (0-3s):\n"If you are still waiting for walk-in customers in 2026, you are quietly letting your competitors steal 80% of your revenue."',
      body: 'BODY:\n"Traditional word-of-mouth used to take years. Today, 1 value-packed Reel reaches 10,000 local buyers in 48 hours.\nYou don\'t need a ₹1,00,000 ad budget. You just need a clear Google profile and 3 authentic videos a week answering your customers\' #1 question."',
      cta: 'CTA:\n"Comment \'MARKET\' below and I\'ll send you our 5-minute local growth checklist for free!"'
    },
    hook: {
      title: '10 High-Converting Viral Hooks',
      badge: 'Viral Hook Matrix',
      hook: '1. [Curiosity] "The 30-second morning habit that 99% of creators overlook."\n2. [Controversial] "Your Instagram engagement didn\'t drop because of the algorithm. Your hooks are just boring."',
      body: '3. [Story] "In 2023, I was posting 5 reels a day with zero views. Here is the single sentence structure that changed everything."\n4. [Shock] "We stopped running paid ads and our inbound leads doubled. Here is the framework."',
      cta: '5. [You Are Doing This Wrong] "Stop putting the core punchline in the caption. Put it in the first 3 seconds of your video."'
    },
    caption: {
      title: 'High-Converting Instagram & LinkedIn Caption',
      badge: 'Social Caption Suite',
      hook: 'SHORT CAPTION:\nMost creators focus on camera gear when they should be obsessing over their first 3 seconds. Here is why storytelling beats 4K resolution every time. 👇',
      body: 'LONG CAPTION:\nLet\'s be honest: nobody scrolls social media looking for polished advertisements.\nPeople want:\n→ Relatable struggles\n→ Rapid, actionable fixes\n→ Human authenticity\n\nWhen you stop trying to sound like a textbook, your audience finally listens.',
      cta: 'HASHTAGS:\n#ContentStrategy #CreatorEconomy #DigitalMarketing2026 #ViralHooks #SocialMediaGrowth'
    },
    thanglish: {
      title: 'Natural Conversational Thanglish Script',
      badge: 'Multi-Language (Thanglish)',
      hook: 'HOOK (0-3s):\n"Ungaloda business-ku daily new customers varala? Neenga innum indha 3 basic mistakes pandreengala-nu check pannunga!"',
      body: 'BODY:\n"Traditional banners and pamphlets ippo work aaga maattudhu.\nCustomer mobile-la dhaan unga store search panraanga.\nPeriya budget thevai illa — just weekly 3 honest videos podhum. Ungaloda practical tips & client reviews share pannunga."',
      cta: 'CTA:\n"Unga business online-la scale panna \'GROWTH\' nu DM pannunga. Free audit tharom!"'
    }
  };

  const currentPreview = previewExamples[activePreviewTab];

  const faqs = [
    {
      q: 'How does ContentFlow AI generate human-sounding content instead of generic AI filler?',
      a: 'ContentFlow AI is powered by customized prompt architectures running on Google Gemini 3.7. We enforce strict anti-slop rules, pacing for speaking speed, viral psychological hook structures, and specific audience calibration so content feels natural and engaging.'
    },
    {
      q: 'Does it support Tamil and Thanglish authentically?',
      a: 'Yes! Unlike standard translation tools that do unnatural literal translations, our Thanglish engine writes natural colloquial spoken Tamil using English/Latin alphabet phonetics just like top Tamil creators speak on Instagram and YouTube.'
    },
    {
      q: 'Can I teach ContentFlow AI my own Brand Voice?',
      a: 'Absolutely. The Brand Voice Studio lets you configure your brand name, target audience, tone traits, favorite keywords, and forbidden words. Every future generation can adhere to this custom persona with 1 click.'
    },
    {
      q: 'How does the Credit System work?',
      a: 'Free users receive 10 generations per month. Pro users get 100 generations per month for ₹499/mo, and Agencies get 500 generations for ₹1,499/mo with priority queue and unlimited tone transformations.'
    },
    {
      q: 'Can I edit and export generated content?',
      a: 'Yes. You can refine content with 1-click AI tools (Make Viral, Shorten, Emotional, Translate), edit text directly, copy with 1 click, or save to your Content Library for future scheduling.'
    }
  ];

  return (
    <div id="landing-page-root" className="min-h-screen bg-[#fcfcfd] text-slate-900 selection:bg-indigo-500 selection:text-white">
      {/* 1. Header Navigation */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 lg:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Logo size="md" showTagline={false} />

          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-600">
            <a href="#features" className="hover:text-indigo-600 transition-colors">Features</a>
            <a href="#tools" className="hover:text-indigo-600 transition-colors">What You Can Create</a>
            <a href="#how-it-works" className="hover:text-indigo-600 transition-colors">How It Works</a>
            <a href="#multilingual" className="hover:text-indigo-600 transition-colors">Tamil & Thanglish</a>
            <a href="#pricing" className="hover:text-indigo-600 transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-indigo-600 transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <button
                id="btn-landing-go-dashboard"
                onClick={onStartCreating}
                className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-500/20 transition-all flex items-center gap-1.5"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <>
                <button
                  id="btn-landing-signin"
                  onClick={() => onNavigate('login')}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  id="btn-landing-cta-top"
                  onClick={() => onNavigate('signup')}
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Start Creating Free</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 px-4 overflow-hidden">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-indigo-50 border border-indigo-100 rounded-full text-indigo-700 text-xs font-bold tracking-wide uppercase mb-6 animate-in fade-in slide-in-from-bottom-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Next-Gen AI Content Studio for Modern Marketers</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12] mb-6">
            Create Better Content.<br />
            <span className="text-indigo-600">In Less Time.</span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-9 font-medium leading-relaxed">
            Generate viral hooks, Reel scripts, captions, YouTube content, SEO copy and more with AI — built for modern creators and marketers.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-14">
            <button
              id="btn-hero-primary-cta"
              onClick={onStartCreating}
              className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/35 transition-all flex items-center justify-center gap-2 group"
            >
              <span>Start Creating Free</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <a
              id="btn-hero-secondary-cta"
              href="#how-it-works"
              className="w-full sm:w-auto px-7 py-3.5 bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm rounded-xl border border-slate-200 shadow-2xs transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-3.5 h-3.5 text-slate-500 fill-slate-500" />
              <span>See How It Works</span>
            </a>
          </div>

          {/* Interactive SaaS Dashboard Mockup Preview */}
          <div className="relative max-w-4xl mx-auto bg-white border border-slate-200/90 rounded-3xl shadow-2xl p-4 sm:p-6 text-left">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-400" />
                <span className="w-3 h-3 rounded-full bg-amber-400" />
                <span className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="text-xs font-bold text-slate-700 ml-2">ContentFlow AI Generator Live Preview</span>
              </div>

              {/* Preview Format Tabs */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                <button
                  onClick={() => setActivePreviewTab('reel')}
                  className={`px-3 py-1 rounded-lg transition-all ${activePreviewTab === 'reel' ? 'bg-white text-indigo-600 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  🎬 Reel Script
                </button>
                <button
                  onClick={() => setActivePreviewTab('hook')}
                  className={`px-3 py-1 rounded-lg transition-all ${activePreviewTab === 'hook' ? 'bg-white text-indigo-600 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  🔥 Viral Hooks
                </button>
                <button
                  onClick={() => setActivePreviewTab('caption')}
                  className={`px-3 py-1 rounded-lg transition-all ${activePreviewTab === 'caption' ? 'bg-white text-indigo-600 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  📝 Caption
                </button>
                <button
                  onClick={() => setActivePreviewTab('thanglish')}
                  className={`px-3 py-1 rounded-lg transition-all ${activePreviewTab === 'thanglish' ? 'bg-white text-indigo-600 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  🗣️ Thanglish
                </button>
              </div>
            </div>

            {/* Generated Output Card Preview */}
            <div className="mt-4 p-4 sm:p-5 bg-slate-50 border border-slate-200/80 rounded-2xl">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full">
                    {currentPreview.badge}
                  </span>
                  <span className="text-xs font-bold text-slate-800 truncate">{currentPreview.title}</span>
                </div>
                <button
                  onClick={() => copied('Sample content copied to clipboard!')}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-700 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Copy</span>
                </button>
              </div>

              <div className="space-y-2.5 text-xs sm:text-sm font-mono text-slate-800 bg-white p-4 rounded-xl border border-slate-200/80 whitespace-pre-wrap leading-relaxed">
                <div className="text-indigo-900 font-semibold">{currentPreview.hook}</div>
                <div className="text-slate-700">{currentPreview.body}</div>
                <div className="text-emerald-700 font-semibold">{currentPreview.cta}</div>
              </div>

              <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-200/60">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Optimized for High Retention & Conversions</span>
                </span>
                <span className="font-semibold text-indigo-600 cursor-pointer" onClick={onStartCreating}>
                  Open in Generator →
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Section: Trusted by creators & marketers */}
      <section className="py-12 border-y border-slate-200/80 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">
            TRUSTED BY 10,000+ CREATORS, DIGITAL AGENCIES & MARKETERS
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-6 items-center justify-center opacity-70">
            <span className="text-base font-extrabold text-slate-700 font-['Outfit']">ZAZU MEDIA</span>
            <span className="text-base font-extrabold text-slate-700 font-['Outfit']">CREATORPULSE</span>
            <span className="text-base font-extrabold text-slate-700 font-['Outfit']">SCALEGROWTH</span>
            <span className="text-base font-extrabold text-slate-700 font-['Outfit']">NEXUS DIGITAL</span>
            <span className="text-base font-extrabold text-slate-700 font-['Outfit']">VIRALFLOW</span>
            <span className="text-base font-extrabold text-slate-700 font-['Outfit']">HYPERREELS</span>
          </div>
        </div>
      </section>

      {/* 4. Section: What You Can Create */}
      <section id="tools" className="py-20 px-4 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
            End-To-End Suite
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3">
            What You Can Create with ContentFlow
          </h2>
          <p className="text-sm text-slate-500 mt-2 font-medium">
            Dedicated generators built for every major social media channel and search engine.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-2xs hover:shadow-md hover:border-indigo-200 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-4 group-hover:scale-105 transition-transform">
              <Film className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">🎬 Viral Reel Scripts</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Hook-first video scripts timed for 30s, 60s, or 90s with visual scene directions and speaking durations.
            </p>
            <span className="text-xs font-bold text-indigo-600 group-hover:underline flex items-center gap-1 cursor-pointer" onClick={() => onNavigate('reels')}>
              Create Reel Script →
            </span>
          </div>

          <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-2xs hover:shadow-md hover:border-amber-200 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 mb-4 group-hover:scale-105 transition-transform">
              <Flame className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">🔥 10 Viral Hook Angles</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Generate 10 psychologically proven hooks: Curiosity, Controversial, Emotional, Shock, Mistake, and more.
            </p>
            <span className="text-xs font-bold text-amber-600 group-hover:underline flex items-center gap-1 cursor-pointer" onClick={() => onNavigate('hooks')}>
              Generate Hooks →
            </span>
          </div>

          <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-2xs hover:shadow-md hover:border-purple-200 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 mb-4 group-hover:scale-105 transition-transform">
              <MessageSquareQuote className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">📝 Captions & Hashtags</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Short and long social captions with seamless call-to-actions and 15+ handpicked high-intent hashtags.
            </p>
            <span className="text-xs font-bold text-purple-600 group-hover:underline flex items-center gap-1 cursor-pointer" onClick={() => onNavigate('captions')}>
              Write Captions →
            </span>
          </div>

          <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-2xs hover:shadow-md hover:border-rose-200 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mb-4 group-hover:scale-105 transition-transform">
              <Youtube className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">▶️ YouTube Studio Suite</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              5 High-CTR SEO Titles, full video descriptions with timestamps, target keyword analysis, and tag lists.
            </p>
            <span className="text-xs font-bold text-rose-600 group-hover:underline flex items-center gap-1 cursor-pointer" onClick={() => onNavigate('youtube')}>
              Optimize YouTube →
            </span>
          </div>

          <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-2xs hover:shadow-md hover:border-blue-200 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-4 group-hover:scale-105 transition-transform">
              <SearchCode className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">🔍 High-Ranking SEO Content</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Meta titles, meta descriptions, H1/H2 structures, in-depth articles, schema FAQs, and zero keyword stuffing.
            </p>
            <span className="text-xs font-bold text-blue-600 group-hover:underline flex items-center gap-1 cursor-pointer" onClick={() => onNavigate('seo')}>
              Generate SEO Copy →
            </span>
          </div>

          <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-2xs hover:shadow-md hover:border-emerald-200 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-4 group-hover:scale-105 transition-transform">
              <Lightbulb className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">💡 20 Content Ideas Matrix</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Get 20 tailored content concepts with viral hooks, unique angles, and recommended formats for any niche.
            </p>
            <span className="text-xs font-bold text-emerald-600 group-hover:underline flex items-center gap-1 cursor-pointer" onClick={() => onNavigate('ideas')}>
              Explore Ideas →
            </span>
          </div>
        </div>
      </section>

      {/* 5. Section: How It Works */}
      <section id="how-it-works" className="py-20 px-4 bg-slate-50/70 border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest bg-indigo-100/70 px-3 py-1 rounded-full">
              3-Step Workflow
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3">
              How ContentFlow AI Works
            </h2>
            <p className="text-sm text-slate-500 mt-2 font-medium">
              From raw topic or rough idea to publish-ready content in under 5 seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 relative">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-extrabold text-sm flex items-center justify-center mb-4">
                1
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Select Format & Topic</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Choose Reel, Hook, Caption, YouTube, or SEO. Type a simple topic like "Why small businesses need digital marketing".
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 relative">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-extrabold text-sm flex items-center justify-center mb-4">
                2
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Tune Tone & Brand Voice</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Pick your language (English, Tamil, Thanglish), audience, length, and toggle your saved Brand Voice persona.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 relative">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-extrabold text-sm flex items-center justify-center mb-4">
                3
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Generate & 1-Click Refine</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Get high-retention content instantly. Use quick AI actions (Make Viral, Shorten, Emotional, Translate) and copy with 1 click.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Section: Powerful AI Features */}
      <section id="features" className="py-20 px-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
              Enterprise Grade AI
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3 mb-4">
              Engineered for Real Creator Growth & Agency Output
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed mb-6">
              Unlike generic chatbot interfaces that dump wordy paragraphs, ContentFlow AI structures content for human psychology, speaking cadence, and social platform algorithms.
            </p>

            <div className="space-y-3.5">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">3-Second Hook Retention Engine</h4>
                  <p className="text-xs text-slate-500">Stops the feed scroll with curiosity gaps, controversial takes, and concrete pain points.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Spoken Cadence Timing</h4>
                  <p className="text-xs text-slate-500">Short, breathable lines optimized for 130 WPM speaking pace with estimated duration calculators.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Custom Brand Voice Synchronization</h4>
                  <p className="text-xs text-slate-500">Injects your custom tone traits, favorite vocabulary, and forbidden words into every output.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 p-6 sm:p-8 rounded-3xl text-white shadow-xl">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">Prompt Intelligence Engine</span>
            </div>

            <div className="space-y-4 text-xs font-mono">
              <div className="p-3 bg-white/10 rounded-xl border border-white/10">
                <span className="text-indigo-300 font-bold block mb-1">INPUT:</span>
                "Why small businesses need digital marketing in 2026"
              </div>

              <div className="p-3 bg-indigo-500/20 rounded-xl border border-indigo-400/30">
                <span className="text-emerald-300 font-bold block mb-1">STRUCTURED FRAMEWORK:</span>
                HOOK (0-3s) → PROBLEM → CURIOSITY → VALUE → EXAMPLE → CTA
              </div>

              <div className="p-3 bg-white/10 rounded-xl border border-white/10 text-slate-300 leading-relaxed">
                <span className="text-amber-300 font-bold block mb-1">AI VERDICT:</span>
                "Zero generic preamble. Natural conversational pacing with high-conversion DM call to action."
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Section: Multi-Language & Thanglish Spotlight */}
      <section id="multilingual" className="py-20 px-4 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto text-center">
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest bg-indigo-950 px-3 py-1 rounded-full border border-indigo-800">
            Regional Superpower
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-3 mb-4">
            Native Multi-Language Support
          </h2>
          <p className="text-sm text-slate-400 max-w-2xl mx-auto mb-12">
            Create high-converting content in English, Tamil, and spoken colloquial Thanglish that resonates deeply with local audiences.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="p-5 bg-white/5 border border-white/10 rounded-2xl">
              <div className="text-xs font-bold text-indigo-400 uppercase mb-2">🇺🇸 English</div>
              <h3 className="text-sm font-bold text-white mb-2">High-Impact International Copy</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                "Stop running paid ads until your organic hook is converting. Here is the 1-page framework we used to scale to ₹5L/month."
              </p>
            </div>

            <div className="p-5 bg-white/5 border border-white/10 rounded-2xl">
              <div className="text-xs font-bold text-indigo-400 uppercase mb-2">🇮🇳 Tamil (தமிழ்)</div>
              <h3 className="text-sm font-bold text-white mb-2">Native Tamil Script</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                "உங்கள் வணிகத்திற்கு தினசரி புதிய வாடிக்கையாளர்கள் வரவில்லையா? இந்த 3 எளிய வழிகளைப் பின்பற்றி உங்கள் விற்பனையை இரட்டிப்பாக்குங்கள்!"
              </p>
            </div>

            <div className="p-5 bg-indigo-600/20 border border-indigo-500/40 rounded-2xl">
              <div className="text-xs font-bold text-indigo-300 uppercase mb-2">🗣️ Spoken Thanglish</div>
              <h3 className="text-sm font-bold text-white mb-2">Authentic Creator Slang</h3>
              <p className="text-xs text-indigo-200 leading-relaxed">
                "Ungaloda business-ku customers varala? Innum banner mattum rely panreengala? 2026-la unga competitors unga sales-ah eduthupaanga!"
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Section: Testimonials */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
            Real Creator Stories
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3">
            Loved by Fast-Growing Creators & Agencies
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-2xs">
            <div className="flex items-center gap-1 text-amber-400 mb-3">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400" />)}
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              "The Reel generator alone saved our agency 15 hours a week. The Thanglish generation is shockingly good — sounds just like real speech, not robotic translation."
            </p>
            <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                RK
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Rajesh Kumar</h4>
                <p className="text-[10px] text-slate-400">Founder, ViralPulse Agency</p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-2xs">
            <div className="flex items-center gap-1 text-amber-400 mb-3">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400" />)}
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              "The 10 Viral Hook generator is an unfair advantage. I picked hook #4 for my video and it hit 140k views on Instagram in 3 days."
            </p>
            <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
              <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center">
                AP
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Ananya Patel</h4>
                <p className="text-[10px] text-slate-400">Fitness & Lifestyle Creator</p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-2xs">
            <div className="flex items-center gap-1 text-amber-400 mb-3">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400" />)}
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              "Brand Voice feature is a game-changer. It remembers our specific clinic tone and avoids generic marketing hype automatically."
            </p>
            <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center">
                DS
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Dr. Siddharth M.</h4>
                <p className="text-[10px] text-slate-400">Director, Apex Dental Studio</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Section: Pricing */}
      <section id="pricing" className="py-20 px-4 bg-slate-50/70 border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto text-center">
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest bg-indigo-100/70 px-3 py-1 rounded-full">
            Transparent Plans
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3 mb-3">
            Choose Your Creation Power
          </h2>
          <p className="text-sm text-slate-500 max-w-xl mx-auto mb-12">
            Start completely free. Upgrade anytime to scale your agency and content output.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto text-left">
            {/* Free */}
            <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-2xs flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Free Plan</h3>
                <p className="text-xs text-slate-500 mt-1">For exploring AI content creation.</p>
                <div className="my-5">
                  <span className="text-3xl font-extrabold text-slate-900">₹0</span>
                  <span className="text-xs text-slate-400 font-medium"> / month</span>
                  <span className="text-[11px] font-bold text-indigo-600 block mt-1">10 AI generations / mo</span>
                </div>
                <div className="space-y-2 mb-6">
                  {['10 Generations / month', 'Reels, Hooks, Captions', 'Multi-language (EN, Tamil, Thanglish)', 'My Content library (20 items)'].map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-600">
                      <Check className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
              <button
                onClick={onStartCreating}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors"
              >
                Get Started Free
              </button>
            </div>

            {/* Pro */}
            <div className="p-6 bg-white border-2 border-indigo-600 rounded-3xl shadow-xl shadow-indigo-500/10 relative flex flex-col justify-between">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-indigo-600 text-white text-[10px] font-extrabold uppercase tracking-wider rounded-full">
                Most Popular
              </span>
              <div>
                <h3 className="text-base font-bold text-slate-900">Pro Creator</h3>
                <p className="text-xs text-slate-500 mt-1">For serious creators & marketers.</p>
                <div className="my-5">
                  <span className="text-3xl font-extrabold text-slate-900">₹499</span>
                  <span className="text-xs text-slate-400 font-medium"> / month</span>
                  <span className="text-[11px] font-bold text-indigo-600 block mt-1">100 AI generations / mo</span>
                </div>
                <div className="space-y-2 mb-6">
                  {[
                    '100 High-Speed Generations / mo',
                    'All Dedicated Generators (SEO, YT, Reels)',
                    'Custom Brand Voice Persona',
                    '1-Click AI Transformations',
                    'Unlimited Content Library',
                    'Markdown & Text Exports'
                  ].map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-600">
                      <Check className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
              <button
                onClick={openUpgradeModal}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-500/20 transition-all"
              >
                Upgrade to Pro
              </button>
            </div>

            {/* Agency */}
            <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-2xs flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Agency & Scale</h3>
                <p className="text-xs text-slate-500 mt-1">For teams & high-volume output.</p>
                <div className="my-5">
                  <span className="text-3xl font-extrabold text-slate-900">₹1,499</span>
                  <span className="text-xs text-slate-400 font-medium"> / month</span>
                  <span className="text-[11px] font-bold text-indigo-600 block mt-1">500 AI generations / mo</span>
                </div>
                <div className="space-y-2 mb-6">
                  {[
                    '500 High-Speed Generations / mo',
                    'Multiple Brand Voice Profiles',
                    'Batch Generation Workflows',
                    'Priority Gemini 3.7 Flash',
                    'Dedicated VIP Creator Support'
                  ].map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-600">
                      <Check className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
              <button
                onClick={openUpgradeModal}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors"
              >
                Get Agency Plan
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 10. Section: FAQ */}
      <section id="faq" className="py-20 px-4 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
            Got Questions?
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-3">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = activeFaq === index;
            return (
              <div
                key={index}
                className="border border-slate-200 bg-white rounded-2xl overflow-hidden transition-all"
              >
                <button
                  onClick={() => setActiveFaq(isOpen ? null : index)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-slate-900 hover:bg-slate-50/50"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${isOpen ? 'rotate-180 text-indigo-600' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-0 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 11. Section: Final CTA & Footer */}
      <section className="py-20 px-4 bg-gradient-to-tr from-indigo-900 via-indigo-800 to-purple-900 text-white text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4 leading-tight">
            Ready to Turn Ideas Into Content That Connects?
          </h2>
          <p className="text-sm sm:text-base text-indigo-200 max-w-xl mx-auto mb-8">
            Join thousands of modern creators, social media managers, and digital marketers scaling their reach today.
          </p>
          <button
            onClick={onStartCreating}
            className="px-8 py-3.5 bg-white text-indigo-900 hover:bg-indigo-50 font-extrabold text-sm rounded-xl shadow-xl transition-all inline-flex items-center gap-2"
          >
            <span>Start Creating Free Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      <footer className="bg-slate-950 text-slate-400 py-12 px-4 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <Logo size="md" className="brightness-125" showTagline={true} />
          <div className="flex flex-wrap items-center justify-center gap-6 text-slate-400 font-medium">
            <a href="#tools" className="hover:text-white transition-colors">Generators</a>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
            <button onClick={openUpgradeModal} className="hover:text-white transition-colors">Subscription</button>
          </div>
          <p className="text-slate-500 text-[11px]">
            © {new Date().getFullYear()} ContentFlow AI. All rights reserved. Powered by Google Gemini 3.7.
          </p>
        </div>
      </footer>
    </div>
  );
};
