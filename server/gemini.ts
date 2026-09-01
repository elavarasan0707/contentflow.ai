import { GoogleGenAI } from '@google/genai';
import { BrandVoice } from './db';

// Lazy-initialize GoogleGenAI client with standard User-Agent
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY || '';
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Sleep helper with jitter
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Check if error is transient (e.g. 503 unavailable, high demand, 429 rate limit, network reset)
function isTransientError(error: any): boolean {
  if (!error) return false;
  const msg = (error.message || error.toString() || '').toLowerCase();
  const status = error.status || error.code || error.error?.code;

  return (
    status === 503 ||
    status === 429 ||
    status === 500 ||
    status === 'UNAVAILABLE' ||
    status === 'RESOURCE_EXHAUSTED' ||
    msg.includes('503') ||
    msg.includes('unavailable') ||
    msg.includes('high demand') ||
    msg.includes('spikes in demand') ||
    msg.includes('rate limit') ||
    msg.includes('resource_exhausted') ||
    msg.includes('quota') ||
    msg.includes('overloaded') ||
    msg.includes('try again later') ||
    msg.includes('econnreset') ||
    msg.includes('fetch failed')
  );
}

// Map of model cooldowns (e.g. when 429 daily quota limit is hit)
const modelCooldownMap = new Map<string, number>();

function isModelCooledDown(model: string): boolean {
  const cooldownUntil = modelCooldownMap.get(model);
  if (!cooldownUntil) return true;
  if (Date.now() > cooldownUntil) {
    modelCooldownMap.delete(model);
    return true;
  }
  return false;
}

function markModelExhausted(model: string, durationMs = 60 * 1000) {
  modelCooldownMap.set(model, Date.now() + durationMs);
}

// Resilient executor with exponential backoff and fallback model chaining
async function executeGeminiWithRetry<T>(
  operation: (model: string) => Promise<T>,
  preferredModel = 'gemini-3.1-flash-lite'
): Promise<T> {
  // Candidate models pool with diverse quota buckets
  const baseCandidates = [
    preferredModel,
    'gemini-3.1-flash-lite',
    'gemini-2.5-flash',
    'gemini-3.7-flash'
  ];

  // Remove duplicates and prioritize models not currently on quota cooldown
  const uniqueCandidates = Array.from(new Set(baseCandidates));
  const availableCandidates = uniqueCandidates.filter(isModelCooledDown);
  const fallbackCandidates = uniqueCandidates.filter((m) => !isModelCooledDown(m));
  const modelsToTry = [...availableCandidates, ...fallbackCandidates];

  let lastError: any = null;

  for (let m = 0; m < modelsToTry.length; m++) {
    const currentModel = modelsToTry[m];
    const maxRetries = 2;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await operation(currentModel);
        // Successful call - clear any cooldown for this model
        modelCooldownMap.delete(currentModel);
        return result;
      } catch (err: any) {
        lastError = err;
        const msg = (err?.message || err?.toString() || '').toLowerCase();
        const isQuota429 = msg.includes('quota') || msg.includes('429') || msg.includes('resource_exhausted');
        const isDailyQuota = msg.includes('perday') || msg.includes('limit: 20');
        const isDemand503 = msg.includes('503') || msg.includes('high demand') || msg.includes('unavailable');

        console.warn(`[Gemini API] Model ${currentModel} attempt ${attempt}/${maxRetries} failed:`, err?.message || err);

        if (!isTransientError(err)) {
          // Non-transient error (e.g. invalid parameter/config), throw immediately
          throw err;
        }

        // If rate limit / quota exceeded (429) for this specific model, mark cooldown & immediately switch
        if (isQuota429) {
          const cooldownDuration = isDailyQuota ? 30 * 60 * 1000 : 30 * 1000;
          markModelExhausted(currentModel, cooldownDuration);
          console.warn(`[Gemini API] Quota limit reached for ${currentModel}. Switching to next candidate model.`);
          break; // Break inner retry loop to try next model in candidates list
        }

        if (attempt < maxRetries) {
          const backoff = isDemand503 ? 1000 + Math.floor(Math.random() * 500) : 800;
          console.log(`[Gemini API] Waiting ${backoff}ms before retry on ${currentModel}...`);
          await delay(backoff);
        }
      }
    }

    console.warn(`[Gemini API] Model ${currentModel} exhausted or throttled. Moving to fallback candidate...`);
  }

  // All candidates and retries failed
  const parsedMsg = lastError?.message || lastError?.error?.message || 'AI service temporarily unavailable due to high demand. Please try again in a few moments.';
  throw new Error(parsedMsg);
}

export interface GenerateParams {
  topic: string;
  platform?: string;
  contentType?: string;
  language?: 'english' | 'tamil' | 'thanglish';
  tone?: string;
  targetAudience?: string;
  contentLength?: string;
  cta?: string;
  customCta?: string;
  style?: string;
  brandVoice?: BrandVoice | null;
  useBrandVoice?: boolean;
  primaryKeyword?: string;
  secondaryKeywords?: string;
  niche?: string;
}

export interface AIActionParams {
  content: string;
  action: 'improve' | 'viral' | 'shorten' | 'expand' | 'emotional' | 'professional' | 'conversational' | 'translate' | 'cta';
  targetLanguage?: 'english' | 'tamil' | 'thanglish';
  targetTone?: string;
  platform?: string;
}

// Multi-language system guidance
function getLanguageInstruction(language?: string): string {
  switch (language?.toLowerCase()) {
    case 'tamil':
      return `LANGUAGE: TAMIL. Write in clear, elegant, modern Tamil script (தமிழ்). Ensure it sounds completely natural, engaging, and culturally relevant to Tamil-speaking audiences.`;
    case 'thanglish':
      return `LANGUAGE: THANGLISH (Colloquial Tamil written using English/Latin alphabet).
CRITICAL RULE FOR THANGLISH:
- DO NOT produce word-by-word literal English translation.
- Write natural conversational Tamil spoken in everyday modern conversation, using English alphabet phonetics.
- Example tone and phrasing: "Ungaloda business-ku daily customers varala? Indha 3 simple mistakes neenga pandringala-nu check pannunga!" or "Innum traditional marketing mattum rely panreengala? 2026-la unga competitors unga sales-ah eduthupaanga!"
- Keep it punchy, engaging, relatable, and authentic to Tamil creators and social media consumers.`;
    case 'english':
    default:
      return `LANGUAGE: Modern, crisp, conversational American/International English. Highly engaging, active voice, zero robotic AI cliches.`;
  }
}

// Brand voice context formatting
function getBrandVoicePrompt(brandVoice?: BrandVoice | null, useBrandVoice?: boolean): string {
  if (!useBrandVoice || !brandVoice || !brandVoice.is_active) {
    return '';
  }

  return `
BRAND VOICE CONTEXT (Strictly adhere to this persona):
- Brand Name: ${brandVoice.brand_name}
- Business Description: ${brandVoice.business_description}
- Target Audience: ${brandVoice.target_audience}
- Preferred Tone: ${brandVoice.preferred_tone}
- Brand Personality: ${brandVoice.brand_personality}
- Preferred CTA Style: ${brandVoice.cta_style}
${brandVoice.words_to_use ? `- Words/Keywords to actively use: ${brandVoice.words_to_use}` : ''}
${brandVoice.words_to_avoid ? `- FORBIDDEN WORDS/PHRASES (DO NOT USE): ${brandVoice.words_to_avoid}` : ''}
`;
}

export async function generateAIContent(params: GenerateParams): Promise<{
  content: string;
  title: string;
  meta: {
    estimated_duration?: string;
    word_count: number;
    char_count: number;
    tags?: string[];
  };
  structured_data?: any;
}> {
  const ai = getAiClient();
  const langPrompt = getLanguageInstruction(params.language);
  const brandPrompt = getBrandVoicePrompt(params.brandVoice, params.useBrandVoice);
  const resolvedCta = params.cta === 'Custom CTA' && params.customCta ? params.customCta : (params.cta || 'Relevant Call to Action');

  let systemPrompt = `You are ContentFlow AI, an elite SaaS AI copywriter and content strategist trusted by top digital marketing agencies and viral social media creators.
Your task is to generate natural, high-converting, human-sounding content with zero fluff or robotic clichés.

Strict Quality Guidelines:
1. Never use generic AI filler like "In today's fast-paced digital world", "Are you ready to dive in?", or "Without further ado".
2. Prioritize hook power, crisp short sentences, strong emotional or logical hooks, concrete examples, and clear takeaways.
3. Keep sentences conversational and readable at standard speaking pace.
4. Integrate the requested platform dynamics (e.g., Instagram needs visual cues, LinkedIn needs crisp white-spaced lines, YouTube needs high-CTR curiosity).
${langPrompt}
${brandPrompt}`;

  let userPrompt = '';
  const contentType = (params.contentType || 'general').toLowerCase();

  if (contentType.includes('reel') || params.contentType === 'Reel Script') {
    userPrompt = `Generate a high-retention REEL / SHORT VIDEO SCRIPT about: "${params.topic}"
Target Platform: ${params.platform || 'Instagram'}
Target Audience: ${params.targetAudience || 'General Audience'}
Tone: ${params.tone || 'Conversational'}
Style: ${params.style || 'Viral'}
Desired Duration: ${params.contentLength || '60 Seconds'}
Call To Action: ${resolvedCta}

Format the output strictly into three clear sections:

HOOK (0-3s):
[First 3 seconds: Must stop the scroll immediately with curiosity, shock, or relatable pain point. Include a brief camera/visual direction if helpful]

BODY:
[Short, punchy spoken sentences. Pacing suitable for speaking out loud. Include natural transitions and 1-2 concrete takeaways]

CTA:
[Short, seamless call to action that makes commenting, saving, or following feel natural]

End with a summary line:
ESTIMATED_DURATION: [e.g., 45 Seconds]`;
  } else if (contentType === 'hook' || contentType === 'viral hook' || params.contentType === 'Viral Hook') {
    userPrompt = `Generate exactly 10 VIRAL HOOKS for the topic: "${params.topic}"
Platform: ${params.platform || 'Instagram / LinkedIn / X'}
Audience: ${params.targetAudience || 'Creators & Marketers'}
Tone: ${params.tone || 'Bold'}

Provide 10 hooks categorized across these 10 viral psychological angles:
1. [Curiosity]: Hook that creates an irresistible knowledge gap
2. [Controversial]: Bold contrarian take that challenges common wisdom
3. [Emotional]: Deep relatable human sentiment or fear of missing out
4. [Question]: Sharp question that directly implicates the viewer's problem
5. [Shock]: Eye-opening statement or unexpected reality
6. [Story]: Hook that launches straight into an engaging real-world moment
7. [Problem]: Direct callout of a painful daily struggle
8. [Statistics]: Compelling realistic number or ratio hook
9. [Mistake]: Hook identifying a costly mistake people make
10. [You Are Doing This Wrong]: Direct behavioral challenge hook

Ensure each hook is punchy, memorable, and ready to use.`;
  } else if (contentType === 'caption' || params.contentType === 'Caption') {
    userPrompt = `Generate a complete high-converting CAPTION for: "${params.topic}"
Platform: ${params.platform || 'Instagram'}
Audience: ${params.targetAudience || 'General Audience'}
Tone: ${params.tone || 'Conversational'}
Call to action: ${resolvedCta}

Provide the following formatted sections:

SHORT CAPTION:
[A punchy 1-2 sentence version with strong hook and immediate CTA, ideal for quick scrolling feeds]

LONG CAPTION:
[A deep, engaging storytelling/value-packed caption with line breaks, bullet points, and high-retention flow]

CALL TO ACTION:
[Clear, low-friction action directive]

HASHTAGS:
[15-20 handpicked, highly relevant niche and broad hashtags formatted with #]`;
  } else if (contentType === 'youtube' || contentType === 'youtube script' || params.contentType === 'YouTube Script' || params.contentType === 'YouTube') {
    userPrompt = `Create a complete YOUTUBE CONTENT SUITE for the video topic: "${params.topic}"
Audience: ${params.targetAudience || 'General Audience'}
Tone: ${params.tone || 'Educational & Engaging'}
Call to action: ${resolvedCta}

Provide:
1. 5 HIGH-CTR TITLES (Optimized under 65 characters with curiosity and clickability)
2. VIDEO DESCRIPTION (Include SEO-rich hook opening, timestamps outline [0:00 Intro, 0:45 Key Concept, etc.], resource links placeholder, and social links)
3. TARGET KEYWORDS (List of 8-10 primary and secondary search keywords)
4. VIDEO TAGS (Comma-separated list of 15+ YouTube tags ready to paste into YouTube Studio)
5. PINNED COMMENT CTA (Engaging question and call to action to boost video ranking)`;
  } else if (contentType === 'seo' || contentType === 'seo content' || params.contentType === 'SEO Content' || contentType === 'blog') {
    userPrompt = `Generate a high-ranking, human-written SEO ARTICLE & CONTENT OUTLINE for: "${params.topic}"
Primary Keyword: ${params.primaryKeyword || params.topic}
Secondary Keywords: ${params.secondaryKeywords || 'best practices, framework, guide 2026, tips'}
Target Audience: ${params.targetAudience || 'Business Owners & Professionals'}
Desired Length: ${params.contentLength || 'Long (Comprehensive)'}
Call to Action: ${resolvedCta}

Generate the full comprehensive structured content:
- SEO Meta Title (50-60 characters, keyword front-loaded)
- SEO Meta Description (150-160 characters, high click-through rate)
- H1: Compelling Main Headline
- Introduction: Pain point, hook, and what the reader will gain
- H2 & H3 Sub-headings: Well-structured, in-depth body content with actionable advice and examples (Do NOT keyword-stuff)
- Key Takeaways (Bullet points)
- FAQ Section: 3-4 schema-friendly Q&As addressing common user queries
- Conclusion & CTA`;
  } else if (contentType === 'ideas' || contentType === 'content ideas' || params.contentType === 'Content Ideas') {
    userPrompt = `Generate 20 HIGH-CONVERTING CONTENT IDEAS for:
Niche: ${params.niche || params.topic}
Audience: ${params.targetAudience || 'Target Audience'}
Platform: ${params.platform || 'Instagram / LinkedIn / YouTube'}

For each of the 20 ideas, format as:
[Number]. Title: "..."
• Hook: "..."
• Angle: [e.g. Behind the Scenes / Problem-Solution / Case Study / Contrarian / Tutorial]
• Recommended Format: [Reel / Carousel / Long-form / Text Post / YouTube]

Cover a wide spectrum of educational, viral, relatable, and promotional concepts.`;
  } else {
    userPrompt = `Generate a high-performing ${params.contentType || 'Social Media Post'} on the topic: "${params.topic}"
Platform: ${params.platform || 'Instagram'}
Audience: ${params.targetAudience || 'General Audience'}
Tone: ${params.tone || 'Conversational'}
Length: ${params.contentLength || 'Medium'}
Call to Action: ${resolvedCta}

Follow a high-retention framework:
1. Hook (Immediate attention grabber)
2. Problem / Context (Why this matters now)
3. Value / Solution (Actionable insights, examples, or framework)
4. Takeaway & CTA`;
  }

  try {
    const response = await executeGeminiWithRetry(async (modelName) => {
      return await ai.models.generateContent({
        model: modelName,
        contents: userPrompt,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.75,
        },
      });
    }, 'gemini-3.1-flash-lite');

    const generatedText = response.text || 'No content generated. Please try again.';
    
    // Extract metadata
    const wordCount = generatedText.split(/\s+/).filter(Boolean).length;
    const charCount = generatedText.length;
    
    // Check if estimated duration is mentioned
    let estDuration = '45 Seconds';
    const durationMatch = generatedText.match(/ESTIMATED_DURATION:\s*([^\n\r]+)/i);
    if (durationMatch) {
      estDuration = durationMatch[1].trim();
    } else {
      // average 130 words per minute
      const seconds = Math.max(15, Math.round((wordCount / 130) * 60));
      estDuration = `${seconds} Seconds`;
    }

    // Extract hashtags if present
    const tagsMatch = generatedText.match(/#[a-zA-Z0-9_]+/g);
    const tags = tagsMatch ? Array.from(new Set(tagsMatch)).slice(0, 15) : [];

    // Formulate a clean display title
    let title = params.topic.trim();
    if (title.length > 60) {
      title = title.substring(0, 57) + '...';
    }
    if (params.contentType) {
      title = `${title} (${params.contentType})`;
    }

    return {
      content: generatedText.replace(/ESTIMATED_DURATION:\s*[^\n\r]+/i, '').trim(),
      title,
      meta: {
        estimated_duration: estDuration,
        word_count: wordCount,
        char_count: charCount,
        tags
      }
    };
  } catch (error: any) {
    console.error('Gemini generateContent error:', error);
    throw new Error(error?.message || 'Failed to generate AI content');
  }
}

export async function transformAIContent(params: AIActionParams): Promise<{
  content: string;
  meta: {
    word_count: number;
    char_count: number;
    estimated_duration: string;
  };
}> {
  const ai = getAiClient();

  let actionInstruction = '';
  switch (params.action) {
    case 'improve':
      actionInstruction = 'Polish and enhance the writing quality, flow, clarity, and punchiness while preserving core meaning.';
      break;
    case 'viral':
      actionInstruction = 'Make this significantly more viral, high-energy, scroll-stopping, and curiosity-driven. Intensify the hook and pacing.';
      break;
    case 'shorten':
      actionInstruction = 'Condense and trim all fluff. Make it 40% shorter, punchier, and faster to read or speak.';
      break;
    case 'expand':
      actionInstruction = 'Expand this content with deeper explanations, concrete real-world examples, actionable steps, and richer detail.';
      break;
    case 'emotional':
      actionInstruction = 'Rewrite with deep emotional resonance, empathy, vulnerability, and relatable human storytelling.';
      break;
    case 'professional':
      actionInstruction = 'Refine tone to be authoritative, polished, corporate-ready, and executive-level professional.';
      break;
    case 'conversational':
      actionInstruction = 'Make this sound like a friendly, natural chat with a peer over coffee. Casual, approachable, and authentic.';
      break;
    case 'translate':
      if (params.targetLanguage === 'thanglish') {
        actionInstruction = 'Translate and adapt this content into natural, colloquial THANGLISH (spoken Tamil using English/Latin alphabet, e.g. "Ungaloda business growth-ku indha tips follow pannunga"). Do NOT do literal translation.';
      } else if (params.targetLanguage === 'tamil') {
        actionInstruction = 'Translate and adapt this content into natural, modern, native TAMIL script (தமிழ்).';
      } else {
        actionInstruction = 'Translate and polish this content into fluent, modern English.';
      }
      break;
    case 'cta':
      actionInstruction = 'Create a significantly stronger, higher-converting call to action tailored to boost comments, saves, shares, or inquiries.';
      break;
  }

  const prompt = `You are ContentFlow AI. Transform the following content according to this instruction:
INSTRUCTION: ${actionInstruction}

ORIGINAL CONTENT:
"""
${params.content}
"""

OUTPUT: Return only the transformed high-quality content ready for publishing. Do not add conversational preamble.`;

  try {
    const response = await executeGeminiWithRetry(async (modelName) => {
      return await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          temperature: 0.7,
        },
      });
    }, 'gemini-3.1-flash-lite');

    const transformed = (response.text || params.content).trim();
    const wordCount = transformed.split(/\s+/).filter(Boolean).length;
    const charCount = transformed.length;
    const seconds = Math.max(15, Math.round((wordCount / 130) * 60));

    return {
      content: transformed,
      meta: {
        word_count: wordCount,
        char_count: charCount,
        estimated_duration: `${seconds} Seconds`
      }
    };
  } catch (error: any) {
    console.error('Gemini transform error:', error);
    throw new Error(error?.message || 'Failed to transform content');
  }
}
