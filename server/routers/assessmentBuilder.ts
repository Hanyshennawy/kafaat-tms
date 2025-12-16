/**
 * ASSESSMENT BUILDER ROUTER
 * 
 * Provides comprehensive API for:
 * - Creating and managing assessments
 * - Configuring assessment sections and questions
 * - Setting timing, proctoring, and scoring rules
 * - Linking generated questions to assessments
 * - Publishing and scheduling assessments
 */

import { z } from "zod";
import { eq, desc, and, sql } from "drizzle-orm";
import { router, protectedProcedure, adminProcedure } from "../_core/trpc";
import { getDb } from "../db";
import {
  assessmentBuilder,
  assessmentQuestionLinks,
  generatedQuestionsBank,
  assessmentFrameworks
} from "../../drizzle/schema-pg";

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const sectionSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  questionCount: z.number().min(1),
  questionTypes: z.array(z.string()).optional(),
  timeLimit: z.number().optional(), // minutes
  aiGenerated: z.boolean().default(false),
  manualQuestionIds: z.array(z.number()).optional(),
  shuffleQuestions: z.boolean().default(true),
  isRequired: z.boolean().default(true)
});

const proctorSettingsSchema = z.object({
  enabled: z.boolean().default(false),
  webcamRequired: z.boolean().default(false),
  screenShareRequired: z.boolean().default(false),
  tabSwitchDetection: z.boolean().default(true),
  copyPasteDisabled: z.boolean().default(true),
  fullScreenRequired: z.boolean().default(false),
  maxWarnings: z.number().default(3)
});

const randomizationSchema = z.object({
  shuffleQuestions: z.boolean().default(true),
  shuffleOptions: z.boolean().default(true),
  questionPoolSize: z.number().optional(), // If set, randomly select from larger pool
  seedByUser: z.boolean().default(true) // Same order for same user
});

const weightingSchema = z.object({
  byDifficulty: z.record(z.string(), z.number()).optional(),
  bySection: z.record(z.string(), z.number()).optional(),
  byQuestionType: z.record(z.string(), z.number()).optional()
});

export const assessmentBuilderRouter = router({
  // ============================================================================
  // ASSESSMENT CRUD
  // ============================================================================

  getAllAssessments: protectedProcedure
    .input(z.object({
      category: z.string().optional(),
      status: z.string().optional(),
      limit: z.number().default(50),
      offset: z.number().default(0)
    }))
    .query(async ({ input }) => {
      const database = await getDb();
      if (!database) return { assessments: [], total: 0 };
      
      const assessments = await database
        .select()
        .from(assessmentBuilder)
        .orderBy(desc(assessmentBuilder.createdAt))
        .limit(input.limit)
        .offset(input.offset);
      
      return { assessments, total: assessments.length };
    }),

  getAssessmentById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const database = await getDb();
      if (!database) return null;
      
      const [assessment] = await database
        .select()
        .from(assessmentBuilder)
        .where(eq(assessmentBuilder.id, input.id));
      
      if (!assessment) return null;

      // Get linked questions
      const links = await database
        .select()
        .from(assessmentQuestionLinks)
        .where(eq(assessmentQuestionLinks.assessmentId, input.id))
        .orderBy(assessmentQuestionLinks.sectionIndex, assessmentQuestionLinks.orderIndex);

      // Get question details
      const questionIds = links.map(l => l.questionId);
      let questions: any[] = [];
      if (questionIds.length > 0) {
        questions = await database
          .select()
          .from(generatedQuestionsBank)
          .where(sql`${generatedQuestionsBank.id} IN (${sql.join(questionIds.map(id => sql`${id}`), sql`, `)})`);
      }

      return {
        ...assessment,
        linkedQuestions: links.map(link => ({
          ...link,
          question: questions.find(q => q.id === link.questionId)
        }))
      };
    }),

  createAssessment: adminProcedure
    .input(z.object({
      title: z.string().min(1),
      code: z.string().min(1),
      category: z.enum(["psychometric", "competency", "cognitive", "skills", "behavioral", "leadership", "custom"]),
      description: z.string().optional(),
      instructions: z.string().optional(),
      frameworkId: z.number().optional(),
      aiConfigId: z.number().optional(),
      sections: z.array(sectionSchema).optional(),
      totalDuration: z.number().optional(),
      sectionTimeLimits: z.record(z.string(), z.number()).optional(),
      totalQuestions: z.number().min(1),
      questionDistribution: z.any().optional(),
      randomization: randomizationSchema.optional(),
      proctorSettings: proctorSettingsSchema.optional(),
      scoringMethod: z.string().optional(),
      passingScore: z.number().optional(),
      weightingScheme: weightingSchema.optional(),
      showResults: z.boolean().default(true),
      showCorrectAnswers: z.boolean().default(false),
      generateReport: z.boolean().default(true),
      availableFrom: z.date().optional(),
      availableUntil: z.date().optional(),
      maxAttempts: z.number().default(1)
    }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");

      const [result] = await database.insert(assessmentBuilder).values({
        ...input,
        status: "draft",
        createdBy: ctx.user.id
      }).returning({ id: assessmentBuilder.id });

      return { id: result.id };
    }),

  updateAssessment: adminProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().optional(),
      description: z.string().optional(),
      instructions: z.string().optional(),
      frameworkId: z.number().optional(),
      aiConfigId: z.number().optional(),
      sections: z.array(sectionSchema).optional(),
      totalDuration: z.number().optional(),
      sectionTimeLimits: z.record(z.string(), z.number()).optional(),
      totalQuestions: z.number().optional(),
      questionDistribution: z.any().optional(),
      randomization: randomizationSchema.optional(),
      proctorSettings: proctorSettingsSchema.optional(),
      scoringMethod: z.string().optional(),
      passingScore: z.number().optional(),
      weightingScheme: weightingSchema.optional(),
      showResults: z.boolean().optional(),
      showCorrectAnswers: z.boolean().optional(),
      generateReport: z.boolean().optional(),
      availableFrom: z.date().optional(),
      availableUntil: z.date().optional(),
      maxAttempts: z.number().optional(),
      status: z.string().optional()
    }))
    .mutation(async ({ input }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      
      const { id, ...data } = input;
      await database.update(assessmentBuilder).set({
        ...data,
        updatedAt: new Date()
      }).where(eq(assessmentBuilder.id, id));

      return { success: true };
    }),

  deleteAssessment: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");

      // Delete linked questions first
      await database.delete(assessmentQuestionLinks).where(eq(assessmentQuestionLinks.assessmentId, input.id));
      
      // Delete assessment
      await database.delete(assessmentBuilder).where(eq(assessmentBuilder.id, input.id));

      return { success: true };
    }),

  // ============================================================================
  // QUESTION LINKING
  // ============================================================================

  linkQuestionsToAssessment: adminProcedure
    .input(z.object({
      assessmentId: z.number(),
      questionLinks: z.array(z.object({
        questionId: z.number(),
        sectionIndex: z.number().default(0),
        orderIndex: z.number(),
        isRequired: z.boolean().default(true),
        weight: z.number().default(1)
      }))
    }))
    .mutation(async ({ input }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");

      // Remove existing links
      await database.delete(assessmentQuestionLinks).where(eq(assessmentQuestionLinks.assessmentId, input.assessmentId));

      // Add new links
      if (input.questionLinks.length > 0) {
        await database.insert(assessmentQuestionLinks).values(
          input.questionLinks.map(link => ({
            assessmentId: input.assessmentId,
            questionId: link.questionId,
            sectionIndex: link.sectionIndex,
            orderIndex: link.orderIndex,
            isRequired: link.isRequired,
            weight: link.weight.toString()
          }))
        );
      }

      return { success: true, linkedCount: input.questionLinks.length };
    }),

  addQuestionToAssessment: adminProcedure
    .input(z.object({
      assessmentId: z.number(),
      questionId: z.number(),
      sectionIndex: z.number().default(0),
      orderIndex: z.number().optional(),
      isRequired: z.boolean().default(true),
      weight: z.number().default(1)
    }))
    .mutation(async ({ input }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");

      // Get max order index if not provided
      let orderIndex = input.orderIndex;
      if (orderIndex === undefined) {
        const maxOrder = await database
          .select({ max: sql<number>`MAX(${assessmentQuestionLinks.orderIndex})` })
          .from(assessmentQuestionLinks)
          .where(
            and(
              eq(assessmentQuestionLinks.assessmentId, input.assessmentId),
              eq(assessmentQuestionLinks.sectionIndex, input.sectionIndex)
            )
          );
        orderIndex = (maxOrder[0]?.max || 0) + 1;
      }

      await database.insert(assessmentQuestionLinks).values({
        assessmentId: input.assessmentId,
        questionId: input.questionId,
        sectionIndex: input.sectionIndex,
        orderIndex,
        isRequired: input.isRequired,
        weight: input.weight.toString()
      });

      return { success: true };
    }),

  removeQuestionFromAssessment: adminProcedure
    .input(z.object({
      assessmentId: z.number(),
      questionId: z.number()
    }))
    .mutation(async ({ input }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");

      await database.delete(assessmentQuestionLinks).where(
        and(
          eq(assessmentQuestionLinks.assessmentId, input.assessmentId),
          eq(assessmentQuestionLinks.questionId, input.questionId)
        )
      );

      return { success: true };
    }),

  reorderQuestions: adminProcedure
    .input(z.object({
      assessmentId: z.number(),
      questionOrders: z.array(z.object({
        questionId: z.number(),
        sectionIndex: z.number(),
        orderIndex: z.number()
      }))
    }))
    .mutation(async ({ input }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");

      for (const order of input.questionOrders) {
        await database.update(assessmentQuestionLinks).set({
          sectionIndex: order.sectionIndex,
          orderIndex: order.orderIndex
        }).where(
          and(
            eq(assessmentQuestionLinks.assessmentId, input.assessmentId),
            eq(assessmentQuestionLinks.questionId, order.questionId)
          )
        );
      }

      return { success: true };
    }),

  // ============================================================================
  // PUBLISHING & SCHEDULING
  // ============================================================================

  publishAssessment: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");

      // Validate assessment has questions
      const links = await database
        .select()
        .from(assessmentQuestionLinks)
        .where(eq(assessmentQuestionLinks.assessmentId, input.id));

      if (links.length === 0) {
        throw new Error("Cannot publish assessment without questions");
      }

      await database.update(assessmentBuilder).set({
        status: "published",
        publishedAt: new Date(),
        updatedAt: new Date()
      }).where(eq(assessmentBuilder.id, input.id));

      return { success: true };
    }),

  unpublishAssessment: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");

      await database.update(assessmentBuilder).set({
        status: "draft",
        updatedAt: new Date()
      }).where(eq(assessmentBuilder.id, input.id));

      return { success: true };
    }),

  archiveAssessment: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");

      await database.update(assessmentBuilder).set({
        status: "archived",
        updatedAt: new Date()
      }).where(eq(assessmentBuilder.id, input.id));

      return { success: true };
    }),

  // ============================================================================
  // DUPLICATION & TEMPLATES
  // ============================================================================

  duplicateAssessment: adminProcedure
    .input(z.object({
      id: z.number(),
      newTitle: z.string(),
      newCode: z.string()
    }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");

      // Get original assessment
      const [original] = await database
        .select()
        .from(assessmentBuilder)
        .where(eq(assessmentBuilder.id, input.id));

      if (!original) throw new Error("Assessment not found");

      // Create duplicate
      const [newAssessment] = await database.insert(assessmentBuilder).values({
        ...original,
        id: undefined,
        title: input.newTitle,
        code: input.newCode,
        status: "draft",
        publishedAt: null,
        createdBy: ctx.user.id,
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning({ id: assessmentBuilder.id });

      // Duplicate question links
      const links = await database
        .select()
        .from(assessmentQuestionLinks)
        .where(eq(assessmentQuestionLinks.assessmentId, input.id));

      if (links.length > 0) {
        await database.insert(assessmentQuestionLinks).values(
          links.map(link => ({
            ...link,
            id: undefined,
            assessmentId: newAssessment.id,
            createdAt: new Date()
          }))
        );
      }

      return { id: newAssessment.id };
    }),

  // ============================================================================
  // ANALYTICS
  // ============================================================================

  getAssessmentStats: adminProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const database = await getDb();
      if (!database) return null;

      const links = await database
        .select()
        .from(assessmentQuestionLinks)
        .where(eq(assessmentQuestionLinks.assessmentId, input.id));

      const questionIds = links.map(l => l.questionId);
      let questions: any[] = [];
      if (questionIds.length > 0) {
        questions = await database
          .select()
          .from(generatedQuestionsBank)
          .where(sql`${generatedQuestionsBank.id} IN (${sql.join(questionIds.map(id => sql`${id}`), sql`, `)})`);
      }

      // Calculate stats
      const byType = questions.reduce((acc, q) => {
        acc[q.questionType] = (acc[q.questionType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const byDifficulty = questions.reduce((acc, q) => {
        acc[q.difficulty || 'unknown'] = (acc[q.difficulty || 'unknown'] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const byDimension = questions.reduce((acc, q) => {
        acc[q.dimension || 'unknown'] = (acc[q.dimension || 'unknown'] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        totalQuestions: questions.length,
        totalSections: new Set(links.map(l => l.sectionIndex)).size,
        byQuestionType: byType,
        byDifficulty,
        byDimension,
        estimatedDuration: questions.reduce((sum, q) => sum + (q.estimatedTime || 60), 0) / 60, // minutes
        totalPoints: questions.reduce((sum, q) => sum + (q.points || 1), 0)
      };
    })
});
