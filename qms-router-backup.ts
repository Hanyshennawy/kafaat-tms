import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { questions, questionOptions } from "../../drizzle/schema";
import { eq, and, like, inArray, sql, desc } from "drizzle-orm";

export const qmsRouter = router({
  // Create a new question
  createQuestion: protectedProcedure
    .input(
      z.object({
        questionText: z.string().min(10),
        questionContext: z.string().optional(),
        questionType: z.enum(["multiple_choice", "true_false", "scenario", "essay"]),
        difficultyLevel: z.enum(["basic", "intermediate", "advanced", "expert"]),
        subjectArea: z.string(),
        jobRole: z.string(),
        licenseTier: z.string(),
        points: z.number().min(1).max(10),
        timeLimit: z.number().optional(),
        explanation: z.string().optional(),
        options: z.array(
          z.object({
            optionText: z.string(),
            isCorrect: z.boolean(),
          })
        ).min(2),

      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Validate at least one correct answer
      const hasCorrectAnswer = input.options.some((opt) => opt.isCorrect);
      if (!hasCorrectAnswer) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "At least one option must be marked as correct",
        });
      }

      // Insert question
      const [question] = await db.insert(questions).values({
        questionText: input.questionText,
        questionContext: input.questionContext,
        questionType: input.questionType,
        difficultyLevel: input.difficultyLevel,
        subjectArea: input.subjectArea,
        jobRole: input.jobRole,
        licenseTier: input.licenseTier,
        points: input.points,
        timeLimit: input.timeLimit,
        explanation: input.explanation,
        createdBy: ctx.user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const questionId = question.insertId;

      // Insert options
      for (const option of input.options) {
        await db.insert(questionOptions).values({
          questionId: Number(questionId),
          optionText: option.optionText,
          isCorrect: option.isCorrect,
          createdAt: new Date(),
        });
      }



      return { questionId: Number(questionId), success: true };
    }),

  // Get question by ID with options
  getQuestion: protectedProcedure
    .input(z.object({ questionId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const questionResults = await db
        .select()
        .from(questions)
        .where(eq(questions.id, input.questionId))
        .limit(1);

      if (questionResults.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Question not found" });
      }

      const question = questionResults[0];

      // Get options
      const options = await db
        .select()
        .from(questionOptions)
        .where(eq(questionOptions.questionId, input.questionId));

      return {
        ...question,
        options,
      };
    }),

  // List questions with pagination and filtering
  listQuestions: protectedProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
        difficultyLevel: z.enum(["basic", "intermediate", "advanced", "expert"]).optional(),
        questionType: z.enum(["multiple_choice", "true_false", "scenario", "essay"]).optional(),
        subjectArea: z.string().optional(),
        jobRole: z.string().optional(),
        licenseTier: z.string().optional(),
        searchText: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const offset = (input.page - 1) * input.limit;

      // Build where conditions
      const conditions = [];
      if (input.difficultyLevel) {
        conditions.push(eq(questions.difficultyLevel, input.difficultyLevel));
      }
      if (input.questionType) {
        conditions.push(eq(questions.questionType, input.questionType));
      }
      if (input.subjectArea) {
        conditions.push(eq(questions.subjectArea, input.subjectArea));
      }
      if (input.jobRole) {
        conditions.push(eq(questions.jobRole, input.jobRole));
      }
      if (input.licenseTier) {
        conditions.push(eq(questions.licenseTier, input.licenseTier));
      }
      if (input.searchText) {
        conditions.push(like(questions.questionText, `%${input.searchText}%`));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      // Get questions
      const questionResults = await db
        .select()
        .from(questions)
        .where(whereClause)
        .orderBy(desc(questions.createdAt))
        .limit(input.limit)
        .offset(offset);

      // Get total count
      const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(questions)
        .where(whereClause);

      const total = Number(countResult[0]?.count || 0);

      return {
        questions: questionResults,
        pagination: {
          page: input.page,
          limit: input.limit,
          total,
          totalPages: Math.ceil(total / input.limit),
        },
      };
    }),

  // Update question
  updateQuestion: protectedProcedure
    .input(
      z.object({
        questionId: z.number(),
        questionText: z.string().min(10).optional(),
        questionContext: z.string().optional(),
        questionType: z.enum(["multiple_choice", "true_false", "scenario", "essay"]).optional(),
        difficultyLevel: z.enum(["basic", "intermediate", "advanced", "expert"]).optional(),
        subjectArea: z.string().optional(),
        jobRole: z.string().optional(),
        licenseTier: z.string().optional(),
        points: z.number().min(1).max(10).optional(),
        timeLimit: z.number().optional(),
        explanation: z.string().optional(),
        options: z.array(
          z.object({
            id: z.number().optional(),
            optionText: z.string(),
            isCorrect: z.boolean(),
          })
        ).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Update question
      const updateData: any = { updatedAt: new Date() };
      if (input.questionText) updateData.questionText = input.questionText;
      if (input.questionContext !== undefined) updateData.questionContext = input.questionContext;
      if (input.questionType) updateData.questionType = input.questionType;
      if (input.difficultyLevel) updateData.difficultyLevel = input.difficultyLevel;
      if (input.subjectArea) updateData.subjectArea = input.subjectArea;
      if (input.jobRole) updateData.jobRole = input.jobRole;
      if (input.licenseTier) updateData.licenseTier = input.licenseTier;
      if (input.points) updateData.points = input.points;
      if (input.timeLimit !== undefined) updateData.timeLimit = input.timeLimit;
      if (input.explanation !== undefined) updateData.explanation = input.explanation;

      await db
        .update(questions)
        .set(updateData)
        .where(eq(questions.id, input.questionId));

      // Update options if provided
      if (input.options) {
        // Validate at least one correct answer
        const hasCorrectAnswer = input.options.some((opt) => opt.isCorrect);
        if (!hasCorrectAnswer) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "At least one option must be marked as correct",
          });
        }

        // Delete existing options
        await db.delete(questionOptions).where(eq(questionOptions.questionId, input.questionId));

        // Insert new options
        for (const option of input.options) {
          await db.insert(questionOptions).values({
            questionId: input.questionId,
            optionText: option.optionText,
            isCorrect: option.isCorrect,
            createdAt: new Date(),
          });
        }
      }

      return { success: true };
    }),

  // Delete question
  deleteQuestion: protectedProcedure
    .input(z.object({ questionId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Delete options first (foreign key constraint)
      await db.delete(questionOptions).where(eq(questionOptions.questionId, input.questionId));



      // Delete question
      await db.delete(questions).where(eq(questions.id, input.questionId));

      return { success: true };
    }),

  // Bulk create questions
  bulkCreateQuestions: protectedProcedure
    .input(
      z.object({
        questions: z.array(
          z.object({
            questionText: z.string(),
            questionType: z.enum(["multiple_choice", "true_false", "scenario", "essay"]),
            difficultyLevel: z.enum(["basic", "intermediate", "advanced", "expert"]),
            subjectArea: z.string(),
            jobRole: z.string(),
            licenseTier: z.string(),
            points: z.number(),
            options: z.array(
              z.object({
                optionText: z.string(),
                isCorrect: z.boolean(),
              })
            ),
          })
        ),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const createdIds = [];

      for (const q of input.questions) {
        // Validate at least one correct answer
        const hasCorrectAnswer = q.options.some((opt) => opt.isCorrect);
        if (!hasCorrectAnswer) continue;

        const [question] = await db.insert(questions).values({
          questionText: q.questionText,
          questionType: q.questionType,
          difficultyLevel: q.difficultyLevel,
          subjectArea: q.subjectArea,
          jobRole: q.jobRole,
          licenseTier: q.licenseTier,
          points: q.points,
          createdBy: ctx.user.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        const questionId = Number(question.insertId);
        createdIds.push(questionId);

        // Insert options
        for (const option of q.options) {
          await db.insert(questionOptions).values({
            questionId,
            optionText: option.optionText,
            isCorrect: option.isCorrect,
            createdAt: new Date(),
          });
        }
      }

      return { success: true, createdCount: createdIds.length, questionIds: createdIds };
    }),

  // Bulk delete questions
  bulkDeleteQuestions: protectedProcedure
    .input(z.object({ questionIds: z.array(z.number()) }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Delete options
      await db.delete(questionOptions).where(inArray(questionOptions.questionId, input.questionIds));



      // Delete questions
      await db.delete(questions).where(inArray(questions.id, input.questionIds));

      return { success: true, deletedCount: input.questionIds.length };
    }),

  // Get question statistics
  getQuestionStats: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(questions);

    const byDifficulty = await db
      .select({
        difficulty: questions.difficultyLevel,
        count: sql<number>`count(*)`,
      })
      .from(questions)
      .groupBy(questions.difficultyLevel);

    const byType = await db
      .select({
        type: questions.questionType,
        count: sql<number>`count(*)`,
      })
      .from(questions)
      .groupBy(questions.questionType);

    const bySubject = await db
      .select({
        subject: questions.subjectArea,
        count: sql<number>`count(*)`,
      })
      .from(questions)
      .groupBy(questions.subjectArea);

    return {
      total: Number(totalResult[0]?.count || 0),
      byDifficulty: byDifficulty.map((d) => ({
        difficulty: d.difficulty,
        count: Number(d.count),
      })),
      byType: byType.map((t) => ({ type: t.type, count: Number(t.count) })),
      bySubject: bySubject.map((s) => ({ subject: s.subject, count: Number(s.count) })),
    };
  }),
});
