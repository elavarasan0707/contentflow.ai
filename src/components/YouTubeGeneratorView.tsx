import React, { useState } from 'react';
import { 
  Youtube, 
  Sparkles, 
  Copy, 
  Bookmark, 
  RotateCw, 
  ListOrdered, 
  Tag, 
  Loader2 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { Language, Tone, TargetAudience } from '../types';
import { AIActionToolbar } from './AIActionToolbar';

export const YouTubeGeneratorView: React.FC = () => {
  const { deductCreditLocal, openUpgradeModal } = useAuth();
  const { copied, success, error } = useToast();

  const [topic, setTopic] = useState('');
  const [language, setLanguage] = useState<Language>('english');
  const [tone, setTone] = useState<Tone>('Educational');
  const [audience, setAudience] = useState<TargetAudience>('Creators');

  const [isGenerating, setIsGenerating] = useState(false);
  const [youtubeOutput, setYoutubeOutput] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!topic.trim()) {
      error('Please enter a YouTube video topic or title');
      return;
    }

    setIsGenerating(true);
    setIsSaved(false);

    try {
      const res = await api.generateContent({
        topic,
        contentType: 'youtube',
        platform: 'youtube',
        language,
        tone,
        targetAudience: audience,
        autoSave: true
      });

      if (res.success) {
        setYoutubeOutput(res.content);
        setIsSaved(true);
        deductCreditLocal(res.credits.remaining, res.credits.limit, res.credits.used);
        success('YouTube titles, description & tags generated!');
      }
    } catch (err: any) {
      if (err.status === 403 || err.message?.includes('Credit limit')) {
        openUpgradeModal();
      } else {
        error(err.message || 'YouTube generation failed');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div id="youtube-generator-root" className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 border border-rose-100 rounded-full text-rose-700 text-xs font-bold uppercase tracking-wider mb-2">
          <Youtube className="w-3.5 h-3.5" /> High-CTR Video Optimizer
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          YouTube Creator Suite
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Generate 5 CTR-optimized titles, complete SEO descriptions with timestamp outlines, and optimized tag lists.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form (4 cols) */}
        <form onSubmit={handleGenerate} className="lg:col-span-4 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Video Topic / Core Focus <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="youtube-topic-input"
              rows={3}
              required
              placeholder="e.g. Complete tutorial on building full-stack web applications with AI in 2026..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-none resize-none leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Language</label>
            <select
              id="youtube-language-select"
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
            <label className="block text-xs font-bold text-slate-700 mb-1">Tone of Video</label>
            <select
              id="youtube-tone-select"
              value={tone}
              onChange={(e) => setTone(e.target.value as Tone)}
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none font-medium"
            >
              <option value="Educational">Educational & Step-by-Step</option>
              <option value="Conversational">Conversational & Engaging</option>
              <option value="Storytelling">Storytelling Case Study</option>
              <option value="Professional">Professional Authority</option>
              <option value="Bold">High Energy / Provocative</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Target Viewers</label>
            <select
              id="youtube-audience-select"
              value={audience}
              onChange={(e) => setAudience(e.target.value as TargetAudience)}
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none font-medium"
            >
              <option value="Creators">Aspiring Creators</option>
              <option value="Students">Beginners & Students</option>
              <option value="Business Owners">Business Owners & Marketers</option>
              <option value="Professionals">Engineers & Professionals</option>
            </select>
          </div>

          <button
            id="btn-generate-youtube-submit"
            type="submit"
            disabled={isGenerating}
            className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-rose-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Optimizing YouTube Package...</span>
              </>
            ) : (
              <>
                <Youtube className="w-4 h-4" />
                <span>Generate YouTube Suite</span>
              </>
            )}
          </button>
        </form>

        {/* Right Output (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-slate-200/90 rounded-2xl shadow-2xs overflow-hidden flex flex-col min-h-[560px]">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-bold text-slate-900">
              YouTube Title, Description & Tags
            </span>

            {youtubeOutput && (
              <div className="flex items-center gap-1.5">
                <button
                  id="btn-copy-youtube-suite"
                  onClick={() => {
                    navigator.clipboard.writeText(youtubeOutput);
                    copied('YouTube package copied to clipboard');
                  }}
                  className="p-1.5 px-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors flex items-center gap-1 bg-white shadow-2xs"
                >
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Copy Package</span>
                </button>

                <button
                  onClick={() => handleGenerate()}
                  disabled={isGenerating}
                  className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-lg transition-colors bg-white shadow-2xs"
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
                <Loader2 className="w-8 h-8 animate-spin text-rose-600" />
                <h4 className="text-sm font-bold text-slate-800">Generating Titles & Timestamps...</h4>
              </div>
            ) : youtubeOutput ? (
              <textarea
                id="youtube-output-textarea"
                value={youtubeOutput}
                onChange={(e) => {
                  setYoutubeOutput(e.target.value);
                  setIsSaved(false);
                }}
                className="w-full flex-1 min-h-[380px] p-4 text-xs sm:text-sm font-mono text-slate-800 bg-slate-50/50 border border-slate-200/80 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none resize-y leading-relaxed"
              />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-400 space-y-3">
                <Youtube className="w-8 h-8 text-slate-300" />
                <p className="text-xs text-slate-500">Enter your video topic on the left to generate 5 CTR titles, timestamps, and tags.</p>
              </div>
            )}
          </div>

          {youtubeOutput && (
            <AIActionToolbar
              content={youtubeOutput}
              onContentUpdated={(newContent) => {
                setYoutubeOutput(newContent);
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
