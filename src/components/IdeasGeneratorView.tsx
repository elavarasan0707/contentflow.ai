import React, { useState } from 'react';
import { 
  Lightbulb, 
  Sparkles, 
  Copy, 
  Bookmark, 
  RotateCw, 
  ArrowRight, 
  Grid, 
  Loader2 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { Language, TargetAudience } from '../types';
import { AIActionToolbar } from './AIActionToolbar';

interface IdeasGeneratorViewProps {
  onSelectIdeaToGenerate?: (ideaTitle: string) => void;
}

export const IdeasGeneratorView: React.FC<IdeasGeneratorViewProps> = ({ onSelectIdeaToGenerate }) => {
  const { deductCreditLocal, openUpgradeModal } = useAuth();
  const { copied, success, error } = useToast();

  const [topic, setTopic] = useState('');
  const [audience, setAudience] = useState<TargetAudience>('Creators');
  const [language, setLanguage] = useState<Language>('english');

  const [isGenerating, setIsGenerating] = useState(false);
  const [ideasOutput, setIdeasOutput] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!topic.trim()) {
      error('Please enter your niche or industry');
      return;
    }

    setIsGenerating(true);
    setIsSaved(false);

    try {
      const res = await api.generateContent({
        topic,
        contentType: 'ideas',
        platform: 'all',
        language,
        targetAudience: audience,
        autoSave: true
      });

      if (res.success) {
        setIdeasOutput(res.content);
        setIsSaved(true);
        deductCreditLocal(res.credits.remaining, res.credits.limit, res.credits.used);
        success('20 Viral content ideas generated!');
      }
    } catch (err: any) {
      if (err.status === 403 || err.message?.includes('Credit limit')) {
        openUpgradeModal();
      } else {
        error(err.message || 'Ideas generation failed');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div id="ideas-generator-root" className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full text-emerald-700 text-xs font-bold uppercase tracking-wider mb-2">
          <Lightbulb className="w-3.5 h-3.5" /> Brainstorm Matrix
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          20 Content Ideas Generator
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Generate 20 high-converting content angles categorized by Hook, Format (Reel / Carousel / Long Post), and Audience Angle.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form (4 cols) */}
        <form onSubmit={handleGenerate} className="lg:col-span-4 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Your Niche, Industry or Topic <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="ideas-topic-input"
              rows={3}
              required
              placeholder="e.g. Real estate marketing in Chennai, or Personal finance for 20-somethings..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-none resize-none leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Target Audience</label>
            <select
              id="ideas-audience-select"
              value={audience}
              onChange={(e) => setAudience(e.target.value as TargetAudience)}
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none font-medium"
            >
              <option value="Creators">Content Creators & Influencers</option>
              <option value="Business Owners">Small Business Owners</option>
              <option value="Students">College Students & Beginners</option>
              <option value="Professionals">Working Tech Professionals</option>
              <option value="Parents">Parents & Families</option>
              <option value="Local Customers">Local Area Customers</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Language</label>
            <select
              id="ideas-language-select"
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none font-medium"
            >
              <option value="english">🇺🇸 English</option>
              <option value="tamil">🇮🇳 Tamil (தமிழ்)</option>
              <option value="thanglish">🗣️ Thanglish (Spoken)</option>
            </select>
          </div>

          <button
            id="btn-generate-ideas-submit"
            type="submit"
            disabled={isGenerating}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Brainstorming 20 Angles...</span>
              </>
            ) : (
              <>
                <Lightbulb className="w-4 h-4" />
                <span>Generate 20 Content Ideas</span>
              </>
            )}
          </button>
        </form>

        {/* Right Output (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-slate-200/90 rounded-2xl shadow-2xs overflow-hidden flex flex-col min-h-[560px]">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-bold text-slate-900">
              20 Content Angles Matrix
            </span>

            {ideasOutput && (
              <div className="flex items-center gap-1.5">
                <button
                  id="btn-copy-ideas"
                  onClick={() => {
                    navigator.clipboard.writeText(ideasOutput);
                    copied('20 ideas copied to clipboard');
                  }}
                  className="p-1.5 px-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors flex items-center gap-1 bg-white shadow-2xs"
                >
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Copy All 20</span>
                </button>

                <button
                  onClick={() => handleGenerate()}
                  disabled={isGenerating}
                  className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 border border-slate-200 rounded-lg transition-colors bg-white shadow-2xs"
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
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                <h4 className="text-sm font-bold text-slate-800">Generating 20 Content Ideas...</h4>
              </div>
            ) : ideasOutput ? (
              <textarea
                id="ideas-output-textarea"
                value={ideasOutput}
                onChange={(e) => {
                  setIdeasOutput(e.target.value);
                  setIsSaved(false);
                }}
                className="w-full flex-1 min-h-[380px] p-4 text-xs sm:text-sm font-mono text-slate-800 bg-slate-50/50 border border-slate-200/80 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none resize-y leading-relaxed"
              />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-400 space-y-3">
                <Grid className="w-8 h-8 text-slate-300" />
                <p className="text-xs text-slate-500">Enter your niche or industry on the left to map out 20 viral content ideas.</p>
              </div>
            )}
          </div>

          {ideasOutput && (
            <AIActionToolbar
              content={ideasOutput}
              onContentUpdated={(newContent) => {
                setIdeasOutput(newContent);
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
