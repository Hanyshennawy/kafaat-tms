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
    // Professional educator-focused questions with varied types
    const mockQuestions: Record<string, any[]> = {
      'big5': [
        {
          question: "How would you handle this classroom situation?",
          type: "scenario",
          scenario: "During a lesson, you notice two students are consistently off-task and distracting others. Your usual warning hasn't worked.",
          dimension: "Conscientiousness",
          options: [
            { id: 'a', text: "Stop the lesson and address the behavior directly with the class", value: 3 },
            { id: 'b', text: "Move closer to the students while continuing to teach", value: 4 },
            { id: 'c', text: "Speak privately with them after class about expectations", value: 5 },
            { id: 'd', text: "Send them to the office to avoid further disruption", value: 2 },
          ]
        },
        {
          question: "When collaborating with colleagues on a project, you typically:",
          type: "multiple_choice",
          dimension: "Extraversion",
          options: [
            { id: 'a', text: "Take the lead and coordinate team efforts", value: 5 },
            { id: 'b', text: "Contribute ideas and support the group leader", value: 4 },
            { id: 'c', text: "Prefer to work on your assigned section independently", value: 2 },
            { id: 'd', text: "Listen to others' ideas before sharing your own", value: 3 },
          ]
        },
        {
          question: "In your approach to lesson planning:",
          type: "forced_choice",
          dimension: "Openness",
          options: [
            { id: 'a', text: "I enjoy experimenting with new teaching methods and technologies", value: 5 },
            { id: 'b', text: "I prefer proven approaches that I know work effectively", value: 3 },
          ]
        },
        {
          question: "What would be your approach?",
          type: "situational",
          scenario: "A parent emails you with concerns about their child's recent grades. The tone seems frustrated and accusatory.",
          dimension: "Agreeableness",
          options: [
            { id: 'a', text: "Respond promptly with empathy and offer to schedule a meeting", value: 5 },
            { id: 'b', text: "Wait a day to respond to avoid reacting emotionally", value: 4 },
            { id: 'c', text: "Forward to administration to handle the complaint", value: 2 },
            { id: 'd', text: "Send a detailed defense of your grading decisions", value: 1 },
          ]
        },
        {
          question: "After receiving critical feedback from an observation:",
          type: "multiple_choice",
          dimension: "Emotional Stability",
          options: [
            { id: 'a', text: "Reflect on valid points and create an improvement plan", value: 5 },
            { id: 'b', text: "Discuss the feedback with trusted colleagues for perspective", value: 4 },
            { id: 'c', text: "Focus on areas where you disagreed with the observer", value: 2 },
            { id: 'd', text: "Accept it but continue with your usual teaching approach", value: 3 },
          ]
        },
      ],
      'emotional_intelligence': [
        {
          question: "How do you respond?",
          type: "scenario",
          scenario: "A usually high-performing student has become withdrawn and their work quality has declined significantly over the past week.",
          dimension: "Empathy",
          options: [
            { id: 'a', text: "Find a private moment to check in and ask if everything is okay", value: 5 },
            { id: 'b', text: "Contact parents immediately to report the change", value: 3 },
            { id: 'c', text: "Give them time - they may just be having a rough week", value: 2 },
            { id: 'd', text: "Adjust expectations temporarily while monitoring the situation", value: 4 },
          ]
        },
        {
          question: "When you feel frustrated with a student's repeated mistakes:",
          type: "forced_choice",
          dimension: "Self-Regulation",
          options: [
            { id: 'a', text: "I take a breath and find a new way to explain the concept", value: 5 },
            { id: 'b', text: "I sometimes show my frustration before catching myself", value: 2 },
          ]
        },
        {
          question: "In managing your own stress and workload:",
          type: "multiple_choice",
          dimension: "Self-Awareness",
          options: [
            { id: 'a', text: "I recognize my limits and take breaks when needed", value: 5 },
            { id: 'b', text: "I push through until everything is done", value: 2 },
            { id: 'c', text: "I prioritize tasks and delegate when possible", value: 4 },
            { id: 'd', text: "I often feel overwhelmed but manage to cope", value: 3 },
          ]
        },
      ],
      'leadership': [
        {
          question: "As a team leader, how would you approach this?",
          type: "scenario",
          scenario: "Your department needs to implement a new curriculum by next semester. Some team members are resistant to the change.",
          dimension: "Change Management",
          options: [
            { id: 'a', text: "Meet individually with resistant members to understand concerns", value: 5 },
            { id: 'b', text: "Present the benefits clearly and set firm deadlines", value: 3 },
            { id: 'c', text: "Identify early adopters and use them to influence others", value: 4 },
            { id: 'd', text: "Escalate to administration for support with implementation", value: 2 },
          ]
        },
        {
          question: "When making important decisions that affect your team:",
          type: "forced_choice",
          dimension: "Decision Making",
          options: [
            { id: 'a', text: "I gather input from stakeholders before deciding", value: 4 },
            { id: 'b', text: "I analyze the data and make an informed decision quickly", value: 4 },
          ]
        },
      ],
      'cognitive': [
        {
          question: "Based on the information, what conclusion is most logical?",
          type: "multiple_choice",
          scenario: "All teachers who completed the workshop showed improved student engagement. Ms. Ahmed did not show improved engagement.",
          dimension: "Verbal Reasoning",
          options: [
            { id: 'a', text: "Ms. Ahmed did not complete the workshop", value: 5 },
            { id: 'b', text: "The workshop was ineffective for Ms. Ahmed", value: 1 },
            { id: 'c', text: "Ms. Ahmed's students were already engaged", value: 1 },
            { id: 'd', text: "Ms. Ahmed needs additional support", value: 1 },
          ],
          correctAnswer: 0,
          explanation: "This is a logical deduction - if all completers showed improvement, and Ahmed didn't improve, she couldn't have completed it."
        },
      ],
    };

    const relevantQuestions = mockQuestions[testType] || mockQuestions['big5'];
    return relevantQuestions.slice(0, count);
  }

  /**
   * Test AI connection - useful for health checks
   */
  async testConnection(): Promise<{ provider: string; available: boolean; message: string }> {
    // First check Together.ai (preferred provider)
    if (process.env.TOGETHER_API_KEY) {
      return {
        provider: 'together',
        available: true,
        message: 'Together.ai API key configured - using Llama 3.2 3B Instruct Turbo',
      };
    }
    
    // Then check Ollama
    if (ollamaService.isServiceAvailable()) {
      const result = await ollamaService.testConnection();
      return {
        provider: 'ollama',
        available: result.success,
        message: result.message,
      };
    }
    
    return {
      provider: 'template',
      available: true,
      message: 'Using template-based AI (rule-based) - Configure TOGETHER_API_KEY for AI features',
    };
  }

  /**
   * Generate competency assessment questions with automatic provider selection
   */
  async generateCompetencyQuestions(
    competencyArea: string,
    level: string,
    jobRole: string = "Educator",
    count: number = 10
  ): Promise<any[]> {
    const provider = getEffectiveProvider('competencyQuestions');
    const startTime = Date.now();
    
    try {
      let result: any[];
      
      switch (provider) {
        case 'together':
          result = await togetherAIService.generateCompetencyQuestions(
            competencyArea,
            level,
            jobRole,
            count
          );
          break;
        case 'ollama':
          if (ollamaService.isServiceAvailable()) {
            // Fallback to Together.ai for competency questions (Ollama doesn't have this method yet)
            try {
              result = await togetherAIService.generateCompetencyQuestions(
                competencyArea,
                level,
                jobRole,
                count
              );
            } catch {
              result = this.getMockCompetencyQuestions(competencyArea, level, count);
            }
          } else {
            result = this.getMockCompetencyQuestions(competencyArea, level, count);
          }
          break;
        default:
          result = this.getMockCompetencyQuestions(competencyArea, level, count);
      }
      
      await logAIUsage('competencyQuestions', provider, true, Date.now() - startTime);
      return result;
    } catch (error) {
      await logAIUsage('competencyQuestions', provider, false, Date.now() - startTime);
      console.error('[AI Router] Competency question generation failed:', error);
      return this.getMockCompetencyQuestions(competencyArea, level, count);
    }
  }

  /**
   * Get mock competency questions as fallback
   */
  private getMockCompetencyQuestions(competencyArea: string, level: string, count: number): any[] {
    const baseQuestions: Record<string, string[]> = {
      'Professional Knowledge': [
        'How do you ensure your subject knowledge stays current with curriculum changes?',
        'Describe how you differentiate instruction based on student learning styles.',
        'What strategies do you use to connect subject matter to real-world applications?',
        'How do you assess prior knowledge before introducing new concepts?',
        'Explain your approach to addressing student misconceptions.',
      ],
      'Professional Practice': [
        'Describe a lesson where you successfully engaged all students.',
        'How do you create an inclusive learning environment?',
        'What assessment methods do you use to track student progress?',
        'How do you handle classroom management challenges?',
        'Describe your approach to providing constructive feedback to students.',
      ],
      'Professional Engagement': [
        'How do you collaborate with colleagues to improve teaching practices?',
        'Describe your approach to parent communication and involvement.',
        'How do you contribute to school-wide improvement initiatives?',
        'What professional development have you pursued recently?',
        'How do you model ethical behavior for students?',
      ],
    };

    const relevantQuestions = baseQuestions[competencyArea] || baseQuestions['Professional Practice'];
    const questions: any[] = [];
    
    for (let i = 0; i < count && i < relevantQuestions.length; i++) {
      questions.push({
        question: relevantQuestions[i],
        competencyArea,
        level,
        behavioralIndicator: 'Demonstrates understanding and application of competency',
        options: [
          'Limited understanding - needs significant development',
          'Developing - shows basic understanding with guidance',
          'Proficient - consistently demonstrates competence',
          'Advanced - exceeds expectations and mentors others'
        ],
        correctAnswer: 2,
        explanation: 'A proficient response demonstrates consistent application of best practices.',
        developmentHint: 'Focus on continuous improvement and peer collaboration.',
        aiGenerated: false,
      });
    }
    
    return questions;
  }
}

// ============================================================================
// EXPORT SINGLETON
// ============================================================================

export const aiRouterService = new AIRouterService();
