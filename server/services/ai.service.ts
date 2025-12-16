/**
 * AI Enhancement Service (Together.ai / OpenAI Provider)
 * 
 * This service provides AI-powered features using Together.ai as PRIMARY provider.
 * OpenAI is used as fallback for critical quality requirements.
 * 
 * Provider Priority:
 * 1. Together.ai (FREE tier - 5M tokens/month) - PRIMARY
 * 2. OpenAI (paid) - fallback for critical tasks
 * 
 * IMPORTANT: This service now routes through Together.ai first!
 * Mock data is ONLY used if ALL providers fail.
 * 
 * See ai-router.service.ts for automatic provider selection.
 */

import OpenAI from "openai";
import { auditService } from "./audit.service";
import { invokeTogether, togetherClient } from "../_core/together";

// ============================================================================
// CONFIGURATION
// ============================================================================

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const TOGETHER_API_KEY = process.env.TOGETHER_API_KEY;

const openai = OPENAI_API_KEY
  ? new OpenAI({ apiKey: OPENAI_API_KEY })
  : null;

// Check if Together.ai is available (PREFERRED)
const isTogetherAvailable = () => !!TOGETHER_API_KEY && togetherClient.isServiceAvailable();

// ============================================================================
// TYPES
// ============================================================================

export interface ResumeParseResult {
  name: string;
  email: string;
  phone: string;
  summary: string;
  experience: {
    title: string;
    company: string;
    duration: string;
    description: string;
    startDate?: string;
    endDate?: string;
  }[];
  education: {
    degree: string;
    institution: string;
    year: string;
    gpa?: string;
  }[];
  skills: {
    name: string;
    level: "beginner" | "intermediate" | "advanced" | "expert";
    category: string;
  }[];
  certifications: {
    name: string;
    issuer: string;
    date?: string;
    expiryDate?: string;
  }[];
  languages: {
    name: string;
    proficiency: string;
  }[];
  totalYearsExperience: number;
  suggestedRole: string;
  confidence: number;
}

export interface CareerRecommendation {
  role: string;
  matchScore: number;
  reasoning: string;
  skillsRequired: string[];
  skillsGap: string[];
  developmentPath: string[];
  timelineMonths: number;
  trainingRecommendations: string[];
}

export interface SentimentAnalysis {
  overallSentiment: "positive" | "neutral" | "negative";
  score: number; // -1 to 1
  emotions: {
    joy: number;
    trust: number;
    fear: number;
    surprise: number;
    sadness: number;
    disgust: number;
    anger: number;
    anticipation: number;
  };
  themes: string[];
  concerns: string[];
  suggestions: string[];
}

export interface PerformancePrediction {
  predictedRating: number;
  confidence: number;
  factors: {
    factor: string;
    impact: "positive" | "negative" | "neutral";
    weight: number;
  }[];
  riskLevel: "low" | "medium" | "high";
  recommendations: string[];
}

export interface SkillsGapAnalysis {
  currentSkills: { name: string; level: number }[];
  requiredSkills: { name: string; level: number }[];
  gaps: {
    skill: string;
    currentLevel: number;
    requiredLevel: number;
    gap: number;
    priority: "high" | "medium" | "low";
    trainingOptions: string[];
  }[];
  overallReadiness: number;
  estimatedTimeToClose: string;
}

export interface InterviewQuestion {
  question: string;
  category: "behavioral" | "technical" | "situational" | "competency";
  difficulty: "easy" | "medium" | "hard";
  expectedAnswer: string;
  evaluationCriteria: string[];
  followUpQuestions: string[];
}

// ============================================================================
// AI SERVICE
// ============================================================================

class AIService {
  private isConfigured: boolean;
  private useTogetherAI: boolean;

  constructor() {
    this.useTogetherAI = isTogetherAvailable();
    this.isConfigured = !!openai || this.useTogetherAI;
    
    if (this.useTogetherAI) {
      console.log("[AI] Together.ai configured as PRIMARY provider (FREE tier)");
    }
    if (openai) {
      console.log("[AI] OpenAI configured as FALLBACK provider");
    }
    if (!this.isConfigured) {
      console.warn("[AI] No AI provider configured. Set TOGETHER_API_KEY (recommended) or OPENAI_API_KEY for AI features.");
    }
  }

  /**
   * Parse a resume and extract structured data
   * Uses Together.ai first, then OpenAI fallback
   */
  async parseResume(
    resumeText: string,
    tenantId?: number
  ): Promise<ResumeParseResult> {
    // Try Together.ai first (FREE)
    if (this.useTogetherAI) {
      try {
        const result = await this.parseResumeWithTogether(resumeText, tenantId);
        return result;
      } catch (error) {
        console.warn("[AI] Together.ai resume parsing failed, trying OpenAI fallback:", error);
      }
    }
    
    // Try OpenAI fallback
    if (openai) {
      try {
        return await this.parseResumeWithOpenAI(resumeText, tenantId);
      } catch (error) {
        console.error("[AI] OpenAI resume parsing also failed:", error);
      }
    }
    
    // Only return mock if ALL providers fail
    console.error("[AI] All providers failed for resume parsing - returning mock data");
    return this.getMockResumeResult();
  }

  /**
   * Parse resume using Together.ai
   */
  private async parseResumeWithTogether(resumeText: string, tenantId?: number): Promise<ResumeParseResult> {
    const prompt = `Analyze the following resume and extract structured information. Return a JSON object with:
- name: Full name
- email: Email address
- phone: Phone number
- summary: Professional summary (2-3 sentences)
- experience: Array of {title, company, duration, description, startDate, endDate}
- education: Array of {degree, institution, year, gpa}
- skills: Array of {name, level (beginner/intermediate/advanced/expert), category}
- certifications: Array of {name, issuer, date, expiryDate}
- languages: Array of {name, proficiency}
- totalYearsExperience: Number
- suggestedRole: Best fitting role for this candidate
- confidence: Confidence score 0-1

Resume text:
${resumeText}`;

    const response = await invokeTogether({
      messages: [
        {
          role: "system",
          content: "You are an expert HR professional and resume analyst. Extract structured data from resumes accurately. Always return valid JSON.",
        },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error("No response from Together.ai");
    
    const result = JSON.parse(typeof content === 'string' ? content : JSON.stringify(content));

    await auditService.success("ai.analysis", {
      tenantId,
      entityType: "resume",
      details: { action: "parse", provider: "together", confidence: result.confidence },
    });

    return result as ResumeParseResult;
  }

  /**
   * Parse resume using OpenAI (fallback)
   */
  private async parseResumeWithOpenAI(resumeText: string, tenantId?: number): Promise<ResumeParseResult> {
    if (!openai) throw new Error("OpenAI not configured");
    
    const prompt = `Analyze the following resume and extract structured information. Return a JSON object with:
- name: Full name
- email: Email address
- phone: Phone number
- summary: Professional summary (2-3 sentences)
- experience: Array of {title, company, duration, description, startDate, endDate}
- education: Array of {degree, institution, year, gpa}
- skills: Array of {name, level (beginner/intermediate/advanced/expert), category}
- certifications: Array of {name, issuer, date, expiryDate}
- languages: Array of {name, proficiency}
- totalYearsExperience: Number
- suggestedRole: Best fitting role for this candidate
- confidence: Confidence score 0-1

Resume text:
${resumeText}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert HR professional and resume analyst. Extract structured data from resumes accurately. Always return valid JSON.",
        },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");

    await auditService.success("ai.analysis", {
      tenantId,
      entityType: "resume",
      details: { action: "parse", provider: "openai", confidence: result.confidence },
    });

    return result as ResumeParseResult;
  }

  /**
   * Get career recommendations based on employee profile
   * Uses Together.ai first, then OpenAI fallback
   */
  async getCareerRecommendations(
    employeeProfile: {
      currentRole: string;
      skills: string[];
      experience: number;
      interests: string[];
      performanceRating: number;
    },
    availableRoles: string[],
    tenantId?: number
  ): Promise<CareerRecommendation[]> {
    const prompt = `Analyze this employee profile and recommend career progression paths:

Employee Profile:
- Current Role: ${employeeProfile.currentRole}
- Skills: ${employeeProfile.skills.join(", ")}
- Years Experience: ${employeeProfile.experience}
- Interests: ${employeeProfile.interests.join(", ")}
- Performance Rating: ${employeeProfile.performanceRating}/5

Available Roles in Organization:
${availableRoles.join("\n")}

Provide 3 career recommendations as JSON array with:
- role: Recommended role
- matchScore: Match percentage 0-100
- reasoning: Why this role is suitable
- skillsRequired: Skills needed for this role
- skillsGap: Skills the employee needs to develop
- developmentPath: Steps to reach this role
- timelineMonths: Estimated months to be ready
- trainingRecommendations: Specific training programs`;

    // Try Together.ai first (FREE)
    if (this.useTogetherAI) {
      try {
        const response = await invokeTogether({
          messages: [
            {
              role: "system",
              content: "You are an expert career counselor specializing in education sector careers. Provide actionable career recommendations.",
            },
            { role: "user", content: prompt },
          ],
          response_format: { type: "json_object" },
          temperature: 0.3,
        });

        const content = response.choices[0]?.message?.content;
        if (!content) throw new Error("No response from Together.ai");
        
        const result = JSON.parse(typeof content === 'string' ? content : JSON.stringify(content));

        await auditService.success("ai.analysis", {
          tenantId,
          entityType: "career",
          details: { action: "recommendations", provider: "together", currentRole: employeeProfile.currentRole },
        });

        return result.recommendations || result || [];
      } catch (error) {
        console.warn("[AI] Together.ai career recommendations failed, trying OpenAI fallback:", error);
      }
    }

    // Try OpenAI fallback
    if (openai) {
      try {
        const response = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: "You are an expert career counselor specializing in education sector careers. Provide actionable career recommendations.",
            },
            { role: "user", content: prompt },
          ],
          response_format: { type: "json_object" },
          temperature: 0.3,
        });

        const result = JSON.parse(response.choices[0].message.content || "{}");

        await auditService.success("ai.analysis", {
          tenantId,
          entityType: "career",
          details: { action: "recommendations", provider: "openai", currentRole: employeeProfile.currentRole },
        });

        return result.recommendations || [];
      } catch (error) {
        console.error("[AI] OpenAI career recommendations also failed:", error);
      }
    }

    // Only return mock if ALL providers fail
    console.error("[AI] All providers failed for career recommendations - returning mock data");
    return this.getMockCareerRecommendations();
  }

  /**
   * Analyze sentiment in survey responses
   * Uses Together.ai first, then OpenAI fallback
   */
  async analyzeSentiment(
    responses: string[],
    context: string = "Employee engagement survey",
    tenantId?: number
  ): Promise<SentimentAnalysis> {
    const prompt = `Analyze the sentiment in these ${context} responses:

${responses.map((r, i) => `${i + 1}. "${r}"`).join("\n")}

Return JSON with:
- overallSentiment: "positive", "neutral", or "negative"
- score: Number from -1 (very negative) to 1 (very positive)
- emotions: Object with joy, trust, fear, surprise, sadness, disgust, anger, anticipation (each 0-1)
- themes: Array of main themes identified
- concerns: Array of concerns raised
- suggestions: Array of actionable suggestions based on feedback`;

    // Try Together.ai first (FREE)
    if (this.useTogetherAI) {
      try {
        const response = await invokeTogether({
          messages: [
            {
              role: "system",
              content: "You are an expert in organizational psychology and sentiment analysis. Analyze employee feedback constructively.",
            },
            { role: "user", content: prompt },
          ],
          response_format: { type: "json_object" },
          temperature: 0.2,
        });

        const content = response.choices[0]?.message?.content;
        if (!content) throw new Error("No response from Together.ai");
        
        const result = JSON.parse(typeof content === 'string' ? content : JSON.stringify(content));

        await auditService.success("ai.analysis", {
          tenantId,
          entityType: "survey",
          details: { action: "sentiment", provider: "together", responseCount: responses.length, sentiment: result.overallSentiment },
        });

        return result as SentimentAnalysis;
      } catch (error) {
        console.warn("[AI] Together.ai sentiment analysis failed, trying OpenAI fallback:", error);
      }
    }

    // Try OpenAI fallback
    if (openai) {
      try {
        const response = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: "You are an expert in organizational psychology and sentiment analysis. Analyze employee feedback constructively.",
            },
            { role: "user", content: prompt },
          ],
          response_format: { type: "json_object" },
          temperature: 0.2,
        });

        const result = JSON.parse(response.choices[0].message.content || "{}");

        await auditService.success("ai.analysis", {
          tenantId,
          entityType: "survey",
          details: { action: "sentiment", provider: "openai", responseCount: responses.length, sentiment: result.overallSentiment },
        });

        return result as SentimentAnalysis;
      } catch (error) {
        console.error("[AI] OpenAI sentiment analysis also failed:", error);
      }
    }

    // Only return mock if ALL providers fail
    console.error("[AI] All providers failed for sentiment analysis - returning mock data");
    return this.getMockSentimentAnalysis();
  }

  /**
   * Predict performance based on historical data
   * Uses Together.ai first, then OpenAI fallback
   */
  async predictPerformance(
    employeeData: {
      historicalRatings: number[];
      attendanceRate: number;
      trainingCompleted: number;
      projectsCompleted: number;
      peersAverageRating: number;
      tenure: number;
    },
    tenantId?: number
  ): Promise<PerformancePrediction> {
    const prompt = `Predict next performance rating based on this employee data:

- Historical Ratings: ${employeeData.historicalRatings.join(", ")}
- Attendance Rate: ${employeeData.attendanceRate}%
- Training Courses Completed: ${employeeData.trainingCompleted}
- Projects Completed: ${employeeData.projectsCompleted}
- Peer Average Rating: ${employeeData.peersAverageRating}/5
- Tenure (years): ${employeeData.tenure}

Return JSON with:
- predictedRating: Expected rating 1-5
- confidence: Confidence level 0-1
- factors: Array of {factor, impact (positive/negative/neutral), weight}
- riskLevel: "low", "medium", or "high"
- recommendations: Array of actions to improve performance`;

    // Try Together.ai first (FREE)
    if (this.useTogetherAI) {
      try {
        const response = await invokeTogether({
          messages: [
            {
              role: "system",
              content: "You are an HR analytics expert specializing in performance prediction. Provide data-driven insights.",
            },
            { role: "user", content: prompt },
          ],
          response_format: { type: "json_object" },
          temperature: 0.2,
        });

        const content = response.choices[0]?.message?.content;
        if (!content) throw new Error("No response from Together.ai");
        
        const result = JSON.parse(typeof content === 'string' ? content : JSON.stringify(content));

        await auditService.success("ai.analysis", {
          tenantId,
          entityType: "performance",
          details: { action: "prediction", provider: "together", predictedRating: result.predictedRating },
        });

        return result as PerformancePrediction;
      } catch (error) {
        console.warn("[AI] Together.ai performance prediction failed, trying OpenAI fallback:", error);
      }
    }

    // Try OpenAI fallback
    if (openai) {
      try {
        const response = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: "You are an HR analytics expert specializing in performance prediction. Provide data-driven insights.",
            },
            { role: "user", content: prompt },
          ],
          response_format: { type: "json_object" },
          temperature: 0.2,
        });

        const result = JSON.parse(response.choices[0].message.content || "{}");

        await auditService.success("ai.analysis", {
          tenantId,
          entityType: "performance",
          details: { action: "prediction", provider: "openai", predictedRating: result.predictedRating },
        });

        return result as PerformancePrediction;
      } catch (error) {
        console.error("[AI] OpenAI performance prediction also failed:", error);
      }
    }

    // Only return mock if ALL providers fail
    console.error("[AI] All providers failed for performance prediction - returning mock data");
    return this.getMockPerformancePrediction();
  }

  /**
   * Analyze skills gap for a role transition
   * Uses Together.ai first, then OpenAI fallback
   */
  async analyzeSkillsGap(
    currentSkills: { name: string; level: number }[],
    targetRole: string,
    tenantId?: number
  ): Promise<SkillsGapAnalysis> {
    const prompt = `Analyze the skills gap for transitioning to ${targetRole}:

Current Skills (0-100 proficiency):
${currentSkills.map((s) => `- ${s.name}: ${s.level}`).join("\n")}

For the target role "${targetRole}", provide JSON with:
- currentSkills: The employee's current skills
- requiredSkills: Skills needed for ${targetRole} with required levels
- gaps: Array of {skill, currentLevel, requiredLevel, gap, priority (high/medium/low), trainingOptions}
- overallReadiness: Percentage ready for the role 0-100
- estimatedTimeToClose: Time needed to close gaps`;

    // Try Together.ai first (FREE)
    if (this.useTogetherAI) {
      try {
        const response = await invokeTogether({
          messages: [
            {
              role: "system",
              content: "You are an expert in competency frameworks and skills development. Provide actionable skills gap analysis.",
            },
            { role: "user", content: prompt },
          ],
          response_format: { type: "json_object" },
          temperature: 0.2,
        });

        const content = response.choices[0]?.message?.content;
        if (!content) throw new Error("No response from Together.ai");
        
        const result = JSON.parse(typeof content === 'string' ? content : JSON.stringify(content));

        await auditService.success("ai.analysis", {
          tenantId,
          entityType: "skills",
          details: { action: "gap_analysis", provider: "together", targetRole, readiness: result.overallReadiness },
        });

        return result as SkillsGapAnalysis;
      } catch (error) {
        console.warn("[AI] Together.ai skills gap analysis failed, trying OpenAI fallback:", error);
      }
    }

    // Try OpenAI fallback
    if (openai) {
      try {
        const response = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: "You are an expert in competency frameworks and skills development. Provide actionable skills gap analysis.",
            },
            { role: "user", content: prompt },
          ],
          response_format: { type: "json_object" },
          temperature: 0.2,
        });

        const result = JSON.parse(response.choices[0].message.content || "{}");

        await auditService.success("ai.analysis", {
          tenantId,
          entityType: "skills",
          details: { action: "gap_analysis", provider: "openai", targetRole, readiness: result.overallReadiness },
        });

        return result as SkillsGapAnalysis;
      } catch (error) {
        console.error("[AI] OpenAI skills gap analysis also failed:", error);
      }
    }

    // Only return mock if ALL providers fail
    console.error("[AI] All providers failed for skills gap analysis - returning mock data");
    return this.getMockSkillsGapAnalysis();
  }

  /**
   * Generate interview questions for a role
   * Uses Together.ai first, then OpenAI fallback
   */
  async generateInterviewQuestions(
    role: string,
    requiredCompetencies: string[],
    difficulty: "easy" | "medium" | "hard" = "medium",
    count: number = 10,
    tenantId?: number
  ): Promise<InterviewQuestion[]> {
    const prompt = `Generate ${count} interview questions for ${role} position.

Required Competencies:
${requiredCompetencies.map((c) => `- ${c}`).join("\n")}

Difficulty: ${difficulty}

Return JSON with "questions" array containing:
- question: The interview question
- category: "behavioral", "technical", "situational", or "competency"
- difficulty: "easy", "medium", or "hard"
- expectedAnswer: Key points in ideal answer
- evaluationCriteria: What to look for in responses
- followUpQuestions: 2-3 follow-up questions`;

    // Try Together.ai first (FREE)
    if (this.useTogetherAI) {
      try {
        const response = await invokeTogether({
          messages: [
            {
              role: "system",
              content: "You are an expert interviewer for education sector roles. Generate insightful interview questions.",
            },
            { role: "user", content: prompt },
          ],
          response_format: { type: "json_object" },
          temperature: 0.4,
        });

        const content = response.choices[0]?.message?.content;
        if (!content) throw new Error("No response from Together.ai");
        
        const result = JSON.parse(typeof content === 'string' ? content : JSON.stringify(content));

        await auditService.success("ai.analysis", {
          tenantId,
          entityType: "interview",
          details: { action: "generate_questions", provider: "together", role, count: result.questions?.length || 0 },
        });

        return result.questions || [];
      } catch (error) {
        console.warn("[AI] Together.ai interview question generation failed, trying OpenAI fallback:", error);
      }
    }

    // Try OpenAI fallback
    if (openai) {
      try {
        const response = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: "You are an expert interviewer for education sector roles. Generate insightful interview questions.",
            },
            { role: "user", content: prompt },
          ],
          response_format: { type: "json_object" },
          temperature: 0.4,
        });

        const result = JSON.parse(response.choices[0].message.content || "{}");

        await auditService.success("ai.analysis", {
          tenantId,
          entityType: "interview",
          details: { action: "generate_questions", provider: "openai", role, count: result.questions?.length || 0 },
        });

        return result.questions || [];
      } catch (error) {
        console.error("[AI] OpenAI interview question generation also failed:", error);
      }
    }

    // Only return mock if ALL providers fail
    console.error("[AI] All providers failed for interview question generation - returning mock data");
    return this.getMockInterviewQuestions();
  }

  /**
   * Generate job description from requirements
   * Uses Together.ai first, then OpenAI fallback
   */
  async generateJobDescription(
    role: string,
    department: string,
    requirements: string[],
    responsibilities: string[],
    tenantId?: number
  ): Promise<string> {
    const prompt = `Generate a professional job description for:

Role: ${role}
Department: ${department}

Key Requirements:
${requirements.map((r) => `- ${r}`).join("\n")}

Key Responsibilities:
${responsibilities.map((r) => `- ${r}`).join("\n")}

Create a compelling, inclusive job description suitable for UAE education sector.`;

    // Try Together.ai first (FREE)
    if (this.useTogetherAI) {
      try {
        const response = await invokeTogether({
          messages: [
            {
              role: "system",
              content: "You are an expert HR professional specializing in education sector recruitment in the UAE.",
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.5,
        });

        const content = response.choices[0]?.message?.content;
        if (!content) throw new Error("No response from Together.ai");

        await auditService.success("ai.analysis", {
          tenantId,
          entityType: "job",
          details: { action: "generate_description", provider: "together", role },
        });

        return typeof content === 'string' ? content : JSON.stringify(content);
      } catch (error) {
        console.warn("[AI] Together.ai job description generation failed, trying OpenAI fallback:", error);
      }
    }

    // Try OpenAI fallback
    if (openai) {
      try {
        const response = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: "You are an expert HR professional specializing in education sector recruitment in the UAE.",
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.5,
        });

        await auditService.success("ai.analysis", {
          tenantId,
          entityType: "job",
          details: { action: "generate_description", provider: "openai", role },
        });

        return response.choices[0].message.content || "";
      } catch (error) {
        console.error("[AI] OpenAI job description generation also failed:", error);
      }
    }

    // Only return mock if ALL providers fail
    console.error("[AI] All providers failed for job description generation - returning mock data");
    return this.getMockJobDescription(role, department);
  }

  // ============================================================================
  // MOCK DATA (Fallbacks when OpenAI is not configured)
  // ============================================================================

  private getMockResumeResult(): ResumeParseResult {
    return {
      name: "Ahmed Al-Rashid",
      email: "ahmed.rashid@example.com",
      phone: "+971 50 123 4567",
      summary: "Experienced educator with 8 years in curriculum development and classroom instruction. Passionate about innovative teaching methodologies.",
      experience: [
        {
          title: "Senior Teacher",
          company: "Al Nahda School",
          duration: "4 years",
          description: "Led mathematics department, developed curriculum standards",
          startDate: "2020-01",
          endDate: "present",
        },
        {
          title: "Mathematics Teacher",
          company: "Emirates Academy",
          duration: "4 years",
          description: "Taught grades 9-12 mathematics",
          startDate: "2016-08",
          endDate: "2019-12",
        },
      ],
      education: [
        {
          degree: "Master of Education",
          institution: "UAE University",
          year: "2016",
          gpa: "3.8",
        },
      ],
      skills: [
        { name: "Curriculum Development", level: "expert", category: "Teaching" },
        { name: "Classroom Management", level: "advanced", category: "Teaching" },
        { name: "Educational Technology", level: "advanced", category: "Technology" },
      ],
      certifications: [
        { name: "UAE Teaching License", issuer: "Ministry of Education", date: "2020" },
      ],
      languages: [
        { name: "Arabic", proficiency: "Native" },
        { name: "English", proficiency: "Fluent" },
      ],
      totalYearsExperience: 8,
      suggestedRole: "Head of Department",
      confidence: 0.85,
    };
  }

  private getMockCareerRecommendations(): CareerRecommendation[] {
    return [
      {
        role: "Head of Department",
        matchScore: 87,
        reasoning: "Strong experience in curriculum development and team leadership",
        skillsRequired: ["Leadership", "Curriculum Design", "Team Management", "Strategic Planning"],
        skillsGap: ["Budget Management", "Policy Development"],
        developmentPath: ["Complete leadership training", "Shadow current HoD", "Lead pilot project"],
        timelineMonths: 12,
        trainingRecommendations: ["Educational Leadership Certificate", "Financial Management for Educators"],
      },
      {
        role: "Curriculum Coordinator",
        matchScore: 92,
        reasoning: "Excellent match with current curriculum development experience",
        skillsRequired: ["Curriculum Design", "Standards Alignment", "Teacher Training"],
        skillsGap: ["Cross-departmental Coordination"],
        developmentPath: ["Complete curriculum certification", "Lead curriculum review committee"],
        timelineMonths: 6,
        trainingRecommendations: ["Advanced Curriculum Design Workshop"],
      },
    ];
  }

  private getMockSentimentAnalysis(): SentimentAnalysis {
    return {
      overallSentiment: "positive",
      score: 0.65,
      emotions: {
        joy: 0.7,
        trust: 0.8,
        fear: 0.1,
        surprise: 0.3,
        sadness: 0.1,
        disgust: 0.05,
        anger: 0.05,
        anticipation: 0.6,
      },
      themes: ["Work-life balance", "Professional development", "Team collaboration"],
      concerns: ["Workload during exam periods", "Need for more training resources"],
      suggestions: [
        "Implement flexible scheduling during peak periods",
        "Increase professional development budget",
        "Create peer mentoring program",
      ],
    };
  }

  private getMockPerformancePrediction(): PerformancePrediction {
    return {
      predictedRating: 4.2,
      confidence: 0.82,
      factors: [
        { factor: "Consistent improvement trend", impact: "positive", weight: 0.3 },
        { factor: "High training completion", impact: "positive", weight: 0.2 },
        { factor: "Above average attendance", impact: "positive", weight: 0.15 },
        { factor: "Recent project success", impact: "positive", weight: 0.25 },
      ],
      riskLevel: "low",
      recommendations: [
        "Assign leadership opportunities in upcoming projects",
        "Consider for mentorship role",
        "Explore promotion readiness",
      ],
    };
  }

  private getMockSkillsGapAnalysis(): SkillsGapAnalysis {
    return {
      currentSkills: [
        { name: "Teaching", level: 90 },
        { name: "Curriculum Design", level: 85 },
        { name: "Student Assessment", level: 80 },
      ],
      requiredSkills: [
        { name: "Leadership", level: 85 },
        { name: "Budget Management", level: 70 },
        { name: "Strategic Planning", level: 75 },
      ],
      gaps: [
        {
          skill: "Leadership",
          currentLevel: 60,
          requiredLevel: 85,
          gap: 25,
          priority: "high",
          trainingOptions: ["Leadership Development Program", "Executive Coaching"],
        },
        {
          skill: "Budget Management",
          currentLevel: 40,
          requiredLevel: 70,
          gap: 30,
          priority: "medium",
          trainingOptions: ["Financial Management for Educators", "Online Budgeting Course"],
        },
      ],
      overallReadiness: 72,
      estimatedTimeToClose: "6-9 months",
    };
  }

  private getMockInterviewQuestions(): InterviewQuestion[] {
    return [
      {
        question: "Tell me about a time you had to adapt your teaching style to meet the needs of a struggling student.",
        category: "behavioral",
        difficulty: "medium",
        expectedAnswer: "Should demonstrate empathy, flexibility, and commitment to student success",
        evaluationCriteria: ["Problem-solving", "Adaptability", "Student focus"],
        followUpQuestions: ["What was the outcome?", "Would you do anything differently?"],
      },
      {
        question: "How do you integrate technology into your classroom instruction?",
        category: "technical",
        difficulty: "medium",
        expectedAnswer: "Should show familiarity with educational technology and practical applications",
        evaluationCriteria: ["Technology skills", "Innovation", "Student engagement"],
        followUpQuestions: ["What tools do you prefer?", "How do you assess effectiveness?"],
      },
    ];
  }

  private getMockJobDescription(role: string, department: string): string {
    return `
# ${role} - ${department}

## About the Role
We are seeking a dedicated and experienced ${role} to join our ${department} team. This is an exciting opportunity to contribute to educational excellence in the UAE.

## Key Responsibilities
- Lead and inspire a team of educators
- Develop and implement curriculum standards
- Foster a positive learning environment
- Collaborate with stakeholders on educational initiatives

## Requirements
- Bachelor's degree in Education or related field
- Valid UAE teaching license
- 5+ years of relevant experience
- Strong communication skills in English and Arabic

## What We Offer
- Competitive salary package
- Professional development opportunities
- Health insurance and benefits
- Supportive work environment

Join us in shaping the future of education in the UAE!
    `.trim();
  }
}

// Singleton instance
export const aiService = new AIService();
