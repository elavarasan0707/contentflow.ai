import React, { useState } from 'react';
import { 
  Sparkles, 
  Flame, 
  Scissors, 
  BookOpen, 
  Heart, 
  Briefcase, 
  MessageSquare, 
  Globe, 
  Target, 
  Loader2,
  ChevronDown
} from 'lucide-react';
import { AIAction } from '../types';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

interface AIActionToolbarProps {
  content: string;
  onContentUpdated: (newContent: string, meta?: any) => void;
  disabled?: boolean;
}

export const AIActionToolbar: React.FC<AIActionToolbarProps> = ({
  content,
  onContentUpdated,
  disabled = false,
}) => {
  const [activeAction, setActiveAction] = useState<AIAction | null>(null);
  const [showTranslateMenu, setShowTranslateMenu] = useState(false);
  const { success, error } = useToast();

  const handleAction = async (action: AIAction, targetLanguage?: 'english' | 'tamil' | 'thanglish') => {
    if (!content || disabled || activeAction) return;

    setActiveAction(action);
    setShowTranslateMenu(false);

    try {
      const res = await api.transformContent({
        content,
        action,
        targetLanguage,
      });

      if (res.success && res.content) {
        onContentUpdated(res.content, res.meta);
        success(`Applied "${action}" transformation successfully!`);
      }
    } catch (err: any) {
      error(err.message || 'Transformation failed. Please try again.');
    } finally {
      setActiveAction(null);
    }
  };

  const actionButtons: Array<{
    action: AIAction;
    label: string;
    icon: React.ReactNode;
    color: string;
  }> = [
    { action: 'improve', label: 'Improve', icon: <Sparkles className="w-3.5 h-3.5 text-indigo-600" />, color: 'hover:border-indigo-300' },
    { action: 'viral', label: 'Make Viral', icon: <Flame className="w-3.5 h-3.5 text-amber-500" />, color: 'hover:border-amber-300' },
    { action: 'shorten', label: 'Shorten', icon: <Scissors className="w-3.5 h-3.5 text-slate-600" />, color: 'hover:border-slate-300' },
    { action: 'expand', label: 'Expand', icon: <BookOpen className="w-3.5 h-3.5 text-emerald-600" />, color: 'hover:border-emerald-300' },
    { action: 'emotional', label: 'Emotional', icon: <Heart className="w-3.5 h-3.5 text-rose-500" />, color: 'hover:border-rose-300' },
    { action: 'professional', label: 'Professional', icon: <Briefcase className="w-3.5 h-3.5 text-blue-600" />, color: 'hover:border-blue-300' },
    { action: 'conversational', label: 'Conversational', icon: <MessageSquare className="w-3.5 h-3.5 text-teal-600" />, color: 'hover:border-teal-300' },
    { action: 'cta', label: 'Stronger CTA', icon: <Target className="w-3.5 h-3.5 text-purple-600" />, color: 'hover:border-purple-300' },
  ];

  return (
    <div id="ai-actions-toolbar" className="p-3 bg-slate-50 border-t border-slate-200/80 rounded-b-xl flex flex-wrap items-center gap-1.5">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1 select-none">
        <Sparkles className="w-3 h-3 text-indigo-500" /> AI Refine:
      </span>

      {actionButtons.map(btn => (
        <button
          key={btn.action}
          id={`btn-ai-action-${btn.action}`}
          type="button"
          onClick={() => handleAction(btn.action)}
          disabled={disabled || !!activeAction}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-white text-slate-700 border border-slate-200 rounded-lg shadow-2xs hover:bg-slate-50 transition-all ${btn.color} disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {activeAction === btn.action ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
          ) : (
            btn.icon
          )}
          <span>{btn.label}</span>
        </button>
      ))}

      {/* Translate Dropdown */}
      <div className="relative">
        <button
          id="btn-ai-action-translate-toggle"
          type="button"
          onClick={() => setShowTranslateMenu(!showTranslateMenu)}
          disabled={disabled || !!activeAction}
          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-white text-slate-700 border border-slate-200 rounded-lg shadow-2xs hover:bg-slate-50 hover:border-indigo-300 transition-all disabled:opacity-50"
        >
          {activeAction === 'translate' ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
          ) : (
            <Globe className="w-3.5 h-3.5 text-indigo-600" />
          )}
          <span>Translate</span>
          <ChevronDown className="w-3 h-3 text-slate-400" />
        </button>

        {showTranslateMenu && (
          <div 
            id="translate-menu-dropdown"
            className="absolute left-0 bottom-full mb-1 w-36 bg-white border border-slate-200 rounded-xl shadow-xl py-1 z-30 text-xs"
          >
            <button
              onClick={() => handleAction('translate', 'english')}
              className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-slate-700 font-medium flex items-center justify-between"
            >
              <span>🇺🇸 English</span>
            </button>
            <button
              onClick={() => handleAction('translate', 'tamil')}
              className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-slate-700 font-medium flex items-center justify-between"
            >
              <span>🇮🇳 Tamil (தமிழ்)</span>
            </button>
            <button
              onClick={() => handleAction('translate', 'thanglish')}
              className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-slate-700 font-medium flex items-center justify-between"
            >
              <span>🗣️ Thanglish</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
