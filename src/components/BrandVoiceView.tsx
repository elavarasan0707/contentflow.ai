import React, { useState, useEffect } from 'react';
import { 
  Sliders, 
  Sparkles, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  TestTube, 
  RefreshCw, 
  Copy, 
  Loader2,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { BrandVoice } from '../types';

export const BrandVoiceView: React.FC = () => {
  const { user, refreshUserData } = useAuth();
  const { success, error, info, copied } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testOutput, setTestOutput] = useState('');

  const [voiceData, setVoiceData] = useState<BrandVoice>({
    brand_name: 'ContentFlow AI',
    business_description: 'AI-powered content studio for modern digital marketers and creators',
    target_audience: 'Content creators, digital marketing agencies, freelancers, students',
    preferred_tone: 'Direct, Conversational, High-energy, Practical',
    words_to_use: 'practical, high-converting, retention, frameworks, scale, organic reach',
    words_to_avoid: 'supercharge, revolutionize, delve, tapestry, cutting-edge, leverage, game-changer',
    brand_personality: 'Helpful expert mentor who cuts through marketing fluff and teaches raw execution',
    cta_style: 'Direct keyword trigger (e.g. "Comment \'GROWTH\' below")',
    is_active: true
  });

  const loadBrandVoice = async () => {
    try {
      const res = await api.getBrandVoice();
      if (res.brandVoice) {
        setVoiceData(res.brandVoice);
      }
    } catch (err) {
      console.warn('Could not fetch brand voice', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBrandVoice();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await api.updateBrandVoice(voiceData);
      setVoiceData(res.brandVoice);
      await refreshUserData();
      success('Brand Voice persona updated and saved!');
    } catch (err: any) {
      error(err.message || 'Failed to save brand voice');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestVoice = async () => {
    setIsTesting(true);
    setTestOutput('');
    try {
      const testTopic = `A 30-second Reel hook for ${voiceData.brand_name || 'our brand'} about why organic social content beats paid ads in 2026`;
      const res = await api.generateContent({
        topic: testTopic,
        contentType: 'reel',
        language: 'english',
        useBrandVoice: true,
        autoSave: false
      });

      if (res.success) {
        setTestOutput(res.content);
        info('Sample test generated using your Brand Voice settings!');
      }
    } catch (err: any) {
      error(err.message || 'Voice test failed');
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div id="brand-voice-root" className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 border border-purple-100 rounded-full text-purple-700 text-xs font-bold uppercase tracking-wider mb-2">
          <Sliders className="w-3.5 h-3.5" /> Persona Calibration
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Brand Voice Studio
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Train ContentFlow AI to adopt your brand's unique personality, vocabulary, and strict anti-slop rules across every generation.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Form (7 cols) */}
        <form onSubmit={handleSave} className="lg:col-span-7 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900">Brand Voice Status</span>
              <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${voiceData.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                {voiceData.is_active ? 'Active on all generators' : 'Disabled'}
              </span>
            </div>

            <button
              type="button"
              id="btn-toggle-brand-voice-active"
              onClick={() => setVoiceData({ ...voiceData, is_active: !voiceData.is_active })}
              className={`relative w-11 h-6 rounded-full transition-colors p-1 ${voiceData.is_active ? 'bg-indigo-600' : 'bg-slate-300'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${voiceData.is_active ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Brand or Company Name</label>
              <input
                id="bv-name-input"
                type="text"
                required
                value={voiceData.brand_name}
                onChange={(e) => setVoiceData({ ...voiceData, brand_name: e.target.value })}
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Preferred Tone</label>
              <input
                id="bv-tone-input"
                type="text"
                placeholder="e.g. Direct, Energetic, Relatable"
                value={voiceData.preferred_tone}
                onChange={(e) => setVoiceData({ ...voiceData, preferred_tone: e.target.value })}
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Business Description & Core Offer</label>
            <textarea
              id="bv-desc-input"
              rows={2}
              value={voiceData.business_description}
              onChange={(e) => setVoiceData({ ...voiceData, business_description: e.target.value })}
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none resize-none leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Target Audience Profile</label>
            <input
              id="bv-audience-input"
              type="text"
              value={voiceData.target_audience}
              onChange={(e) => setVoiceData({ ...voiceData, target_audience: e.target.value })}
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Brand Persona & Speaking Character</label>
            <textarea
              id="bv-personality-input"
              rows={2}
              placeholder="e.g. A seasoned practitioner who gives brutally honest advice with actionable step-by-step clarity"
              value={voiceData.brand_personality}
              onChange={(e) => setVoiceData({ ...voiceData, brand_personality: e.target.value })}
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none resize-none leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-emerald-700 mb-1">✅ Words / Phrases To Use</label>
              <textarea
                id="bv-words-use-input"
                rows={2}
                placeholder="practical, organic reach, retention, scalable"
                value={voiceData.words_to_use}
                onChange={(e) => setVoiceData({ ...voiceData, words_to_use: e.target.value })}
                className="w-full p-2 text-xs bg-emerald-50/40 border border-emerald-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-rose-700 mb-1">❌ Words / Jargon To Avoid</label>
              <textarea
                id="bv-words-avoid-input"
                rows={2}
                placeholder="supercharge, tapestry, delve, unleash, game-changing"
                value={voiceData.words_to_avoid}
                onChange={(e) => setVoiceData({ ...voiceData, words_to_avoid: e.target.value })}
                className="w-full p-2 text-xs bg-rose-50/40 border border-rose-200 rounded-xl focus:bg-white focus:border-rose-500 focus:outline-none resize-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Signature Call To Action Style</label>
            <input
              id="bv-cta-style-input"
              type="text"
              value={voiceData.cta_style}
              onChange={(e) => setVoiceData({ ...voiceData, cta_style: e.target.value })}
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-between">
            <button
              id="btn-save-brand-voice"
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-500/20 transition-all flex items-center gap-2 disabled:opacity-60"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save Brand Voice</span>
            </button>

            <button
              id="btn-test-brand-voice"
              type="button"
              disabled={isTesting}
              onClick={handleTestVoice}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-all flex items-center gap-2"
            >
              {isTesting ? <Loader2 className="w-4 h-4 animate-spin text-indigo-600" /> : <TestTube className="w-4 h-4 text-purple-600" />}
              <span>Test Calibrated Output</span>
            </button>
          </div>
        </form>

        {/* Right Info & Live Test Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Quick Info Box */}
          <div className="bg-gradient-to-br from-indigo-900 to-purple-950 p-6 rounded-2xl text-white shadow-md">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="w-5 h-5 text-indigo-300" />
              <h3 className="text-sm font-bold">Why Brand Voice Matters</h3>
            </div>
            <p className="text-xs text-indigo-200 leading-relaxed mb-4">
              When Brand Voice is enabled, the Gemini prompt engine injects these exact guidelines into every Reel, Hook, and Caption you generate so your content sounds uniquely like you, not a generic robot.
            </p>
            <div className="text-[11px] text-indigo-300/90 font-sans bg-white/10 p-3 rounded-xl">
              ✓ Active on all 6 generators<br />
              ✓ Strict anti-slop vocabulary enforcement<br />
              ✓ Spoken pacing calibration
            </div>
          </div>

          {/* Live Test Output Display */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs min-h-[300px] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  Live Voice Test Output
                </span>
                {testOutput && (
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(testOutput);
                      copied('Test output copied!');
                    }}
                    className="p-1 text-slate-400 hover:text-slate-700"
                    title="Copy"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {isTesting ? (
                <div className="p-8 text-center">
                  <Loader2 className="w-6 h-6 animate-spin text-purple-600 mx-auto mb-2" />
                  <p className="text-xs text-slate-500">Generating live sample in your calibrated voice...</p>
                </div>
              ) : testOutput ? (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-sans text-slate-800 whitespace-pre-wrap leading-relaxed">
                  {testOutput}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400 text-xs">
                  Click "Test Calibrated Output" above to verify how your Brand Voice persona sounds in action.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
