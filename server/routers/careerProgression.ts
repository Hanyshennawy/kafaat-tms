import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import { getDb } from "../db";
import * as schema from "../../drizzle/schema";
import { eq, and, desc, sql } from "drizzle-orm";

export const careerProgressionRouter = router({
  // Get all career paths
  listCareerPaths: publicProcedure
    .input(z.object({
      departmentId: z.number().optional(),
      status: z.enum(["draft", "published", "archived"]).optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      let query = db.select().from(schema.careerPaths);
      
      if (input?.departmentId) {
        query = query.where(eq(schema.careerPaths.departmentId, input.departmentId)) as any;
      }
      
      if (input?.status) {
        query = query.where(eq(schema.careerPaths.status, input.status)) as any;
      }

      const paths = await query.orderBy(desc(schema.careerPaths.createdAt));
      return paths;
    }),

  // Get career path by ID with steps
  getCareerPath: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const path = await db.select().from(schema.careerPaths)
        .where(eq(schema.careerPaths.id, input.id))
        .limit(1);

      if (!path.length) throw new Error("Career path not found");

      const steps = await db.select().from(schema.careerPathSteps)
        .where(eq(schema.careerPathSteps.careerPathId, input.id))
        .orderBy(schema.careerPathSteps.position);

      return {
        ...path[0],
        steps,
      };
    }),

  // Get employee's current career path and progress
  getMyCareerPath: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get employee's current position
      const employee = await db.select().from(schema.users)
        .where(eq(schema.users.id, ctx.user.id))
        .limit(1);

      if (!employee.length || !employee[0].positionId) {
        return null;
      }

      // Find career paths that include this position
      const paths = await db.select().from(schema.careerPaths)
        .where(eq(schema.careerPaths.status, "published"));

      // Get recommendations for this employee
      const recommendations = await db.select().from(schema.careerRecommendations)
        .where(eq(schema.careerRecommendations.employeeId, ctx.user.id))
        .orderBy(desc(schema.careerRecommendations.aiScore))
        .limit(3);

      return {
        currentPosition: employee[0].positionId,
        availablePaths: paths,
        recommendations,
      };
    }),

  // Get all skills
  listSkills: publicProcedure
    .input(z.object({
      category: z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      let query = db.select().from(schema.skills);
      
      if (input?.category) {
        query = query.where(eq(schema.skills.category, input.category)) as any;
      }

      return await query;
    }),

  // Get employee skills with gap analysis
  getMySkills: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get employee's current skills
      const employeeSkills = await db.select({
        id: schema.employeeSkills.id,
        skillId: schema.employeeSkills.skillId,
        skillName: schema.skills.name,
        skillCategory: schema.skills.category,
        proficiencyLevel: schema.employeeSkills.proficiencyLevel,
        verifiedAt: schema.employeeSkills.verifiedAt,
      })
      .from(schema.employeeSkills)
      .leftJoin(schema.skills, eq(schema.employeeSkills.skillId, schema.skills.id))
      .where(eq(schema.employeeSkills.employeeId, ctx.user.id));

      // Get skill gaps
      const skillGaps = await db.select({
        id: schema.skillGaps.id,
        skillId: schema.skillGaps.skillId,
        skillName: schema.skills.name,
        currentLevel: schema.skillGaps.currentLevel,
        requiredLevel: schema.skillGaps.requiredLevel,
        gapLevel: schema.skillGaps.gapLevel,
        recommendedTraining: schema.skillGaps.recommendedTraining,
      })
      .from(schema.skillGaps)
      .leftJoin(schema.skills, eq(schema.skillGaps.skillId, schema.skills.id))
      .where(eq(schema.skillGaps.employeeId, ctx.user.id))
      .orderBy(desc(schema.skillGaps.gapLevel));

      return {
        skills: employeeSkills,
        gaps: skillGaps,
      };
    }),

  // Add or update employee skill
  updateMySkill: protectedProcedure
    .input(z.object({
      skillId: z.number(),
      proficiencyLevel: z.enum(["beginner", "intermediate", "advanced", "expert"]),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Check if skill already exists
      const existing = await db.select().from(schema.employeeSkills)
        .where(and(
          eq(schema.employeeSkills.employeeId, ctx.user.id),
          eq(schema.employeeSkills.skillId, input.skillId)
        ))
        .limit(1);

      if (existing.length) {
        // Update existing
        await db.update(schema.employeeSkills)
          .set({
            proficiencyLevel: input.proficiencyLevel,
            updatedAt: new Date(),
          })
          .where(eq(schema.employeeSkills.id, existing[0].id));
      } else {
        // Insert new
        await db.insert(schema.employeeSkills).values({
          employeeId: ctx.user.id,
          skillId: input.skillId,
          proficiencyLevel: input.proficiencyLevel,
        });
      }

      return { success: true };
    }),

  // Get career recommendations
  getRecommendations: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const recommendations = await db.select({
        id: schema.careerRecommendations.id,
        pathId: schema.careerRecommendations.recommendedPathId,
        pathName: schema.careerPaths.name,
        pathDescription: schema.careerPaths.description,
        aiScore: schema.careerRecommendations.aiScore,
        reasons: schema.careerRecommendations.reasons,
        estimatedTimeMonths: schema.careerRecommendations.estimatedTimeMonths,
        requiredEffort: schema.careerRecommendations.requiredEffort,
        status: schema.careerRecommendations.status,
        createdAt: schema.careerRecommendations.createdAt,
      })
      .from(schema.careerRecommendations)
      .leftJoin(schema.careerPaths, eq(schema.careerRecommendations.recommendedPathId, schema.careerPaths.id))
      .where(eq(schema.careerRecommendations.employeeId, ctx.user.id))
      .orderBy(desc(schema.careerRecommendations.aiScore));

      return recommendations;
    }),

  // Accept or reject a career recommendation
  updateRecommendationStatus: protectedProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["accepted", "rejected"]),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.update(schema.careerRecommendations)
        .set({ status: input.status })
        .where(and(
          eq(schema.careerRecommendations.id, input.id),
          eq(schema.careerRecommendations.employeeId, ctx.user.id)
        ));

      return { success: true };
    }),

  // Get skill categories
  getSkillCategories: publicProcedure
    .query(async () => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const categories = await db.selectDistinct({
        category: schema.skills.category,
      })
      .from(schema.skills)
      .where(sql`${schema.skills.category} IS NOT NULL`);

      return categories.map(c => c.category).filter(Boolean);
    }),
});
