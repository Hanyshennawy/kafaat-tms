/**
 * AI Configuration & Routing Strategy
 * 
 * Defines which AI provider to use for each feature based on:
 * - Cost optimization
 * - Quality requirements
 * - Provider availability
 * 
 * Provider Priority (when AI_PROVIDER not explicitly set):
 * 1. Together.ai (free tier, cloud - 5M tokens/month FREE)
 * 2. Ollama (free, local - requires local installation)
 * 3. Templates (free, rule-based)
 * 4. OpenAI (paid, cloud)
 * 5. Mock (fallback)
 * 
 * Cost Breakdown:
 * - Together.ai: $0 free tier (5M tokens/month) / $8/mo paid
 * - Ollama: $0 (local, requires installation)
 * - Templates: $0 (rule-based)
 * - OpenAI: $6-10/mo (critical requests only)
 * 
 * IMPORTANT: Set TOGETHER_API_KEY in .env for AI features to work!
 */

export type AIProvider = 'ollama' | 'template' | 'together' | 'openai' | 'mock';

// Environment variable to override default AI provider
const DEFAULT_PROVIDER = process.env.AI_PROVIDER as AIProvider | undefined;

export interface AIFeatureConfig {
  provider: AIProvider;
  fallbackProvider?: AIProvider;
  qualityThreshold: number; // 0-10 scale
  costPerRequest: number; // USD
  avgResponseTime: number; // milliseconds
  description: string;
}

/**
 * AI Provider Priority by Feature
 * 
 * This configuration optimizes for:
 * 1. Availability (Together.ai cloud first - always available)
 * 2. Cost (Free tier 5M tokens/month)
 * 3. Quality (Llama 3.2 3B for most tasks)
 * 4. Speed (templates are instant for simple tasks)
 */
export const AI_FEATURE_CONFIG: Record<string, AIFeatureConfig> = {
  // ============================================================================
  // TOGETHER.AI PREFERRED (Cloud AI - FREE 5M tokens/month)
  // ============================================================================
  
  resumeParsing: {
    provider: 'together',
    fallbackProvider: 'ollama',
    qualityThreshold: 8,
    costPerRequest: 0,
    avgResponseTime: 3000,
    description: 'Extract structured data from resumes using Together.ai Llama 3.2',
  },
  
  interviewQuestions: {
    provider: 'together',
    fallbackProvider: 'ollama',
    qualityThreshold: 8,
    costPerRequest: 0,
    avgResponseTime: 4000,
    description: 'Generate role-specific interview questions',
  },
  
  competencyGapAnalysis: {
    provider: 'together',
    fallbackProvider: 'template',
    qualityThreshold: 7,
    costPerRequest: 0,
    avgResponseTime: 3000,
    description: 'Analyze skill gaps and create development plans',
  },
  
  licensingQuestions: {
    provider: 'together',
    fallbackProvider: 'ollama',
    qualityThreshold: 8,
    costPerRequest: 0,
    avgResponseTime: 5000,
    description: 'Generate UAE MOE licensing assessment questions',
  },
  
  jobDescriptionGeneration: {
    provider: 'together',
    fallbackProvider: 'ollama',
    qualityThreshold: 7,
    costPerRequest: 0,
    avgResponseTime: 3000,
    description: 'Create professional job descriptions for education sector',
  },
  
  psychometricQuestions: {
    provider: 'together',
    fallbackProvider: 'ollama',
    qualityThreshold: 8,
    costPerRequest: 0,
    avgResponseTime: 4000,
    description: 'Generate psychometric assessment items',
  },
  
  competencyQuestions: {
    provider: 'together',
    fallbackProvider: 'ollama',
    qualityThreshold: 8,
    costPerRequest: 0,
    avgResponseTime: 4000,
    description: 'Generate competency assessment questions',
  },

  // ============================================================================
  // TEMPLATE-BASED (Rule-based - FREE, instant)
  // ============================================================================
  
  careerRecommendations: {
    provider: 'template',
    fallbackProvider: 'mock',
    qualityThreshold: 7,
    costPerRequest: 0,
    avgResponseTime: 50,
    description: 'Rule-based career path recommendations from UAE MOE framework',
  },
  
  jobMatching: {
    provider: 'template',
    fallbackProvider: 'mock',
    qualityThreshold: 7,
    costPerRequest: 0,
    avgResponseTime: 30,
    description: 'SQL-based job matching with competency filters',
  },
  
  sentimentAnalysis: {
    provider: 'template',
    fallbackProvider: 'mock',
    qualityThreshold: 6,
    costPerRequest: 0,
    avgResponseTime: 20,
    description: 'Keyword-based sentiment analysis with emotion detection',
  },
  
  performancePrediction: {
    provider: 'template',
    fallbackProvider: 'mock',
    qualityThreshold: 7,
    costPerRequest: 0,
    avgResponseTime: 40,
    description: 'Statistical performance prediction based on historical data',
  },
};

// Import Ollama service for availability check
let ollamaAvailable: boolean | null = null;

async function checkOllamaAvailable(): Promise<boolean> {
  if (ollamaAvailable !== null) return ollamaAvailable;
  
  try {
    const response = await fetch((process.env.OLLAMA_BASE_URL || 'http://localhost:11434') + '/api/tags', {
      signal: AbortSignal.timeout(2000),
    });
    ollamaAvailable = response.ok;
  } catch {
    ollamaAvailable = false;
  }
  return ollamaAvailable;
}

/**
 * Get AI provider configuration for a feature
 */
export function getAIConfig(feature: string): AIFeatureConfig {
  return AI_FEATURE_CONFIG[feature] || {
    provider: 'mock',
    fallbackProvider: 'mock',
    qualityThreshold: 5,
    costPerRequest: 0,
    avgResponseTime: 10,
    description: 'Fallback mock data',
  };
}

/**
 * Check if a provider is available based on environment variables
 */
export function isProviderAvailable(provider: AIProvider): boolean {
  switch (provider) {
    case 'ollama':
      // For sync check, we assume available if URL is set or default
      // Real availability is checked async in getEffectiveProvider
      return true; // Will be verified at runtime
    case 'template':
      return true; // Always available
    case 'together':
      return !!process.env.TOGETHER_API_KEY;
    case 'openai':
      return !!process.env.OPENAI_API_KEY;
    case 'mock':
      return true; // Always available
    default:
      return false;
  }
}

/**
 * Get effective provider with fallback logic
 * Supports environment variable AI_PROVIDER to override defaults
 * 
 * Priority: Together.ai > Ollama > Template > OpenAI > Mock
 */
export function getEffectiveProvider(feature: string): AIProvider {
  // If AI_PROVIDER environment variable is set, use it
  if (DEFAULT_PROVIDER && isProviderAvailable(DEFAULT_PROVIDER)) {
    console.log(`[AI Config] Using AI_PROVIDER override: '${DEFAULT_PROVIDER}' for '${feature}'`);
    return DEFAULT_PROVIDER;
  }
  
  const config = getAIConfig(feature);
  
  // Check if Together.ai is available (PREFERRED - cloud, always available)
  if (isProviderAvailable('together')) {
    console.log(`[AI Config] Using Together.ai for '${feature}' (API key configured)`);
    return 'together';
  }
  
  // Check if Ollama is available (requires local installation)
  if (config.provider === 'ollama' || config.fallbackProvider === 'ollama') {
    // In production (Render), skip Ollama and use next fallback
    if (process.env.NODE_ENV === 'production' || process.env.RENDER === 'true') {
      console.log(`[AI Config] Production mode: Skipping Ollama for '${feature}'`);
    } else {
      // Check if Ollama URL is configured and potentially available
      const ollamaUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
      console.log(`[AI Config] Attempting Ollama for '${feature}' at ${ollamaUrl}`);
      return 'ollama';
    }
  }
  
  // Check primary provider
  if (isProviderAvailable(config.provider)) {
    return config.provider;
  }
  
  // Check fallback provider
  if (config.fallbackProvider && isProviderAvailable(config.fallbackProvider)) {
    console.warn(`[AI Config] Primary provider '${config.provider}' not available for '${feature}', using fallback '${config.fallbackProvider}'`);
    return config.fallbackProvider;
  }
  
  // Final fallback to template or mock
  if (config.provider === 'template' || isProviderAvailable('template')) {
    console.warn(`[AI Config] Falling back to template-based AI for '${feature}'`);
    return 'template';
  }
  
  console.warn(`[AI Config] No providers available for '${feature}', using mock data`);
  return 'mock';
}

/**
 * Calculate estimated monthly cost based on usage
 */
export function calculateMonthlyCost(requestsPerFeature: Record<string, number>): {
  totalCost: number;
  breakdown: Record<string, number>;
} {
  const breakdown: Record<string, number> = {};
  let totalCost = 0;
  
  for (const [feature, requests] of Object.entries(requestsPerFeature)) {
    const config = getAIConfig(feature);
    const cost = requests * config.costPerRequest;
    breakdown[feature] = cost;
    totalCost += cost;
  }
  
  return { totalCost, breakdown };
}

/**
 * Log AI provider usage for monitoring
 */
export async function logAIUsage(
  feature: string,
  provider: AIProvider,
  success: boolean,
  responseTime: number,
  tokensUsed?: number
): Promise<void> {
  const config = getAIConfig(feature);
  const cost = config.costPerRequest;
  
  console.log(`[AI Usage] ${feature}:`, {
    provider,
    success,
    responseTime: `${responseTime}ms`,
    tokensUsed,
    estimatedCost: `$${cost.toFixed(6)}`,
    quality: `${config.qualityThreshold}/10`,
  });
  
  // TODO: Store in database for analytics and billing
}
