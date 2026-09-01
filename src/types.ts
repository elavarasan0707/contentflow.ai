export type UserRole = 'user' | 'admin';
export type SubscriptionTier = 'free' | 'pro' | 'agency';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
  tier: SubscriptionTier;
  credits_used: number;
  credits_limit: number;
  created_at: string;
  disabled?: boolean;
}

export interface UserStats {
  credits_remaining: number;
  credits_used: number;
  credits_limit: number;
  total_content_saved: number;
  has_brand_voice: boolean;
}

export type Platform = 'instagram' | 'youtube' | 'linkedin' | 'facebook' | 'x' | 'all';

export type ContentType = 
  | 'reel'
  | 'hook'
  | 'caption'
  | 'youtube'
  | 'seo'
  | 'ideas'
  | 'general'
  | 'carousel'
  | 'blog'
  | 'ad';

export type Language = 'english' | 'tamil' | 'thanglish';

export type Tone =
  | 'Professional'
  | 'Emotional'
  | 'Educational'
  | 'Funny'
  | 'Storytelling'
  | 'Conversational'
  | 'Bold'
  | 'Inspirational';

export type TargetAudience =
  | 'Business Owners'
  | 'Students'
  | 'Parents'
  | 'Creators'
  | 'Professionals'
  | 'Doctors'
  | 'Local Customers'
  | 'General Audience';

export type ContentLength =
  | 'Short'
  | 'Medium'
  | 'Long'
  | '30 Seconds'
  | '60 Seconds'
  | '90 Seconds';

export type CtaOption =
  | 'Generate automatically'
  | 'Learn More'
  | 'Follow'
  | 'Comment'
  | 'DM'
  | 'Visit Website'
  | 'Book Now'
  | 'Custom CTA';

export type ReelStyle =
  | 'Viral'
  | 'Educational'
  | 'Emotional'
  | 'Storytelling'
  | 'News-based'
  | 'Problem/Solution'
  | 'Listicle'
  | 'Myth vs Fact';

export interface BrandVoice {
  id?: string;
  user_id?: string;
  brand_name: string;
  business_description: string;
  target_audience: string;
  preferred_tone: string;
  words_to_use: string;
  words_to_avoid: string;
  brand_personality: string;
  cta_style: string;
  is_active: boolean;
  updated_at?: string;
}

export interface ContentMeta {
  estimated_duration?: string;
  word_count?: number;
  char_count?: number;
  tags?: string[];
}

export interface ContentItem {
  id: string;
  user_id: string;
  title: string;
  type: string;
  platform: string;
  language: string;
  tone: string;
  topic: string;
  content: string;
  meta?: ContentMeta;
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

export interface GenerationRequest {
  topic: string;
  platform?: Platform | string;
  contentType?: string;
  language?: Language;
  tone?: Tone | string;
  targetAudience?: TargetAudience | string;
  contentLength?: ContentLength | string;
  cta?: CtaOption | string;
  customCta?: string;
  style?: ReelStyle | string;
  useBrandVoice?: boolean;
  primaryKeyword?: string;
  secondaryKeywords?: string;
  niche?: string;
  autoSave?: boolean;
}

export interface GenerationResponse {
  success: boolean;
  content: string;
  title: string;
  meta: ContentMeta;
  savedItem?: ContentItem;
  credits: {
    remaining: number;
    limit: number;
    used: number;
  };
}

export type AIAction =
  | 'improve'
  | 'viral'
  | 'shorten'
  | 'expand'
  | 'emotional'
  | 'professional'
  | 'conversational'
  | 'translate'
  | 'cta';

export interface AdminStats {
  total_users: number;
  active_users: number;
  total_generations: number;
  daily_generations: number;
  monthly_generations: number;
  most_popular_type: string;
  content_distribution: Record<string, number>;
  recent_logs: Array<{
    id: string;
    user_id: string;
    type: string;
    platform: string;
    topic: string;
    created_at: string;
  }>;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'copied';
  title?: string;
  message: string;
  duration?: number;
}
