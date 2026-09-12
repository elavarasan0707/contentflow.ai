import React, { useState } from 'react';
import { 
  Film, 
  Sparkles, 
  Copy, 
  Bookmark, 
  RotateCw, 
  Download, 
  Clock, 
  Video, 
  Sliders, 
  Languages, 
  Loader2,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { Language, Tone, ReelStyle, ContentLength, CtaOption } from '../types';
import { AIActionToolbar } from './AIActionToolbar';

export const ReelGeneratorView: React.FC = () => {
  const { deductCreditLocal, openUpgradeModal } = useAuth();
  const { copied, success, error, info } = useToast();

  const [topic, setTopic] = useState('');
  const [style, setStyle] = useState<ReelStyle>('Viral');
  const [duration, setDuration] = useState<ContentLength>('60 Seconds');
  const [language, setLanguage] = useState<Language>('english');
  const [tone, setTone] = useState<Tone>('Storytelling');
  const [cta, setCta] = useState<CtaOption>('Comment');
  const [useBrandVoice, setUseBrandVoice] = useState(true);

  const [isGenerating, setIsGenerating] = useState(false);
  const [script, setScript] = useState('');
  const [title, setTitle] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!topic.trim()) {
      error('Please specify a Reel topic or key hook idea');
      return;
    }

    setIsGenerating(true);
    setIsSaved(false);

    try {
      const res = await api.generateContent({
        topic,
        contentType: 'reel',
        platform: 'instagram',
        language,
        tone,
        contentLength: duration,
        style,
        cta,
        useBrandVoice,
        autoSave: true
      });

      if (res.success) {
        setScript(res.content);
        setTitle(res.title);
        setIsSaved(true);
        deductCreditLocal(res.credits.remaining, res.credits.limit, res.credits.used);
        success('Reel script generated and formatted!');
      }
    } catch (err: any) {
      if (err.status === 403 || err.message?.includes('Credit limit')) {
        openUpgradeModal();
      } else {
        error(err.message || 'Generation failed');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleManualSave = async () => {
    if (!script) return;
    try {
      await api.saveContent({
        title: title || `Reel: ${topic}`,
        type: 'reel',
        platform: 'instagram',
        language,
        tone,
        topic,
        content: script,
      });
      setIsSaved(true);
      success('Saved to your Content library!');
    } catch (err: any) {
      error(err.message || 'Failed to save');
    }
  };

  const wordCount = script.trim() ? script.trim().split(/\s+/).length : 0;
  const estimatedSeconds = Math.ceil(wordCount / 2.2);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isGenerating && topic.trim()) {
        handleGenerate();
      }
    }
  };

  return (
    <div id="reel-generator-root" className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200 font-sans">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full text-indigo-700 text-xs font-semibold uppercase tracking-wider mb-2">
          <Film className="w-3.5 h-3.5" /> High-Retention Video Suite
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Reels & Shorts Script Generator
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Hook-first video scripts with visual cues, camera directions, and spoken pacing for Instagram Reels, YouTube Shorts, & TikTok.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form (5 cols) */}
        <form onSubmit={handleGenerate} className="lg:col-span-5 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-800">
                Reel Topic / Video Concept <span className="text-rose-500">*</span>
              </label>
              <span className="text-[10px] text-slate-400 font-medium">
                Enter ↵ to send • Shift+Enter for new line
              </span>
            </div>
            <textarea
              id="reel-topic-input"
              rows={3}
              required
              placeholder="Message ContentFlow AI... (e.g. 3 harsh truths about freelancing in 2026)"
              value={topic}
              onKeyDown={handleKeyDown}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full p-3.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-none resize-none leading-relaxed transition-all placeholder:text-slate-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target Duration</label>
              <select
                id="reel-duration-select"
                value={duration}
                onChange={(e) => setDuration(e.target.value as ContentLength)}
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none font-medium"
              >
                <option value="30 Seconds">30s (Snappy / Fast)</option>
                <option value="60 Seconds">60s (Standard Reel)</option>
                <option value="90 Seconds">90s (Deep-dive Story)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Reel Style</label>
              <select
                id="reel-style-select"
                value={style}
                onChange={(e) => setStyle(e.target.value as ReelStyle)}
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none font-medium"
              >
                <option value="Viral">Viral & Provocative</option>
                <option value="Problem/Solution">Problem → Solution</option>
                <option value="Storytelling">Personal Storytelling</option>
                <option value="Educational">Educational Breakdown</option>
                <option value="Listicle">Top 3-5 Listicle</option>
                <option value="Myth vs Fact">Myth vs Fact</option>
                <option value="Emotional">Emotional & Vulnerable</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Language</label>
              <select
                id="reel-language-select"
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tone of Voice</label>
              <select
                id="reel-tone-select"
                value={tone}
                onChange={(e) => setTone(e.target.value as Tone)}
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none font-medium"
              >
                <option value="Storytelling">Storytelling</option>
                <option value="Conversational">Conversational</option>
                <option value="Bold">Bold / Direct</option>
                <option value="Educational">Educational</option>
                <option value="Emotional">Emotional</option>
                <option value="Funny">Witty / Humorous</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Desired Call to Action</label>
            <select
              id="reel-cta-select"
              value={cta}
              onChange={(e) => setCta(e.target.value as CtaOption)}
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none font-medium"
            >
              <option value="Comment">Comment a keyword (e.g. "REEL")</option>
              <option value="Follow">Follow for part 2</option>
              <option value="DM">Send a DM</option>
              <option value="Visit Website">Link in Bio</option>
              <option value="Generate automatically">Automatic AI CTA</option>
            </select>
          </div>

          <button
            id="btn-generate-reel-submit"
            type="submit"
            disabled={isGenerating}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Scripting Hook & Scene Flow...</span>
              </>
            ) : (
              <>
                <Film className="w-4 h-4" />
                <span>Generate Reel Script</span>
              </>
            )}
          </button>
        </form>

        {/* Right Output Display (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-2xl shadow-2xs overflow-hidden flex flex-col min-h-[560px]">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-900">
                {title || 'Reel Script Preview'}
              </span>
            </div>

            {script && (
              <div className="flex items-center gap-1.5">
                <button
                  id="btn-copy-reel-script"
                  onClick={() => {
                    navigator.clipboard.writeText(script);
                    copied('Script copied to clipboard');
                  }}
                  className="p-1.5 px-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors flex items-center gap-1 bg-white shadow-2xs cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Copy</span>
                </button>

                <button
                  id="btn-save-reel-script"
                  onClick={handleManualSave}
                  className={`p-1.5 px-2.5 text-xs font-semibold border rounded-lg transition-colors flex items-center gap-1 shadow-2xs cursor-pointer ${
                    isSaved ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>{isSaved ? 'Saved' : 'Save'}</span>
                </button>

                <button
                  onClick={() => handleGenerate()}
                  disabled={isGenerating}
                  className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 rounded-lg transition-colors bg-white shadow-2xs cursor-pointer"
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
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                <h4 className="text-sm font-semibold text-slate-800">Writing Script & Video Pacing...</h4>
                <p className="text-xs text-slate-400 max-w-xs">Optimizing spoken delivery cadence and visual cue markers.</p>
              </div>
            ) : script ? (
              <div className="flex-1 flex flex-col">
                {/* User Prompt Message Bubble */}
                {topic && (
                  <div className="mb-4 p-3 bg-slate-100/70 border border-slate-200/60 rounded-xl">
                    <div className="text-[11px] font-semibold text-slate-500 mb-1">Your Concept:</div>
                    <p className="text-xs text-slate-800 font-medium leading-relaxed">{topic}</p>
                  </div>
                )}

                <textarea
                  id="reel-script-output-textarea"
                  value={script}
                  onChange={(e) => {
                    setScript(e.target.value);
                    setIsSaved(false);
                  }}
                  className="w-full flex-1 min-h-[360px] p-4 text-xs sm:text-sm font-sans text-slate-800 bg-slate-50/50 border border-slate-200/80 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-none resize-y leading-relaxed"
                />

                {/* Duration Meter */}
                <div className="mt-3 p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl flex items-center justify-between text-xs font-medium text-indigo-900">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-indigo-600" />
                    <span>Estimated Speaking Duration: <strong>~{estimatedSeconds} seconds</strong> ({wordCount} words at ~130 WPM)</span>
                  </div>
                  <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-md">
                    {estimatedSeconds <= 35 ? '30s Pacing' : estimatedSeconds <= 65 ? '60s Pacing' : '90s Pacing'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-400 space-y-3">
                <Video className="w-8 h-8 text-slate-300" />
                <p className="text-xs text-slate-500">Enter your video topic on the left to script your next viral Reel.</p>
              </div>
            )}
          </div>

          {script && (
            <AIActionToolbar
              content={script}
              onContentUpdated={(newScript) => {
                setScript(newScript);
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
