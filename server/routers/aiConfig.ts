/**
 * AI CONFIGURATION & QUESTION GENERATION ROUTER
 * 
 * Provides API endpoints for:
 * - Managing AI configurations (prompts, models, settings)
 * - Managing knowledge base entries
 * - Managing assessment frameworks
 * - Generating questions with AI
 * - Managing question templates
 */

import { z } from "zod";
import { eq, desc, and, sql } from "drizzle-orm";
import { router, protectedProcedure, adminProcedure, publicProcedure } from "../_core/trpc";
import { getDb } from "../db";
import {
  aiConfigurations,
  knowledgeBase,
  assessmentFrameworks,
  questionTemplates,
  generatedQuestionsBank,
  aiGenerationLogs,
  assessmentBuilder,
  assessmentQuestionLinks
} from "../../drizzle/schema-pg";
import { 
  aiQuestionEngine, 
  PSYCHOMETRIC_FRAMEWORKS, 
  EDUCATORS_COMPETENCY_FRAMEWORK,
  QUESTION_TYPE_CONFIGS,
  type GenerationRequest
} from "../services/ai-question-engine.service";

export const aiConfigRouter = router({
  // ============================================================================
  // AI CONFIGURATIONS
  // ============================================================================

  getAllConfigurations: adminProcedure.query(async () => {
    const database = await getDb();
    if (!database) return [];
    return await database.select().from(aiConfigurations).orderBy(desc(aiConfigurations.createdAt));
  }),

  getConfigurationById: adminProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const database = await getDb();
      if (!database) return null;
      const [config] = await database
        .select()
        .from(aiConfigurations)
        .where(eq(aiConfigurations.id, input.id));
      return config || null;
    }),

  getConfigurationByType: protectedProcedure
    .input(z.object({ configType: z.string() }))
    .query(async ({ input }) => {
      const database = await getDb();
      if (!database) return null;
      const [config] = await database
        .select()
        .from(aiConfigurations)
        .where(
          and(
            eq(aiConfigurations.configType, input.configType),
            eq(aiConfigurations.status, "active")
          )
        );
      return config || null;
    }),

  createConfiguration: adminProcedure
    .input(z.object({
      name: z.string().min(1),
      configType: z.string().min(1),
      modelProvider: z.enum(["together", "openai", "ollama", "anthropic"]).default("together"),
      modelName: z.string().min(1),
      temperature: z.number().min(0).max(2).optional(),
      maxTokens: z.number().min(100).max(32000).optional(),
      topP: z.number().min(0).max(1).optional(),
      systemPrompt: z.string().min(1),
      contextInstructions: z.string().optional(),
      outputFormat: z.string().optional(),
      qualityThreshold: z.number().min(1).max(10).optional(),
      isDefault: z.boolean().optional()
    }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");

      // If setting as default, unset other defaults of same type
      if (input.isDefault) {
        await database
          .update(aiConfigurations)
          .set({ isDefault: false })
          .where(eq(aiConfigurations.configType, input.configType));
      }

      const [result] = await database.insert(aiConfigurations).values({
        ...input,
        temperature: input.temperature?.toString(),
        topP: input.topP?.toString(),
        createdBy: ctx.user.id
      }).returning({ id: aiConfigurations.id });
      return { id: result.id };
    }),

  updateConfiguration: adminProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      modelProvider: z.enum(["together", "openai", "ollama", "anthropic"]).optional(),
      modelName: z.string().optional(),
      temperature: z.number().min(0).max(2).optional(),
      maxTokens: z.number().min(100).max(32000).optional(),
      topP: z.number().min(0).max(1).optional(),
      systemPrompt: z.string().optional(),
      contextInstructions: z.string().optional(),
      outputFormat: z.string().optional(),
      qualityThreshold: z.number().min(1).max(10).optional(),
      status: z.enum(["active", "inactive", "draft"]).optional(),
      isDefault: z.boolean().optional()
    }))
    .mutation(async ({ input }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      const { id, temperature, topP, ...rest } = input;
      await database.update(aiConfigurations).set({
        ...rest,
        temperature: temperature?.toString(),
        topP: topP?.toString(),
        updatedAt: new Date()
      }).where(eq(aiConfigurations.id, id));
      return { success: true };
    }),

  deleteConfiguration: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      await database.delete(aiConfigurations).where(eq(aiConfigurations.id, input.id));
      return { success: true };
    }),

  // ============================================================================
  // KNOWLEDGE BASE
  // ============================================================================

  getAllKnowledgeBase: adminProcedure.query(async () => {
    const database = await getDb();
    if (!database) return [];
    return await database.select().from(knowledgeBase).orderBy(desc(knowledgeBase.priority), desc(knowledgeBase.createdAt));
  }),

  getKnowledgeBaseById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const database = await getDb();
      if (!database) return null;
      const [kb] = await database.select().from(knowledgeBase).where(eq(knowledgeBase.id, input.id));
      return kb || null;
    }),

  getKnowledgeBaseByType: protectedProcedure
    .input(z.object({ knowledgeType: z.enum(["competency_framework", "psychometric_methodology", "assessment_rubric", "question_template", "custom"]) }))
    .query(async ({ input }) => {
      const database = await getDb();
      if (!database) return [];
      return await database
        .select()
        .from(knowledgeBase)
        .where(
          and(
            eq(knowledgeBase.knowledgeType, input.knowledgeType),
            eq(knowledgeBase.status, "active")
          )
        )
        .orderBy(desc(knowledgeBase.priority));
    }),

  createKnowledgeBase: adminProcedure
    .input(z.object({
      name: z.string().min(1),
      knowledgeType: z.enum(["competency_framework", "psychometric_methodology", "assessment_rubric", "question_template", "custom"]),
      category: z.string().optional(),
      content: z.string().min(1),
      structuredData: z.any().optional(),
      source: z.string().optional(),
      version: z.string().optional(),
      language: z.string().default("en"),
      priority: z.number().default(0)
    }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      const [result] = await database.insert(knowledgeBase).values({
        ...input,
        createdBy: ctx.user.id
      }).returning({ id: knowledgeBase.id });
      return { id: result.id };
    }),

  updateKnowledgeBase: adminProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      category: z.string().optional(),
      content: z.string().optional(),
      structuredData: z.any().optional(),
      source: z.string().optional(),
      version: z.string().optional(),
      priority: z.number().optional(),
      status: z.enum(["active", "inactive", "draft"]).optional()
    }))
    .mutation(async ({ input }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      const { id, ...data } = input;
      await database.update(knowledgeBase).set({
        ...data,
        updatedAt: new Date()
      }).where(eq(knowledgeBase.id, id));
      return { success: true };
    }),

  deleteKnowledgeBase: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      await database.delete(knowledgeBase).where(eq(knowledgeBase.id, input.id));
      return { success: true };
    }),

  // ============================================================================
  // ASSESSMENT FRAMEWORKS
  // ============================================================================

  getAllFrameworks: protectedProcedure.query(async () => {
    const database = await getDb();
    if (!database) return [];
    return await database.select().from(assessmentFrameworks).orderBy(assessmentFrameworks.name);
  }),

  getBuiltInFrameworks: publicProcedure.query(() => {
    return {
      psychometric: PSYCHOMETRIC_FRAMEWORKS,
      competency: EDUCATORS_COMPETENCY_FRAMEWORK
    };
  }),

  getFrameworkByCode: protectedProcedure
    .input(z.object({ code: z.string() }))
    .query(async ({ input }) => {
      const database = await getDb();
      if (!database) {
        // Return built-in framework
        const builtIn = PSYCHOMETRIC_FRAMEWORKS[input.code as keyof typeof PSYCHOMETRIC_FRAMEWORKS];
        if (builtIn) return { ...builtIn, isBuiltIn: true };
        return null;
      }
      const [framework] = await database
        .select()
        .from(assessmentFrameworks)
        .where(eq(assessmentFrameworks.code, input.code));
      return framework || null;
    }),

  createFramework: adminProcedure
    .input(z.object({
      name: z.string().min(1),
      code: z.string().min(1),
      frameworkType: z.enum(["big_five", "hogan", "disc", "mbti", "eq", "shl", "gallup", "custom"]),
      category: z.enum(["psychometric", "competency", "cognitive", "skills", "behavioral", "leadership", "custom"]),
      description: z.string().optional(),
      methodology: z.string().optional(),
      dimensions: z.any().optional(),
      scoringRules: z.any().optional(),
      questionTypes: z.any().optional(),
      aiConfigId: z.number().optional(),
      promptTemplate: z.string().optional(),
      exampleQuestions: z.string().optional()
    }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      const [result] = await database.insert(assessmentFrameworks).values({
        ...input,
        createdBy: ctx.user.id
      }).returning({ id: assessmentFrameworks.id });
      return { id: result.id };
    }),

  updateFramework: adminProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      description: z.string().optional(),
      methodology: z.string().optional(),
      dimensions: z.any().optional(),
      scoringRules: z.any().optional(),
      questionTypes: z.any().optional(),
      aiConfigId: z.number().optional(),
      promptTemplate: z.string().optional(),
      status: z.enum(["active", "inactive", "draft"]).optional()
    }))
    .mutation(async ({ input }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      const { id, ...data } = input;
      await database.update(assessmentFrameworks).set({
        ...data,
        updatedAt: new Date()
      }).where(eq(assessmentFrameworks.id, id));
      return { success: true };
    }),

  // ============================================================================
  // QUESTION TEMPLATES
  // ============================================================================

  getAllTemplates: adminProcedure.query(async () => {
    const database = await getDb();
    if (!database) return [];
    return await database.select().from(questionTemplates).orderBy(questionTemplates.name);
  }),

  getTemplatesByType: protectedProcedure
    .input(z.object({ 
      questionType: z.string().optional(),
      category: z.string().optional()
    }))
    .query(async ({ input }) => {
      const database = await getDb();
      if (!database) return [];
      let query = database.select().from(questionTemplates).where(eq(questionTemplates.status, "active"));
      return await query.orderBy(desc(questionTemplates.usageCount));
    }),

  createTemplate: adminProcedure
    .input(z.object({
      name: z.string().min(1),
      questionType: z.string(),
      category: z.enum(["psychometric", "competency", "cognitive", "skills", "behavioral", "leadership", "custom"]),
      templateText: z.string().min(1),
      optionsTemplate: z.any().optional(),
      scoringTemplate: z.any().optional(),
      instructions: z.string().optional(),
      examples: z.string().optional(),
      constraints: z.any().optional(),
      difficulty: z.string().optional(),
      estimatedTime: z.number().optional(),
      tags: z.any().optional()
    }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      const [result] = await database.insert(questionTemplates).values({
        ...input,
        questionType: input.questionType as any,
        createdBy: ctx.user.id
      }).returning({ id: questionTemplates.id });
      return { id: result.id };
    }),

  // ============================================================================
  // QUESTION GENERATION
  // ============================================================================

  getQuestionTypeConfigs: publicProcedure.query(() => {
    return QUESTION_TYPE_CONFIGS;
  }),

  generateQuestions: adminProcedure
    .input(z.object({
      category: z.enum(["psychometric", "competency", "cognitive", "skills", "behavioral", "leadership", "custom"]),
      frameworkCode: z.string().optional(),
      dimension: z.string().optional(),
      questionTypes: z.array(z.string()),
      count: z.number().min(1).max(50).default(10),
      difficulty: z.enum(["basic", "intermediate", "advanced", "expert", "mixed"]).optional(),
      includeValidityChecks: z.boolean().optional(),
      includeAntiFaking: z.boolean().optional(),
      customPrompt: z.string().optional(),
      knowledgeBaseIds: z.array(z.number()).optional()
    }))
    .mutation(async ({ input, ctx }) => {
      const request: GenerationRequest = {
        ...input,
        questionTypes: input.questionTypes as any[],
        tenantId: (ctx as any).tenantId
      };
      
      const questions = await aiQuestionEngine.generateQuestions(request);
      return { questions, count: questions.length };
    }),

  // ============================================================================
  // GENERATED QUESTIONS BANK
  // ============================================================================

  getGeneratedQuestions: protectedProcedure
    .input(z.object({
      category: z.string().optional(),
      dimension: z.string().optional(),
      questionType: z.string().optional(),
      status: z.string().optional(),
      limit: z.number().default(50),
      offset: z.number().default(0)
    }))
    .query(async ({ input }) => {
      const database = await getDb();
      if (!database) return { questions: [], total: 0 };
      
      const questions = await database
        .select()
        .from(generatedQuestionsBank)
        .orderBy(desc(generatedQuestionsBank.createdAt))
        .limit(input.limit)
        .offset(input.offset);
      
      return { questions, total: questions.length };
    }),

  updateQuestionStatus: adminProcedure
    .input(z.object({
      id: z.number(),
      reviewStatus: z.string().optional(),
      qualityScore: z.number().min(1).max(10).optional(),
      reviewNotes: z.string().optional(),
      status: z.string().optional()
    }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      const { id, ...data } = input;
      await database.update(generatedQuestionsBank).set({
        ...data,
        reviewedBy: ctx.user.id,
        updatedAt: new Date()
      }).where(eq(generatedQuestionsBank.id, id));
      return { success: true };
    }),

  deleteGeneratedQuestion: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      await database.delete(generatedQuestionsBank).where(eq(generatedQuestionsBank.id, input.id));
      return { success: true };
    }),

  // ============================================================================
  // AI GENERATION LOGS
  // ============================================================================

  getGenerationLogs: adminProcedure
    .input(z.object({
      limit: z.number().default(100),
      offset: z.number().default(0)
    }))
    .query(async ({ input }) => {
      const database = await getDb();
      if (!database) return [];
      return await database
        .select()
        .from(aiGenerationLogs)
        .orderBy(desc(aiGenerationLogs.createdAt))
        .limit(input.limit)
        .offset(input.offset);
    }),

  getGenerationStats: adminProcedure.query(async () => {
    const database = await getDb();
    if (!database) return { totalGenerations: 0, successRate: 0, totalQuestions: 0 };
    
    const stats = await database.select({
      total: sql<number>`COUNT(*)`,
      successful: sql<number>`SUM(CASE WHEN success THEN 1 ELSE 0 END)`,
      questionsGenerated: sql<number>`SUM(COALESCE(questions_generated, 0))`
    }).from(aiGenerationLogs);

    const s = stats[0];
    return {
      totalGenerations: s?.total || 0,
      successRate: s?.total ? ((s?.successful || 0) / s.total) * 100 : 0,
      totalQuestions: s?.questionsGenerated || 0
    };
  })
});
