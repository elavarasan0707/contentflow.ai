import React, { useState } from 'react';
import { 
  SearchCode, 
  Sparkles, 
  Copy, 
  Bookmark, 
  RotateCw, 
  KeyRound, 
  FileCheck, 
  Loader2 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { Language, Tone } from '../types';
import { AIActionToolbar } from './AIActionToolbar';

export const SeoGeneratorView: React.FC = () => {
  const { deductCreditLocal, openUpgradeModal } = useAuth();
  const { copied, success, error } = useToast();

  const [topic, setTopic] = useState('');
  const [primaryKeyword, setPrimaryKeyword] = useState('');
  const [secondaryKeywords, setSecondaryKeywords] = useState('');
  const [language, setLanguage] = useState<Language>('english');
  const [tone, setTone] = useState<Tone>('Professional');

  const [isGenerating, setIsGenerating] = useState(false);
  const [seoOutput, setSeoOutput] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!topic.trim()) {
      error('Please enter a target article topic');
      return;
    }

    setIsGenerating(true);
    setIsSaved(false);

    try {
      const res = await api.generateContent({
        topic,
        contentType: 'seo',
        platform: 'all',
        language,
        tone,
        primaryKeyword,
        secondaryKeywords,
        autoSave: true
      });

      if (res.success) {
        setSeoOutput(res.content);
        setIsSaved(true);
        deductCreditLocal(res.credits.remaining, res.credits.limit, res.credits.used);
        success('SEO Content, Meta & FAQs generated!');
      }
    } catch (err: any) {
      if (err.status === 403 || err.message?.includes('Credit limit')) {
        openUpgradeModal();
      } else {
        error(err.message || 'SEO generation failed');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div id="seo-generator-root" className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-100 rounded-full text-blue-700 text-xs font-bold uppercase tracking-wider mb-2">
          <SearchCode className="w-3.5 h-3.5" /> Rank-Ready Optimization
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          SEO Article & Copywriter
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Generate structured H1/H2 content, Meta Titles (under 60 chars), Meta Descriptions (under 160 chars), and Schema FAQ blocks.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form (4 cols) */}
        <form onSubmit={handleGenerate} className="lg:col-span-4 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Article Topic / Title <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="seo-topic-input"
              rows={3}
              required
              placeholder="e.g. The Ultimate Guide to Local SEO for Doctors & Dental Clinics in 2026..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-none resize-none leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Primary Keyword</label>
            <input
              id="seo-primary-kw-input"
              type="text"
              placeholder="e.g. dental clinic local seo"
              value={primaryKeyword}
              onChange={(e) => setPrimaryKeyword(e.target.value)}
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Secondary Keywords (Comma separated)</label>
            <input
              id="seo-secondary-kw-input"
              type="text"
              placeholder="e.g. google business profile, dental marketing, patient acquisition"
              value={secondaryKeywords}
              onChange={(e) => setSecondaryKeywords(e.target.value)}
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Language</label>
              <select
                id="seo-language-select"
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none font-medium"
              >
                <option value="english">🇺🇸 English</option>
                <option value="tamil">🇮🇳 Tamil (தமிழ்)</option>
                <option value="thanglish">🗣️ Thanglish</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tone</label>
              <select
                id="seo-tone-select"
                value={tone}
                onChange={(e) => setTone(e.target.value as Tone)}
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none font-medium"
              >
                <option value="Professional">Professional Authority</option>
                <option value="Educational">Educational Guide</option>
                <option value="Conversational">Conversational</option>
              </select>
            </div>
          </div>

          <button
            id="btn-generate-seo-submit"
            type="submit"
            disabled={isGenerating}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Optimizing SEO Architecture...</span>
              </>
            ) : (
              <>
                <SearchCode className="w-4 h-4" />
                <span>Generate SEO Content</span>
              </>
            )}
          </button>
        </form>

        {/* Right Output (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-slate-200/90 rounded-2xl shadow-2xs overflow-hidden flex flex-col min-h-[560px]">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-bold text-slate-900">
              SEO Article & Meta Structure
            </span>

            {seoOutput && (
              <div className="flex items-center gap-1.5">
                <button
                  id="btn-copy-seo"
                  onClick={() => {
                    navigator.clipboard.writeText(seoOutput);
                    copied('SEO article copied to clipboard');
                  }}
                  className="p-1.5 px-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors flex items-center gap-1 bg-white shadow-2xs"
                >
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Copy Article</span>
                </button>

                <button
                  onClick={() => handleGenerate()}
                  disabled={isGenerating}
                  className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 rounded-lg transition-colors bg-white shadow-2xs"
                  title="Regenerate"
                >
                  <RotateCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 p-5 flex flex-col">
            {isGenerating ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <h4 className="text-sm font-bold text-slate-800">Drafting H1/H2 & Meta Copy...</h4>
              </div>
            ) : seoOutput ? (
              <textarea
                id="seo-output-textarea"
                value={seoOutput}
                onChange={(e) => {
                  setSeoOutput(e.target.value);
                  setIsSaved(false);
                }}
                className="w-full flex-1 min-h-[380px] p-4 text-xs sm:text-sm font-mono text-slate-800 bg-slate-50/50 border border-slate-200/80 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none resize-y leading-relaxed"
              />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-400 space-y-3">
                <SearchCode className="w-8 h-8 text-slate-300" />
                <p className="text-xs text-slate-500">Enter your target keywords on the left to produce rank-ready copy.</p>
              </div>
            )}
          </div>

          {seoOutput && (
            <AIActionToolbar
              content={seoOutput}
              onContentUpdated={(newContent) => {
                setSeoOutput(newContent);
                setIsSaved(false);
              }}
              disabled={isGenerating}
            />
          )}
        </div>
      </div>
    </div>
  );
};
