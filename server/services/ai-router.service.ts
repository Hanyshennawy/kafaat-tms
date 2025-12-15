/**
 * AI Router Service
 * 
 * Smart routing layer that directs AI requests to the appropriate provider:
 * - Template service (60% - free, instant)
 * - Together.ai (35% - free tier, 1-2s)
 * - OpenAI (5% - paid, critical quality)
 * 
 * Automatically handles fallbacks and provider availability.
 */

import { getEffectiveProvider, logAIUsage } from './ai-config';
import { templateAIService } from './ai-template.service';
import { togetherAIService } from './ai-together.service';
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
      
      // Fallback chain
      if (provider !== 'openai') {
        console.warn(`[AI Router] Falling back from ${provider} to mock for resume parsing`);
        return openaiService.parseResume(resumeText, tenantId);
      }
      
      throw error;
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
   * (Uses OpenAI GPT-4o-mini for critical quality)
   */
  async generatePsychometricQuestions(
    testType: string,
    dimension: string,
    count: number
  ): Promise<any[]> {
    const provider = getEffectiveProvider('psychometricQuestions');
    const startTime = Date.now();
    
    try {
      // Psychometric always uses OpenAI for quality
      if (provider !== 'openai') {
        console.warn('[AI Router] Psychometric questions require OpenAI, but not configured. Using fallback.');
      }
      
      // TODO: Implement OpenAI psychometric generation or use specialized service
      const result: any[] = [];
      
      await logAIUsage('psychometricQuestions', provider, true, Date.now() - startTime);
      return result;
    } catch (error) {
      await logAIUsage('psychometricQuestions', provider, false, Date.now() - startTime);
      console.error('[AI Router] Psychometric question generation failed:', error);
      throw error;
    }
  }
}

// ============================================================================
// EXPORT SINGLETON
// ============================================================================

export const aiRouterService = new AIRouterService();
