/**
 * AI Configuration & Routing Strategy
 * 
 * Defines which AI provider to use for each feature based on:
 * - Cost optimization
 * - Quality requirements
 * - Render free tier compatibility
 * 
 * Cost Breakdown:
 * - Templates: $0 (60% of requests)
 * - Together.ai: $0 free tier / $8/mo paid (35% of requests)
 * - OpenAI: $6-10/mo (5% of critical requests)
 */

export type AIProvider = 'template' | 'together' | 'openai' | 'mock';

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
 * 1. Cost (templates first)
 * 2. Quality (critical features use better models)
 * 3. Speed (templates are instant)
 * 4. Render compatibility (all external APIs)
 */
export const AI_FEATURE_CONFIG: Record<string, AIFeatureConfig> = {
  // ============================================================================
  // TEMPLATE-BASED (60% of requests - FREE)
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
  
  // ============================================================================
  // TOGETHER.AI (35% of requests - FREE tier 5M tokens/mo)
  // ============================================================================
  
  resumeParsing: {
    provider: 'together',
    fallbackProvider: 'template',
    qualityThreshold: 7,
    costPerRequest: 0.0001,
    avgResponseTime: 1500,
    description: 'Extract structured data from unstructured resumes',
  },
  
  interviewQuestions: {
    provider: 'together',
    fallbackProvider: 'template',
    qualityThreshold: 7,
    costPerRequest: 0.0002,
    avgResponseTime: 2000,
    description: 'Generate role-specific behavioral & technical interview questions',
  },
  
  competencyGapAnalysis: {
    provider: 'together',
    fallbackProvider: 'template',
    qualityThreshold: 7,
    costPerRequest: 0.0002,
    avgResponseTime: 2000,
    description: 'Analyze skill gaps and create development plans',
  },
  
  licensingQuestions: {
    provider: 'together',
    fallbackProvider: 'mock',
    qualityThreshold: 7,
    costPerRequest: 0.0003,
    avgResponseTime: 2500,
    description: 'Generate UAE MOE licensing assessment questions',
  },
  
  jobDescriptionGeneration: {
    provider: 'together',
    fallbackProvider: 'template',
    qualityThreshold: 7,
    costPerRequest: 0.0002,
    avgResponseTime: 2000,
    description: 'Create professional job descriptions for education sector',
  },
  
  // ============================================================================
  // OPENAI GPT-4o-mini (5% of requests - Critical quality)
  // ============================================================================
  
  psychometricQuestions: {
    provider: 'openai',
    fallbackProvider: 'together',
    qualityThreshold: 9,
    costPerRequest: 0.002,
    avgResponseTime: 2000,
    description: 'Generate psychologically valid personality & cognitive assessments',
  },
};

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
 */
export function getEffectiveProvider(feature: string): AIProvider {
  const config = getAIConfig(feature);
  
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
