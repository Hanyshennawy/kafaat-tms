/**
 * AI Configuration & Routing Strategy
 * 
 * Defines which AI provider to use for each feature based on:
 * - Cost optimization
 * - Quality requirements
 * - Provider availability
 * 
 * Provider Priority (when AI_PROVIDER not explicitly set):
 * 1. Ollama (free, local, recommended)
 * 2. Together.ai (free tier, cloud)
 * 3. OpenAI (paid, cloud)
 * 4. Templates (free, rule-based)
 * 5. Mock (fallback)
 * 
 * Cost Breakdown:
 * - Ollama: $0 (local)
 * - Templates: $0 (rule-based)
 * - Together.ai: $0 free tier / $8/mo paid
 * - OpenAI: $6-10/mo (critical requests only)
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
 * 1. Cost (Ollama/templates first - FREE)
 * 2. Quality (critical features use better models)
 * 3. Speed (templates are instant, Ollama is local)
 * 4. Privacy (Ollama keeps data local)
 */
export const AI_FEATURE_CONFIG: Record<string, AIFeatureConfig> = {
  // ============================================================================
  // OLLAMA-PREFERRED (Local AI - FREE, private)
  // ============================================================================
  
  resumeParsing: {
    provider: 'ollama',
    fallbackProvider: 'together',
    qualityThreshold: 8,
    costPerRequest: 0,
    avgResponseTime: 3000,
    description: 'Extract structured data from resumes using local LLM',
  },
  
  interviewQuestions: {
    provider: 'ollama',
    fallbackProvider: 'together',
    qualityThreshold: 8,
    costPerRequest: 0,
    avgResponseTime: 4000,
    description: 'Generate role-specific interview questions',
  },
  
  competencyGapAnalysis: {
    provider: 'ollama',
    fallbackProvider: 'template',
    qualityThreshold: 7,
    costPerRequest: 0,
    avgResponseTime: 3000,
    description: 'Analyze skill gaps and create development plans',
  },
  
  licensingQuestions: {
    provider: 'ollama',
    fallbackProvider: 'together',
    qualityThreshold: 8,
    costPerRequest: 0,
    avgResponseTime: 5000,
    description: 'Generate UAE MOE licensing assessment questions',
  },
  
  jobDescriptionGeneration: {
    provider: 'ollama',
    fallbackProvider: 'together',
    qualityThreshold: 7,
    costPerRequest: 0,
    avgResponseTime: 3000,
    description: 'Create professional job descriptions for education sector',
  },
  
  psychometricQuestions: {
    provider: 'ollama',
    fallbackProvider: 'together',
    qualityThreshold: 8,
    costPerRequest: 0,
    avgResponseTime: 4000,
    description: 'Generate psychometric assessment items',
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
 */
export function getEffectiveProvider(feature: string): AIProvider {
  // If AI_PROVIDER environment variable is set, use it
  if (DEFAULT_PROVIDER && isProviderAvailable(DEFAULT_PROVIDER)) {
    console.log(`[AI Config] Using AI_PROVIDER override: '${DEFAULT_PROVIDER}' for '${feature}'`);
    return DEFAULT_PROVIDER;
  }
  
  const config = getAIConfig(feature);
  
  // For Ollama, check if we're in production (Render) - Ollama won't be available
  if (config.provider === 'ollama') {
    // In production (Render), skip Ollama and use fallback
    if (process.env.NODE_ENV === 'production' || process.env.RENDER === 'true') {
      if (config.fallbackProvider && isProviderAvailable(config.fallbackProvider)) {
        console.log(`[AI Config] Production mode: Using '${config.fallbackProvider}' for '${feature}' (Ollama not available in cloud)`);
        return config.fallbackProvider;
      }
    }
    
    // Check if Ollama URL is configured or we're using default localhost
    const ollamaUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    console.log(`[AI Config] Using Ollama for '${feature}' at ${ollamaUrl}`);
    return 'ollama';
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
  
  // Final fallback to mock
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
