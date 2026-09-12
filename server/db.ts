import fs from 'fs';
import path from 'path';
import { ALL_TEMPLATES } from '../src/data/templatesData';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  avatar?: string;
  role: 'user' | 'admin';
  tier: 'free' | 'pro' | 'agency';
  credits_used: number;
  credits_limit: number;
  created_at: string;
  disabled?: boolean;
  creator_name?: string;
  preferences?: {
    defaultLanguage?: string;
    defaultPlatform?: string;
    theme?: string;
  };
}

export interface BrandVoice {
  id: string;
  user_id: string;
  brand_name: string;
  business_description: string;
  target_audience: string;
  preferred_tone: string;
  words_to_use: string;
  words_to_avoid: string;
  brand_personality: string;
  cta_style: string;
  is_active: boolean;
  updated_at: string;
}

export interface ContentItem {
  id: string;
  user_id: string;
  title: string;
  type: string; // 'reel' | 'hook' | 'caption' | 'youtube' | 'seo' | 'ideas' | 'general'
  platform: string; // 'instagram' | 'youtube' | 'linkedin' | 'facebook' | 'x' | 'all'
  language: string; // 'english' | 'tamil' | 'thanglish'
  tone: string;
  topic: string;
  content: string;
  structured_data?: any;
  meta?: {
    estimated_duration?: string;
    word_count?: number;
    char_count?: number;
    tags?: string[];
  };
  created_at: string;
  updated_at: string;
}

export interface ContentTemplate {
  id: string;
  title: string;
  description: string;
  category: 'reels' | 'social' | 'marketing' | 'youtube' | 'seo';
  icon: string;
  type: string;
  platform: string;
  tone: string;
  topic_template: string;
  prompt_preset: Record<string, any>;
}

export interface UsageLog {
  id: string;
  user_id: string;
  type: string;
  platform: string;
  topic: string;
  created_at: string;
}

interface DatabaseSchema {
  users: User[];
  brand_voices: BrandVoice[];
  content: ContentItem[];
  usage_logs: UsageLog[];
  templates: ContentTemplate[];
  user_favorites?: Record<string, string[]>;
  user_recent_templates?: Record<string, { template_id: string; used_at: string }[]>;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'contentflow_db.json');

// Default initial templates
const DEFAULT_TEMPLATES: ContentTemplate[] = [
  {
    id: 'tpl-60s-reel',
    title: '60 Second Viral Reel',
    description: 'High-retention video script structured for maximum watch time and comment engagement.',
    category: 'reels',
    icon: 'film',
    type: 'reel',
    platform: 'instagram',
    tone: 'Conversational',
    topic_template: '3 secret productivity hacks top entrepreneurs use daily',
    prompt_preset: {
      duration: '60 Seconds',
      style: 'Viral',
      target_audience: 'Creators'
    }
  },
  {
    id: 'tpl-problem-solution',
    title: 'Problem → Solution Hook & Body',
    description: 'Call out a painful audience mistake, agitate the frustration, and deliver the clear fix.',
    category: 'marketing',
    icon: 'zap',
    type: 'general',
    platform: 'linkedin',
    tone: 'Educational',
    topic_template: 'Why 90% of lead magnets fail and the 1-page framework that actually converts',
    prompt_preset: {
      length: 'Medium',
      cta: 'DM',
      target_audience: 'Business Owners'
    }
  },
  {
    id: 'tpl-educational-reel',
    title: 'Educational Reel Breakdown',
    description: 'Step-by-step tutorial or quick educational concept that positions you as the niche authority.',
    category: 'reels',
    icon: 'graduation-cap',
    type: 'reel',
    platform: 'instagram',
    tone: 'Educational',
    topic_template: 'How to rank on Google without paying for ads in 2026',
    prompt_preset: {
      duration: '60 Seconds',
      style: 'Educational',
      target_audience: 'Business Owners'
    }
  },
  {
    id: 'tpl-storytelling-reel',
    title: 'Storytelling Reel',
    description: 'Emotional before-and-after narrative that creates deep audience connection and relatability.',
    category: 'reels',
    icon: 'book-open',
    type: 'reel',
    platform: 'instagram',
    tone: 'Storytelling',
    topic_template: 'How I went from 0 clients to fully booked in 6 months as a freelancer',
    prompt_preset: {
      duration: '90 Seconds',
      style: 'Storytelling',
      target_audience: 'Creators'
    }
  },
  {
    id: 'tpl-product-promo',
    title: 'Product Promotion Campaign',
    description: 'Benefit-driven promotional copy that highlights value, eliminates objections, and drives sales.',
    category: 'marketing',
    icon: 'shopping-bag',
    type: 'general',
    platform: 'facebook',
    tone: 'Bold',
    topic_template: 'Announcing our new all-in-one content creation toolkit for marketing agencies',
    prompt_preset: {
      length: 'Medium',
      cta: 'Visit Website',
      target_audience: 'Professionals'
    }
  },
  {
    id: 'tpl-local-business',
    title: 'Local Business Promotion',
    description: 'Hyper-engaging local social content built to attract nearby foot traffic and local bookings.',
    category: 'social',
    icon: 'map-pin',
    type: 'caption',
    platform: 'instagram',
    tone: 'Conversational',
    topic_template: 'Special weekend walk-in offer for the best artisan sourdough & coffee in town',
    prompt_preset: {
      cta: 'Book Now',
      target_audience: 'Local Customers'
    }
  },
  {
    id: 'tpl-personal-brand',
    title: 'Personal Brand Authority Post',
    description: 'Thought leadership and authentic insights that build credibility on LinkedIn and X.',
    category: 'social',
    icon: 'user-check',
    type: 'general',
    platform: 'linkedin',
    tone: 'Inspirational',
    topic_template: 'The biggest mindset shift that doubled my agency revenue without working more hours',
    prompt_preset: {
      length: 'Medium',
      cta: 'Comment',
      target_audience: 'Professionals'
    }
  },
  {
    id: 'tpl-news-content',
    title: 'News & Trend Commentary',
    description: 'Timely analysis of trending industry news that rides the viral algorithm wave.',
    category: 'social',
    icon: 'globe',
    type: 'reel',
    platform: 'youtube',
    tone: 'Bold',
    topic_template: 'OpenAI and Google just changed search forever — here is what it means for your business',
    prompt_preset: {
      duration: '60 Seconds',
      style: 'News-based',
      target_audience: 'General Audience'
    }
  },
  {
    id: 'tpl-customer-testimonial',
    title: 'Customer Testimonial Spotlight',
    description: 'Transform client success stories into persuasive social proof that closes fence-sitters.',
    category: 'marketing',
    icon: 'award',
    type: 'caption',
    platform: 'instagram',
    tone: 'Storytelling',
    topic_template: 'How our client Sarah grew her coaching business from ₹50k to ₹5L/month',
    prompt_preset: {
      cta: 'DM',
      target_audience: 'Business Owners'
    }
  }
];

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.ensureDataDir();
    this.data = this.load();
  }

  private ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);

        // Merge ALL_TEMPLATES with existing database templates to preserve existing while adding all new templates
        const templateMap = new Map<string, ContentTemplate>();
        ALL_TEMPLATES.forEach(t => templateMap.set(t.id, t as any));
        if (Array.isArray(parsed.templates)) {
          parsed.templates.forEach((t: ContentTemplate) => {
            if (templateMap.has(t.id)) {
              templateMap.set(t.id, { ...templateMap.get(t.id), ...t });
            } else {
              templateMap.set(t.id, t);
            }
          });
        }
        DEFAULT_TEMPLATES.forEach(t => {
          if (!templateMap.has(t.id)) templateMap.set(t.id, t);
        });

        const mergedTemplates = Array.from(templateMap.values());

        return {
          users: parsed.users || [],
          brand_voices: parsed.brand_voices || [],
          content: parsed.content || [],
          usage_logs: parsed.usage_logs || [],
          templates: mergedTemplates,
          user_favorites: parsed.user_favorites || {},
          user_recent_templates: parsed.user_recent_templates || {}
        };
      }
    } catch (e) {
      console.error('Error reading database file, initializing default:', e);
    }

    const initialData: DatabaseSchema = {
      users: [
        {
          id: 'user-demo-creator',
          name: 'Elavarasan R',
          email: 'elavarasanr308@gmail.com',
          passwordHash: 'password123',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          role: 'user',
          tier: 'pro',
          credits_used: 3,
          credits_limit: 100,
          created_at: new Date().toISOString()
        },
        {
          id: 'user-demo-admin',
          name: 'Admin ContentFlow',
          email: 'admin@contentflow.ai',
          passwordHash: 'admin123',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
          role: 'admin',
          tier: 'agency',
          credits_used: 12,
          credits_limit: 500,
          created_at: new Date().toISOString()
        },
        {
          id: 'user-demo-free',
          name: 'Alex Rivera',
          email: 'free.creator@example.com',
          passwordHash: 'password123',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
          role: 'user',
          tier: 'free',
          credits_used: 7,
          credits_limit: 10,
          created_at: new Date().toISOString()
        }
      ],
      brand_voices: [
        {
          id: 'bv-1',
          user_id: 'user-demo-creator',
          brand_name: 'ZAZU Digital Media',
          business_description: 'Full-service modern digital marketing & content growth agency for local businesses and eCommerce brands.',
          target_audience: 'Small business owners, startup founders, and local clinic/store directors',
          preferred_tone: 'Conversational',
          words_to_use: 'Growth, predictable leads, conversions, authentic branding, proven framework',
          words_to_avoid: 'Synergy, supercharge, cheap, guarantee, spam, hack',
          brand_personality: 'Professional + Friendly, practical, results-driven with touch of wit',
          cta_style: 'Direct & low-friction (e.g., "Drop a comment below" or "DM \'GROWTH\'")',
          is_active: true,
          updated_at: new Date().toISOString()
        }
      ],
      content: [
        {
          id: 'cnt-demo-1',
          user_id: 'user-demo-creator',
          title: 'Why Small Businesses Need Digital Marketing in 2026',
          type: 'reel',
          platform: 'instagram',
          language: 'thanglish',
          tone: 'Conversational',
          topic: 'Why small businesses need digital marketing in 2026',
          content: `HOOK (0-3s):
"Ungaloda local business-ku innum direct walk-ins mattum dhaan varudha? Neenga daily 50+ prospective customers-ah miss pandreenga!"

BODY:
"Traditional marketing ippo slow aayiduchu.
2026-la unga customer first search pandradhu Instagram & Google Maps-la dhaan.
Neenga online-la illana, unga competitor dhaan unga sales-ah eduthupaanga.
Digital marketing pannuradhukku periya budget thevai illa — just daily 1 valuable Reel & clear Google profile podhum."

CTA:
"Unga business-ah online-la scale panna 'MARKET' nu DM pannunga. Free audit tharom!"`,
          meta: {
            estimated_duration: '45 Seconds',
            word_count: 78,
            char_count: 512
          },
          created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
          updated_at: new Date(Date.now() - 3600000 * 4).toISOString()
        },
        {
          id: 'cnt-demo-2',
          user_id: 'user-demo-creator',
          title: '10 High-Converting Viral Hooks for B2B Creators',
          type: 'hook',
          platform: 'linkedin',
          language: 'english',
          tone: 'Bold',
          topic: 'High-converting lead generation frameworks for agency owners',
          content: `1. [Shock] "We spent ₹50,000 on LinkedIn ads and got ZERO leads. Here is the 1 organic tactic that made us ₹4,20,000 instead."
2. [Mistake] "Stop pitching your services in the first DM. It's destroying your pipeline."
3. [Question] "Why are 90% of marketing agencies stuck at 5 clients while others scale effortlessly?"
4. [Controversial] "Your website copy isn't converting because you are talking about yourself, not their problem."
5. [Story] "In 2023, I was working 14-hour days for ₹30k/month clients. Here is the single pricing change that saved my sanity."`,
          meta: {
            estimated_duration: '35 Seconds',
            word_count: 92,
            char_count: 590
          },
          created_at: new Date(Date.now() - 3600000 * 18).toISOString(),
          updated_at: new Date(Date.now() - 3600000 * 18).toISOString()
        }
      ],
      usage_logs: [
        {
          id: 'log-1',
          user_id: 'user-demo-creator',
          type: 'reel',
          platform: 'instagram',
          topic: 'Why small businesses need digital marketing in 2026',
          created_at: new Date(Date.now() - 3600000 * 4).toISOString()
        },
        {
          id: 'log-2',
          user_id: 'user-demo-creator',
          type: 'hook',
          platform: 'linkedin',
          topic: 'High-converting lead generation frameworks for agency owners',
          created_at: new Date(Date.now() - 3600000 * 18).toISOString()
        }
      ],
      templates: DEFAULT_TEMPLATES
    };

    this.saveData(initialData);
    return initialData;
  }

  private saveData(dataToSave: DatabaseSchema) {
    try {
      this.ensureDataDir();
      fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to write database file:', e);
    }
  }

  public save() {
    this.saveData(this.data);
  }

  // User Operations
  public findUserByEmail(email: string): User | undefined {
    if (!email) return undefined;
    const normalized = email.trim().toLowerCase();
    return this.data.users.find(u => (u.email || '').trim().toLowerCase() === normalized);
  }

  public findUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  public createUser(user: Omit<User, 'id' | 'created_at' | 'credits_used' | 'credits_limit'>): User {
    const newUser: User = {
      ...user,
      id: 'user-' + Math.random().toString(36).substring(2, 9) + Date.now(),
      credits_used: 0,
      credits_limit: user.tier === 'agency' ? 500 : user.tier === 'pro' ? 100 : 10,
      created_at: new Date().toISOString()
    };
    this.data.users.push(newUser);
    this.save();
    return newUser;
  }

  public updateUser(id: string, updates: Partial<User>): User | undefined {
    const userIndex = this.data.users.findIndex(u => u.id === id);
    if (userIndex === -1) return undefined;
    this.data.users[userIndex] = { ...this.data.users[userIndex], ...updates };
    this.save();
    return this.data.users[userIndex];
  }

  public deleteUser(id: string): boolean {
    const initialLen = this.data.users.length;
    this.data.users = this.data.users.filter(u => u.id !== id);
    this.data.content = this.data.content.filter(c => c.user_id !== id);
    this.data.brand_voices = this.data.brand_voices.filter(b => b.user_id !== id);
    this.save();
    return this.data.users.length < initialLen;
  }

  public getAllUsers(): User[] {
    return this.data.users;
  }

  // Credit & Usage
  public checkAndDeductCredit(userId: string): { success: boolean; remaining: number; limit: number; used: number } {
    const user = this.findUserById(userId);
    if (!user) return { success: false, remaining: 0, limit: 0, used: 0 };
    
    // Check if user has limit remaining
    const remaining = Math.max(0, user.credits_limit - user.credits_used);
    if (remaining <= 0 && user.tier === 'free') {
      return { success: false, remaining: 0, limit: user.credits_limit, used: user.credits_used };
    }

    user.credits_used += 1;
    this.save();
    return {
      success: true,
      remaining: Math.max(0, user.credits_limit - user.credits_used),
      limit: user.credits_limit,
      used: user.credits_used
    };
  }

  public refundCredit(userId: string) {
    const user = this.findUserById(userId);
    if (user && user.credits_used > 0) {
      user.credits_used -= 1;
      this.save();
    }
  }

  public logUsage(userId: string, type: string, platform: string, topic: string) {
    const log: UsageLog = {
      id: 'log-' + Math.random().toString(36).substring(2, 9),
      user_id: userId,
      type,
      platform,
      topic,
      created_at: new Date().toISOString()
    };
    this.data.usage_logs.push(log);
    this.save();
  }

  public getUsageLogs(): UsageLog[] {
    return this.data.usage_logs;
  }

  // Content Operations
  public getContentByUser(userId: string): ContentItem[] {
    return this.data.content
      .filter(c => c.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public getContentById(id: string): ContentItem | undefined {
    return this.data.content.find(c => c.id === id);
  }

  public saveContent(content: Omit<ContentItem, 'id' | 'created_at' | 'updated_at'>): ContentItem {
    const newItem: ContentItem = {
      ...content,
      id: 'cnt-' + Math.random().toString(36).substring(2, 9) + Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.data.content.unshift(newItem);
    this.save();
    return newItem;
  }

  public updateContent(id: string, updates: Partial<ContentItem>): ContentItem | undefined {
    const index = this.data.content.findIndex(c => c.id === id);
    if (index === -1) return undefined;
    this.data.content[index] = {
      ...this.data.content[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    this.save();
    return this.data.content[index];
  }

  public deleteContent(id: string): boolean {
    const initialLen = this.data.content.length;
    this.data.content = this.data.content.filter(c => c.id !== id);
    this.save();
    return this.data.content.length < initialLen;
  }

  public getAllContent(): ContentItem[] {
    return this.data.content;
  }

  // Brand Voice Operations
  public getBrandVoiceByUser(userId: string): BrandVoice | undefined {
    return this.data.brand_voices.find(bv => bv.user_id === userId);
  }

  public upsertBrandVoice(userId: string, brandVoice: Partial<BrandVoice>): BrandVoice {
    const existing = this.getBrandVoiceByUser(userId);
    if (existing) {
      const updated: BrandVoice = {
        ...existing,
        ...brandVoice,
        updated_at: new Date().toISOString()
      };
      const index = this.data.brand_voices.findIndex(bv => bv.user_id === userId);
      this.data.brand_voices[index] = updated;
      this.save();
      return updated;
    } else {
      const created: BrandVoice = {
        id: 'bv-' + Math.random().toString(36).substring(2, 9),
        user_id: userId,
        brand_name: brandVoice.brand_name || 'My Brand',
        business_description: brandVoice.business_description || '',
        target_audience: brandVoice.target_audience || '',
        preferred_tone: brandVoice.preferred_tone || 'Conversational',
        words_to_use: brandVoice.words_to_use || '',
        words_to_avoid: brandVoice.words_to_avoid || '',
        brand_personality: brandVoice.brand_personality || 'Professional & Engaging',
        cta_style: brandVoice.cta_style || 'Clear & Direct',
        is_active: brandVoice.is_active !== undefined ? brandVoice.is_active : true,
        updated_at: new Date().toISOString()
      };
      this.data.brand_voices.push(created);
      this.save();
      return created;
    }
  }

  // Templates
  public getTemplates(): ContentTemplate[] {
    return this.data.templates;
  }

  public getUserFavorites(userId: string): string[] {
    if (!this.data.user_favorites) this.data.user_favorites = {};
    return this.data.user_favorites[userId] || [];
  }

  public toggleUserFavorite(userId: string, templateId: string): string[] {
    if (!this.data.user_favorites) this.data.user_favorites = {};
    const existing = this.data.user_favorites[userId] || [];
    const index = existing.indexOf(templateId);
    if (index > -1) {
      existing.splice(index, 1);
    } else {
      existing.push(templateId);
    }
    this.data.user_favorites[userId] = [...existing];
    this.save();
    return this.data.user_favorites[userId];
  }

  public getUserRecentTemplates(userId: string): string[] {
    if (!this.data.user_recent_templates) this.data.user_recent_templates = {};
    const list = this.data.user_recent_templates[userId] || [];
    return list.map(item => item.template_id);
  }

  public trackTemplateUsage(userId: string, templateId: string): string[] {
    if (!this.data.user_recent_templates) this.data.user_recent_templates = {};
    let list = this.data.user_recent_templates[userId] || [];
    list = list.filter(item => item.template_id !== templateId);
    list.unshift({ template_id: templateId, used_at: new Date().toISOString() });
    if (list.length > 30) list = list.slice(0, 30);
    this.data.user_recent_templates[userId] = list;
    this.save();
    return list.map(item => item.template_id);
  }
}

export const db = new Database();
