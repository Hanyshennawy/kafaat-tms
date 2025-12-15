/**
 * Together.ai Integration Service
 * 
 * Handles AI features that require LLMs using Together.ai's Llama 3.2 3B Instruct Turbo.
 * This service handles 35% of requests with ~1-2s latency and free tier (5M tokens/month).
 * 
 * Features:
 * - Resume parsing
 * - Interview question generation
 * - Competency gap analysis
 * - Licensing question generation
 * - Job description generation
 */

import { invokeTogether } from '../_core/together';
import { logAIUsage } from './ai-config';
import type {
  ResumeParseResult,
  InterviewQuestion,
  SkillsGapAnalysis,
} from './ai.service';

// ============================================================================
// TOGETHER.AI SERVICE
// ============================================================================

export class TogetherAIService {
  /**
   * Parse resume from text
   */
  async parseResume(resumeText: string, tenantId?: number): Promise<ResumeParseResult> {
    const startTime = Date.now();
    
    try {
      const prompt = `Extract structured information from this resume for an education sector candidate in the UAE:

${resumeText}

Extract:
- Personal info (name, email, phone)
- Professional summary
- Work experience (title, company, duration, description, dates)
- Education (degree, institution, year, GPA)
- Skills (name, proficiency level, category)
- Certifications (name, issuer, date)
- Languages (name, proficiency)
- Total years of experience
- Suggested best-fit role
- Confidence score (0-1)

Provide structured JSON output.`;

      const response = await invokeTogether({
        messages: [
          {
            role: 'system',
            content: 'You are an expert resume parser for education sector recruitment in the UAE. Extract structured data accurately.',
          },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
        max_tokens: 2000,
        temperature: 0.2, // Low temperature for accurate extraction
        includeContext: true,
      });

      const content = response.choices[0]?.message?.content || '{}';
      const result = JSON.parse(content as string);

      await logAIUsage('resumeParsing', 'together', true, Date.now() - startTime, response.usage?.total_tokens);

      return this.normalizeResumeResult(result);
    } catch (error) {
      console.error('[Together.ai] Resume parsing failed:', error);
      await logAIUsage('resumeParsing', 'together', false, Date.now() - startTime);
      throw error;
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
    const startTime = Date.now();
    
    try {
      const prompt = `Generate ${count} ${difficulty} interview questions for a ${role} position in UAE education sector.

Required Competencies:
${requiredCompetencies.map(c => `- ${c}`).join('\n')}

For each question provide:
- question: The interview question
- category: "behavioral", "technical", "situational", or "competency"
- difficulty: "easy", "medium", or "hard"
- expectedAnswer: Key points in ideal answer
- evaluationCriteria: What to look for in responses
- followUpQuestions: 2-3 follow-up questions

Focus on UAE educational context, cultural sensitivity, and ministry standards.

Return as JSON array with ${count} questions.`;

      const response = await invokeTogether({
        messages: [
          {
            role: 'system',
            content: 'You are an expert education sector interviewer. Generate insightful, culturally appropriate questions for UAE schools.',
          },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
        max_tokens: 3000,
        temperature: 0.7, // Higher for creative question generation
        includeContext: true,
      });

      const content = response.choices[0]?.message?.content || '{}';
      const result = JSON.parse(content as string);

      await logAIUsage('interviewQuestions', 'together', true, Date.now() - startTime, response.usage?.total_tokens);

      return result.questions || result.interviewQuestions || [];
    } catch (error) {
      console.error('[Together.ai] Interview question generation failed:', error);
      await logAIUsage('interviewQuestions', 'together', false, Date.now() - startTime);
      throw error;
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
    const startTime = Date.now();
    
    try {
      const prompt = `Analyze the competency gap for transitioning to ${targetRole} in UAE education sector.

Current Skills (0-100 proficiency):
${currentSkills.map(s => `- ${s.name}: ${s.level}`).join('\n')}

Provide JSON with:
- currentSkills: List current skills with levels
- requiredSkills: Skills needed for ${targetRole} with required levels (0-100)
- gaps: Array of {skill, currentLevel, requiredLevel, gap, priority (high/medium/low), trainingOptions}
- overallReadiness: Percentage ready for role (0-100)
- estimatedTimeToClose: Time needed to close gaps (e.g., "6-12 months")
- developmentPlan: Specific steps to close gaps
- certifications: Relevant UAE/international certifications

Focus on UAE Ministry of Education competency framework.`;

      const response = await invokeTogether({
        messages: [
          {
            role: 'system',
            content: 'You are a UAE education sector competency development expert. Provide actionable skills gap analysis aligned with MOE standards.',
          },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
        max_tokens: 2500,
        temperature: 0.4, // Lower for structured analysis
        includeContext: true,
      });

      const content = response.choices[0]?.message?.content || '{}';
      const result = JSON.parse(content as string);

      await logAIUsage('competencyGapAnalysis', 'together', true, Date.now() - startTime, response.usage?.total_tokens);

      return result as SkillsGapAnalysis;
    } catch (error) {
      console.error('[Together.ai] Skills gap analysis failed:', error);
      await logAIUsage('competencyGapAnalysis', 'together', false, Date.now() - startTime);
      throw error;
    }
  }

  /**
   * Generate licensing assessment questions
   */
  async generateLicensingQuestions(
    jobRole: string,
    licenseTier: string,
    subjectArea: string,
    difficultyLevel: string,
    questionType: string,
    count: number
  ): Promise<any[]> {
    const startTime = Date.now();
    
    try {
      const prompt = `Generate ${count} high-quality ${difficultyLevel} ${questionType} questions for UAE Ministry of Education teacher licensing.

Context:
- Job Role: ${jobRole}
- License Tier: ${licenseTier}
- Subject Area: ${subjectArea}
- Question Type: ${questionType}

Requirements:
- Assess competencies specific to ${jobRole} in UAE educational context
- Include realistic teaching scenarios for ${subjectArea}
- Difficulty: ${difficultyLevel}
- Each question: 4 options for multiple choice
- Include detailed explanation for correct answer
- Tag with relevant competency areas

Competency Focus Areas for ${jobRole}:
1. Pedagogical Knowledge
2. Subject Matter Expertise
3. Assessment and Evaluation
4. Classroom Management
5. Student Engagement
6. Differentiated Instruction
7. Technology Integration
8. Professional Ethics & UAE Standards

Return JSON array with ${count} questions, each containing:
- questionText: The question
- questionContext: Scenario/context (optional)
- options: Array of 4 answer choices
- correctAnswer: Index of correct answer (0-3)
- explanation: Why the answer is correct
- points: Point value (1-5)
- tags: Relevant competency tags`;

      const response = await invokeTogether({
        messages: [
          {
            role: 'system',
            content: 'You are an expert UAE Ministry of Education assessment designer. Create pedagogically sound, culturally appropriate licensing questions.',
          },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
        max_tokens: 4000,
        temperature: 0.5, // Balanced for assessment questions
        includeContext: true,
      });

      const content = response.choices[0]?.message?.content || '{}';
      const result = JSON.parse(content as string);

      await logAIUsage('licensingQuestions', 'together', true, Date.now() - startTime, response.usage?.total_tokens);

      return result.questions || [];
    } catch (error) {
      console.error('[Together.ai] Licensing question generation failed:', error);
      await logAIUsage('licensingQuestions', 'together', false, Date.now() - startTime);
      throw error;
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
    const startTime = Date.now();
    
    try {
      const prompt = `Create a professional, compelling job description for UAE education sector:

Role: ${role}
Department: ${department}

Key Requirements:
${requirements.map(r => `- ${r}`).join('\n')}

Key Responsibilities:
${responsibilities.map(r => `- ${r}`).join('\n')}

Generate a complete job description including:
1. Position Overview
2. Key Responsibilities (detailed)
3. Required Qualifications
4. Preferred Qualifications
5. Skills and Competencies
6. Working Conditions
7. Benefits (standard UAE education sector)
8. Application Instructions

Make it:
- Inclusive and culturally sensitive
- Aligned with UAE MOE standards
- Attractive to top talent
- Clear about expectations
- Professional and engaging`;

      const response = await invokeTogether({
        messages: [
          {
            role: 'system',
            content: 'You are an expert HR professional for UAE education sector. Write compelling, inclusive job descriptions that attract qualified candidates.',
          },
          { role: 'user', content: prompt },
        ],
        max_tokens: 2000,
        temperature: 0.8, // Higher for creative writing
        includeContext: true,
      });

      const content = response.choices[0]?.message?.content || '';

      await logAIUsage('jobDescriptionGeneration', 'together', true, Date.now() - startTime, response.usage?.total_tokens);

      return typeof content === 'string' ? content : JSON.stringify(content);
    } catch (error) {
      console.error('[Together.ai] Job description generation failed:', error);
      await logAIUsage('jobDescriptionGeneration', 'together', false, Date.now() - startTime);
      throw error;
    }
  }

  /**
   * Generate psychometric assessment questions
   * Uses validated psychological assessment design principles
   */
  async generatePsychometricQuestions(
    testType: string,
    dimension: string,
    count: number,
    tenantId?: number
  ): Promise<any[]> {
    const startTime = Date.now();
    
    try {
      const prompt = `Generate ${count} scientifically valid psychometric assessment items.

Test Type: ${testType}
Dimension to Measure: ${dimension}

IMPORTANT PSYCHOMETRIC DESIGN PRINCIPLES:
1. Use clear, unambiguous language appropriate for UAE professionals
2. Avoid double-barreled questions (asking two things at once)
3. Include a mix of positively and negatively worded items
4. Avoid extreme language (always, never, completely)
5. Questions should have cultural sensitivity for UAE context
6. Balance social desirability bias with reverse-scored items

TEST TYPE SPECIFIC GUIDELINES:
${testType === 'big5' ? `
- Measure Big Five personality traits: Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism
- Use behavioral statements rather than self-labels
- Example: "I enjoy meeting new people" (Extraversion) not "I am extroverted"
` : testType === 'leadership' ? `
- Measure leadership competencies: Vision, Decision-making, Team building, Communication, Emotional intelligence
- Use situational and behavioral statements
- Focus on UAE educational leadership context
` : testType === 'cognitive' ? `
- Assess cognitive abilities: Analytical thinking, Problem-solving, Pattern recognition, Memory, Adaptability
- Use scenario-based questions
- Appropriate for education sector professionals
` : testType === 'emotional_intelligence' ? `
- Measure EQ dimensions: Self-awareness, Self-regulation, Motivation, Empathy, Social skills
- Use workplace scenarios relevant to schools
- Focus on teacher-student and colleague interactions
` : `
- Measure relevant professional competencies
- Use behavioral indicators
- Align with UAE MOE standards
`}

For each question, provide JSON with:
- question: The assessment item text
- dimension: "${dimension}" or relevant sub-dimension
- type: "likert" (5-point scale), "forced-choice" (A/B choice), or "situational" (scenario-based)
- options: Array of response options or scale labels
- scoring: "normal" (higher = more of trait) or "reverse" (lower = more of trait)
- weight: Importance weight (0.5 to 1.5, default 1.0)
- rationale: Brief explanation of what this item measures

Return as JSON object with "questions" array containing exactly ${count} items.`;

      const response = await invokeTogether({
        messages: [
          {
            role: 'system',
            content: `You are an expert psychometrician with deep knowledge of psychological assessment design. 
You specialize in creating valid, reliable assessment instruments for organizational psychology in the UAE education sector.
Your items should follow APA guidelines for psychological testing and be culturally appropriate for the UAE context.
Always respond with properly structured JSON.`,
          },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
        max_tokens: 4000,
        temperature: 0.5, // Balanced for assessment items
        includeContext: true,
      });

      const content = response.choices[0]?.message?.content || '{}';
      const result = JSON.parse(content as string);

      await logAIUsage('psychometricQuestions', 'together', true, Date.now() - startTime, response.usage?.total_tokens);

      // Normalize the response
      const questions = result.questions || result.items || [];
      return questions.map((q: any, idx: number) => ({
        question: q.question || q.text || q.item || '',
        dimension: q.dimension || dimension,
        type: q.type || 'likert',
        options: q.options || ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
        scoring: q.scoring || (idx % 3 === 2 ? 'reverse' : 'normal'),
        weight: q.weight || 1.0,
        rationale: q.rationale || '',
      }));
    } catch (error) {
      console.error('[Together.ai] Psychometric question generation failed:', error);
      await logAIUsage('psychometricQuestions', 'together', false, Date.now() - startTime);
      throw error;
    }
  }

  /**
   * Generate competency assessment questions
   * Uses UAE MOE competency framework for educator evaluation
   */
  async generateCompetencyQuestions(
    competencyArea: string,
    level: string,
    jobRole: string = "Educator",
    count: number = 10
  ): Promise<any[]> {
    const startTime = Date.now();
    
    try {
      const prompt = `Generate ${count} competency assessment questions for ${jobRole} at ${level} level.

COMPETENCY AREA: ${competencyArea}

UAE MOE COMPETENCY FRAMEWORK:
Use these domains for context:
1. Professional Knowledge - Subject expertise, curriculum understanding
2. Professional Practice - Teaching strategies, assessment, learning environment
3. Professional Engagement - Relationships, ethics, continuous development

QUESTION REQUIREMENTS:
- Assess practical demonstration of ${competencyArea} competencies
- Include realistic classroom/school scenarios
- Progressive complexity for ${level} level
- Aligned with UAE education context
- Measurable behavioral indicators

For each question provide:
- question: Scenario-based assessment question
- competencyArea: "${competencyArea}"
- level: "${level}"
- behavioralIndicator: What behavior demonstrates competence
- scoringCriteria: How to evaluate the response (1-5 scale descriptors)
- options: Array of 4 response options (for multiple choice)
- correctAnswer: Index of best response (0-3)
- explanation: Why the correct answer demonstrates competence
- developmentHint: Guidance for improvement

Return as JSON object with "questions" array containing exactly ${count} questions.`;

      const response = await invokeTogether({
        messages: [
          {
            role: 'system',
            content: `You are an expert educator competency assessor for UAE Ministry of Education.
Create authentic, fair, and developmentally appropriate competency assessments.
Focus on observable behaviors and practical application in UAE school settings.
Always respond with properly structured JSON.`,
          },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
        max_tokens: 4000,
        temperature: 0.5,
        includeContext: true,
      });

      const content = response.choices[0]?.message?.content || '{}';
      const result = JSON.parse(content as string);

      await logAIUsage('competencyQuestions', 'together', true, Date.now() - startTime, response.usage?.total_tokens);

      // Normalize the response
      const questions = result.questions || result.items || [];
      return questions.map((q: any, idx: number) => ({
        question: q.question || q.text || '',
        competencyArea: q.competencyArea || competencyArea,
        level: q.level || level,
        behavioralIndicator: q.behavioralIndicator || '',
        scoringCriteria: q.scoringCriteria || '',
        options: q.options || [],
        correctAnswer: q.correctAnswer ?? 0,
        explanation: q.explanation || '',
        developmentHint: q.developmentHint || '',
        aiGenerated: true,
      }));
    } catch (error) {
      console.error('[Together.ai] Competency question generation failed:', error);
      await logAIUsage('competencyQuestions', 'together', false, Date.now() - startTime);
      throw error;
    }
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private normalizeResumeResult(raw: any): ResumeParseResult {
    // Ensure all required fields exist with defaults
    return {
      name: raw.name || raw.personalInfo?.name || 'Unknown',
      email: raw.email || raw.personalInfo?.email || raw.contact?.email || '',
      phone: raw.phone || raw.personalInfo?.phone || raw.contact?.phone || '',
      summary: raw.summary || raw.professionalSummary || '',
      experience: Array.isArray(raw.experience) ? raw.experience.map((exp: any) => ({
        title: exp.title || exp.position || '',
        company: exp.company || exp.organization || '',
        duration: exp.duration || '',
        description: exp.description || exp.responsibilities || '',
        startDate: exp.startDate || exp.start || '',
        endDate: exp.endDate || exp.end || 'present',
      })) : [],
      education: Array.isArray(raw.education) ? raw.education.map((edu: any) => ({
        degree: edu.degree || edu.qualification || '',
        institution: edu.institution || edu.school || edu.university || '',
        year: edu.year || edu.graduationYear || '',
        gpa: edu.gpa || '',
      })) : [],
      skills: Array.isArray(raw.skills) ? raw.skills.map((skill: any) => {
        if (typeof skill === 'string') {
          return { name: skill, level: 'intermediate' as const, category: 'General' };
        }
        return {
          name: skill.name || skill.skill || '',
          level: (skill.level || skill.proficiency || 'intermediate') as any,
          category: skill.category || 'General',
        };
      }) : [],
      certifications: Array.isArray(raw.certifications) ? raw.certifications.map((cert: any) => ({
        name: cert.name || cert.certification || '',
        issuer: cert.issuer || cert.organization || '',
        date: cert.date || cert.year || '',
        expiryDate: cert.expiryDate || cert.expiry || '',
      })) : [],
      languages: Array.isArray(raw.languages) ? raw.languages.map((lang: any) => {
        if (typeof lang === 'string') {
          return { name: lang, proficiency: 'Intermediate' };
        }
        return {
          name: lang.name || lang.language || '',
          proficiency: lang.proficiency || lang.level || 'Intermediate',
        };
      }) : [],
      totalYearsExperience: raw.totalYearsExperience || raw.yearsOfExperience || 0,
      suggestedRole: raw.suggestedRole || raw.recommendedRole || '',
      confidence: raw.confidence || 0.7,
    };
  }
}

// ============================================================================
// EXPORT SINGLETON
// ============================================================================

export const togetherAIService = new TogetherAIService();
