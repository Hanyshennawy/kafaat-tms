/**
 * Ollama Service - Local LLM Integration
 * 
 * OpenAI-compatible wrapper for Ollama that provides:
 * - Resume parsing
 * - Career recommendations
 * - Interview question generation
 * - Skills gap analysis
 * - Job description generation
 * - Licensing questions
 * - Psychometric questions
 * 
 * Supports both local Ollama (http://localhost:11434) and remote deployments.
 */

import type {
  ResumeParseResult,
  CareerRecommendation,
  SentimentAnalysis,
  PerformancePrediction,
  SkillsGapAnalysis,
  InterviewQuestion,
} from './ai.service';

// ============================================================================
// CONFIGURATION
// ============================================================================

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2:3b';
const OLLAMA_TIMEOUT = parseInt(process.env.OLLAMA_TIMEOUT || '60000'); // 60 seconds

// ============================================================================
// TYPES
// ============================================================================

interface OllamaRequest {
  model: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  stream?: boolean;
  format?: 'json';
  options?: {
    temperature?: number;
    top_p?: number;
    num_predict?: number;
  };
}

interface OllamaResponse {
  model: string;
  created_at: string;
  message: {
    role: string;
    content: string;
  };
  done: boolean;
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  eval_count?: number;
}

interface OllamaChatCompletion {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: { role: string; content: string };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// ============================================================================
// OLLAMA SERVICE
// ============================================================================

class OllamaService {
  private baseUrl: string;
  private defaultModel: string;
  private isAvailable: boolean = false;
  private availableModels: string[] = [];

  constructor() {
    this.baseUrl = OLLAMA_BASE_URL;
    this.defaultModel = OLLAMA_MODEL;
    this.checkAvailability();
  }

  /**
   * Check if Ollama is available and list models
   */
  private async checkAvailability() {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        signal: AbortSignal.timeout(5000),
      });
      this.isAvailable = response.ok;

      if (this.isAvailable) {
        const data = await response.json();
        this.availableModels = data.models?.map((m: any) => m.name) || [];
        console.log('[Ollama] ✅ Connected! Available models:', this.availableModels);

        if (!this.availableModels.some(m => m.startsWith(this.defaultModel.split(':')[0]))) {
          console.warn(`[Ollama] ⚠️ Model ${this.defaultModel} not found. Available:`, this.availableModels);
          console.log(`[Ollama] 💡 Run: ollama pull ${this.defaultModel}`);
        }
      }
    } catch (error) {
      this.isAvailable = false;
      console.warn('[Ollama] ❌ Not available. Make sure Ollama is running.');
      console.log('[Ollama] 💡 Install: https://ollama.com/download');
    }
  }

  /**
   * Refresh availability status
   */
  async refresh(): Promise<boolean> {
    await this.checkAvailability();
    return this.isAvailable;
  }

  /**
   * Generate chat completion (OpenAI-compatible interface)
   */
  async chatCompletion(params: {
    messages: Array<{ role: string; content: string }>;
    model?: string;
    temperature?: number;
    max_tokens?: number;
    response_format?: { type: 'json_object' };
  }): Promise<OllamaChatCompletion> {
    if (!this.isAvailable) {
      throw new Error('Ollama service is not available. Start Ollama server first.');
    }

    const request: OllamaRequest = {
      model: params.model || this.defaultModel,
      messages: params.messages as any,
      stream: false,
      options: {
        temperature: params.temperature || 0.7,
        ...(params.max_tokens && { num_predict: params.max_tokens }),
      },
    };

    // Request JSON format if specified
    if (params.response_format?.type === 'json_object') {
      request.format = 'json';

      // Add JSON instruction to system message
      const systemMessage = request.messages.find(m => m.role === 'system');
      if (systemMessage) {
        if (!systemMessage.content.includes('JSON')) {
          systemMessage.content += '\n\nIMPORTANT: Respond with valid JSON only. No markdown, no explanation.';
        }
      } else {
        request.messages.unshift({
          role: 'system',
          content: 'You must respond with valid JSON only. No markdown, no explanation.',
        });
      }
    }

    try {
      const startTime = Date.now();

      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
        signal: AbortSignal.timeout(OLLAMA_TIMEOUT),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Ollama API error: ${response.status} ${response.statusText} - ${error}`);
      }

      const data: OllamaResponse = await response.json();
      const duration = Date.now() - startTime;

      console.log(`[Ollama] Request completed in ${duration}ms, model: ${data.model}`);

      // Convert to OpenAI format
      return {
        id: `ollama-${Date.now()}`,
        object: 'chat.completion',
        created: Math.floor(new Date(data.created_at).getTime() / 1000),
        model: data.model,
        choices: [
          {
            index: 0,
            message: {
              role: data.message.role,
              content: data.message.content,
            },
            finish_reason: 'stop',
          },
        ],
        usage: {
          prompt_tokens: data.prompt_eval_count || 0,
          completion_tokens: data.eval_count || 0,
          total_tokens: (data.prompt_eval_count || 0) + (data.eval_count || 0),
        },
      };
    } catch (error) {
      console.error('[Ollama] Request failed:', error);
      throw error;
    }
  }

  /**
   * Check if service is available
   */
  isServiceAvailable(): boolean {
    return this.isAvailable;
  }

  /**
   * Get available models
   */
  getAvailableModels(): string[] {
    return this.availableModels;
  }

  /**
   * Get current model
   */
  getModel(): string {
    return this.defaultModel;
  }

  // ============================================================================
  // AI FEATURE IMPLEMENTATIONS
  // ============================================================================

  /**
   * Parse resume with Ollama
   */
  async parseResume(resumeText: string, tenantId?: number): Promise<ResumeParseResult> {
    const systemPrompt = `You are an expert HR professional and resume analyst for UAE Ministry of Education.
Extract structured data from resumes accurately. Focus on:
- UAE-specific qualifications and certifications
- Teaching and education experience
- Arabic and English language proficiency
- TDRA compliance certifications

Return ONLY valid JSON with this exact structure:
{
  "name": "string",
  "email": "string",
  "phone": "string",
  "summary": "string (2-3 sentences)",
  "experience": [{"title": "string", "company": "string", "duration": "string", "description": "string", "startDate": "string", "endDate": "string"}],
  "education": [{"degree": "string", "institution": "string", "year": "string", "gpa": "string or null"}],
  "skills": [{"name": "string", "level": "beginner|intermediate|advanced|expert", "category": "string"}],
  "certifications": [{"name": "string", "issuer": "string", "date": "string or null", "expiryDate": "string or null"}],
  "languages": [{"name": "string", "proficiency": "string"}],
  "totalYearsExperience": number,
  "suggestedRole": "string",
  "confidence": number (0-1)
}`;

    const response = await this.chatCompletion({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Parse this resume:\n\n${resumeText}` },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2,
      max_tokens: 2000,
    });

    try {
      const content = response.choices[0].message.content;
      return JSON.parse(content) as ResumeParseResult;
    } catch (e) {
      console.error('[Ollama] Failed to parse resume JSON response:', e);
      throw new Error('Failed to parse resume: Invalid JSON response from AI');
    }
  }

  /**
   * Generate career recommendations
   */
  async getCareerRecommendations(
    currentRole: string,
    yearsExperience: number,
    currentSkills: string[],
    targetAreas?: string[],
    tenantId?: number
  ): Promise<CareerRecommendation[]> {
    const systemPrompt = `You are an expert career advisor for UAE Ministry of Education.
Provide career recommendations based on UAE MOE career framework.
Consider:
- UAE teaching license requirements
- TDRA compliance for educational roles
- Arabic language requirements
- UAE-specific career paths in education

Return ONLY valid JSON array with 3 recommendations:
[{
  "role": "string",
  "matchScore": number (0-100),
  "reasoning": "string",
  "skillsRequired": ["string"],
  "skillsGap": ["string"],
  "developmentPath": ["string"],
  "timelineMonths": number,
  "trainingRecommendations": ["string"]
}]`;

    const userPrompt = `Current Role: ${currentRole}
Years Experience: ${yearsExperience}
Current Skills: ${currentSkills.join(', ')}
${targetAreas?.length ? `Target Areas: ${targetAreas.join(', ')}` : ''}

Provide 3 career recommendations for this profile.`;

    const response = await this.chatCompletion({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 2000,
    });

    try {
      const content = response.choices[0].message.content;
      const parsed = JSON.parse(content);
      // Handle both array and object with recommendations key
      return Array.isArray(parsed) ? parsed : (parsed.recommendations || []);
    } catch (e) {
      console.error('[Ollama] Failed to parse career recommendations:', e);
      throw new Error('Failed to generate career recommendations: Invalid JSON response');
    }
  }

  /**
   * Analyze sentiment
   */
  async analyzeSentiment(texts: string[], category?: string, tenantId?: number): Promise<SentimentAnalysis> {
    const systemPrompt = `You are an expert sentiment analyst for employee feedback in UAE Ministry of Education.
Analyze the sentiment considering:
- UAE cultural context
- Educational sector concerns
- Arabic expressions (if present)

Return ONLY valid JSON:
{
  "overallSentiment": "positive|neutral|negative",
  "score": number (-1 to 1),
  "emotions": {
    "joy": number (0-1),
    "trust": number (0-1),
    "fear": number (0-1),
    "surprise": number (0-1),
    "sadness": number (0-1),
    "disgust": number (0-1),
    "anger": number (0-1),
    "anticipation": number (0-1)
  },
  "themes": ["string"],
  "concerns": ["string"],
  "suggestions": ["string"]
}`;

    const response = await this.chatCompletion({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Analyze sentiment in this text:\n\n${texts.join('\n\n')}` },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
      max_tokens: 1000,
    });

    try {
      const content = response.choices[0].message.content;
      return JSON.parse(content) as SentimentAnalysis;
    } catch (e) {
      console.error('[Ollama] Failed to parse sentiment analysis:', e);
      throw new Error('Failed to analyze sentiment: Invalid JSON response');
    }
  }

  /**
   * Analyze skills gap
   */
  async analyzeSkillsGap(
    currentSkills: { name: string; level: number }[],
    targetRole: string,
    tenantId?: number
  ): Promise<SkillsGapAnalysis> {
    const systemPrompt = `You are an expert skills analyst for UAE Ministry of Education.
Analyze skills gaps considering:
- UAE MOE competency framework
- TDRA requirements
- UAE teaching license requirements

Return ONLY valid JSON:
{
  "currentSkills": [{"name": "string", "level": number (1-5)}],
  "requiredSkills": [{"name": "string", "level": number (1-5)}],
  "gaps": [{
    "skill": "string",
    "currentLevel": number,
    "requiredLevel": number,
    "gap": number,
    "priority": "high|medium|low",
    "trainingOptions": ["string"]
  }],
  "overallReadiness": number (0-100),
  "estimatedTimeToClose": "string"
}`;

    const skillsStr = currentSkills.map(s => `${s.name}: Level ${s.level}`).join(', ');
    
    const response = await this.chatCompletion({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Target Role: ${targetRole}\nCurrent Skills: ${skillsStr}\n\nAnalyze the skills gap.` },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.5,
      max_tokens: 2000,
    });

    try {
      const content = response.choices[0].message.content;
      return JSON.parse(content) as SkillsGapAnalysis;
    } catch (e) {
      console.error('[Ollama] Failed to parse skills gap analysis:', e);
      throw new Error('Failed to analyze skills gap: Invalid JSON response');
    }
  }

  /**
   * Generate interview questions
   */
  async generateInterviewQuestions(
    role: string,
    requiredCompetencies: string[],
    difficulty: 'easy' | 'medium' | 'hard' = 'medium',
    count: number = 10,
    tenantId?: number
  ): Promise<InterviewQuestion[]> {
    const systemPrompt = `You are an expert interviewer for UAE Ministry of Education.
Generate interview questions that:
- Test UAE MOE competency framework
- Include behavioral and situational questions
- Consider UAE cultural context
- Test Arabic communication (where relevant)

Return ONLY valid JSON array of ${count} questions:
[{
  "question": "string",
  "category": "behavioral|technical|situational|competency",
  "difficulty": "easy|medium|hard",
  "expectedAnswer": "string (key points to look for)",
  "evaluationCriteria": ["string"],
  "followUpQuestions": ["string"]
}]`;

    const response = await this.chatCompletion({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Role: ${role}\nCompetencies: ${requiredCompetencies.join(', ')}\nDifficulty: ${difficulty}\n\nGenerate ${count} interview questions.` },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.8,
      max_tokens: 3000,
    });

    try {
      const content = response.choices[0].message.content;
      const parsed = JSON.parse(content);
      return Array.isArray(parsed) ? parsed : (parsed.questions || []);
    } catch (e) {
      console.error('[Ollama] Failed to parse interview questions:', e);
      throw new Error('Failed to generate interview questions: Invalid JSON response');
    }
  }

  /**
   * Generate job description
   */
  async generateJobDescription(
    role: string,
    department: string,
    requirements: string[],
    responsibilities: string[],
    tenantId?: number
  ): Promise<string> {
    const systemPrompt = `You are an HR expert for UAE Ministry of Education.
Generate professional job descriptions that:
- Follow UAE MOE standards
- Include TDRA compliance requirements
- Mention Arabic language requirements where appropriate
- Use professional, inclusive language

Generate a complete job description in professional format.`;

    const response = await this.chatCompletion({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Role: ${role}\nDepartment: ${department}\nRequirements: ${requirements.join(', ')}\nResponsibilities: ${responsibilities.join(', ')}\n\nGenerate a professional job description.` },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    return response.choices[0].message.content;
  }

  /**
   * Generate licensing questions
   */
  async generateLicensingQuestions(
    jobRole: string,
    licenseTier: string,
    subjectArea: string,
    difficultyLevel: string,
    questionType: string,
    count: number
  ): Promise<any[]> {
    const systemPrompt = `You are an expert exam creator for UAE Teacher Licensing.
Generate licensing exam questions that:
- Align with UAE MOE standards
- Test appropriate knowledge level
- Include distractors based on common misconceptions
- Follow UAE curriculum requirements

Return ONLY valid JSON array of ${count} questions:
[{
  "question": "string",
  "type": "${questionType}",
  "options": ["string"] (for multiple choice),
  "correctAnswer": "string or index",
  "explanation": "string",
  "difficulty": "${difficultyLevel}",
  "topic": "string",
  "competency": "string"
}]`;

    const response = await this.chatCompletion({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Generate ${count} ${questionType} questions for:\nRole: ${jobRole}\nLicense Tier: ${licenseTier}\nSubject: ${subjectArea}\nDifficulty: ${difficultyLevel}` },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.8,
      max_tokens: 4000,
    });

    try {
      const content = response.choices[0].message.content;
      const parsed = JSON.parse(content);
      return Array.isArray(parsed) ? parsed : (parsed.questions || []);
    } catch (e) {
      console.error('[Ollama] Failed to parse licensing questions:', e);
      throw new Error('Failed to generate licensing questions: Invalid JSON response');
    }
  }

  /**
   * Generate psychometric questions
   * Uses SHL/Hogan/Gallup-style assessment design with anti-faking measures
   */
  async generatePsychometricQuestions(
    testType: string,
    dimension: string,
    count: number
  ): Promise<any[]> {
    const safeCount = Math.min(count, 8);
    
    const systemPrompt = `You are a senior psychometrician with 20+ years experience at SHL, Hogan, and Gallup.
You specialize in creating assessment items that:
- Accurately measure psychological constructs
- Resist faking and social desirability bias
- Use realistic scenarios relevant to education professionals
- Include proper behavioral anchors

Return ONLY valid JSON. No markdown code blocks. No explanations.`;

    const userPrompt = `Generate ${safeCount} professional-grade psychometric questions for ${testType} assessment.

ASSESSMENT CONTEXT:
- Target Population: UAE education professionals (teachers, administrators, counselors)
- Dimension to Measure: ${dimension}
- Purpose: Authentic personality/competency assessment with anti-faking measures

CRITICAL REQUIREMENTS (SHL/Hogan Standards):

1. QUESTION TYPES TO USE (MUST vary across these types):
   - "ipsative": Forced-choice between EQUALLY DESIRABLE options (eliminates social desirability bias)
   - "situational_judgment": Realistic workplace dilemmas with multiple valid approaches
   - "behavioral_anchor": Specific observable behaviors rated on a scale
   - "scenario": Rich context-based questions requiring judgment
   - "forced_choice": Two options, both moderately desirable

2. ANTI-FAKING MEASURES (MANDATORY):
   - NO obvious "best" answer - all options should seem reasonable
   - Options must have SIMILAR social desirability levels
   - Include subtle behavioral indicators, not stated ideals
   - Use specific situations, not abstract traits
   - Avoid leading language like "always", "never", "best"

3. SCENARIO REQUIREMENTS:
   - Set in UAE school/education context
   - Include realistic constraints (time, resources, relationships)
   - Present genuine dilemmas with trade-offs
   - Focus on OBSERVABLE BEHAVIORS, not intentions

4. OPTION DESIGN:
   - Each option reveals different personality traits
   - None should be obviously "wrong" or "right"
   - Use concrete actions, not vague descriptors
   - Include traits each option measures

EXAMPLE HIGH-QUALITY QUESTION:
{
  "question": "During a staff meeting, a colleague presents an idea you believe has significant flaws. How do you respond?",
  "type": "situational_judgment",
  "dimension": "Agreeableness-Assertiveness Balance",
  "scenario": "The meeting is running long, the principal seems supportive of the idea, and your colleague is known to be sensitive to criticism.",
  "options": [
    {"id": "a", "text": "Ask clarifying questions that subtly highlight potential issues without direct criticism", "value": 4, "traits": ["Diplomacy", "Conscientiousness"]},
    {"id": "b", "text": "Request time to review the proposal and share written feedback privately after the meeting", "value": 4, "traits": ["Conscientiousness", "Introversion"]},
    {"id": "c", "text": "Acknowledge the idea's strengths, then respectfully voice your specific concerns", "value": 4, "traits": ["Assertiveness", "Openness"]},
    {"id": "d", "text": "Support the consensus in the meeting and adapt your approach if the plan moves forward", "value": 3, "traits": ["Agreeableness", "Flexibility"]}
  ]
}

Return ONLY this exact JSON structure:
{
  "questions": [
    {
      "question": "Clear, specific question text",
      "type": "ipsative|situational_judgment|behavioral_anchor|scenario|forced_choice",
      "dimension": "${dimension}",
      "scenario": "Detailed realistic scenario with context and constraints",
      "options": [
        {"id": "a", "text": "Specific behavioral response", "value": 4, "traits": ["Trait1", "Trait2"]},
        {"id": "b", "text": "Different but equally valid response", "value": 4, "traits": ["Trait3", "Trait4"]},
        {"id": "c", "text": "Another reasonable approach", "value": 3, "traits": ["Trait5"]},
        {"id": "d", "text": "Final option revealing different preferences", "value": 3, "traits": ["Trait6"]}
      ],
      "scoring": "normal",
      "weight": 1.0
    }
  ]
}

Generate exactly ${safeCount} varied, professional questions.`;

    const response = await this.chatCompletion({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 4000,
    });

    try {
      const content = response.choices[0].message.content;
      const parsed = JSON.parse(content);
      const questions = Array.isArray(parsed) ? parsed : (parsed.items || parsed.questions || []);
      
      // Normalize the response format
      return questions.map((q: any) => ({
        question: q.question || q.text || '',
        dimension: q.dimension || dimension,
        type: q.type || 'scenario',
        scenario: q.scenario,
        options: q.options || [],
        scoring: q.scoring || 'normal',
        weight: q.weight || 1.0,
        traits: q.traits,
      }));
    } catch (e) {
      console.error('[Ollama] Failed to parse psychometric questions:', e);
      throw new Error('Failed to generate psychometric questions: Invalid JSON response');
    }
  }

  /**
   * Test connection with a simple request
   */
  async testConnection(): Promise<{ success: boolean; model: string; message: string }> {
    try {
      await this.refresh();
      
      if (!this.isAvailable) {
        return {
          success: false,
          model: this.defaultModel,
          message: 'Ollama server not running. Start with: ollama serve',
        };
      }

      const result = await this.chatCompletion({
        messages: [{ role: 'user', content: 'Say "OK" if you can read this.' }],
        max_tokens: 10,
      });

      const response = result.choices[0]?.message?.content || '';
      return {
        success: response.toLowerCase().includes('ok'),
        model: result.model,
        message: response,
      };
    } catch (error) {
      return {
        success: false,
        model: this.defaultModel,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

// ============================================================================
// EXPORT SINGLETON
// ============================================================================

export const ollamaService = new OllamaService();

