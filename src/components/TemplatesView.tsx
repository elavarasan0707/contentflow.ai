import React, { useState, useEffect } from 'react';
import { 
  LayoutTemplate, 
  Sparkles, 
  Film, 
  Flame, 
  MessageSquareQuote, 
  Youtube, 
  SearchCode, 
  ArrowRight, 
  Check, 
  Star 
} from 'lucide-react';
import { api } from '../services/api';
import { ContentTemplate } from '../types';

interface TemplatesViewProps {
  onUseTemplate: (template: ContentTemplate) => void;
}

export const TemplatesView: React.FC<TemplatesViewProps> = ({ onUseTemplate }) => {
  const [templates, setTemplates] = useState<ContentTemplate[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.getTemplates()
      .then(res => setTemplates(res.templates))
      .catch(err => console.warn('Could not load templates', err))
      .finally(() => setIsLoading(false));
  }, []);

  const categories = [
    { id: 'all', label: 'All Templates' },
    { id: 'reels', label: '🎬 Reels & Shorts' },
    { id: 'social', label: '📱 Social Media' },
    { id: 'marketing', label: '🎯 Marketing' },
    { id: 'youtube', label: '▶️ YouTube' },
    { id: 'seo', label: '🔍 SEO' },
  ];

  const filtered = activeCategory === 'all' 
    ? templates 
    : templates.filter(t => t.category === activeCategory);

  return (
    <div id="templates-view-root" className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full text-indigo-700 text-xs font-bold uppercase tracking-wider mb-2">
          <LayoutTemplate className="w-3.5 h-3.5" /> High-Converting Presets
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Prompt Templates Library
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Launch proven frameworks with 1-click presets for storytelling reels, viral hooks, sales carousels, and SEO outlines.
        </p>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
              activeCategory === cat.id
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {isLoading ? (
          <div className="col-span-3 p-12 text-center text-xs text-slate-400">Loading templates...</div>
        ) : (
          filtered.map(template => (
            <div
              key={template.id}
              className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-2xs hover:shadow-md hover:border-indigo-200 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xl p-2 bg-indigo-50 rounded-xl">{template.icon}</span>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                    {template.category}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {template.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {template.description}
                </p>

                <div className="mt-4 p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-[11px] font-mono text-slate-600 truncate">
                  {template.topic_template}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-400 capitalize">
                  {template.platform} • {template.tone}
                </span>
                <button
                  onClick={() => onUseTemplate(template)}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-2xs transition-all flex items-center gap-1 group-hover:shadow-md"
                >
                  <span>Use Template</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
