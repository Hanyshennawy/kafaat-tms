/**
 * MODULE 10: EDUCATOR PSYCHOMETRIC ASSESSMENTS ROUTER
 * 
 * Manages psychometric tests, personality assessments, and cognitive ability evaluations.
 */

import { z } from "zod";
import { eq, desc, and } from "drizzle-orm";
import { router, protectedProcedure, adminProcedure } from "../_core/trpc";
import { getDb } from "../db";
import {
  psychometricTestTypes,
  psychometricQuestions,
  psychometricOptions,
  psychometricAssessments,
  psychometricResponses,
  psychometricResults,
} from "../../drizzle/schema";

export const psychometricRouter = router({
  // ============================================================================
  // TEST TYPES
  // ============================================================================

  getAllTestTypes: protectedProcedure.query(async () => {
    const database = await getDb();
    if (!database) return [];
    return await database.select().from(psychometricTestTypes).orderBy(psychometricTestTypes.name);
  }),

  getTestTypeById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const database = await getDb();
      if (!database) return null;
      const [testType] = await database
        .select()
        .from(psychometricTestTypes)
        .where(eq(psychometricTestTypes.id, input.id));
      return testType || null;
    }),

  createTestType: adminProcedure
    .input(z.object({
      name: z.string().min(1),
      category: z.enum(["personality", "cognitive", "aptitude", "emotional_intelligence", "leadership", "team_dynamics"]),
      description: z.string().optional(),
      duration: z.number().optional(),
      instructions: z.string().optional(),
      scoringMethod: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      const [result] = await database.insert(psychometricTestTypes).values({
        ...input,
        category: input.category as any, // Map to schema enum
        scoringMethod: (input.scoringMethod || "likert_scale") as any,
      });
      return { id: result.insertId };
    }),

  updateTestType: adminProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      description: z.string().optional(),
      duration: z.number().optional(),
      instructions: z.string().optional(),
      status: z.enum(["draft", "active", "archived"]).optional(),
    }))
    .mutation(async ({ input }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      const { id, status, ...data } = input;
      // Map status if provided, ensuring compatibility with schema enum
      const updateData: any = { ...data };
      if (status) {
        updateData.status = status === 'archived' ? 'inactive' : status;
      }
      await database.update(psychometricTestTypes).set(updateData).where(eq(psychometricTestTypes.id, id));
      return { success: true };
    }),

  // ============================================================================
  // QUESTIONS
  // ============================================================================

  getQuestionsByTestType: protectedProcedure
    .input(z.object({ testTypeId: z.number() }))
    .query(async ({ input }) => {
      const database = await getDb();
      if (!database) return [];
      return await database
        .select()
        .from(psychometricQuestions)
        .where(eq(psychometricQuestions.testTypeId, input.testTypeId))
        .orderBy(psychometricQuestions.orderIndex);
    }),

  createQuestion: adminProcedure
    .input(z.object({
      testTypeId: z.number(),
      questionText: z.string().min(1),
      questionType: z.enum(["likert", "multiple_choice", "true_false", "rating"]),
      dimension: z.string().optional(),
      traitMeasured: z.string().optional(),
      orderIndex: z.number(),
      isReverseCoded: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      const [result] = await database.insert(psychometricQuestions).values(input);
      return { id: result.insertId };
    }),

  // ============================================================================
  // OPTIONS
  // ============================================================================

  getOptionsByQuestion: protectedProcedure
    .input(z.object({ questionId: z.number() }))
    .query(async ({ input }) => {
      const database = await getDb();
      if (!database) return [];
      return await database
        .select()
        .from(psychometricOptions)
        .where(eq(psychometricOptions.questionId, input.questionId))
        .orderBy(psychometricOptions.orderIndex);
    }),

  createOption: adminProcedure
    .input(z.object({
      questionId: z.number(),
      optionText: z.string().min(1),
      scoreValue: z.number(),
      orderIndex: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      const [result] = await database.insert(psychometricOptions).values({
        ...input,
        orderIndex: input.orderIndex ?? 0,
      });
      return { id: result.insertId };
    }),

  // ============================================================================
  // ASSESSMENTS
  // ============================================================================

  getMyAssessments: protectedProcedure.query(async ({ ctx }) => {
    const database = await getDb();
    if (!database) return [];
    return await database
      .select()
      .from(psychometricAssessments)
      .where(eq(psychometricAssessments.educatorId, ctx.user.id))
      .orderBy(desc(psychometricAssessments.startedAt));
  }),

  getAssessmentById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const database = await getDb();
      if (!database) return null;
      const [assessment] = await database
        .select()
        .from(psychometricAssessments)
        .where(eq(psychometricAssessments.id, input.id));
      return assessment || null;
    }),

  getAvailableAssessments: protectedProcedure.query(async ({ ctx }) => {
    const database = await getDb();
    if (!database) return [];
    
    // Get all active test types
    const testTypes = await database
      .select()
      .from(psychometricTestTypes)
      .where(eq(psychometricTestTypes.status, "active"));

    // Get user's completed assessments
    const completed = await database
      .select()
      .from(psychometricAssessments)
      .where(
        and(
          eq(psychometricAssessments.educatorId, ctx.user.id),
          eq(psychometricAssessments.status, "completed")
        )
      );

    const completedTypeIds = completed.map(c => c.testTypeId);
    
    // Filter out completed ones (unless retake is allowed)
    return testTypes.filter(t => !completedTypeIds.includes(t.id));
  }),

  startAssessment: protectedProcedure
    .input(z.object({ testTypeId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      
      // Check if there's already an in-progress assessment
      const [existing] = await database
        .select()
        .from(psychometricAssessments)
        .where(
          and(
            eq(psychometricAssessments.educatorId, ctx.user.id),
            eq(psychometricAssessments.testTypeId, input.testTypeId),
            eq(psychometricAssessments.status, "in_progress")
          )
        );

      if (existing) {
        return { id: existing.id, resumed: true };
      }

      const [result] = await database.insert(psychometricAssessments).values({
        educatorId: ctx.user.id,
        testTypeId: input.testTypeId,
        status: "in_progress",
        startedAt: new Date(),
      });
      return { id: result.insertId, resumed: false };
    }),

  submitResponse: protectedProcedure
    .input(z.object({
      assessmentId: z.number(),
      questionId: z.number(),
      selectedOptionId: z.number().optional(),
      responseValue: z.number().optional(),
      textResponse: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");

      // Check if response already exists
      const [existing] = await database
        .select()
        .from(psychometricResponses)
        .where(
          and(
            eq(psychometricResponses.assessmentId, input.assessmentId),
            eq(psychometricResponses.questionId, input.questionId)
          )
        );

      if (existing) {
        await database.update(psychometricResponses).set({
          selectedOptionId: input.selectedOptionId,
          responseValue: input.responseValue,
          // textResponse not in schema - store in responseValue if needed
        }).where(eq(psychometricResponses.id, existing.id));
        return { id: existing.id, updated: true };
      }

      const [result] = await database.insert(psychometricResponses).values(input);
      return { id: result.insertId, updated: false };
    }),

  completeAssessment: protectedProcedure
    .input(z.object({ assessmentId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");

      // Get assessment
      const [assessment] = await database
        .select()
        .from(psychometricAssessments)
        .where(eq(psychometricAssessments.id, input.assessmentId));

      if (!assessment) throw new Error("Assessment not found");

      // Get all responses
      const responses = await database
        .select()
        .from(psychometricResponses)
        .where(eq(psychometricResponses.assessmentId, input.assessmentId));

      // Get questions with their details
      const questions = await database
        .select()
        .from(psychometricQuestions)
        .where(eq(psychometricQuestions.testTypeId, assessment.testTypeId));

      // Calculate scores by dimension/trait
      const scores: Record<string, { total: number; count: number }> = {};
      
      for (const response of responses) {
        const question = questions.find(q => q.id === response.questionId);
        if (question && question.dimension) {
          if (!scores[question.dimension]) {
            scores[question.dimension] = { total: 0, count: 0 };
          }
          const value = response.responseValue || 0;
          scores[question.dimension].total += question.isReverseCoded ? (6 - value) : value;
          scores[question.dimension].count++;
        }
      }

      // Calculate overall score
      const totalScore = Object.values(scores).reduce((sum, s) => sum + s.total, 0);
      const maxScore = Object.values(scores).reduce((sum, s) => sum + s.count * 5, 0); // Assuming 5-point scale
      const percentile = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

      // Update assessment
      await database.update(psychometricAssessments).set({
        status: "completed",
        completedAt: new Date(),
      }).where(eq(psychometricAssessments.id, input.assessmentId));

      // Create result
      const dimensionScores = Object.entries(scores).reduce((acc, [dim, s]) => {
        acc[dim] = s.count > 0 ? Math.round((s.total / (s.count * 5)) * 100) : 0;
        return acc;
      }, {} as Record<string, number>);

      const [result] = await database.insert(psychometricResults).values({
        assessmentId: input.assessmentId,
        educatorId: ctx.user.id,
        testTypeId: assessment.testTypeId,
        overallScore: percentile,
        percentileRank: percentile,
        interpretation: generateInterpretation(dimensionScores),
        strengths: JSON.stringify(dimensionScores), // Store dimension scores in strengths field
        recommendations: generateRecommendations(dimensionScores),
      });

      return { resultId: result.insertId, score: percentile };
    }),

  // ============================================================================
  // RESULTS
  // ============================================================================

  getMyResults: protectedProcedure.query(async ({ ctx }) => {
    const database = await getDb();
    if (!database) return [];

    const assessments = await database
      .select()
      .from(psychometricAssessments)
      .where(
        and(
          eq(psychometricAssessments.educatorId, ctx.user.id),
          eq(psychometricAssessments.status, "completed")
        )
      );

    const results = [];
    for (const assessment of assessments) {
      const [result] = await database
        .select()
        .from(psychometricResults)
        .where(eq(psychometricResults.assessmentId, assessment.id));
      if (result) {
        results.push({ ...result, assessment });
      }
    }

    return results;
  }),

  getResultById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const database = await getDb();
      if (!database) return null;
      const [result] = await database
        .select()
        .from(psychometricResults)
        .where(eq(psychometricResults.id, input.id));
      return result || null;
    }),

  getResultByAssessment: protectedProcedure
    .input(z.object({ assessmentId: z.number() }))
    .query(async ({ input }) => {
      const database = await getDb();
      if (!database) return null;
      const [result] = await database
        .select()
        .from(psychometricResults)
        .where(eq(psychometricResults.assessmentId, input.assessmentId));
      return result || null;
    }),

  // ============================================================================
  // PERSONALITY PROFILE
  // ============================================================================

  getPersonalityProfile: protectedProcedure.query(async ({ ctx }) => {
    const database = await getDb();
    if (!database) return null;

    // Get personality assessment results
    const personalityTests = await database
      .select()
      .from(psychometricTestTypes)
      .where(eq(psychometricTestTypes.category, "personality"));

    const personalityTypeIds = personalityTests.map(t => t.id);

    const assessments = await database
      .select()
      .from(psychometricAssessments)
      .where(eq(psychometricAssessments.educatorId, ctx.user.id));

    const personalityAssessments = assessments.filter(a => personalityTypeIds.includes(a.testTypeId));

    if (personalityAssessments.length === 0) return null;

    const latestAssessment = personalityAssessments.sort((a, b) => 
      (b.completedAt?.getTime() || 0) - (a.completedAt?.getTime() || 0)
    )[0];

    const [result] = await database
      .select()
      .from(psychometricResults)
      .where(eq(psychometricResults.assessmentId, latestAssessment.id));

    return {
      assessment: latestAssessment,
      result,
      traits: result?.strengths ? JSON.parse(result.strengths as string) : {},
    };
  }),

  // ============================================================================
  // COGNITIVE ABILITY
  // ============================================================================

  getCognitiveAbility: protectedProcedure.query(async ({ ctx }) => {
    const database = await getDb();
    if (!database) return null;

    const cognitiveTests = await database
      .select()
      .from(psychometricTestTypes)
      .where(eq(psychometricTestTypes.category, "cognitive"));

    const cognitiveTypeIds = cognitiveTests.map(t => t.id);

    const assessments = await database
      .select()
      .from(psychometricAssessments)
      .where(eq(psychometricAssessments.educatorId, ctx.user.id));

    const cognitiveAssessments = assessments.filter(a => cognitiveTypeIds.includes(a.testTypeId));

    if (cognitiveAssessments.length === 0) return null;

    const latestAssessment = cognitiveAssessments.sort((a, b) => 
      (b.completedAt?.getTime() || 0) - (a.completedAt?.getTime() || 0)
    )[0];

    const [result] = await database
      .select()
      .from(psychometricResults)
      .where(eq(psychometricResults.assessmentId, latestAssessment.id));

    return {
      assessment: latestAssessment,
      result,
      abilities: result?.strengths ? JSON.parse(result.strengths as string) : {},
    };
  }),

  // ============================================================================
  // ANALYTICS
  // ============================================================================

  getAssessmentAnalytics: adminProcedure.query(async () => {
    const database = await getDb();
    if (!database) return null;

    const assessments = await database.select().from(psychometricAssessments);
    const results = await database.select().from(psychometricResults);
    const testTypes = await database.select().from(psychometricTestTypes);

    const stats = {
      totalAssessments: assessments.length,
      completedAssessments: assessments.filter(a => a.status === "completed").length,
      inProgressAssessments: assessments.filter(a => a.status === "in_progress").length,
      averageScore: results.length > 0 
        ? Math.round(results.reduce((sum, r) => sum + (r.overallScore || 0), 0) / results.length)
        : 0,
      byTestType: testTypes.map(tt => ({
        id: tt.id,
        name: tt.name,
        category: tt.category,
        count: assessments.filter(a => a.testTypeId === tt.id).length,
        completedCount: assessments.filter(a => a.testTypeId === tt.id && a.status === "completed").length,
      })),
    };

    return stats;
  }),
});

// Helper functions
function generateInterpretation(scores: Record<string, number>): string {
  const interpretations: string[] = [];
  
  for (const [dimension, score] of Object.entries(scores)) {
    if (score >= 80) {
      interpretations.push(`Strong ${dimension.toLowerCase()}`);
    } else if (score >= 60) {
      interpretations.push(`Moderate ${dimension.toLowerCase()}`);
    } else if (score >= 40) {
      interpretations.push(`Developing ${dimension.toLowerCase()}`);
    } else {
      interpretations.push(`Area for growth: ${dimension.toLowerCase()}`);
    }
  }
  
  return interpretations.join(". ") + ".";
}

function generateRecommendations(scores: Record<string, number>): string {
  const recommendations: string[] = [];
  
  for (const [dimension, score] of Object.entries(scores)) {
    if (score < 60) {
      recommendations.push(`Consider professional development in ${dimension.toLowerCase()}`);
    }
  }
  
  if (recommendations.length === 0) {
    recommendations.push("Continue maintaining your strong performance across all dimensions");
  }
  
  return recommendations.join(". ") + ".";
}
