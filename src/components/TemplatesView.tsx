import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutTemplate, 
  Search, 
  Star, 
  Clock, 
  ArrowRight, 
  Sparkles, 
  Copy, 
  Check, 
  X, 
  Eye, 
  ShieldAlert, 
  Sparkle,
  SlidersHorizontal,
  Bookmark,
  Layers,
  ChevronRight
} from 'lucide-react';
import { api } from '../services/api';
import { ContentTemplate } from '../types';

interface TemplatesViewProps {
  onUseTemplate: (template: ContentTemplate) => void;
}

interface CategoryDef {
  id: string;
  label: string;
  emoji?: string;
}

export const TemplatesView: React.FC<TemplatesViewProps> = ({ onUseTemplate }) => {
  const [templates, setTemplates] = useState<ContentTemplate[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [previewTemplate, setPreviewTemplate] = useState<ContentTemplate | null>(null);
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);

  // Load templates & user preferences
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    Promise.all([
      api.getTemplates(),
      api.getTemplateUserData().catch(() => ({ favorites: [], recent: [] }))
    ])
      .then(([templatesRes, userRes]) => {
        if (!isMounted) return;
        setTemplates(templatesRes.templates || []);
        if (userRes) {
          setFavorites(userRes.favorites || []);
          setRecentIds(userRes.recent || []);
        }
      })
      .catch(err => {
        console.warn('Could not load templates', err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const categories: CategoryDef[] = [
    { id: 'all', label: 'All Templates' },
    { id: 'reels', label: '🎬 Reels & Shorts' },
    { id: 'social', label: '📱 Social Media' },
    { id: 'marketing', label: '🎯 Marketing' },
    { id: 'youtube', label: '▶️ YouTube' },
    { id: 'seo', label: '🔍 SEO' },
    { id: 'copywriting', label: '✍️ Copywriting' },
    { id: 'sales', label: '💰 Sales' },
    { id: 'business', label: '🏢 Business' },
    { id: 'personal-brand', label: '👤 Personal Brand' },
    { id: 'education', label: '📚 Education' },
    { id: 'healthcare', label: '🏥 Healthcare' },
    { id: 'local-business', label: '🍽️ Local Business' },
    { id: 'ads', label: '📢 Ads' },
    { id: 'planning', label: '📅 Content Planning' },
    { id: 'favorites', label: '⭐ Favorites' },
    { id: 'recent', label: '🕘 Recently Used' },
  ];

  // Toggle favorite with instant UI feedback and backend sync
  const handleToggleFavorite = async (e: React.MouseEvent, templateId: string) => {
    e.stopPropagation();
    const isFav = favorites.includes(templateId);
    const newFavorites = isFav 
      ? favorites.filter(id => id !== templateId)
      : [...favorites, templateId];
    
    setFavorites(newFavorites);

    try {
      await api.toggleTemplateFavorite(templateId);
    } catch (err) {
      console.error('Failed to sync favorite', err);
    }
  };

  // Launch template
  const handleSelectTemplate = (template: ContentTemplate) => {
    // Record recent
    const updatedRecent = [template.id, ...recentIds.filter(id => id !== template.id)].slice(0, 30);
    setRecentIds(updatedRecent);
    api.trackTemplateUse(template.id).catch(() => {});
    
    // Close preview if open
    setPreviewTemplate(null);
    
    // Pass to parent
    onUseTemplate(template);
  };

  const handleCopyPrompt = (e: React.MouseEvent, template: ContentTemplate) => {
    e.stopPropagation();
    const textToCopy = template.topic_template;
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopiedPromptId(template.id);
      setTimeout(() => setCopiedPromptId(null), 2000);
    });
  };

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: templates.length,
      favorites: favorites.length,
      recent: recentIds.length
    };

    templates.forEach(t => {
      counts[t.category] = (counts[t.category] || 0) + 1;
    });

    return counts;
  }, [templates, favorites, recentIds]);

  // Distinct platforms for secondary filtering
  const availablePlatforms = useMemo(() => {
    const set = new Set<string>();
    templates.forEach(t => {
      if (t.platform) set.add(t.platform.toLowerCase());
    });
    return Array.from(set).sort();
  }, [templates]);

  // Filtered templates list
  const filteredTemplates = useMemo(() => {
    return templates.filter(template => {
      // 1. Category check
      if (activeCategory === 'favorites') {
        if (!favorites.includes(template.id)) return false;
      } else if (activeCategory === 'recent') {
        if (!recentIds.includes(template.id)) return false;
      } else if (activeCategory !== 'all') {
        if (template.category !== activeCategory) return false;
      }

      // 2. Platform filter
      if (selectedPlatform !== 'all') {
        if (template.platform.toLowerCase() !== selectedPlatform.toLowerCase()) {
          return false;
        }
      }

      // 3. Search query check
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchTitle = template.title.toLowerCase().includes(query);
        const matchDesc = template.description.toLowerCase().includes(query);
        const matchTopic = template.topic_template.toLowerCase().includes(query);
        const matchPlatform = template.platform.toLowerCase().includes(query);
        const matchTone = template.tone.toLowerCase().includes(query);
        const matchFramework = template.framework?.toLowerCase().includes(query) || false;
        const matchKeywords = template.keywords?.some(k => k.toLowerCase().includes(query)) || false;
        const matchAudience = template.audience?.toLowerCase().includes(query) || false;

        return matchTitle || matchDesc || matchTopic || matchPlatform || matchTone || matchFramework || matchKeywords || matchAudience;
      }

      return true;
    });
  }, [templates, activeCategory, selectedPlatform, searchQuery, favorites, recentIds]);

  return (
    <div id="templates-view-root" className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header section - strictly preserves requested title & subtitle */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full text-indigo-700 text-xs font-bold uppercase tracking-wider mb-2">
            <LayoutTemplate className="w-3.5 h-3.5" /> High-Converting Presets
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Prompt Templates Library
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl leading-relaxed">
            Launch proven frameworks with 1-click presets for storytelling reels, viral hooks, sales carousels, and SEO outlines.
          </p>
        </div>

        {/* Quick stats pill */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <div className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 shadow-2xs flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span><strong className="text-slate-900 font-bold">{templates.length}</strong> Templates</span>
          </div>
          {favorites.length > 0 && (
            <button
              onClick={() => setActiveCategory('favorites')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                activeCategory === 'favorites'
                  ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-2xs'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span><strong>{favorites.length}</strong> Starred</span>
            </button>
          )}
        </div>
      </div>

      {/* Search & Platform Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search templates by keyword, framework (PAS, AIDA), hook, or industry..."
            className="w-full pl-10 pr-9 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-2xs transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Platform quick filter */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              aria-label="Filter by platform"
              className="appearance-none pl-3.5 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-2xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer"
            >
              <option value="all">All Platforms</option>
              {availablePlatforms.map(p => (
                <option key={p} value={p}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </option>
              ))}
            </select>
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {(searchQuery || selectedPlatform !== 'all' || activeCategory !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedPlatform('all');
                setActiveCategory('all');
              }}
              className="px-3 py-2.5 text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all"
              title="Reset all filters"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Category Pills (instant client-side filtering without page reload) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 scrollbar-thin scrollbar-thumb-slate-200">
        {categories.map(cat => {
          const count = categoryCounts[cat.id] || 0;
          const isActive = activeCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/25 ring-1 ring-indigo-600'
                  : 'bg-white text-slate-600 hover:bg-slate-100/90 border border-slate-200/90 hover:border-slate-300'
              }`}
            >
              <span>{cat.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                isActive ? 'bg-indigo-700/80 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <div>
          Showing <span className="font-bold text-slate-800">{filteredTemplates.length}</span> {filteredTemplates.length === 1 ? 'framework preset' : 'framework presets'}
          {activeCategory !== 'all' && (
            <span> in <span className="font-semibold text-indigo-600">{categories.find(c => c.id === activeCategory)?.label}</span></span>
          )}
          {searchQuery && (
            <span> matching &ldquo;<strong className="text-slate-700">{searchQuery}</strong>&rdquo;</span>
          )}
        </div>
      </div>

      {/* Templates Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="p-6 bg-white border border-slate-200/80 rounded-2xl animate-pulse space-y-4">
              <div className="flex justify-between items-center">
                <div className="w-10 h-10 bg-slate-200 rounded-xl"></div>
                <div className="w-16 h-5 bg-slate-200 rounded"></div>
              </div>
              <div className="w-3/4 h-5 bg-slate-200 rounded"></div>
              <div className="w-full h-12 bg-slate-100 rounded"></div>
              <div className="w-full h-8 bg-slate-50 rounded"></div>
            </div>
          ))}
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="p-12 text-center bg-white border border-dashed border-slate-300 rounded-2xl space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">No templates match your filters</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Try adjusting your search query or selecting &quot;All Templates&quot; to explore our 130+ viral frameworks.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedPlatform('all');
              setActiveCategory('all');
            }}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all shadow-2xs"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTemplates.map(template => {
            const isFavorite = favorites.includes(template.id);
            const isRecent = recentIds.includes(template.id);

            return (
              <div
                key={template.id}
                id={`template-card-${template.id}`}
                className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-2xs hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between group relative"
              >
                <div>
                  {/* Top Bar: Icon, Category Badge, Favorite Star */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl p-2 bg-indigo-50 border border-indigo-100/50 rounded-xl leading-none flex items-center justify-center shadow-2xs">
                        {template.icon}
                      </span>
                      {isRecent && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200/80 flex items-center gap-0.5">
                          <Clock className="w-2.5 h-2.5" /> Recent
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200/60 tracking-wider">
                        {template.category}
                      </span>
                      <button
                        onClick={(e) => handleToggleFavorite(e, template.id)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          isFavorite 
                            ? 'text-amber-500 hover:text-amber-600 bg-amber-50' 
                            : 'text-slate-300 hover:text-slate-500 hover:bg-slate-100'
                        }`}
                        title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                        aria-label="Toggle favorite"
                      >
                        <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-400 text-amber-500' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                    {template.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">
                    {template.description}
                  </p>

                  {/* Framework tag & Duration if present */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-3">
                    {template.framework && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-50/70 text-indigo-700 border border-indigo-100">
                        {template.framework}
                      </span>
                    )}
                    {template.duration && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100">
                        {template.duration}
                      </span>
                    )}
                    {template.safety_note && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                        <ShieldAlert className="w-2.5 h-2.5" /> Disclaimer included
                      </span>
                    )}
                  </div>

                  {/* Topic placeholder prompt box */}
                  <div className="mt-3.5 p-2.5 bg-slate-50/90 border border-slate-100 rounded-xl text-[11px] font-sans text-slate-600 group-hover:border-indigo-100 transition-all">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      <span>Starter Prompt</span>
                      <button
                        onClick={(e) => handleCopyPrompt(e, template)}
                        className="hover:text-indigo-600 transition-colors flex items-center gap-0.5"
                        title="Copy prompt"
                      >
                        {copiedPromptId === template.id ? (
                          <span className="text-emerald-600 flex items-center gap-0.5"><Check className="w-2.5 h-2.5" /> Copied</span>
                        ) : (
                          <span className="flex items-center gap-0.5"><Copy className="w-2.5 h-2.5" /> Copy</span>
                        )}
                      </button>
                    </div>
                    <p className="line-clamp-2 italic text-slate-700">
                      &ldquo;{template.topic_template}&rdquo;
                    </p>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 capitalize">
                    <span>{template.platform}</span>
                    <span>•</span>
                    <span>{template.tone}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setPreviewTemplate(template)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all"
                      title="Inspect full template details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleSelectTemplate(template)}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-2xs transition-all flex items-center gap-1 group-hover:shadow-md cursor-pointer"
                    >
                      <span>Use Template</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <span className="text-2xl p-2 bg-indigo-50 border border-indigo-100 rounded-xl leading-none">
                  {previewTemplate.icon}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {previewTemplate.category}
                    </span>
                    <span className="text-xs font-semibold text-slate-400 capitalize">
                      {previewTemplate.platform} • {previewTemplate.tone}
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-slate-900 mt-0.5">
                    {previewTemplate.title}
                  </h2>
                </div>
              </div>

              <button
                onClick={() => setPreviewTemplate(null)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Framework Objective
                </h4>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {previewTemplate.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 font-semibold block text-[10px] uppercase">Framework</span>
                  <span className="text-slate-800 font-bold">{previewTemplate.framework || 'Custom High-Converting Hook'}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block text-[10px] uppercase">Target Duration / Length</span>
                  <span className="text-slate-800 font-bold">{previewTemplate.duration || 'Optimal for platform algorithm'}</span>
                </div>
                {previewTemplate.audience && (
                  <div className="col-span-2">
                    <span className="text-slate-400 font-semibold block text-[10px] uppercase">Best For Audience</span>
                    <span className="text-slate-800 font-bold">{previewTemplate.audience}</span>
                  </div>
                )}
              </div>

              {previewTemplate.safety_note && (
                <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-xl text-xs text-amber-800 flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold">Compliance Note: </strong>
                    {previewTemplate.safety_note}
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Recommended Prompt Template
                  </h4>
                  <button
                    onClick={(e) => handleCopyPrompt(e, previewTemplate)}
                    className="text-xs text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1"
                  >
                    {copiedPromptId === previewTemplate.id ? (
                      <span className="text-emerald-600 flex items-center gap-1"><Check className="w-3 h-3" /> Copied</span>
                    ) : (
                      <span className="flex items-center gap-1"><Copy className="w-3 h-3" /> Copy Prompt</span>
                    )}
                  </button>
                </div>
                <div className="p-3.5 bg-slate-900 text-slate-100 rounded-xl font-mono text-xs leading-relaxed border border-slate-800">
                  {previewTemplate.topic_template}
                </div>
              </div>

              {previewTemplate.keywords && previewTemplate.keywords.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Key Algorithm Triggers
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {previewTemplate.keywords.map((kw, i) => (
                      <span key={i} className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                        #{kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <button
                onClick={(e) => handleToggleFavorite(e, previewTemplate.id)}
                className="px-3 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all flex items-center gap-1.5"
              >
                <Star className={`w-4 h-4 ${favorites.includes(previewTemplate.id) ? 'fill-amber-400 text-amber-500' : ''}`} />
                <span>{favorites.includes(previewTemplate.id) ? 'Starred in Favorites' : 'Add to Favorites'}</span>
              </button>

              <button
                onClick={() => handleSelectTemplate(previewTemplate)}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>Launch in AI Generator</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
