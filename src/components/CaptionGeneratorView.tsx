import React, { useState } from 'react';
import { 
  MessageSquareQuote, 
  Sparkles, 
  Copy, 
  Bookmark, 
  RotateCw, 
  Hash, 
  Globe, 
  Target, 
  Loader2 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { Platform, Language, Tone, CtaOption } from '../types';
import { AIActionToolbar } from './AIActionToolbar';

export const CaptionGeneratorView: React.FC = () => {
  const { deductCreditLocal, openUpgradeModal } = useAuth();
  const { copied, success, error } = useToast();

  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState<Platform>('instagram');
  const [language, setLanguage] = useState<Language>('english');
  const [tone, setTone] = useState<Tone>('Conversational');
  const [cta, setCta] = useState<CtaOption>('DM');

  const [isGenerating, setIsGenerating] = useState(false);
  const [captionOutput, setCaptionOutput] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!topic.trim()) {
      error('Please enter a caption topic or post context');
      return;
    }

    setIsGenerating(true);
    setIsSaved(false);

    try {
      const res = await api.generateContent({
        topic,
        contentType: 'caption',
        platform,
        language,
        tone,
        cta,
        autoSave: true
      });

      if (res.success) {
        setCaptionOutput(res.content);
        setIsSaved(true);
        deductCreditLocal(res.credits.remaining, res.credits.limit, res.credits.used);
        success('Captions and hashtags generated!');
      }
    } catch (err: any) {
      if (err.status === 403 || err.message?.includes('Credit limit')) {
        openUpgradeModal();
      } else {
        error(err.message || 'Caption generation failed');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div id="caption-generator-root" className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 border border-purple-100 rounded-full text-purple-700 text-xs font-bold uppercase tracking-wider mb-2">
          <MessageSquareQuote className="w-3.5 h-3.5" /> High-Engagement Copy
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Social Captions & Hashtag Suite
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Generate short and long-form captions with engaging hooks, line breaks, clear call-to-actions, and 15+ curated hashtags.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form (4 cols) */}
        <form onSubmit={handleGenerate} className="lg:col-span-4 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Post Topic / What is being shared? <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="caption-topic-input"
              rows={3}
              required
              placeholder="e.g. Behind the scenes of launching our new product, lessons learned from losing 3 big clients..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-none resize-none leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Target Platform</label>
            <select
              id="caption-platform-select"
              value={platform}
              onChange={(e) => setPlatform(e.target.value as Platform)}
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none font-medium"
            >
              <option value="instagram">Instagram</option>
              <option value="linkedin">LinkedIn</option>
              <option value="facebook">Facebook</option>
              <option value="x">X (Twitter)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Language</label>
            <select
              id="caption-language-select"
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
            <label className="block text-xs font-bold text-slate-700 mb-1">Tone of Voice</label>
            <select
              id="caption-tone-select"
              value={tone}
              onChange={(e) => setTone(e.target.value as Tone)}
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none font-medium"
            >
              <option value="Conversational">Conversational & Relatable</option>
              <option value="Professional">Professional & Authority</option>
              <option value="Storytelling">Personal Story</option>
              <option value="Educational">Educational Value</option>
              <option value="Emotional">Emotional & Vulnerable</option>
              <option value="Bold">Bold / Hot Take</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Call to Action (CTA)</label>
            <select
              id="caption-cta-select"
              value={cta}
              onChange={(e) => setCta(e.target.value as CtaOption)}
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none font-medium"
            >
              <option value="DM">"DM me for details"</option>
              <option value="Comment">"Drop a comment below"</option>
              <option value="Visit Website">"Link in bio"</option>
              <option value="Follow">"Save & follow for more"</option>
              <option value="Generate automatically">Automatic AI CTA</option>
            </select>
          </div>

          <button
            id="btn-generate-caption-submit"
            type="submit"
            disabled={isGenerating}
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-purple-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Writing Captions...</span>
              </>
            ) : (
              <>
                <MessageSquareQuote className="w-4 h-4" />
                <span>Generate Captions & Tags</span>
              </>
            )}
          </button>
        </form>

        {/* Right Output (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-slate-200/90 rounded-2xl shadow-2xs overflow-hidden flex flex-col min-h-[560px]">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-bold text-slate-900">
              Captions & Hashtags Preview
            </span>

            {captionOutput && (
              <div className="flex items-center gap-1.5">
                <button
                  id="btn-copy-captions"
                  onClick={() => {
                    navigator.clipboard.writeText(captionOutput);
                    copied('Captions copied to clipboard');
                  }}
                  className="p-1.5 px-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors flex items-center gap-1 bg-white shadow-2xs"
                >
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Copy All</span>
                </button>

                <button
                  onClick={() => handleGenerate()}
                  disabled={isGenerating}
                  className="p-1.5 text-slate-500 hover:text-purple-600 hover:bg-purple-50 border border-slate-200 rounded-lg transition-colors bg-white shadow-2xs"
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
                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                <h4 className="text-sm font-bold text-slate-800">Drafting Captions & Tags...</h4>
              </div>
            ) : captionOutput ? (
              <textarea
                id="caption-output-textarea"
                value={captionOutput}
                onChange={(e) => {
                  setCaptionOutput(e.target.value);
                  setIsSaved(false);
                }}
                className="w-full flex-1 min-h-[380px] p-4 text-xs sm:text-sm font-mono text-slate-800 bg-slate-50/50 border border-slate-200/80 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none resize-y leading-relaxed"
              />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-400 space-y-3">
                <MessageSquareQuote className="w-8 h-8 text-slate-300" />
                <p className="text-xs text-slate-500">Fill in your post topic on the left to generate short & long captions with hashtags.</p>
              </div>
            )}
          </div>

          {captionOutput && (
            <AIActionToolbar
              content={captionOutput}
              onContentUpdated={(newContent) => {
                setCaptionOutput(newContent);
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
