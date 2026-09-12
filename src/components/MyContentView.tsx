import React, { useState, useEffect } from 'react';
import { 
  FolderHeart, 
  Search, 
  Film, 
  Flame, 
  MessageSquareQuote, 
  Youtube, 
  SearchCode, 
  Lightbulb, 
  Copy, 
  Trash2, 
  Download, 
  Edit3, 
  Save, 
  X, 
  Clock, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { ContentItem } from '../types';
import { AIActionToolbar } from './AIActionToolbar';

interface MyContentViewProps {
  initialSelectId?: string;
}

export const MyContentView: React.FC<MyContentViewProps> = ({ initialSelectId }) => {
  const { user } = useAuth();
  const { copied, success, error, info } = useToast();

  const [items, setItems] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTypeFilter, setActiveTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Selected Item for Detail / Edit
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const loadContent = async () => {
    setIsLoading(true);
    try {
      const res = await api.getContent({
        type: activeTypeFilter === 'all' ? undefined : activeTypeFilter,
        search: searchQuery || undefined
      });
      setItems(res.items);

      if (initialSelectId && !selectedItem) {
        const found = res.items.find(i => i.id === initialSelectId);
        if (found) {
          handleSelectItem(found);
        }
      }
    } catch (err) {
      console.warn('Could not load content library', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadContent();
  }, [activeTypeFilter, searchQuery]);

  const handleSelectItem = (item: ContentItem) => {
    setSelectedItem(item);
    setEditTitle(item.title);
    setEditContent(item.content);
  };

  const handleSaveEdit = async () => {
    if (!selectedItem) return;
    setIsSavingEdit(true);
    try {
      const res = await api.updateContent(selectedItem.id, {
        title: editTitle,
        content: editContent
      });
      setSelectedItem(res.item);
      setItems(prev => prev.map(i => i.id === res.item.id ? res.item : i));
      success('Changes saved successfully!');
    } catch (err: any) {
      error(err.message || 'Failed to update item');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await api.deleteContent(id);
      setItems(prev => prev.filter(i => i.id !== id));
      if (selectedItem?.id === id) {
        setSelectedItem(null);
      }
      success('Item deleted from your library');
    } catch (err: any) {
      error(err.message || 'Failed to delete');
    }
  };

  const handleDownload = (item: ContentItem) => {
    const blob = new Blob([item.content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(item.title || 'content').replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
    a.click();
    URL.revokeObjectURL(url);
    info('Exported as Markdown file');
  };

  const typeIcons: Record<string, any> = {
    reel: Film,
    hook: Flame,
    caption: MessageSquareQuote,
    youtube: Youtube,
    seo: SearchCode,
    ideas: Lightbulb,
    general: Sparkles
  };

  return (
    <div id="my-content-root" className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full text-indigo-700 text-xs font-bold uppercase tracking-wider mb-2">
            <FolderHeart className="w-3.5 h-3.5" /> Content Vault
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Content Library
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Search, edit, refine with AI, and export all your generated social media assets.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            id="content-library-search-input"
            type="text"
            placeholder="Search saved content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none shadow-2xs"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'all', label: 'All Items' },
          { id: 'reel', label: '🎬 Reels' },
          { id: 'hook', label: '🔥 Viral Hooks' },
          { id: 'caption', label: '📝 Captions' },
          { id: 'youtube', label: '▶️ YouTube' },
          { id: 'seo', label: '🔍 SEO' },
          { id: 'ideas', label: '💡 Ideas' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTypeFilter(tab.id)}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
              activeTypeFilter === tab.id
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grid: List (Left) & Detail Editor (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Items List (5 cols or 12 if no item selected on mobile) */}
        <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-2xl shadow-2xs overflow-hidden">
          <div className="p-3.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700">
            <span>{items.length} Saved Items</span>
            <span className="text-[11px] text-slate-400 font-medium">Click to inspect & edit</span>
          </div>

          <div className="divide-y divide-slate-100 max-h-[620px] overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center text-xs text-slate-400">Loading library...</div>
            ) : items.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No items match your filter. Generate content to see it here!
              </div>
            ) : (
              items.map(item => {
                const isSelected = selectedItem?.id === item.id;
                const Icon = typeIcons[item.type] || Sparkles;

                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelectItem(item)}
                    className={`p-4 transition-all cursor-pointer flex items-start justify-between gap-3 ${
                      isSelected 
                        ? 'bg-indigo-50/70 border-l-4 border-l-indigo-600' 
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">
                          {item.type}
                        </span>
                        <span className="text-[10px] text-slate-400 capitalize">{item.platform}</span>
                        <span className="text-[10px] text-slate-400">•</span>
                        <span className="text-[10px] text-slate-400">{new Date(item.created_at).toLocaleDateString()}</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 truncate">
                        {item.title || item.topic}
                      </h4>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5 font-sans">
                        {item.content.replace(/[#*`_]/g, '')}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigator.clipboard.writeText(item.content);
                          copied('Content copied to clipboard');
                        }}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Copy"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(item.id, e)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Detail / Editor (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-2xl shadow-2xs overflow-hidden min-h-[620px] flex flex-col justify-between">
          {selectedItem ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3">
                <div className="flex-1 min-w-0 pr-2">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full font-bold text-xs sm:text-sm text-slate-900 bg-transparent border-b border-transparent focus:border-indigo-500 focus:outline-none"
                  />
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                    <span className="capitalize">{selectedItem.type}</span>
                    <span>•</span>
                    <span className="capitalize">{selectedItem.platform}</span>
                    <span>•</span>
                    <span className="capitalize">{selectedItem.language}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    id="btn-copy-selected-item"
                    onClick={() => {
                      navigator.clipboard.writeText(editContent);
                      copied('Copied to clipboard');
                    }}
                    className="p-1.5 px-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-2xs flex items-center gap-1"
                  >
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Copy</span>
                  </button>

                  <button
                    id="btn-save-edited-item"
                    onClick={handleSaveEdit}
                    disabled={isSavingEdit}
                    className="p-1.5 px-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-2xs flex items-center gap-1"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save</span>
                  </button>

                  <button
                    onClick={() => handleDownload(selectedItem)}
                    className="p-1.5 text-slate-500 hover:text-slate-800 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-2xs"
                    title="Export Markdown"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDelete(selectedItem.id)}
                    className="p-1.5 text-rose-500 hover:bg-rose-50 border border-slate-200 rounded-lg transition-colors shadow-2xs"
                    title="Delete item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Editable Text Area */}
              <div className="flex-1 p-5 flex flex-col">
                <textarea
                  id="library-item-content-textarea"
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full flex-1 min-h-[380px] p-4 text-xs sm:text-sm font-sans text-slate-800 bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none resize-y leading-relaxed"
                />
              </div>

              {/* AI Transformation Toolbar */}
              <AIActionToolbar
                content={editContent}
                onContentUpdated={(newContent) => {
                  setEditContent(newContent);
                }}
              />
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-400 space-y-3">
              <FolderHeart className="w-10 h-10 text-slate-300" />
              <div>
                <h4 className="text-sm font-bold text-slate-700">No Item Selected</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                  Select any content item from the list on the left to view, edit, or apply AI refinements.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
