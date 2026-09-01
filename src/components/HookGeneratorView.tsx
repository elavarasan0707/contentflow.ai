import React, { useState } from 'react';
import { 
  Flame, 
  Sparkles, 
  Copy, 
  Bookmark, 
  RotateCw, 
  Check, 
  Target, 
  Sliders, 
  Loader2 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { Language, Tone, TargetAudience } from '../types';
import { AIActionToolbar } from './AIActionToolbar';

export const HookGeneratorView: React.FC = () => {
  const { deductCreditLocal, openUpgradeModal } = useAuth();
  const { copied, success, error } = useToast();

  const [topic, setTopic] = useState('');
  const [language, setLanguage] = useState<Language>('english');
  const [tone, setTone] = useState<Tone>('Bold');
  const [audience, setAudience] = useState<TargetAudience>('Creators');

  const [isGenerating, setIsGenerating] = useState(false);
  const [rawOutput, setRawOutput] = useState('');
  const [parsedHooks, setParsedHooks] = useState<Array<{ category: string; text: string }>>([]);
  const [isSaved, setIsSaved] = useState(false);

  const parseHooksList = (text: string) => {
    const lines = text.split('\n').filter(l => l.trim().length > 0);
    const hooks: Array<{ category: string; text: string }> = [];

    lines.forEach((line) => {
      const match = line.match(/(?:^\d+[\.\)]|\-|\*)\s*(?:\[(.*?)\])?\s*(.*)/);
      if (match) {
        hooks.push({
          category: match[1] || 'Hook Angle',
          text: match[2] || line
        });
      } else if (line.length > 15 && !line.toLowerCase().includes('here are') && !line.startsWith('#')) {
        hooks.push({
          category: 'Viral Hook',
          text: line.replace(/^["'\s]+|["'\s]+$/g, '')
        });
      }
    });

    if (hooks.length === 0 && text.trim()) {
      return [{ category: 'Viral Hooks', text: text }];
    }
    return hooks;
  };

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!topic.trim()) {
      error('Please specify a topic or niche to generate hooks for');
      return;
    }

    setIsGenerating(true);
    setIsSaved(false);

    try {
      const res = await api.generateContent({
        topic,
        contentType: 'hook',
        platform: 'all',
        language,
        tone,
        targetAudience: audience,
        autoSave: true
      });

      if (res.success) {
        setRawOutput(res.content);
        setParsedHooks(parseHooksList(res.content));
        setIsSaved(true);
        deductCreditLocal(res.credits.remaining, res.credits.limit, res.credits.used);
        success('10 Viral hook variations ready!');
      }
    } catch (err: any) {
      if (err.status === 403 || err.message?.includes('Credit limit')) {
        openUpgradeModal();
      } else {
        error(err.message || 'Hook generation failed');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyIndividual = (text: string) => {
    navigator.clipboard.writeText(text);
    copied('Hook copied to clipboard!');
  };

  const handleCopyAll = () => {
    if (!rawOutput) return;
    navigator.clipboard.writeText(rawOutput);
    copied('All 10 hooks copied to clipboard!');
  };

  return (
    <div id="hook-generator-root" className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-100 rounded-full text-amber-700 text-xs font-bold uppercase tracking-wider mb-2">
          <Flame className="w-3.5 h-3.5" /> Retention Maximizer
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          10 Viral Hooks Generator
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Generate 10 psychologically proven hook angles (Curiosity, Controversial, Shock, Story, Problem) to capture attention in the first 3 seconds.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form (4 cols) */}
        <form onSubmit={handleGenerate} className="lg:col-span-4 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Topic or Niche <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="hook-topic-input"
              rows={3}
              required
              placeholder="e.g. AI tools for digital marketing agencies, or Why cold calling is dead in 2026..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-none resize-none leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Language</label>
            <select
              id="hook-language-select"
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none font-medium"
            >
              <option value="english">🇺🇸 English</option>
              <option value="tamil">🇮🇳 Tamil (தமிழ்)</option>
              <option value="thanglish">🗣️ Thanglish (Spoken)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Target Audience</label>
            <select
              id="hook-audience-select"
              value={audience}
              onChange={(e) => setAudience(e.target.value as TargetAudience)}
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none font-medium"
            >
              <option value="Creators">Content Creators</option>
              <option value="Business Owners">Business Owners & Founders</option>
              <option value="Professionals">Working Professionals</option>
              <option value="Students">Students / Gen-Z</option>
              <option value="Local Customers">Local Customers</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Tone</label>
            <select
              id="hook-tone-select"
              value={tone}
              onChange={(e) => setTone(e.target.value as Tone)}
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none font-medium"
            >
              <option value="Bold">Bold & Provocative</option>
              <option value="Storytelling">Storytelling & Intrigued</option>
              <option value="Conversational">Conversational</option>
              <option value="Educational">Educational Authority</option>
              <option value="Emotional">Emotional & Vulnerable</option>
            </select>
          </div>

          <button
            id="btn-generate-hooks-submit"
            type="submit"
            disabled={isGenerating}
            className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Crafting Viral Angles...</span>
              </>
            ) : (
              <>
                <Flame className="w-4 h-4" />
                <span>Generate 10 Viral Hooks</span>
              </>
            )}
          </button>
        </form>

        {/* Right Output: Hook Cards (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-slate-200/90 rounded-2xl shadow-2xs overflow-hidden flex flex-col min-h-[560px]">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900">
                Generated Viral Hook Matrix
              </span>
              {parsedHooks.length > 0 && (
                <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                  {parsedHooks.length} Angles
                </span>
              )}
            </div>

            {rawOutput && (
              <div className="flex items-center gap-2">
                <button
                  id="btn-copy-all-hooks"
                  onClick={handleCopyAll}
                  className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
                >
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Copy All 10 Hooks</span>
                </button>

                <button
                  onClick={() => handleGenerate()}
                  disabled={isGenerating}
                  className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 border border-slate-200 rounded-lg transition-colors bg-white shadow-2xs"
                  title="Regenerate Hooks"
                >
                  <RotateCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 p-5 overflow-y-auto max-h-[600px]">
            {isGenerating ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
                <h4 className="text-sm font-bold text-slate-800">Generating 10 Viral Angles...</h4>
              </div>
            ) : parsedHooks.length > 0 ? (
              <div className="space-y-3">
                {parsedHooks.map((hook, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-slate-50/80 hover:bg-white border border-slate-200 hover:border-amber-300 rounded-xl transition-all shadow-2xs group flex items-start justify-between gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.2 rounded-md bg-amber-100 text-amber-900">
                          #{idx + 1} {hook.category}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm font-medium text-slate-800 leading-relaxed">
                        {hook.text}
                      </p>
                    </div>

                    <button
                      onClick={() => handleCopyIndividual(hook.text)}
                      className="p-2 text-slate-400 hover:text-amber-700 hover:bg-amber-50 border border-slate-200/80 rounded-lg transition-colors bg-white shrink-0"
                      title="Copy this hook"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400 space-y-3">
                <Flame className="w-8 h-8 text-slate-300" />
                <p className="text-xs text-slate-500">Enter your topic on the left to generate 10 high-converting hooks.</p>
              </div>
            )}
          </div>

          {rawOutput && (
            <AIActionToolbar
              content={rawOutput}
              onContentUpdated={(newContent) => {
                setRawOutput(newContent);
                setParsedHooks(parseHooksList(newContent));
              }}
              disabled={isGenerating}
            />
          )}
        </div>
      </div>
    </div>
  );
};
