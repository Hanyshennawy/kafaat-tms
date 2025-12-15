/**
 * AI Router Service
 * 
 * Smart routing layer that directs AI requests to the appropriate provider:
 * - Ollama (recommended - free, local, private)
 * - Template service (free, instant, rule-based)
 * - Together.ai (free tier cloud backup)
 * - OpenAI (paid, critical quality)
 * 
 * Automatically handles fallbacks and provider availability.
 */

import { getEffectiveProvider, logAIUsage } from './ai-config';
import { templateAIService } from './ai-template.service';
import { togetherAIService } from './ai-together.service';
import { ollamaService } from './ollama.service';
import { aiService as openaiService } from './ai.service';
import type {
  ResumeParseResult,
  CareerRecommendation,
  SentimentAnalysis,
  PerformancePrediction,
  SkillsGapAnalysis,
  InterviewQuestion,
} from './ai.service';

// ============================================================================
// AI ROUTER SERVICE
// ============================================================================

export class AIRouterService {
  /**
   * Parse resume with automatic provider selection
   */
  async parseResume(resumeText: string, tenantId?: number): Promise<ResumeParseResult> {
    const provider = getEffectiveProvider('resumeParsing');
    const startTime = Date.now();
    
    try {
      let result: ResumeParseResult;
      
      switch (provider) {
        case 'ollama':
          if (ollamaService.isServiceAvailable()) {
            result = await ollamaService.parseResume(resumeText, tenantId);
          } else {
            console.warn('[AI Router] Ollama not available, falling back to Together.ai');
            result = await togetherAIService.parseResume(resumeText, tenantId);
          }
          break;
        case 'together':
          result = await togetherAIService.parseResume(resumeText, tenantId);
          break;
        case 'openai':
          result = await openaiService.parseResume(resumeText, tenantId);
          break;
        default:
          // Fallback to mock
          result = await openaiService.parseResume(resumeText, tenantId);
      }
      
      await logAIUsage('resumeParsing', provider, true, Date.now() - startTime);
      return result;
    } catch (error) {
      await logAIUsage('resumeParsing', provider, false, Date.now() - startTime);
      
      // Fallback chain: ollama -> together -> openai (mock)
      console.warn(`[AI Router] Falling back from ${provider} for resume parsing`);
      if (provider === 'ollama') {
        try {
          return await togetherAIService.parseResume(resumeText, tenantId);
        } catch {
          return openaiService.parseResume(resumeText, tenantId);
        }
      }
      return openaiService.parseResume(resumeText, tenantId);
    }
  }

  /**
   * Get career recommendations with automatic provider selection
   */
  async getCareerRecommendations(
    currentRole: string,
    yearsExperience: number,
    currentSkills: string[],
    targetAreas?: string[],
    tenantId?: number
  ): Promise<CareerRecommendation[]> {
    const provider = getEffectiveProvider('careerRecommendations');
    const startTime = Date.now();
    
    try {
      let result: CareerRecommendation[];
      
      switch (provider) {
        case 'ollama':
          if (ollamaService.isServiceAvailable()) {
            result = await ollamaService.getCareerRecommendations(
              currentRole,
              yearsExperience,
              currentSkills,
              targetAreas,
              tenantId
            );
          } else {
            result = await templateAIService.getCareerRecommendations(
              currentRole,
              yearsExperience,
              currentSkills,
              targetAreas
            );
          }
          break;
        case 'template':
          result = await templateAIService.getCareerRecommendations(
            currentRole,
            yearsExperience,
            currentSkills,
            targetAreas
          );
          break;
        case 'openai':
          result = await openaiService.getCareerRecommendations(
            {
              currentRole,
              skills: currentSkills,
              experience: yearsExperience,
              interests: targetAreas || [],
              performanceRating: 0,
            },
            [],
            tenantId
          );
          break;
        default:
          // Fallback to template
          result = await templateAIService.getCareerRecommendations(
            currentRole,
            yearsExperience,
            currentSkills,
            targetAreas
          );
      }
      
      await logAIUsage('careerRecommendations', provider, true, Date.now() - startTime);
      return result;
    } catch (error) {
      await logAIUsage('careerRecommendations', provider, false, Date.now() - startTime);
      console.error('[AI Router] Career recommendations failed:', error);
      
      // Always fallback to template
      return templateAIService.getCareerRecommendations(currentRole, yearsExperience, currentSkills, targetAreas);
    }
  }

  /**
   * Analyze sentiment with automatic provider selection
   */
  async analyzeSentiment(texts: string[], category?: string, tenantId?: number): Promise<SentimentAnalysis> {
    const provider = getEffectiveProvider('sentimentAnalysis');
    const startTime = Date.now();
    
    try {
      let result: SentimentAnalysis;
      
      switch (provider) {
        case 'ollama':
          if (ollamaService.isServiceAvailable()) {
            result = await ollamaService.analyzeSentiment(texts, category, tenantId);
          } else {
            result = await templateAIService.analyzeSentiment(texts);
          }
          break;
        case 'template':
          result = await templateAIService.analyzeSentiment(texts);
          break;
        case 'openai':
          result = await openaiService.analyzeSentiment(texts, category, tenantId);
          break;
        default:
          // Fallback to template
          result = await templateAIService.analyzeSentiment(texts);
      }
      
      await logAIUsage('sentimentAnalysis', provider, true, Date.now() - startTime);
      return result;
    } catch (error) {
      await logAIUsage('sentimentAnalysis', provider, false, Date.now() - startTime);
      console.error('[AI Router] Sentiment analysis failed:', error);
      
      // Always fallback to template
      return templateAIService.analyzeSentiment(texts);
    }
  }

  /**
   * Predict performance with automatic provider selection
   */
  async predictPerformance(data: {
    previousRatings: number[];
    trainingCompleted: number;
    attendanceRate: number;
    projectsCompleted: number;
    yearsExperience: number;
  }, tenantId?: number): Promise<PerformancePrediction> {
    const provider = getEffectiveProvider('performancePrediction');
    const startTime = Date.now();
    
    try {
      let result: PerformancePrediction;
      
      switch (provider) {
        case 'template':
          result = await templateAIService.predictPerformance(data);
          break;
        case 'openai':
          // Map to OpenAI service format
          const openAIData = {
            historicalRatings: data.previousRatings,
            attendanceRate: data.attendanceRate,
            trainingCompleted: data.trainingCompleted,
            projectsCompleted: data.projectsCompleted,
            peersAverageRating: 0, // Not provided in simplified format
            tenure: data.yearsExperience,
          };
          result = await openaiService.predictPerformance(openAIData, tenantId);
          break;
        default:
          // Fallback to template
          result = await templateAIService.predictPerformance(data);
      }
      
      await logAIUsage('performancePrediction', provider, true, Date.now() - startTime);
      return result;
    } catch (error) {
      await logAIUsage('performancePrediction', provider, false, Date.now() - startTime);
      console.error('[AI Router] Performance prediction failed:', error);
      
      // Always fallback to template
      return templateAIService.predictPerformance(data);
    }
  }

  /**
   * Analyze skills gap with automatic provider selection
   */
  async analyzeSkillsGap(
    currentSkills: { name: string; level: number }[],
    targetRole: string,
    tenantId?: number
  ): Promise<SkillsGapAnalysis> {
    const provider = getEffectiveProvider('competencyGapAnalysis');
    const startTime = Date.now();
    
    try {
      let result: SkillsGapAnalysis;
      
      switch (provider) {
        case 'ollama':
          if (ollamaService.isServiceAvailable()) {
            result = await ollamaService.analyzeSkillsGap(currentSkills, targetRole, tenantId);
          } else {
            result = await togetherAIService.analyzeSkillsGap(currentSkills, targetRole, tenantId);
          }
          break;
        case 'together':
          result = await togetherAIService.analyzeSkillsGap(currentSkills, targetRole, tenantId);
          break;
        case 'openai':
          result = await openaiService.analyzeSkillsGap(currentSkills, targetRole, tenantId);
          break;
        default:
          // Fallback to OpenAI mock
          result = await openaiService.analyzeSkillsGap(currentSkills, targetRole, tenantId);
      }
      
      await logAIUsage('competencyGapAnalysis', provider, true, Date.now() - startTime);
      return result;
    } catch (error) {
      await logAIUsage('competencyGapAnalysis', provider, false, Date.now() - startTime);
      console.error('[AI Router] Skills gap analysis failed:', error);
      
      // Fallback to OpenAI (which has mock)
      return openaiService.analyzeSkillsGap(currentSkills, targetRole, tenantId);
    }
  }

  /**
   * Generate interview questions with automatic provider selection
   */
  async generateInterviewQuestions(
    role: string,
    requiredCompetencies: string[],
    difficulty: 'easy' | 'medium' | 'hard' = 'medium',
    count: number = 10,
    tenantId?: number
  ): Promise<InterviewQuestion[]> {
    const provider = getEffectiveProvider('interviewQuestions');
    const startTime = Date.now();
    
    try {
      let result: InterviewQuestion[];
      
      switch (provider) {
        case 'ollama':
          if (ollamaService.isServiceAvailable()) {
            result = await ollamaService.generateInterviewQuestions(
              role,
              requiredCompetencies,
              difficulty,
              count,
              tenantId
            );
          } else {
            result = await togetherAIService.generateInterviewQuestions(
              role,
              requiredCompetencies,
              difficulty,
              count,
              tenantId
            );
          }
          break;
        case 'together':
          result = await togetherAIService.generateInterviewQuestions(
            role,
            requiredCompetencies,
            difficulty,
            count,
            tenantId
          );
          break;
        case 'openai':
          result = await openaiService.generateInterviewQuestions(
            role,
            requiredCompetencies,
            difficulty,
            count,
            tenantId
          );
          break;
        default:
          // Fallback to OpenAI mock
          result = await openaiService.generateInterviewQuestions(
            role,
            requiredCompetencies,
            difficulty,
            count,
            tenantId
          );
      }
      
      await logAIUsage('interviewQuestions', provider, true, Date.now() - startTime);
      return result;
    } catch (error) {
      await logAIUsage('interviewQuestions', provider, false, Date.now() - startTime);
      console.error('[AI Router] Interview question generation failed:', error);
      
      // Fallback to OpenAI (which has mock)
      return openaiService.generateInterviewQuestions(role, requiredCompetencies, difficulty, count, tenantId);
    }
  }

  /**
   * Generate job description with automatic provider selection
   */
  async generateJobDescription(
    role: string,
    department: string,
    requirements: string[],
    responsibilities: string[],
    tenantId?: number
  ): Promise<string> {
    const provider = getEffectiveProvider('jobDescriptionGeneration');
    const startTime = Date.now();
    
    try {
      let result: string;
      
      switch (provider) {
        case 'ollama':
          if (ollamaService.isServiceAvailable()) {
            result = await ollamaService.generateJobDescription(
              role,
              department,
              requirements,
              responsibilities,
              tenantId
            );
          } else {
            result = await togetherAIService.generateJobDescription(
              role,
              department,
              requirements,
              responsibilities,
              tenantId
            );
          }
          break;
        case 'together':
          result = await togetherAIService.generateJobDescription(
            role,
            department,
            requirements,
            responsibilities,
            tenantId
          );
          break;
        case 'openai':
          result = await openaiService.generateJobDescription(
            role,
            department,
            requirements,
            responsibilities,
            tenantId
          );
          break;
        default:
          // Fallback to OpenAI mock
          result = await openaiService.generateJobDescription(
            role,
            department,
            requirements,
            responsibilities,
            tenantId
          );
      }
      
      await logAIUsage('jobDescriptionGeneration', provider, true, Date.now() - startTime);
      return result;
    } catch (error) {
      await logAIUsage('jobDescriptionGeneration', provider, false, Date.now() - startTime);
      console.error('[AI Router] Job description generation failed:', error);
      
      // Fallback to OpenAI (which has mock)
      return openaiService.generateJobDescription(role, department, requirements, responsibilities, tenantId);
    }
  }

  /**
   * Generate licensing questions with automatic provider selection
   */
  async generateLicensingQuestions(
    jobRole: string,
    licenseTier: string,
    subjectArea: string,
    difficultyLevel: string,
    questionType: string,
    count: number
  ): Promise<any[]> {
    const provider = getEffectiveProvider('licensingQuestions');
    const startTime = Date.now();
    
    try {
      let result: any[];
      
      switch (provider) {
        case 'ollama':
          if (ollamaService.isServiceAvailable()) {
            result = await ollamaService.generateLicensingQuestions(
              jobRole,
              licenseTier,
              subjectArea,
              difficultyLevel,
              questionType,
              count
            );
          } else {
            result = await togetherAIService.generateLicensingQuestions(
              jobRole,
              licenseTier,
              subjectArea,
              difficultyLevel,
              questionType,
              count
            );
          }
          break;
        case 'together':
          result = await togetherAIService.generateLicensingQuestions(
            jobRole,
            licenseTier,
            subjectArea,
            difficultyLevel,
            questionType,
            count
          );
          break;
        case 'openai':
          // OpenAI doesn't have this method, use question-generator.ts fallback
          throw new Error('OpenAI provider not implemented for licensing questions');
        default:
          throw new Error(`Provider ${provider} not available for licensing questions`);
      }
      
      await logAIUsage('licensingQuestions', provider, true, Date.now() - startTime);
      return result;
    } catch (error) {
      await logAIUsage('licensingQuestions', provider, false, Date.now() - startTime);
      console.error('[AI Router] Licensing question generation failed:', error);
      throw error; // Let question-generator.ts handle fallback
    }
  }

  /**
   * Generate psychometric questions with automatic provider selection
   */
  async generatePsychometricQuestions(
    testType: string,
    dimension: string,
    count: number
  ): Promise<any[]> {
    const provider = getEffectiveProvider('psychometricQuestions');
    const startTime = Date.now();
    
    try {
      let result: any[];
      
      switch (provider) {
        case 'ollama':
          if (ollamaService.isServiceAvailable()) {
            result = await ollamaService.generatePsychometricQuestions(testType, dimension, count);
          } else {
            console.warn('[AI Router] Ollama not available for psychometric. Using Together.ai.');
            result = await togetherAIService.generatePsychometricQuestions(testType, dimension, count);
          }
          break;
        case 'together':
          result = await togetherAIService.generatePsychometricQuestions(testType, dimension, count);
          break;
        case 'openai':
          // Fallback to Together.ai if OpenAI not available
          if (process.env.OPENAI_API_KEY) {
            result = this.getMockPsychometricQuestions(testType, dimension, count);
          } else {
            result = await togetherAIService.generatePsychometricQuestions(testType, dimension, count);
          }
          break;
        default:
          // Try Together.ai first, then mock
          try {
            result = await togetherAIService.generatePsychometricQuestions(testType, dimension, count);
          } catch {
            result = this.getMockPsychometricQuestions(testType, dimension, count);
          }
      }
      
      await logAIUsage('psychometricQuestions', provider, true, Date.now() - startTime);
      return result;
    } catch (error) {
      await logAIUsage('psychometricQuestions', provider, false, Date.now() - startTime);
      console.error('[AI Router] Psychometric question generation failed:', error);
      return this.getMockPsychometricQuestions(testType, dimension, count);
    }
  }

  /**
   * Get mock psychometric questions as fallback
   */
  private getMockPsychometricQuestions(testType: string, dimension: string, count: number): any[] {
    const questions = [];
    const baseQuestions: Record<string, string[]> = {
      'big5': [
        'I enjoy being the center of attention in social situations.',
        'I prefer to have a plan rather than being spontaneous.',
        'I find it easy to empathize with others\' feelings.',
        'I remain calm under pressure.',
        'I am curious about many different things.',
      ],
      'leadership': [
        'I naturally take charge in group situations.',
        'I inspire others to achieve their best.',
        'I make decisions quickly and confidently.',
        'I delegate tasks effectively to team members.',
        'I handle conflicts constructively.',
      ],
      'cognitive': [
        'I can easily identify patterns in complex data.',
        'I enjoy solving puzzles and brain teasers.',
        'I can remember detailed information accurately.',
        'I adapt quickly to new situations.',
        'I think through problems systematically.',
      ],
    };

    const relevantQuestions = baseQuestions[testType] || baseQuestions['big5'];
    
    for (let i = 0; i < count && i < relevantQuestions.length; i++) {
      questions.push({
        question: relevantQuestions[i],
        dimension: dimension,
        type: 'likert',
        options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
        scoring: i % 2 === 0 ? 'normal' : 'reverse',
        weight: 1.0,
      });
    }
    
    return questions;
  }

  /**
   * Test AI connection - useful for health checks
   */
  async testConnection(): Promise<{ provider: string; available: boolean; message: string }> {
    if (ollamaService.isServiceAvailable()) {
      const result = await ollamaService.testConnection();
      return {
        provider: 'ollama',
        available: result.success,
        message: result.message,
      };
    }
    
    if (process.env.TOGETHER_API_KEY) {
      return {
        provider: 'together',
        available: true,
        message: 'Together.ai API key configured',
      };
    }
    
    return {
      provider: 'template',
      available: true,
      message: 'Using template-based AI (rule-based)',
    };
  }
}

// ============================================================================
// EXPORT SINGLETON
// ============================================================================

export const aiRouterService = new AIRouterService();
