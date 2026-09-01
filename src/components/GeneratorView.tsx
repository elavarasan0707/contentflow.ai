import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Copy, 
  Check, 
  RotateCw, 
  Bookmark, 
  Download, 
  Share2, 
  Sliders, 
  Globe, 
  Layers, 
  Target, 
  Clock, 
  MessageSquare,
  Loader2,
  FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { 
  ContentType, 
  Platform, 
  Language, 
  Tone, 
  TargetAudience, 
  ContentLength, 
  CtaOption,
  ContentMeta
} from '../types';
import { AIActionToolbar } from './AIActionToolbar';

interface GeneratorViewProps {
  initialTopic?: string;
  initialType?: string;
}

export const GeneratorView: React.FC<GeneratorViewProps> = ({
  initialTopic = '',
  initialType = 'reel'
}) => {
  const { user, stats, deductCreditLocal, openUpgradeModal } = useAuth();
  const { copied, success, error, info } = useToast();

  const [topic, setTopic] = useState(initialTopic);
  const [contentType, setContentType] = useState<ContentType>((initialType as ContentType) || 'reel');
  const [platform, setPlatform] = useState<Platform>('instagram');
  const [language, setLanguage] = useState<Language>('english');
  const [tone, setTone] = useState<Tone>('Professional');
  const [targetAudience, setTargetAudience] = useState<TargetAudience>('Business Owners');
  const [contentLength, setContentLength] = useState<ContentLength>('60 Seconds');
  const [cta, setCta] = useState<CtaOption>('Generate automatically');
  const [customCta, setCustomCta] = useState('');
  const [useBrandVoice, setUseBrandVoice] = useState(true);

  // Result state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<string>('');
  const [generatedTitle, setGeneratedTitle] = useState<string>('');
  const [generatedMeta, setGeneratedMeta] = useState<ContentMeta | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (initialTopic) setTopic(initialTopic);
    if (initialType) setContentType(initialType as ContentType);
  }, [initialTopic, initialType]);

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!topic.trim()) {
      error('Please enter a content topic or idea');
      return;
    }

    setIsGenerating(true);
    setIsSaved(false);

    try {
      const res = await api.generateContent({
        topic,
        contentType,
        platform,
        language,
        tone,
        targetAudience,
        contentLength,
        cta,
        customCta: cta === 'Custom CTA' ? customCta : undefined,
        useBrandVoice,
        autoSave: true,
      });

      if (res.success) {
        setGeneratedResult(res.content);
        setGeneratedTitle(res.title);
        setGeneratedMeta(res.meta);
        setIsSaved(true);
        deductCreditLocal(res.credits.remaining, res.credits.limit, res.credits.used);
        success('Content generated and saved to your library!');
      }
    } catch (err: any) {
      if (err.status === 403 || err.message?.includes('Credit limit')) {
        openUpgradeModal();
      } else {
        error(err.message || 'Generation failed. Please try again.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleManualSave = async () => {
    if (!generatedResult) return;
    try {
      await api.saveContent({
        title: generatedTitle || topic,
        type: contentType,
        platform,
        language,
        tone,
        topic,
        content: generatedResult,
        meta: generatedMeta || undefined
      });
      setIsSaved(true);
      success('Saved to My Content library!');
    } catch (err: any) {
      error(err.message || 'Failed to save');
    }
  };

  const handleDownloadTxt = () => {
    if (!generatedResult) return;
    const blob = new Blob([generatedResult], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(generatedTitle || topic || 'content').replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    info('Downloaded as TXT file');
  };

  const charCount = generatedResult.length;
  const wordCount = generatedResult.trim() ? generatedResult.trim().split(/\s+/).length : 0;
  const estSeconds = Math.ceil(wordCount / 2.2);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isGenerating && topic.trim()) {
        handleGenerate();
      }
    }
  };

  return (
    <div id="unified-generator-root" className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200 font-['Inter',sans-serif]">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full text-indigo-700 text-xs font-semibold uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5" /> Universal Content Studio
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          AI Content Generator
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Configure prompt frameworks, language settings, and tone traits to generate high-retention copy.
        </p>
      </div>

      {/* Grid: Form (Left) & Output (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Generator Form (5 cols) */}
        <form onSubmit={handleGenerate} className="lg:col-span-5 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-4">
          {/* 1. Topic input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-800">
                Content Prompt <span className="text-rose-500">*</span>
              </label>
              <span className="text-[10px] text-slate-400 font-medium">
                Enter ↵ to send • Shift+Enter for new line
              </span>
            </div>
            <div className="relative">
              <textarea
                id="generator-topic-input"
                rows={3}
                required
                placeholder="Message ContentFlow AI..."
                value={topic}
                onKeyDown={handleKeyDown}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full p-3.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-none resize-none leading-relaxed transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* 2. Format & Platform Selector */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Content Type</label>
              <select
                id="generator-content-type-select"
                value={contentType}
                onChange={(e) => setContentType(e.target.value as ContentType)}
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none font-medium"
              >
                <option value="reel">🎬 Reel Script</option>
                <option value="hook">🔥 Viral Hooks</option>
                <option value="caption">📝 Captions & Hashtags</option>
                <option value="youtube">▶️ YouTube Suite</option>
                <option value="seo">🔍 SEO Article/Copy</option>
                <option value="ideas">💡 Content Ideas</option>
                <option value="carousel">📑 Carousel Slides</option>
                <option value="ad">🎯 High-Converting Ad</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Platform</label>
              <select
                id="generator-platform-select"
                value={platform}
                onChange={(e) => setPlatform(e.target.value as Platform)}
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none font-medium"
              >
                <option value="instagram">Instagram</option>
                <option value="youtube">YouTube</option>
                <option value="linkedin">LinkedIn</option>
                <option value="facebook">Facebook</option>
                <option value="x">X (Twitter)</option>
                <option value="all">Multi-Platform</option>
              </select>
            </div>
          </div>

          {/* 3. Language & Tone */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Language</label>
              <select
                id="generator-language-select"
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tone</label>
              <select
                id="generator-tone-select"
                value={tone}
                onChange={(e) => setTone(e.target.value as Tone)}
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none font-medium"
              >
                <option value="Professional">Professional</option>
                <option value="Conversational">Conversational</option>
                <option value="Storytelling">Storytelling</option>
                <option value="Educational">Educational</option>
                <option value="Emotional">Emotional</option>
                <option value="Funny">Humorous / Witty</option>
                <option value="Bold">Bold & Provocative</option>
                <option value="Inspirational">Inspirational</option>
              </select>
            </div>
          </div>

          {/* 4. Target Audience & Length */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Audience</label>
              <select
                id="generator-audience-select"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value as TargetAudience)}
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none font-medium"
              >
                <option value="Business Owners">Business Owners</option>
                <option value="Creators">Content Creators</option>
                <option value="Students">Students / Beginners</option>
                <option value="Professionals">Working Professionals</option>
                <option value="Parents">Parents / Families</option>
                <option value="Local Customers">Local Customers</option>
                <option value="General Audience">General Audience</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Length / Duration</label>
              <select
                id="generator-length-select"
                value={contentLength}
                onChange={(e) => setContentLength(e.target.value as ContentLength)}
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none font-medium"
              >
                <option value="30 Seconds">30s (Ultra Short)</option>
                <option value="60 Seconds">60s (Standard Reel)</option>
                <option value="90 Seconds">90s (In-depth Reel)</option>
                <option value="Short">Short Post</option>
                <option value="Medium">Medium Form</option>
                <option value="Long">Long Form Detailed</option>
              </select>
            </div>
          </div>

          {/* 5. Call To Action (CTA) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Call To Action (CTA)</label>
            <select
              id="generator-cta-select"
              value={cta}
              onChange={(e) => setCta(e.target.value as CtaOption)}
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none font-medium"
            >
              <option value="Generate automatically">Generate automatically</option>
              <option value="Follow">Follow for more tips</option>
              <option value="Comment">Comment below</option>
              <option value="DM">Send a Direct Message (DM)</option>
              <option value="Visit Website">Visit Website / Link in Bio</option>
              <option value="Book Now">Book a free consultation</option>
              <option value="Custom CTA">Custom Call to Action</option>
            </select>

            {cta === 'Custom CTA' && (
              <input
                id="generator-custom-cta-input"
                type="text"
                placeholder="e.g. Register for our masterclass this Sunday"
                value={customCta}
                onChange={(e) => setCustomCta(e.target.value)}
                className="w-full mt-2 p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none"
              />
            )}
          </div>

          {/* Brand Voice Toggle */}
          <div className="flex items-center justify-between p-3 bg-indigo-50/60 border border-indigo-100 rounded-xl">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-600" />
              <div>
                <span className="text-xs font-semibold text-slate-800 block">Apply Brand Voice</span>
                <span className="text-[10px] text-slate-500">Inject your customized tone & persona</span>
              </div>
            </div>
            <button
              type="button"
              id="btn-toggle-brand-voice"
              onClick={() => setUseBrandVoice(!useBrandVoice)}
              className={`relative w-10 h-5 rounded-full transition-colors p-0.5 cursor-pointer ${useBrandVoice ? 'bg-indigo-600' : 'bg-slate-300'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${useBrandVoice ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>

          {/* Generate Button */}
          <button
            id="btn-generate-content-submit"
            type="submit"
            disabled={isGenerating}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Crafting High-Converting Copy...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Content</span>
              </>
            )}
          </button>
        </form>

        {/* Right Column: Result Display & Editor (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-2xl shadow-2xs overflow-hidden flex flex-col min-h-[560px]">
          {/* Result Card Header */}
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold text-slate-900 truncate">
                {generatedTitle || 'Generated Content Preview'}
              </span>
            </div>

            {/* Actions: Copy, Save, Download, Regenerate */}
            {generatedResult && (
              <div className="flex items-center gap-1.5">
                <button
                  id="btn-copy-generated-content"
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(generatedResult);
                    copied('Content copied to clipboard');
                  }}
                  className="p-1.5 px-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors flex items-center gap-1 bg-white shadow-2xs cursor-pointer"
                  title="Copy to clipboard"
                >
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Copy</span>
                </button>

                <button
                  id="btn-save-generated-content"
                  type="button"
                  onClick={handleManualSave}
                  className={`p-1.5 px-2.5 text-xs font-semibold border rounded-lg transition-colors flex items-center gap-1 shadow-2xs cursor-pointer ${
                    isSaved 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                      : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>{isSaved ? 'Saved' : 'Save'}</span>
                </button>

                <button
                  id="btn-download-txt"
                  type="button"
                  onClick={handleDownloadTxt}
                  className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors bg-white shadow-2xs cursor-pointer"
                  title="Download .txt"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>

                <button
                  id="btn-regenerate-content"
                  type="button"
                  disabled={isGenerating}
                  onClick={() => handleGenerate()}
                  className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 rounded-lg transition-colors bg-white shadow-2xs cursor-pointer"
                  title="Regenerate"
                >
                  <RotateCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                </button>
              </div>
            )}
          </div>

          {/* Result Content Box */}
          <div className="flex-1 p-5 flex flex-col">
            {isGenerating ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
                <h4 className="text-sm font-semibold text-slate-800">Generating Response...</h4>
                <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                  Crafting structured copy with retention psychology, formatting, and high readability.
                </p>
              </div>
            ) : generatedResult ? (
              <div className="flex-1 flex flex-col">
                {/* User Prompt Message bubble */}
                {topic && (
                  <div className="mb-4 p-3 bg-slate-100/70 border border-slate-200/60 rounded-xl">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 mb-1">
                      <MessageSquare className="w-3 h-3 text-slate-400" />
                      <span>Your Prompt:</span>
                    </div>
                    <p className="text-xs text-slate-800 leading-relaxed font-medium">
                      {topic}
                    </p>
                  </div>
                )}

                <textarea
                  id="generator-output-textarea"
                  value={generatedResult}
                  onChange={(e) => {
                    setGeneratedResult(e.target.value);
                    setIsSaved(false);
                  }}
                  className="w-full flex-1 min-h-[360px] p-4 text-xs sm:text-sm font-sans text-slate-800 bg-slate-50/50 border border-slate-200/80 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-none resize-y leading-relaxed"
                />

                {/* Content Stats footer */}
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 font-medium">
                  <div className="flex items-center gap-3">
                    <span>{wordCount} words</span>
                    <span>•</span>
                    <span>{charCount} characters</span>
                    <span>•</span>
                    <span className="text-indigo-600 font-semibold flex items-center gap-1">
                      <Clock className="w-3 h-3" /> ~{estSeconds}s speech
                    </span>
                  </div>
                  <span className="text-slate-400">Click text to edit directly</span>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-400 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-700">No Content Generated Yet</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs">
                    Type a prompt on the left and press Enter to generate copy with ContentFlow AI.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* AI Refine Action Toolbar */}
          {generatedResult && (
            <AIActionToolbar
              content={generatedResult}
              onContentUpdated={(newContent, meta) => {
                setGeneratedResult(newContent);
                if (meta) setGeneratedMeta(meta);
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
