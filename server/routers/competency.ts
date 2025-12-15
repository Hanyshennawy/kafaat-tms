/**
 * MODULE 8: EDUCATOR'S COMPETENCY ASSESSMENTS ROUTER
 * 
 * Manages competency frameworks, standards, assessments, and development plans.
 */

import { z } from "zod";
import { eq, desc, and } from "drizzle-orm";
import { router, protectedProcedure, adminProcedure } from "../_core/trpc";
import { getDb } from "../db";
import {
  competencyFrameworks,
  competencyStandards,
  educatorCompetencies,
  competencyAssessments,
  assessmentRubrics,
  assessmentEvidence,
  competencyDevelopmentPlans,
} from "../../drizzle/schema";

export const competencyRouter = router({
  // ============================================================================
  // COMPETENCY FRAMEWORKS
  // ============================================================================

  getAllFrameworks: protectedProcedure.query(async () => {
    const database = await getDb();
    if (!database) return [];
    return await database.select().from(competencyFrameworks).orderBy(desc(competencyFrameworks.createdAt));
  }),

  getFrameworkById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const database = await getDb();
      if (!database) return null;
      const [framework] = await database
        .select()
        .from(competencyFrameworks)
        .where(eq(competencyFrameworks.id, input.id));
      return framework || null;
    }),

  createFramework: adminProcedure
    .input(z.object({
      name: z.string().min(1),
      description: z.string().optional(),
      version: z.string().optional(),
      effectiveDate: z.date().optional(),
      expiryDate: z.date().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      const [result] = await database.insert(competencyFrameworks).values({
        ...input,
        createdBy: ctx.user.id,
      });
      return { id: result.insertId };
    }),

  updateFramework: adminProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      description: z.string().optional(),
      version: z.string().optional(),
      status: z.enum(["draft", "active", "archived"]).optional(),
      effectiveDate: z.date().optional(),
      expiryDate: z.date().optional(),
    }))
    .mutation(async ({ input }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      const { id, ...data } = input;
      await database.update(competencyFrameworks).set(data).where(eq(competencyFrameworks.id, id));
      return { success: true };
    }),

  // ============================================================================
  // COMPETENCY STANDARDS
  // ============================================================================

  getStandardsByFramework: protectedProcedure
    .input(z.object({ frameworkId: z.number() }))
    .query(async ({ input }) => {
      const database = await getDb();
      if (!database) return [];
      return await database
        .select()
        .from(competencyStandards)
        .where(eq(competencyStandards.frameworkId, input.frameworkId))
        .orderBy(competencyStandards.sortOrder);
    }),

  createStandard: adminProcedure
    .input(z.object({
      frameworkId: z.number(),
      code: z.string().min(1),
      name: z.string().min(1),
      description: z.string().optional(),
      category: z.string().optional(),
      level: z.enum(["foundation", "intermediate", "advanced", "expert"]),
      weight: z.number().optional(),
      criteria: z.string().optional(),
      evidenceRequirements: z.string().optional(),
      parentId: z.number().optional(),
      sortOrder: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      const [result] = await database.insert(competencyStandards).values(input);
      return { id: result.insertId };
    }),

  // ============================================================================
  // EDUCATOR COMPETENCIES
  // ============================================================================

  getEducatorCompetencies: protectedProcedure
    .input(z.object({ educatorId: z.number() }))
    .query(async ({ input }) => {
      const database = await getDb();
      if (!database) return [];
      return await database
        .select()
        .from(educatorCompetencies)
        .where(eq(educatorCompetencies.educatorId, input.educatorId));
    }),

  getMyCompetencies: protectedProcedure.query(async ({ ctx }) => {
    const database = await getDb();
    if (!database) return [];
    return await database
      .select()
      .from(educatorCompetencies)
      .where(eq(educatorCompetencies.educatorId, ctx.user.id));
  }),

  updateEducatorCompetency: protectedProcedure
    .input(z.object({
      id: z.number(),
      currentLevel: z.enum(["not_started", "developing", "proficient", "advanced", "expert"]).optional(),
      targetLevel: z.enum(["developing", "proficient", "advanced", "expert"]).optional(),
      status: z.enum(["in_progress", "achieved", "expired", "under_review"]).optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      const { id, ...data } = input;
      await database.update(educatorCompetencies).set(data).where(eq(educatorCompetencies.id, id));
      return { success: true };
    }),

  // ============================================================================
  // COMPETENCY ASSESSMENTS
  // ============================================================================

  getAssessments: protectedProcedure
    .input(z.object({ educatorId: z.number().optional() }))
    .query(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) return [];
      const educatorId = input.educatorId || ctx.user.id;
      return await database
        .select()
        .from(competencyAssessments)
        .where(eq(competencyAssessments.educatorId, educatorId))
        .orderBy(desc(competencyAssessments.assessmentDate));
    }),

  createAssessment: protectedProcedure
    .input(z.object({
      educatorId: z.number(),
      standardId: z.number(),
      assessmentType: z.enum(["self_assessment", "peer_review", "supervisor_review", "external_assessment", "portfolio_review"]),
      assessmentDate: z.date(),
      score: z.number().min(0).max(100).optional(),
      level: z.enum(["not_demonstrated", "developing", "proficient", "advanced", "expert"]).optional(),
      strengths: z.string().optional(),
      areasForImprovement: z.string().optional(),
      recommendations: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      const [result] = await database.insert(competencyAssessments).values({
        ...input,
        assessorId: ctx.user.id,
      });
      return { id: result.insertId };
    }),

  completeAssessment: protectedProcedure
    .input(z.object({
      id: z.number(),
      score: z.number().min(0).max(100),
      level: z.enum(["not_demonstrated", "developing", "proficient", "advanced", "expert"]),
      strengths: z.string().optional(),
      areasForImprovement: z.string().optional(),
      recommendations: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      const { id, ...data } = input;
      await database.update(competencyAssessments).set({
        ...data,
        status: "completed",
      }).where(eq(competencyAssessments.id, id));
      return { success: true };
    }),

  verifyAssessment: adminProcedure
    .input(z.object({
      id: z.number(),
      verified: z.boolean(),
    }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      await database.update(competencyAssessments).set({
        status: input.verified ? "verified" : "rejected",
        verifiedBy: ctx.user.id,
        verifiedDate: new Date(),
      }).where(eq(competencyAssessments.id, input.id));
      return { success: true };
    }),

  // ============================================================================
  // ASSESSMENT EVIDENCE
  // ============================================================================

  getEvidence: protectedProcedure
    .input(z.object({ assessmentId: z.number() }))
    .query(async ({ input }) => {
      const database = await getDb();
      if (!database) return [];
      return await database
        .select()
        .from(assessmentEvidence)
        .where(eq(assessmentEvidence.assessmentId, input.assessmentId));
    }),

  uploadEvidence: protectedProcedure
    .input(z.object({
      assessmentId: z.number(),
      evidenceType: z.enum(["document", "video", "observation", "artifact", "testimony", "certificate"]),
      title: z.string().min(1),
      description: z.string().optional(),
      fileUrl: z.string().optional(),
      fileType: z.string().optional(),
      fileSize: z.number().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      const [result] = await database.insert(assessmentEvidence).values({
        ...input,
        uploadedBy: ctx.user.id,
      });
      return { id: result.insertId };
    }),

  verifyEvidence: adminProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["verified", "rejected"]),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      await database.update(assessmentEvidence).set({
        verificationStatus: input.status,
        verifiedBy: ctx.user.id,
        verifiedDate: new Date(),
        notes: input.notes,
      }).where(eq(assessmentEvidence.id, input.id));
      return { success: true };
    }),

  // ============================================================================
  // DEVELOPMENT PLANS
  // ============================================================================

  getDevelopmentPlans: protectedProcedure
    .input(z.object({ educatorId: z.number().optional() }))
    .query(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) return [];
      const educatorId = input.educatorId || ctx.user.id;
      return await database
        .select()
        .from(competencyDevelopmentPlans)
        .where(eq(competencyDevelopmentPlans.educatorId, educatorId))
        .orderBy(desc(competencyDevelopmentPlans.createdAt));
    }),

  createDevelopmentPlan: protectedProcedure
    .input(z.object({
      standardId: z.number(),
      currentLevel: z.enum(["not_started", "developing", "proficient", "advanced", "expert"]),
      targetLevel: z.enum(["developing", "proficient", "advanced", "expert"]),
      targetDate: z.date().optional(),
      activities: z.string().optional(),
      resources: z.string().optional(),
      milestones: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      const [result] = await database.insert(competencyDevelopmentPlans).values({
        ...input,
        educatorId: ctx.user.id,
      });
      return { id: result.insertId };
    }),

  updateDevelopmentPlan: protectedProcedure
    .input(z.object({
      id: z.number(),
      targetLevel: z.enum(["developing", "proficient", "advanced", "expert"]).optional(),
      targetDate: z.date().optional(),
      activities: z.string().optional(),
      resources: z.string().optional(),
      milestones: z.string().optional(),
      status: z.enum(["draft", "active", "completed", "cancelled"]).optional(),
      progress: z.number().min(0).max(100).optional(),
    }))
    .mutation(async ({ input }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      const { id, ...data } = input;
      await database.update(competencyDevelopmentPlans).set(data).where(eq(competencyDevelopmentPlans.id, id));
      return { success: true };
    }),

  // ============================================================================
  // ASSESSMENT RUBRICS
  // ============================================================================

  getRubrics: protectedProcedure
    .input(z.object({ standardId: z.number() }))
    .query(async ({ input }) => {
      const database = await getDb();
      if (!database) return [];
      return await database
        .select()
        .from(assessmentRubrics)
        .where(eq(assessmentRubrics.standardId, input.standardId));
    }),

  createRubric: adminProcedure
    .input(z.object({
      standardId: z.number(),
      name: z.string().min(1),
      description: z.string().optional(),
      criteria: z.string().optional(),
      maxScore: z.number().optional(),
      passingScore: z.number().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      const [result] = await database.insert(assessmentRubrics).values({
        ...input,
        createdBy: ctx.user.id,
      });
      return { id: result.insertId };
    }),
});
