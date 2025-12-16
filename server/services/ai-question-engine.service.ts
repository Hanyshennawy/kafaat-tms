/**
 * AI QUESTION GENERATION ENGINE
 * 
 * Professional-grade AI-powered question generation system for:
 * - Psychometric Assessments (Hogan, Big Five, SHL, DISC, Gallup)
 * - Competency Assessments (National Educators' Framework)
 * - Cognitive Ability Tests
 * - Situational Judgment Tests
 * 
 * Features:
 * - Customizable AI instructions and prompts
 * - Knowledge base injection for context
 * - Multiple question types support
 * - Quality scoring and validation
 * - Anti-faking measures generation
 */

import { getDb } from "../db";
import { 
  aiConfigurations, 
  knowledgeBase, 
  assessmentFrameworks,
  generatedQuestionsBank,
  aiGenerationLogs,
  questionTemplates
} from "../../drizzle/schema-pg";
import { eq, and, desc, sql } from "drizzle-orm";

// ============================================================================
// TYPES
// ============================================================================

export type QuestionType = 
  | "mcq" | "true_false" | "likert" | "rating_scale" | "scenario" | "forced_choice"
  | "ranking" | "matching" | "fill_blank" | "short_answer" | "essay" | "open_ended"
  | "situational_judgment" | "ipsative_pair" | "ipsative_quad" | "semantic_differential"
  | "behavioral_anchor" | "conditional_reasoning" | "case_study" | "video_response";

export type AssessmentCategory = "psychometric" | "competency" | "cognitive" | "skills" | "behavioral" | "leadership" | "custom";

export interface GeneratedQuestionResult {
  id?: number;
  questionType: QuestionType;
  questionText: string;
  scenario?: string;
  instructions?: string;
  options: QuestionOption[];
  correctAnswer?: string | number;
  explanation?: string;
  scoringKey?: ScoringKey;
  dimension: string;
  subdimension?: string;
  traitMeasured?: string;
  difficulty: "basic" | "intermediate" | "advanced" | "expert";
  estimatedTime: number;
  points: number;
  tags: string[];
  qualityScore: number;
  isValidityCheck?: boolean;
  isReverseCoded?: boolean;
}

export interface QuestionOption {
  id: string;
  text: string;
  value?: number;
  isCorrect?: boolean;
  traits?: { trait: string; score: number }[];
  behavioralAnchor?: string;
  socialDesirability?: "high" | "medium" | "low" | "neutral";
}

export interface ScoringKey {
  method: "normative" | "ipsative" | "criterion" | "competency" | "cognitive";
  traitWeights?: Record<string, number>;
  correctAnswer?: number | string;
  passingThreshold?: number;
}

export interface GenerationRequest {
  category: AssessmentCategory;
  frameworkCode?: string;
  dimension?: string;
  questionTypes: QuestionType[];
  count: number;
  difficulty?: "basic" | "intermediate" | "advanced" | "expert" | "mixed";
  includeValidityChecks?: boolean;
  includeAntiFaking?: boolean;
  customPrompt?: string;
  knowledgeBaseIds?: number[];
  tenantId?: number;
}

// ============================================================================
// PSYCHOMETRIC FRAMEWORKS - BUILT-IN
// ============================================================================

export const PSYCHOMETRIC_FRAMEWORKS = {
  big_five: {
    name: "Big Five Personality (OCEAN)",
    dimensions: [
      { code: "O", name: "Openness", description: "Openness to experience, creativity, intellectual curiosity" },
      { code: "C", name: "Conscientiousness", description: "Organization, dependability, self-discipline" },
      { code: "E", name: "Extraversion", description: "Sociability, assertiveness, positive emotions" },
      { code: "A", name: "Agreeableness", description: "Cooperation, trust, empathy" },
      { code: "N", name: "Neuroticism", description: "Emotional stability, anxiety, stress response" }
    ],
    methodology: "NEO-PI-R based assessment with Likert and forced-choice items"
  },
  hogan: {
    name: "Hogan Personality Inventory (HPI)",
    dimensions: [
      { code: "ADJ", name: "Adjustment", description: "Emotional stability and stress tolerance" },
      { code: "AMB", name: "Ambition", description: "Leadership and competitiveness" },
      { code: "SOC", name: "Sociability", description: "Need for social interaction" },
      { code: "INT", name: "Interpersonal Sensitivity", description: "Tact and perceptiveness" },
      { code: "PRU", name: "Prudence", description: "Self-discipline and responsibility" },
      { code: "INQ", name: "Inquisitive", description: "Imagination and curiosity" },
      { code: "LRN", name: "Learning Approach", description: "Achievement orientation" }
    ],
    methodology: "Work-focused personality assessment with situational judgment tests"
  },
  disc: {
    name: "DISC Behavioral Assessment",
    dimensions: [
      { code: "D", name: "Dominance", description: "Direct, results-oriented, decisive" },
      { code: "I", name: "Influence", description: "Enthusiastic, collaborative, optimistic" },
      { code: "S", name: "Steadiness", description: "Patient, reliable, team-oriented" },
      { code: "C", name: "Conscientiousness", description: "Analytical, reserved, precise" }
    ],
    methodology: "Forced-choice ipsative assessment of behavioral styles"
  },
  shl: {
    name: "SHL OPQ32",
    dimensions: [
      { code: "REL", name: "Relationships with People", description: "Persuasive, controlling, outgoing, affiliative" },
      { code: "THK", name: "Thinking Style", description: "Data rational, evaluative, forward thinking" },
      { code: "FEL", name: "Feelings and Emotions", description: "Tough minded, optimistic, competitive" }
    ],
    methodology: "Occupational Personality Questionnaire with normative and ipsative formats"
  },
  eq: {
    name: "Emotional Intelligence (EQ-i 2.0)",
    dimensions: [
      { code: "SA", name: "Self-Awareness", description: "Emotional self-awareness, self-regard" },
      { code: "SM", name: "Self-Management", description: "Self-control, adaptability, achievement" },
      { code: "SOA", name: "Social Awareness", description: "Empathy, organizational awareness" },
      { code: "RM", name: "Relationship Management", description: "Influence, conflict management" },
      { code: "DM", name: "Decision Making", description: "Reality testing, problem solving" }
    ],
    methodology: "Multi-rater emotional intelligence assessment"
  },
  gallup: {
    name: "Gallup StrengthsFinder",
    dimensions: [
      { code: "EXE", name: "Executing", description: "Getting things done - Achiever, Focus, Responsibility" },
      { code: "INF", name: "Influencing", description: "Taking charge - Communication, Self-Assurance" },
      { code: "REL", name: "Relationship Building", description: "Connecting with others - Empathy, Harmony" },
      { code: "STR", name: "Strategic Thinking", description: "Analyzing - Analytical, Futuristic, Learner" }
    ],
    methodology: "Strengths-based development with talent theme identification"
  },
  leadership: {
    name: "Leadership Competency Model",
    dimensions: [
      { code: "VIS", name: "Vision & Strategy", description: "Setting direction and inspiring others" },
      { code: "EXE", name: "Execution", description: "Delivering results and driving performance" },
      { code: "PPL", name: "People Development", description: "Coaching, mentoring, building teams" },
      { code: "CHG", name: "Change Leadership", description: "Leading transformation and innovation" },
      { code: "INT", name: "Integrity", description: "Ethics, trust, and authenticity" }
    ],
    methodology: "360-degree feedback with behavioral anchored rating scales"
  }
};

// ============================================================================
// NATIONAL EDUCATORS' COMPETENCY FRAMEWORK
// ============================================================================

export const EDUCATORS_COMPETENCY_FRAMEWORK = {
  name: "National Educators' Competency Framework (UAE MOE)",
  domains: [
    {
      code: "PK",
      name: "Professional Knowledge",
      standards: [
        { code: "PK1", name: "Subject Matter Expertise", level: "foundation", indicators: ["Deep content knowledge", "Cross-curricular connections"] },
        { code: "PK2", name: "Pedagogical Knowledge", level: "intermediate", indicators: ["Learning theories", "Instructional strategies"] },
        { code: "PK3", name: "Curriculum Understanding", level: "intermediate", indicators: ["Curriculum design", "Learning outcomes alignment"] },
        { code: "PK4", name: "Student Development", level: "foundation", indicators: ["Developmental stages", "Learning differences"] }
      ]
    },
    {
      code: "PP",
      name: "Professional Practice",
      standards: [
        { code: "PP1", name: "Planning & Preparation", level: "foundation", indicators: ["Lesson planning", "Resource preparation"] },
        { code: "PP2", name: "Classroom Management", level: "intermediate", indicators: ["Behavior management", "Learning environment"] },
        { code: "PP3", name: "Instructional Delivery", level: "advanced", indicators: ["Differentiation", "Engagement strategies"] },
        { code: "PP4", name: "Assessment & Feedback", level: "advanced", indicators: ["Formative assessment", "Constructive feedback"] },
        { code: "PP5", name: "Technology Integration", level: "intermediate", indicators: ["EdTech tools", "Digital literacy"] }
      ]
    },
    {
      code: "PE",
      name: "Professional Engagement",
      standards: [
        { code: "PE1", name: "Collaboration", level: "foundation", indicators: ["Team teaching", "PLCs participation"] },
        { code: "PE2", name: "Parent Partnership", level: "intermediate", indicators: ["Parent communication", "Community engagement"] },
        { code: "PE3", name: "Professional Learning", level: "advanced", indicators: ["CPD commitment", "Action research"] },
        { code: "PE4", name: "Ethics & Conduct", level: "foundation", indicators: ["Professional ethics", "UAE values"] },
        { code: "PE5", name: "Leadership", level: "expert", indicators: ["Mentoring", "School improvement"] }
      ]
    }
  ]
};

// ============================================================================
// QUESTION TYPE CONFIGURATIONS
// ============================================================================

export const QUESTION_TYPE_CONFIGS: Record<QuestionType, {
  name: string;
  description: string;
  optionsRequired: boolean;
  minOptions?: number;
  maxOptions?: number;
  scoringMethod: string;
  uiComponent: string;
  instructions: string;
}> = {
  mcq: {
    name: "Multiple Choice",
    description: "Single correct answer from multiple options",
    optionsRequired: true,
    minOptions: 3,
    maxOptions: 6,
    scoringMethod: "correct_answer",
    uiComponent: "RadioGroup",
    instructions: "Select the best answer from the options below."
  },
  true_false: {
    name: "True/False",
    description: "Binary choice question",
    optionsRequired: true,
    minOptions: 2,
    maxOptions: 2,
    scoringMethod: "correct_answer",
    uiComponent: "RadioGroup",
    instructions: "Select True or False."
  },
  likert: {
    name: "Likert Scale",
    description: "Agreement scale (Strongly Disagree to Strongly Agree)",
    optionsRequired: true,
    minOptions: 5,
    maxOptions: 7,
    scoringMethod: "normative",
    uiComponent: "LikertScale",
    instructions: "Indicate your level of agreement."
  },
  rating_scale: {
    name: "Rating Scale",
    description: "Numeric rating (1-5, 1-10)",
    optionsRequired: false,
    scoringMethod: "normative",
    uiComponent: "RatingScale",
    instructions: "Rate on the scale provided."
  },
  scenario: {
    name: "Scenario-Based",
    description: "Contextualized question with a scenario",
    optionsRequired: true,
    minOptions: 3,
    maxOptions: 5,
    scoringMethod: "weighted",
    uiComponent: "ScenarioQuestion",
    instructions: "Read the scenario carefully, then select the best response."
  },
  forced_choice: {
    name: "Forced Choice",
    description: "Choose between two equally desirable options",
    optionsRequired: true,
    minOptions: 2,
    maxOptions: 2,
    scoringMethod: "ipsative",
    uiComponent: "ForcedChoice",
    instructions: "Choose the option that BEST describes you."
  },
  ranking: {
    name: "Ranking",
    description: "Order items by preference or importance",
    optionsRequired: true,
    minOptions: 3,
    maxOptions: 7,
    scoringMethod: "rank_weighted",
    uiComponent: "RankingQuestion",
    instructions: "Drag items to rank from most to least important."
  },
  matching: {
    name: "Matching",
    description: "Match items from two columns",
    optionsRequired: true,
    minOptions: 3,
    maxOptions: 8,
    scoringMethod: "correct_pairs",
    uiComponent: "MatchingQuestion",
    instructions: "Match each item on the left with the correct item on the right."
  },
  fill_blank: {
    name: "Fill in the Blank",
    description: "Complete the sentence or paragraph",
    optionsRequired: false,
    scoringMethod: "keyword_match",
    uiComponent: "FillBlank",
    instructions: "Fill in the blank with the appropriate word or phrase."
  },
  short_answer: {
    name: "Short Answer",
    description: "Brief text response (1-3 sentences)",
    optionsRequired: false,
    scoringMethod: "rubric",
    uiComponent: "TextInput",
    instructions: "Provide a brief answer in 1-3 sentences."
  },
  essay: {
    name: "Essay",
    description: "Extended written response",
    optionsRequired: false,
    scoringMethod: "rubric",
    uiComponent: "TextArea",
    instructions: "Write a detailed response addressing all aspects of the question."
  },
  open_ended: {
    name: "Open-Ended",
    description: "Free-form response with no specific format",
    optionsRequired: false,
    scoringMethod: "qualitative",
    uiComponent: "TextArea",
    instructions: "Share your thoughts openly."
  },
  situational_judgment: {
    name: "Situational Judgment Test",
    description: "Workplace scenario with multiple defensible responses",
    optionsRequired: true,
    minOptions: 4,
    maxOptions: 5,
    scoringMethod: "criterion",
    uiComponent: "SJTQuestion",
    instructions: "Rank responses from MOST effective to LEAST effective."
  },
  ipsative_pair: {
    name: "Ipsative Pair",
    description: "Choose between two personality-related options",
    optionsRequired: true,
    minOptions: 2,
    maxOptions: 2,
    scoringMethod: "ipsative",
    uiComponent: "IpsativePair",
    instructions: "Select which statement describes you BETTER."
  },
  ipsative_quad: {
    name: "Ipsative Quad",
    description: "Select MOST and LEAST like you from four options",
    optionsRequired: true,
    minOptions: 4,
    maxOptions: 4,
    scoringMethod: "ipsative",
    uiComponent: "IpsativeQuad",
    instructions: "Select which is MOST like you and which is LEAST like you."
  },
  semantic_differential: {
    name: "Semantic Differential",
    description: "Rating between two opposite adjectives",
    optionsRequired: true,
    minOptions: 2,
    maxOptions: 2,
    scoringMethod: "bipolar",
    uiComponent: "SemanticDifferential",
    instructions: "Mark where you fall on the scale between these opposites."
  },
  behavioral_anchor: {
    name: "Behavioral Anchor Rating",
    description: "Rate behaviors with specific behavioral examples",
    optionsRequired: true,
    minOptions: 4,
    maxOptions: 6,
    scoringMethod: "bars",
    uiComponent: "BARSQuestion",
    instructions: "Select the behavior that best describes your typical approach."
  },
  conditional_reasoning: {
    name: "Conditional Reasoning",
    description: "Implicit personality measurement through logical reasoning",
    optionsRequired: true,
    minOptions: 3,
    maxOptions: 4,
    scoringMethod: "criterion",
    uiComponent: "RadioGroup",
    instructions: "Select the most logical conclusion."
  },
  case_study: {
    name: "Case Study",
    description: "Extended scenario with multiple questions",
    optionsRequired: true,
    minOptions: 3,
    maxOptions: 5,
    scoringMethod: "rubric",
    uiComponent: "CaseStudy",
    instructions: "Read the case carefully and answer the questions that follow."
  },
  video_response: {
    name: "Video Response",
    description: "Record a video response to the question",
    optionsRequired: false,
    scoringMethod: "rubric",
    uiComponent: "VideoResponse",
    instructions: "Record your response (2-3 minutes maximum)."
  }
};

// ============================================================================
// PROMPT TEMPLATES FOR AI GENERATION
// ============================================================================

const SYSTEM_PROMPTS = {
  psychometric: `You are an expert industrial-organizational psychologist with deep expertise in psychometric assessment design. You specialize in creating valid, reliable assessment items following the methodologies of leading assessment providers (SHL, Hogan, Gallup, DISC).

Your questions must:
1. Measure specific psychological constructs reliably
2. Avoid obvious "correct" answers to prevent faking
3. Use scenario-based and forced-choice formats when appropriate
4. Include behavioral anchors for clarity
5. Be culturally appropriate for UAE educational context
6. Follow psychometric best practices for validity

Anti-faking techniques to employ:
- Balanced keying (equal positive/negative items)
- Social desirability matching in forced-choice pairs
- Subtle trait measurement through scenarios
- Validity check items for consistency`,

  competency: `You are an expert educator assessment designer for the UAE Ministry of Education (MOE). You specialize in creating competency-based assessments aligned with the National Educators' Competency Framework.

Your questions must:
1. Directly assess the specified competency standard
2. Use realistic UAE educational scenarios
3. Include multiple competency levels (foundation to expert)
4. Align with MOE professional standards
5. Reflect UAE cultural values and educational priorities
6. Provide clear behavioral indicators

Focus areas for UAE educators:
- Arabic/English bilingual education
- Islamic values integration
- 21st century skills
- Technology-enhanced learning
- Inclusive education
- Parent-community partnerships`,

  cognitive: `You are an expert in cognitive assessment design with expertise in measuring reasoning abilities for educational professionals.

Your questions must:
1. Measure specific cognitive abilities (verbal, numerical, abstract reasoning)
2. Be appropriately timed for the difficulty level
3. Have clear, unambiguous correct answers
4. Progress in difficulty within sets
5. Be free from cultural bias

Question types:
- Verbal Reasoning: Analogies, reading comprehension, critical thinking
- Numerical Reasoning: Data interpretation, mathematical problem-solving
- Abstract Reasoning: Pattern recognition, logical sequences`
};

// ============================================================================
// AI QUESTION ENGINE CLASS
// ============================================================================

export class AIQuestionEngine {
  private togetherApiKey: string;
  private modelName: string;

  constructor() {
    this.togetherApiKey = process.env.TOGETHER_API_KEY || "";
    // Use the most capable model for highest quality
    this.modelName = process.env.TOGETHER_MODEL || "meta-llama/Llama-3.3-70B-Instruct-Turbo";
  }

  /**
   * Generate questions based on configuration
   */
  async generateQuestions(request: GenerationRequest): Promise<GeneratedQuestionResult[]> {
    const startTime = Date.now();
    const db = await getDb();

    try {
      // Get AI configuration if specified
      let aiConfig = null;
      if (request.category && db) {
        const configs = await db
          .select()
          .from(aiConfigurations)
          .where(
            and(
              eq(aiConfigurations.configType, `${request.category}_generation`),
              eq(aiConfigurations.status, "active")
            )
          )
          .limit(1);
        aiConfig = configs[0];
      }

      // Get framework configuration
      let framework = null;
      if (request.frameworkCode && db) {
        const frameworks = await db
          .select()
          .from(assessmentFrameworks)
          .where(eq(assessmentFrameworks.code, request.frameworkCode))
          .limit(1);
        framework = frameworks[0];
      }

      // Get knowledge base content
      let knowledgeContent = "";
      if (request.knowledgeBaseIds?.length && db) {
        const knowledge = await db
          .select()
          .from(knowledgeBase)
          .where(eq(knowledgeBase.status, "active"));
        knowledgeContent = knowledge
          .filter(k => request.knowledgeBaseIds?.includes(k.id))
          .map(k => k.content)
          .join("\n\n");
      }

      // Build the prompt
      const prompt = this.buildGenerationPrompt(request, aiConfig, framework, knowledgeContent);

      // Call AI API
      const response = await this.callAI(prompt, aiConfig);

      // Parse and validate questions
      const questions = this.parseGeneratedQuestions(response, request);

      // Log the generation
      if (db) {
        await db.insert(aiGenerationLogs).values({
          requestType: `${request.category}_question_generation`,
          configId: aiConfig?.id || null,
          promptUsed: prompt.substring(0, 5000),
          responseContent: JSON.stringify(questions).substring(0, 10000),
          questionsGenerated: questions.length,
          responseTimeMs: Date.now() - startTime,
          modelUsed: this.modelName,
          success: true,
          tenantId: request.tenantId
        });

        // Save questions to bank
        for (const q of questions) {
          await db.insert(generatedQuestionsBank).values({
            questionType: q.questionType as any,
            questionText: q.questionText,
            scenario: q.scenario || null,
            instructions: q.instructions || null,
            options: q.options,
            correctAnswer: q.correctAnswer?.toString() || null,
            explanation: q.explanation || null,
            scoringKey: q.scoringKey || null,
            category: request.category as any,
            frameworkId: framework?.id || null,
            dimension: q.dimension,
            subdimension: q.subdimension || null,
            traitMeasured: q.traitMeasured || null,
            difficulty: q.difficulty,
            estimatedTime: q.estimatedTime,
            points: q.points,
            tags: q.tags,
            aiConfigId: aiConfig?.id || null,
            generationPrompt: prompt.substring(0, 2000),
            modelUsed: this.modelName,
            qualityScore: q.qualityScore,
            reviewStatus: "pending",
            isValidityCheck: q.isValidityCheck || false,
            isReverseCoded: q.isReverseCoded || false,
            tenantId: request.tenantId
          });
        }
      }

      return questions;
    } catch (error) {
      // Log error
      if (db) {
        await db.insert(aiGenerationLogs).values({
          requestType: `${request.category}_question_generation`,
          responseTimeMs: Date.now() - startTime,
          modelUsed: this.modelName,
          success: false,
          errorMessage: error instanceof Error ? error.message : "Unknown error",
          tenantId: request.tenantId
        });
      }
      throw error;
    }
  }

  /**
   * Build the AI prompt for question generation
   */
  private buildGenerationPrompt(
    request: GenerationRequest,
    aiConfig: any,
    framework: any,
    knowledgeContent: string
  ): string {
    // Get system prompt
    let systemPrompt = aiConfig?.systemPrompt || SYSTEM_PROMPTS[request.category as keyof typeof SYSTEM_PROMPTS] || SYSTEM_PROMPTS.competency;

    // Add framework context
    let frameworkContext = "";
    if (framework) {
      frameworkContext = `
ASSESSMENT FRAMEWORK: ${framework.name}
${framework.description || ""}
${framework.methodology || ""}

DIMENSIONS TO ASSESS:
${JSON.stringify(framework.dimensions, null, 2)}
`;
    } else if (request.category === "psychometric" && request.frameworkCode) {
      const builtInFramework = PSYCHOMETRIC_FRAMEWORKS[request.frameworkCode as keyof typeof PSYCHOMETRIC_FRAMEWORKS];
      if (builtInFramework) {
        frameworkContext = `
ASSESSMENT FRAMEWORK: ${builtInFramework.name}
Methodology: ${builtInFramework.methodology}

DIMENSIONS TO ASSESS:
${builtInFramework.dimensions.map(d => `- ${d.code}: ${d.name} - ${d.description}`).join("\n")}
`;
      }
    } else if (request.category === "competency") {
      frameworkContext = `
NATIONAL EDUCATORS' COMPETENCY FRAMEWORK (UAE MOE)

DOMAINS:
${EDUCATORS_COMPETENCY_FRAMEWORK.domains.map(d => `
${d.code}: ${d.name}
Standards:
${d.standards.map(s => `  - ${s.code}: ${s.name} (${s.level})`).join("\n")}
`).join("\n")}
`;
    }

    // Add knowledge base
    const knowledgeSection = knowledgeContent ? `
ADDITIONAL KNOWLEDGE BASE:
${knowledgeContent}
` : "";

    // Build generation instructions
    const generationInstructions = `
GENERATION REQUIREMENTS:
- Generate exactly ${request.count} questions
- Question types allowed: ${request.questionTypes.join(", ")}
- Category: ${request.category}
${request.dimension ? `- Focus on dimension: ${request.dimension}` : ""}
- Difficulty distribution: ${request.difficulty || "mixed"}
${request.includeValidityChecks ? "- Include 1-2 validity check items" : ""}
${request.includeAntiFaking ? "- Apply anti-faking measures (balanced keying, subtle measurement)" : ""}

${request.customPrompt || ""}

OUTPUT FORMAT (JSON array):
[
  {
    "questionType": "scenario|mcq|likert|forced_choice|etc",
    "questionText": "The main question text",
    "scenario": "Optional scenario/context (for scenario-based questions)",
    "instructions": "Specific instructions for this question",
    "options": [
      {
        "id": "a",
        "text": "Option text",
        "value": 3,
        "isCorrect": false,
        "traits": [{"trait": "Openness", "score": 4}],
        "behavioralAnchor": "Optional behavioral description"
      }
    ],
    "correctAnswer": "a or null for personality questions",
    "explanation": "Why this is correct or how to interpret",
    "scoringKey": {
      "method": "normative|ipsative|criterion",
      "traitWeights": {"Openness": 1.0}
    },
    "dimension": "Main dimension being measured",
    "subdimension": "Optional subdimension",
    "traitMeasured": "Specific trait",
    "difficulty": "basic|intermediate|advanced|expert",
    "estimatedTime": 60,
    "points": 1,
    "tags": ["tag1", "tag2"],
    "qualityScore": 8,
    "isValidityCheck": false,
    "isReverseCoded": false
  }
]

Generate high-quality, professionally-crafted questions now.`;

    return `${systemPrompt}

${frameworkContext}

${knowledgeSection}

${generationInstructions}`;
  }

  /**
   * Call AI API (Together.ai)
   */
  private async callAI(prompt: string, aiConfig: any): Promise<string> {
    if (!this.togetherApiKey) {
      throw new Error("Together.ai API key not configured");
    }

    const temperature = aiConfig?.temperature ? parseFloat(aiConfig.temperature) : 0.7;
    const maxTokens = aiConfig?.maxTokens || 8192;

    const response = await fetch("https://api.together.xyz/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.togetherApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: this.modelName,
        messages: [
          { role: "system", content: "You are an expert assessment designer. Always respond with valid JSON only." },
          { role: "user", content: prompt }
        ],
        temperature,
        max_tokens: maxTokens,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`AI API error: ${error}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "";
  }

  /**
   * Parse and validate generated questions
   */
  private parseGeneratedQuestions(response: string, request: GenerationRequest): GeneratedQuestionResult[] {
    try {
      let parsed = JSON.parse(response);
      
      // Handle wrapped responses
      if (parsed.questions) {
        parsed = parsed.questions;
      }

      if (!Array.isArray(parsed)) {
        parsed = [parsed];
      }

      return parsed.map((q: any, index: number) => ({
        questionType: q.questionType || request.questionTypes[0],
        questionText: q.questionText || q.text || "",
        scenario: q.scenario,
        instructions: q.instructions,
        options: (q.options || []).map((o: any, i: number) => ({
          id: o.id || String.fromCharCode(97 + i),
          text: o.text || "",
          value: o.value ?? i + 1,
          isCorrect: o.isCorrect,
          traits: o.traits,
          behavioralAnchor: o.behavioralAnchor,
          socialDesirability: o.socialDesirability
        })),
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        scoringKey: q.scoringKey,
        dimension: q.dimension || request.dimension || "General",
        subdimension: q.subdimension,
        traitMeasured: q.traitMeasured,
        difficulty: q.difficulty || "intermediate",
        estimatedTime: q.estimatedTime || 60,
        points: q.points || 1,
        tags: q.tags || [],
        qualityScore: q.qualityScore || 7,
        isValidityCheck: q.isValidityCheck,
        isReverseCoded: q.isReverseCoded
      }));
    } catch (error) {
      console.error("Failed to parse AI response:", error);
      return [];
    }
  }

  /**
   * Get available frameworks
   */
  getAvailableFrameworks() {
    return {
      psychometric: PSYCHOMETRIC_FRAMEWORKS,
      competency: EDUCATORS_COMPETENCY_FRAMEWORK
    };
  }

  /**
   * Get question type configurations
   */
  getQuestionTypeConfigs() {
    return QUESTION_TYPE_CONFIGS;
  }
}

// Export singleton instance
export const aiQuestionEngine = new AIQuestionEngine();
